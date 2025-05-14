import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getGithubAuthUrl } from "../../utils/githubOAuth";
import { useUserStore } from "../../store/useUserStore";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import toast, { Toaster } from "react-hot-toast";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";

// Testimonials and howItWorks data
const testimonials = [
  {
    name: "Harkirat",
    role: "Superteam DAO",
    text: "SkillMint made it effortless for us to recognize open-source contributors. The on-chain badges are a game changer for hiring!",
    img: "https://superteam.fun/logo.png",
  },
  {
    name: "Renao",
    role: "Solana Developer",
    text: "I finally have a profile that shows what I can do, not just what I say. Recruiters instantly trusted my SkillMint badges.",
    img: "https://avatars.githubusercontent.com/u/123456?v=4",
  },
  {
    name: "Alice",
    role: "Open Source Maintainer",
    text: "The GitHub Actions flow is so smooth. I issued a badge in one click, and it showed up on-chain instantly.",
    img: "https://avatars.githubusercontent.com/u/654321?v=4",
  },
];

const howItWorks = [
  {
    title: "Connect GitHub & Wallet",
    desc: "Securely link your GitHub and Solana wallet in seconds. Your credentials stay yours.",
    icon: "🔗",
  },
  {
    title: "Earn On-Chain Badges",
    desc: "Get NFT badges for real achievements-building dApps, contributing to open source, or mastering Solana tools.",
    icon: "🎖️",
  },
  {
    title: "Accept & Showcase",
    desc: "You control which badges appear on your profile. Endorsements from trusted orgs make your skills stand out.",
    icon: "🌟",
  },
  {
    title: "Trustless Verification",
    desc: "Recruiters and DAOs can instantly verify your skills and reputation. No more fake claims or manual checks.",
    icon: "🔍",
  },
];

