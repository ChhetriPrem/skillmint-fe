import React, { useMemo } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { PhantomWalletAdapter } from "@solana/wallet-adapter-wallets";
import { clusterApiUrl, Connection } from "@solana/web3.js";
import "@solana/wallet-adapter-react-ui/styles.css";
import Onboarding from "./components/Onboarding";
import OAuthCallback from "./components/OAuthCallback";
import Dashboard from "./components/Dashboard";
import Landing from "./components/Landing";

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
              <Route path="/" element={<Landing />} />
              <Route path="/oauth-callback" element={<OAuthCallback />} />
              <Route
                path="/auth"
                element={
                  <RedirectIfOnboarded>
                    <Onboarding />
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
              <Route path="*" element={<Navigate to="/auth" replace />} />
            </Routes>
          </Router>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}
