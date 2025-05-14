import React, { useMemo } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { PhantomWalletAdapter } from "@solana/wallet-adapter-wallets";
import { clusterApiUrl, Connection } from "@solana/web3.js";
import "@solana/wallet-adapter-react-ui/styles.css";
import SkillMintLanding from "./components/AuthPage/SkillMintLanding"; // <--- Your beautiful onboarding page
import Dashboard from "./components/Dashboard"; // Your dashboard page
import OAuthCallback from "./components/AuthPage/OAuthCallback"; // Handles GitHub OAuth redirect

const NETWORK = "devnet";
const useOnboarded = () => !!localStorage.getItem("onboarded");

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
          <Router>
            <Routes>
              <Route
                path="/auth"
                element={
                  <RedirectIfOnboarded>
                    <SkillMintLanding />
                  </RedirectIfOnboarded>
                }
              />
              <Route
                path="/dashboard"
                element={
                  <RequireOnboarded>
                    <Dashboard />
                  </RequireOnboarded>
                }
              />
              <Route path="/oauth" element={<OAuthCallback />} />
              <Route path="/" element={<Navigate to="/auth" replace />} />
              <Route path="*" element={<Navigate to="/auth" replace />} />
            </Routes>
          </Router>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}