export default function SkillMintLanding() {
 const [showWalletModal, setShowWalletModal] = useState(false);
  const [testimonialIdx, setTestimonialIdx] = useState(0);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [githubConnected, setGithubConnected] = useState(!!localStorage.getItem("github_access_token"));
  const [githubUsername, setGithubUsername] = useState(localStorage.getItem("github_username") || "");
  const setWallet = useUserStore((s) => s.setWallet);
  const solWallet = useWallet();
  const navigate = useNavigate();
  const location = useLocation();

  // Stepper state: 'wallet' | 'github' | 'linking' | 'done'
  const [step, setStep] = useState("wallet");

  // Step 1: When wallet connects, move to GitHub step
  useEffect(() => {
    if (showWalletModal && solWallet.connected && step === "wallet") {
      setStep("github");
    }
  }, [showWalletModal, solWallet.connected, step]);

  // Step 2: Handle GitHub OAuth callback
  useEffect(() => {
    console.log(`${import.meta.env.VITE_BACKEND_URL}/api/auth/github/exchange`);
    const params = new URLSearchParams(location.search);
    const code = params.get("code");
    if (code && !githubConnected) {
      setLoading(true);
      setStatus("Connecting to GitHub...");
      axios
        .post(`${import.meta.env.VITE_BACKEND_URL}/api/auth/github/exchange`, { code })
        .then((res) => {
          localStorage.setItem("github_access_token", res.data.accessToken);
          localStorage.setItem("github_username", res.data.username);
          setGithubConnected(true);
          setGithubUsername(res.data.username);
          setStatus("GitHub connected! Now linking...");
          toast.success("GitHub connected!");
          window.history.replaceState({}, document.title, location.pathname);
          setStep("linking");
        })
        .catch(() => {
          setStatus("GitHub connection failed.");
          toast.error("GitHub connection failed.");
        })
        .finally(() => setLoading(false));
    }
  }, [location, githubConnected]);

  // Step 3: When both connected, link wallet & GitHub
  useEffect(() => {
    if (showWalletModal && solWallet.connected && githubConnected && step === "linking") {
      handleConnectAndSign();
    }
    // eslint-disable-next-line
  }, [showWalletModal, solWallet.connected, githubConnected, step]);

  // Step 4: After onboarding, redirect
  useEffect(() => {
    if (step === "done") {
      setTimeout(() => navigate("/dashboard"), 1200);
    }
  }, [step, navigate]);

  async function handleConnectAndSign() {
     setStatus("Connecting wallet...");
    setLoading(true);
    try {
      if (!githubConnected || !githubUsername) {
        toast.error("Please connect your GitHub first!");
        setStatus("Please connect your GitHub first!");
        setLoading(false);
        return;
      }
      if (!solWallet.connected) {
        toast.error("Please connect your wallet first!");
        setStatus("Please connect your wallet first!");
        setLoading(false);
        return;
      }
      const publicKey = solWallet.publicKey?.toBase58();
      if (!publicKey) throw new Error("No wallet address");
      setWallet({ publicKey });

      // Get challenge from backend
      setStatus("Getting challenge...");
      const { data: challengeData } = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/auth/github/challenge`,
        { github_username: githubUsername }
      );
      const challenge = challengeData.challenge;

      // Sign challenge
      setStatus("Signing challenge...");
      if (!solWallet.signMessage) throw new Error("Wallet does not support signMessage");
      const encoded = new TextEncoder().encode(challenge);
      const sig = await solWallet.signMessage(encoded);
      const sigBase64 = btoa(String.fromCharCode(...sig));

      // Send signature to backend to link GitHub <-> wallet
      setStatus("Linking wallet to GitHub...");
      await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/auth/github/link`,
        {
          github_username: githubUsername,
          wallet_address: publicKey,
          signature: sigBase64,
          challenge,
        }
      );

      setWallet({ publicKey, signature: sigBase64, githubUsername });
      setStatus("Wallet connected and GitHub linked!");
      toast.success("Wallet linked to GitHub! Redirecting to dashboard...");

      localStorage.setItem("onboarded", "1");
      setStep("done");
    } catch (e) {
      setStatus("❌ " + (e.response?.data?.error || e.message || "Wallet/signing error"));
      toast.error(e.response?.data?.error || e.message || "Wallet/signing error");
      setStep("github");
    } finally {
      setLoading(false);
    }
  }

  // Carousel logic (unchanged)
  const nextTestimonial = () => setTestimonialIdx((i) => (i + 1) % testimonials.length);
  const prevTestimonial = () => setTestimonialIdx((i) => (i === 0 ? testimonials.length - 1 : i - 1));



  return (
    <div className="relative min-h-screen bg-gradient-to-tr from-[#0f172a] via-[#1e293b] to-[#0f172a] text-white overflow-x-hidden">
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
  <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
        style={{ display: showWalletModal ? "flex" : "none" }}
      >
        <div className="bg-[#181f2a] rounded-2xl p-8 shadow-2xl min-w-[340px] max-w-full relative">
          <button
            className="absolute top-4 right-6 text-xl text-gray-400 hover:text-pink-400"
            onClick={() => setShowWalletModal(false)}
          >
            ×
          </button>
          <h2 className="text-2xl font-bold mb-6 text-purple-300 text-center">Onboard to SkillMint</h2>

         {step === "wallet" && (
  <>
    <WalletMultiButton />
    <div className="mt-4 text-gray-300 text-center">Connect your Solana wallet to continue.</div>
  </>
)}

{step === "github" && solWallet.connected && (
  <>
    <button
      className="w-full py-3 px-6 rounded-lg font-bold bg-gradient-to-r from-purple-600 to-pink-500 shadow-lg hover:brightness-110 transition mb-2"
      onClick={() => { window.location.href = getGithubAuthUrl(); }}
      disabled={loading}
    >
      {loading ? "Connecting..." : "Connect GitHub"}
    </button>
    <div className="mt-2 text-gray-300 text-center">Connect your GitHub account.</div>
  </>
)}


          {step === "linking" && (
            <>
              <div className="text-center text-lg text-purple-300 mb-2">Linking your wallet & GitHub...</div>
              <div className="text-center text-gray-400">{status || "Signing and linking..."}</div>
            </>
          )}

          {step === "done" && (
            <div className="text-center text-green-400 font-bold text-lg">Onboarding complete! Redirecting...</div>
          )}

          {status && step !== "done" && (
            <div className="mt-4 text-center text-pink-300">{status}</div>
          )}
        </div>
      </motion.div>
      {/* Animated background orbs */}
      <motion.div
        className="absolute top-[-120px] left-[-120px] w-[350px] h-[350px] rounded-full bg-purple-600 opacity-30 blur-3xl animate-blob"
        style={{ filter: "drop-shadow(0 0 30px #8b5cf6)" }}
        animate={{ x: [0, 60, 0], y: [0, 40, 0] }}
        transition={{ duration: 8, repeat: Infinity, repeatType: "reverse" }}
      />
      <motion.div
        className="absolute bottom-[-140px] right-[-140px] w-[400px] h-[400px] rounded-full bg-pink-500 opacity-25 blur-3xl animate-blob animation-delay-2000"
        style={{ filter: "drop-shadow(0 0 35px #ec4899)" }}
        animate={{ x: [0, -50, 0], y: [0, -30, 0] }}
        transition={{ duration: 9, repeat: Infinity, repeatType: "reverse" }}
      />

      {/* HERO */}
      <section className="relative z-10 flex flex-col items-center justify-center py-24 px-4 text-center">
        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: "easeOut" }}
          className="text-5xl md:text-7xl font-extrabold bg-gradient-to-r from-purple-400 via-pink-400 to-yellow-300 bg-clip-text text-transparent drop-shadow-lg mb-6"
        >
          SkillMint
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="max-w-2xl mx-auto text-lg md:text-2xl text-gray-200 mb-10"
        >
          On-chain, verifiable skill badges for Solana developers.<br />
          <span className="text-pink-400 font-semibold">
            Showcase your real skills. Get recognized. Own your reputation.
          </span>
        </motion.p>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, duration: 0.7 }}
          className="flex flex-col md:flex-row gap-4 justify-center items-center"
        >
