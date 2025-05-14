import React, { useState, useMemo, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from "react-router-dom";
import { ConnectionProvider, WalletProvider, useWallet } from "@solana/wallet-adapter-react";
import { WalletModalProvider, WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { PhantomWalletAdapter } from "@solana/wallet-adapter-wallets";
import { clusterApiUrl, Connection } from "@solana/web3.js";
import "@solana/wallet-adapter-react-ui/styles.css";
import axios from "axios";

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

// Onboarding modal logic (GitHub + Wallet) as a component
function OnboardingModal({ show, onClose }) {
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const wallet = useWallet();
  const navigate = useNavigate();

  const githubConnected = !!localStorage.getItem("github_access_token");
  const githubUsername = localStorage.getItem("github_username");

  function getGithubAuthUrl() {
    const CLIENT_ID = "YOUR_GITHUB_CLIENT_ID";
    const REDIRECT_URI = "http://localhost:3000/oauth";
    const scope = "read:user";
    return `https://github.com/login/oauth/authorize?client_id=${CLIENT_ID}&scope=${scope}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}`;
  }

  const handleSign = async () => {
    setLoading(true);
    setStatus("Signing...");
    try {
      const message = "Sign to link wallet with SkillMint";
      const encodedMessage = new TextEncoder().encode(message);
      await wallet.signMessage(encodedMessage);
      localStorage.setItem("onboarded", "1");
      setStatus("Onboarding complete!");
      setTimeout(() => {
        onClose();
        navigate("/dashboard");
      }, 1000);
    } catch (err) {
      setStatus("Signature failed.");
    }
    setLoading(false);
  };

  if (!show) return null;

  return (
    <div style={{
      position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
      background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000
    }}>
      <div style={{ background: "#222", color: "#fff", padding: 32, borderRadius: 12, minWidth: 350 }}>
        <button onClick={onClose} style={{ float: "right", background: "none", border: "none", color: "#fff", fontSize: 24, cursor: "pointer" }}>×</button>
        <h2>Onboard to SkillMint</h2>
        {!githubConnected ? (
          <button
            onClick={() => (window.location.href = getGithubAuthUrl())}
            disabled={loading}
            style={{ margin: "20px", padding: "10px 20px", fontWeight: "bold" }}
          >
            {loading ? "Connecting..." : "Connect GitHub"}
          </button>
        ) : !wallet.connected ? (
          <>
            <WalletMultiButton />
            <div style={{ marginTop: 20, color: "#f43f5e" }}>Please connect your wallet.</div>
          </>
        ) : (
          <button
            onClick={handleSign}
            disabled={loading}
            style={{ margin: "20px", padding: "10px 20px", fontWeight: "bold" }}
          >
            {loading ? "Processing..." : "Sign Message to Link"}
          </button>
        )}
        <div style={{ marginTop: 10, color: "#a78bfa" }}>{status}</div>
        {githubConnected && githubUsername && (
          <div style={{ marginTop: 10, fontSize: 12, color: "#999" }}>
            GitHub: {githubUsername}
          </div>
        )}
      </div>
    </div>
  );
}

// Handles GitHub OAuth callback and stores token, then redirects to /auth
function OAuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    if (code) {
      axios
        .post("http://localhost:5000/api/auth/github/exchange", { code }) // Your backend endpoint
        .then((res) => {
          localStorage.setItem("github_access_token", res.data.accessToken);
          localStorage.setItem("github_username", res.data.username);
          navigate("/auth");
        })
        .catch(() => {
          navigate("/auth");
        });
    } else {
      navigate("/auth");
    }
  }, [navigate]);

  return <div style={{ textAlign: "center", marginTop: 100 }}>Connecting to GitHub...</div>;
}

function Dashboard() {
  return (
    <div style={{ textAlign: "center", marginTop: 100 }}>
      <h1>Welcome to the SkillMint Dashboard!</h1>
      <p>You are onboarded and can use the app.</p>
    </div>
  );
}

function Landing() {
  const navigate = useNavigate();
  return (
    <div style={{ textAlign: "center", marginTop: 100 }}>
      <h1>SkillMint</h1>
      <p>Mint, manage, and showcase your skills as NFTs on Solana.</p>
      <button
        onClick={() => navigate("/auth")}
        style={{ margin: "20px", padding: "10px 20px", fontWeight: "bold" }}
      >
        Get Started
      </button>
    </div>
  );
}

function AuthPage() {
  // Show the onboarding modal
  const [showModal, setShowModal] = useState(false);

  // Open modal if returned from OAuth (URL has ?code=)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("code") && !localStorage.getItem("onboarded")) {
      setShowModal(true);
    }
  }, []);

  return (
    <div style={{ textAlign: "center", marginTop: 100 }}>
      <h2>Onboarding Required</h2>
      <p>To use SkillMint, connect your GitHub & wallet.</p>
      <button
        onClick={() => setShowModal(true)}
        style={{ margin: "20px", padding: "10px 20px", fontWeight: "bold" }}
      >
        Connect GitHub & Wallet
      </button>
      <OnboardingModal show={showModal} onClose={() => setShowModal(false)} />
    </div>
  );
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
              <Route path="/oauth" element={<OAuthCallback />} />
              <Route
                path="/auth"
                element={
                  <RedirectIfOnboarded>
                    <AuthPage />
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
