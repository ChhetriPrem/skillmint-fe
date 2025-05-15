import React, { useMemo } from "react";
import { BrowserRouter as Router, Routes, Route, Link, Navigate, Outlet, useLocation, useNavigate } from "react-router-dom";
import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { PhantomWalletAdapter } from "@solana/wallet-adapter-wallets";
import { clusterApiUrl, Connection } from "@solana/web3.js";
import { NETWORK } from "./utils/constants";
import "@solana/wallet-adapter-react-ui/styles.css";
import { Toaster } from 'react-hot-toast';

// Import your actual page components
import AuthPage from "./components/AuthPage/Auth";
import SkillMintCV from "./components/CV";
import PublicCV from "./components/CVPublic";
import DashboardLayout from "./components/Dashboard";
import IssuerInitializer from "./components/IssuerInitializer";
import BadgeTemplateCreator from "./components/BadgeTemplateCreator";
import BadgeMinter from "./components/BadgeMinter";
import BadgeList from "./components/BadgesList";
import BadgeAccepter from "./components/AcceptBadge";
import OAuthCallback from "./components/AuthPage/Auth";

// ProtectedRoute component (recommended pattern[2][5][7])
function ProtectedRoute() {
  const location = useLocation();
  const isOnboarded = localStorage.getItem("onboarded") === "1";
  if (!isOnboarded) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }
  return <Outlet />;
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
              {/* Public Routes */}
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/oauth-callback" element={<OAuthCallback />} />
              <Route path="/publiccv" element={<PublicCV />} />
              <Route path="/cv/:username" element={<SkillMintCV />} />

              {/* Protected Dashboard Routes */}
              <Route path="/dashboard" element={<ProtectedRoute />}>
                <Route
                  index
                  element={
                    <DashboardLayout>
                      <div className="max-w-2xl mx-auto mt-12 text-center">
                        <div className="grid md:grid-cols-3 gap-6">
                          <Link to="issuer" className="bg-purple-700/80 hover:bg-purple-600 text-white font-semibold py-4 rounded-xl shadow-lg transition text-lg">Initialize Issuer</Link>
                          <Link to="template" className="bg-purple-700/80 hover:bg-purple-600 text-white font-semibold py-4 rounded-xl shadow-lg transition text-lg">Create Template</Link>
                          <Link to="mint" className="bg-purple-700/80 hover:bg-purple-600 text-white font-semibold py-4 rounded-xl shadow-lg transition text-lg">Mint Badge</Link>
                        </div>
                      </div>
                    </DashboardLayout>
                  }
                />
                <Route path="issuer" element={<IssuerInitializer connection={connection} />} />
                <Route path="template" element={<BadgeTemplateCreator />} />
                <Route path="mint" element={<BadgeMinter />} />
                <Route path="badges" element={<BadgeList />} />
                <Route path="accept" element={<BadgeAccepter />} />
              </Route>

              {/* Catch-all */}
              <Route path="*" element={<Navigate to="/auth" replace />} />
            </Routes>
          </Router>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}