<button
  onClick={() => setShowWalletModal(true)}
  className="py-4 px-8 rounded-xl font-bold text-lg bg-gradient-to-r from-purple-600 to-pink-500 shadow-lg hover:brightness-110 transition duration-300"
>
  Connect GitHub & Wallet
</button>

          <a
            href="#demo"
            className="py-4 px-8 rounded-xl font-bold text-lg bg-[#111827]/80 border border-purple-600 text-purple-300 hover:bg-purple-900/40 transition"
          >
            Watch Demo
          </a>
        </motion.div>
      </section>

      {/* HOW IT WORKS */}
      <section className="relative z-10 py-16 px-4 max-w-5xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500 mb-10 text-center">
          How SkillMint Works
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {howItWorks.map((step, i) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.15, duration: 0.7 }}
              viewport={{ once: true }}
              className="bg-[#181f2a]/80 rounded-2xl p-6 shadow-xl flex flex-col items-center"
            >
              <div className="text-4xl mb-4">{step.icon}</div>
              <h3 className="font-bold text-xl mb-2 text-purple-300">{step.title}</h3>
              <p className="text-gray-300">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* SCREENSHOTS & DEMO */}
      <section id="demo" className="relative z-10 py-16 px-4 max-w-5xl mx-auto">
        <h2 className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-pink-400 to-yellow-400 mb-8 text-center">
          See SkillMint In Action
        </h2>
        <div className="flex flex-col md:flex-row gap-8 items-center justify-center">
          <img
            src="YOUR_SCREENSHOT_URL" // Replace with your screenshot
            alt="SkillMint Wallet Linking"
            className="rounded-2xl shadow-2xl w-full md:w-1/2"
          />
          <div className="flex-1 text-lg text-gray-200">
            <ul className="space-y-4">
              <li>🔗 One-click wallet & GitHub linking</li>
              <li>🎖️ Mint NFT badges for real achievements</li>
              <li>🌟 Accept, endorse, and showcase your skills</li>
              <li>🔍 Trustless, public verification for recruiters</li>
            </ul>
            <button
              onClick={() => setShowWalletModal(true)}
              className="mt-8 py-3 px-8 rounded-xl font-bold bg-gradient-to-r from-purple-600 to-pink-500 shadow-lg hover:brightness-110 transition"
            >
              Try Wallet Linking
            </button>
          </div>
        </div>
      </section>

      {/* EXTENSION */}
      <section className="relative z-10 py-16 px-4 max-w-5xl mx-auto">
        <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500 mb-6 text-center">
          Chrome Extension Integration
        </h2>
        <div className="flex flex-col md:flex-row gap-8 items-center justify-center">
          <img
            src="YOUR_EXTENSION_SCREENSHOT_URL" // Replace with your extension screenshot
            alt="SkillMint Extension"
            className="rounded-xl shadow-xl w-full md:w-1/3"
          />
          <div className="flex-1 text-lg text-gray-200">
            <p>
              <b>Seamlessly link your wallet, sign messages, and manage badges directly from your browser.</b>
            </p>
            <a
              href="YOUR_EXTENSION_URL"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-block py-3 px-8 rounded-xl font-bold bg-gradient-to-r from-pink-500 to-purple-500 shadow-lg hover:brightness-110 transition"
            >
              Add Extension
            </a>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="relative z-10 py-16 px-4 max-w-4xl mx-auto">
        <h2 className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-pink-400 to-yellow-400 mb-8 text-center">
          What Developers & Recruiters Say
        </h2>
        <div className="flex flex-col items-center">
          <motion.div
            key={testimonialIdx}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="bg-[#181f2a]/90 rounded-2xl p-8 shadow-xl max-w-xl text-center"
          >
            <img
              src={testimonials[testimonialIdx].img}
              alt={testimonials[testimonialIdx].name}
              className="w-16 h-16 rounded-full mx-auto mb-4 border-4 border-purple-500"
            />
            <p className="text-xl text-gray-100 mb-4">"{testimonials[testimonialIdx].text}"</p>
            <div className="font-bold text-purple-300">{testimonials[testimonialIdx].name}</div>
            <div className="text-sm text-pink-300">{testimonials[testimonialIdx].role}</div>
          </motion.div>
          <div className="flex gap-4 mt-6">
            <button
              onClick={prevTestimonial}
              className="p-2 rounded-full bg-purple-700 hover:bg-purple-600 transition"
              aria-label="Previous testimonial"
            >
              ◀
            </button>
            <button
              onClick={nextTestimonial}
              className="p-2 rounded-full bg-pink-700 hover:bg-pink-600 transition"
              aria-label="Next testimonial"
            >
              ▶
            </button>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="relative z-10 py-16 px-4 max-w-3xl mx-auto">
        <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500 mb-8 text-center">
          Frequently Asked Questions
        </h2>
        <div className="space-y-6">
          <div>
            <div className="font-bold text-pink-300">Is my data safe?</div>
            <div className="text-gray-300">
              All wallet signatures are local. No private keys ever leave your device. We use industry-standard security protocols.
            </div>
          </div>
          <div>
            <div className="font-bold text-pink-300">What if I lose my wallet?</div>
            <div className="text-gray-300">
              Badges are on-chain-recoverable with your wallet. Your credentials are always yours.
            </div>
          </div>
          <div>
            <div className="font-bold text-pink-300">Who can issue badges?</div>
            <div className="text-gray-300">
              Verified orgs and trusted reviewers. You decide which badges to accept.
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="relative z-10 py-10 px-4 bg-[#111827]/80 border-t border-purple-800 mt-12">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <div className="text-xl font-bold text-purple-300">SkillMint</div>
            <div className="text-gray-400 text-sm mt-2">
              Own your skills. Own your future.
            </div>
          </div>
          <form
            className="flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              alert("Thanks for subscribing!");
            }}
          >
            <input
              type="email"
              required
              placeholder="Your email"
              className="rounded-lg px-4 py-2 bg-[#181f2a] text-white border border-purple-700 focus:outline-none"
            />
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-pink-500 font-bold"
            >
              Subscribe
            </button>
          </form>
          <div className="flex gap-4 text-2xl">
            <a href="https://github.com/skillmint" target="_blank" rel="noopener noreferrer" className="hover:text-purple-400">🐙</a>
            <a href="https://twitter.com/skillmint" target="_blank" rel="noopener noreferrer" className="hover:text-pink-400">🐦</a>
            <a href="https://discord.gg/skillmint" target="_blank" rel="noopener noreferrer" className="hover:text-purple-400">💬</a>
          </div>
        </div>
      </footer>

      {/* WALLET LINK MODAL */}
      <AnimatePresence>
        {showWalletModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#181f2a] rounded-2xl p-8 max-w-lg w-full shadow-2xl relative"
            >
              <button
                onClick={() => setShowWalletModal(false)}
                className="absolute top-4 right-4 text-2xl text-gray-400 hover:text-pink-400"
              >
                ×
              </button>
              <div className="text-center">
                <h3 className="text-2xl font-bold mb-4 text-purple-300">Link Your GitHub & Wallet</h3>
                {/* 1. GitHub Connect */}
                {!githubConnected ? (
                  <button
                    onClick={() => window.location.href = getGithubAuthUrl()}
                    className="mt-6 py-3 px-8 rounded-xl font-bold bg-gradient-to-r from-gray-700 to-gray-900 shadow-lg hover:brightness-110 transition"
                    disabled={loading}
                  >
                    {loading ? "Connecting..." : "Connect GitHub"}
                  </button>
                ) : !solWallet.connected ? (
                  // 2. Wallet Connect
                  <>
                    <WalletMultiButton />
                    <div className="mt-4 text-pink-400 font-semibold">Please connect your wallet.</div>
                  </>
                ) : (
                  // 3. Sign Message
                  <button
                    className="mt-6 py-3 px-8 rounded-xl font-bold bg-gradient-to-r from-purple-600 to-pink-500 shadow-lg hover:brightness-110 transition"
                    onClick={handleConnectAndSign}
                    disabled={loading}
                  >
                    {loading ? "Processing..." : "Sign Message to Link"}
                  </button>
                )}
                {status && <div className="mt-4 text-sm text-gray-300">{status}</div>}
                {githubConnected && githubUsername && (
                  <div className="mt-2 text-xs text-gray-400">
                    GitHub: <span className="font-mono">{githubUsername}</span>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

