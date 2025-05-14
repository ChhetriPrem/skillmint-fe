import React, { useMemo } from "react";
import { BrowserRouter as Router, Routes, Route, Link, Navigate, Outlet, useLocation } from "react-router-dom";
import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { PhantomWalletAdapter } from "@solana/wallet-adapter-wallets";
import { clusterApiUrl, Connection } from "@solana/web3.js";
import { NETWORK } from "./utils/constants";
import "@solana/wallet-adapter-react-ui/styles.css";
import { Toaster } from 'react-hot-toast';

// Import your pages/components
import AuthPage from "./components/AuthPage/Auth";      
import SkillMintCV from "./components/CV";               
import DashboardLayout from "./components/Dashboard";
import IssuerInitializer from "./components/IssuerInitializer";
import BadgeTemplateCreator from "./components/BadgeTemplateCreator";
import BadgeMinter from "./components/BadgeMinter";
import BadgeList from "./components/BadgesList";
import BadgeAccepter from "./components/AcceptBadge";
import OAuthCallback from "./components/AuthPage/Auth";    

// Helper hook for onboarding
const useOnboarded = () => !!localStorage.getItem("onboarded");

// Protect dashboard routes
function RequireOnboarded({ children }) {
  const onboarded = useOnboarded();
  const location = useLocation();
  if (!onboarded) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }
  return children;
}

export default function App() {
  const wallets = useMemo(() => [new PhantomWalletAdapter()], []);
  const connection = useMemo(() => new Connection(clusterApiUrl(NETWORK)), []);

  return (
    <ConnectionProvider endpoint={clusterApiUrl(NETWORK)}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <Toaster
            position="top-center"
            toastOptions={{
              style: {
                background: "#181f2a",
                color: "#fff",
                border: "1px solid #8b5cf6",
                boxShadow: "0 4px 24px 0 rgba(139,92,246,0.25)",
                fontWeight: 600,
                fontFamily: "inherit",
                fontSize: "1.1rem",
              },
              duration: 3500,
              success: {
                iconTheme: {
                  primary: "#a78bfa",
                  secondary: "#181f2a",
                },
              },
              error: {
                iconTheme: {
                  primary: "#f43f5e",
                  secondary: "#181f2a",
                },
              },
            }}
          />
          <Router>
            <Routes>
          
              <Route path="/auth" element={<AuthPage />} /> 
<Route path="/oauth-callback" element={<OAuthCallback />} />

              <Route path="/cv/:username" element={<SkillMintCV />} /> {/* public CV */}
              <Route
                path="/dashboard"
                element={
                  <RequireOnboarded>
                    <DashboardLayout />
                  </RequireOnboarded>
                }
              >
                <Route
                  index
                  element={
                    <div className="max-w-2xl mx-auto mt-12 text-center">
                      <h1 className="text-4xl font-bold mb-6 text-purple-300 drop-shadow">
                        Welcome to SkillMint DApp
                      </h1>
                      <p className="mb-8 text-gray-300">
                        Mint, manage, and showcase your skills as NFTs on Solana.
                      </p>
                      <div className="grid md:grid-cols-3 gap-6">
                        <Link to="issuer" className="bg-purple-700/80 hover:bg-purple-600 text-white font-semibold py-4 rounded-xl shadow-lg transition text-lg">Initialize Issuer</Link>
                        <Link to="template" className="bg-purple-700/80 hover:bg-purple-600 text-white font-semibold py-4 rounded-xl shadow-lg transition text-lg">Create Template</Link>
                        <Link to="mint" className="bg-purple-700/80 hover:bg-purple-600 text-white font-semibold py-4 rounded-xl shadow-lg transition text-lg">Mint Badge</Link>
                      </div>
                    </div>
                  }
                />
                <Route path="issuer" element={<IssuerInitializer connection={connection} />} />
                <Route path="template" element={<BadgeTemplateCreator connection={connection} />} />

                <Route path="badges" element={<BadgeList />} />

                <Route path="accept" element={<BadgeAccepter />} />
              </Route>
              <Route path="*" element={<Navigate to="/auth" replace />} />
            </Routes>
          </Router>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}
