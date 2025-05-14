import React, { useMemo } from "react";
import { BrowserRouter as Router, Routes, Route, Link, Navigate, Outlet, useLocation } from "react-router-dom";
import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react";
import { WalletModalProvider, WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { PhantomWalletAdapter } from "@solana/wallet-adapter-wallets";
import { clusterApiUrl, Connection } from "@solana/web3.js";
import IssuerInitializer from "./components/IssuerInitializer";
import BadgeTemplateCreator from "./components/BadgeTemplateCreator";
import BadgeMinter from "./components/BadgeMinter";
import { NETWORK } from "./utils/constants";
import "@solana/wallet-adapter-react-ui/styles.css";
import OAuthCallback from "./components/AuthPage/Auth";
import BadgeAccepter from "./components/AcceptBadge";
import BadgeList from "./components/BadgesList";
import LinkWalletPage from "./components/AuthPage/Auth";
import SkillMintLanding from "./components/CV";
import SkillMintCV from "./components/CV"; // <-- Your public CV page
import { Toaster } from 'react-hot-toast';

const useOnboarded = () => !!localStorage.getItem("onboarded");

function DashboardLayout() {
  return (
    <>
      <nav className="bg-gray-900 text-white py-3 px-8 flex justify-between items-center shadow-lg">
        <div className="text-2xl font-extrabold tracking-tight text-purple-400">
          SkillMint
        </div>
        <div className="flex gap-6 items-center">
          <Link to="/dashboard" className="hover:text-purple-400 transition">Home</Link>
          <Link to="/dashboard/template" className="hover:text-purple-400 transition">Template</Link>
          <Link to="/dashboard/badges" className="hover:text-purple-400 transition">Badges</Link>
          {/* Special My CV Button */}
      
        </div>
            <Link
            to="/cv/renao"
            className="absolute right-60 bg-gradient-to-r from-yellow-400 to-pink-500 text-white font-bold px-4 py-2 rounded-lg shadow-lg hover:scale-105 transition"
   
          >
            ⭐ My CV
          </Link>
        <WalletMultiButton />
      </nav>
      <main className="min-h-screen bg-gradient-to-tr from-gray-950 via-gray-900 to-gray-800 flex flex-col items-center p-4">
        <Outlet />
        <div className="text-xs mt-8 text-gray-400">No Anchor JS used. All serialization is manual.</div>
      </main>
    </>
  );
}

function RequireOnboarded({ children }) {
  const onboarded = useOnboarded();
  const location = useLocation();
  if (!onboarded) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }
  return children;
}
function RedirectIfOnboarded({ children }) {
  const onboarded = useOnboarded();
  if (onboarded) {
    return <Navigate to="/dashboard" replace />;
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
    // Global toast styles
    style: {
      background: "#181f2a", // deep black/blue (matches your app)
      color: "#fff",
      border: "1px solid #8b5cf6", // subtle purple border
      boxShadow: "0 4px 24px 0 rgba(139,92,246,0.25)",
      fontWeight: 600,
      fontFamily: "inherit",
      fontSize: "1.1rem",
    },
    duration: 3500,
    success: {
      iconTheme: {
        primary: "#a78bfa", // purple
        secondary: "#181f2a",
      },
    },
    error: {
      iconTheme: {
        primary: "#f43f5e", // pink
        secondary: "#181f2a",
      },
    },
  }}
/>
          <Router>
            <Routes>
              <Route path="/" element={<SkillMintLanding />} />
              <Route path="oauth" element={<OAuthCallback />} />
              <Route path="/cv/:username" element={<SkillMintCV />} /> {/* <-- Public CV */}
              <Route
                path="/auth"
                element={
                  <RedirectIfOnboarded>
                    <LinkWalletPage />
                  </RedirectIfOnboarded>
                }
              />
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
                <Route path="mint" element={<BadgeMinter connection={connection} />} />
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
