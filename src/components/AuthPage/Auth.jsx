import React, { useState, useEffect } from "react";
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

const features = [
  {
    title: "Connect GitHub & Wallet",
    desc: "Securely link your GitHub and Solana wallet in seconds.",
    icon: "🔗",
  },
  {
    title: "Earn On-Chain Badges",
    desc: "Get NFT badges for real achievements—building dApps, contributing to open source, or mastering Solana tools.",
    icon: "🎖️",
  },
  {
    title: "Showcase Your Skills",
    desc: "You control which badges appear on your profile. Endorsements from trusted orgs make your skills stand out.",
    icon: "🌟",
  },
  {
    title: "Trustless Verification",
    desc: "Recruiters and DAOs can instantly verify your skills and reputation. No more fake claims or manual checks.",
    icon: "🔍",
  },
];

const ExtensionModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
      <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
        <h2 className="text-xl font-semibold mb-4 text-indigo-700">Install the SkillMint Extension</h2>
        <p className="mb-4 text-gray-700">
          Our extension isn't yet published on the Chrome Web Store. Please download and install it manually:
        </p>
        <a
          href="https://github.com/ChhetriPrem/skillmint-extension/tree/main/github-extension"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-4 py-3 rounded-lg transition"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="7 10 12 15 17 10"></polyline>
            <line x1="12" y1="15" x2="12" y2="3"></line>
          </svg>
          Download Extension
        </a>
        <div className="mt-4 p-3 bg-indigo-50 rounded-lg">
          <p className="text-sm text-gray-700">
            <span className="font-medium">Installation steps:</span>
            <ol className="mt-2 ml-4 space-y-1 list-decimal">
              <li>Go to <code className="bg-indigo-100 px-1 py-0.5 rounded">chrome://extensions</code></li>
              <li>Enable "Developer Mode" in the top-right</li>
              <li>Click "Load unpacked" and select the extracted folder</li>
            </ol>
          </p>
        </div>
      </div>
    </div>
  );
};

export default function SkillMintLanding() {
  const [showExtensionModal, setShowExtensionModal] = useState(false);
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [connecting, setConnecting] = useState(false);
  const [connectStatus, setConnectStatus] = useState("");
  const [githubConnected, setGithubConnected] = useState(!!localStorage.getItem("github_access_token"));
  const [githubUsername, setGithubUsername] = useState(localStorage.getItem("github_username") || "");
  
  const setWallet = useUserStore((s) => s.setWallet);
  const solWallet = useWallet();
  const navigate = useNavigate();
  const location = useLocation();

  // Handle GitHub OAuth callback
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const code = params.get("code");
    
    if (code && !githubConnected) {
      setConnecting(true);
      setConnectStatus("Connecting to GitHub...");
      
      axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/github/exchange`, { code })
        .then((res) => {
          localStorage.setItem("github_access_token", res.data.accessToken);
          localStorage.setItem("github_username", res.data.username);
          setGithubConnected(true);
          setGithubUsername(res.data.username);
          toast.success("GitHub connected successfully!");
          window.history.replaceState({}, document.title, location.pathname);
          
          // If wallet is already connected, proceed to link them
          if (solWallet.connected) {
            linkWalletToGitHub();
          }
        })
        .catch(() => {
          toast.error("GitHub connection failed. Please try again.");
        })
        .finally(() => setConnecting(false));
    }
  }, [location, githubConnected]);

  // Link GitHub and wallet
  const linkWalletToGitHub = async () => {
    if (!githubConnected || !solWallet.connected) {
      return;
    }

    setConnecting(true);
    setConnectStatus("Linking GitHub and wallet...");

    try {
      const publicKey = solWallet.publicKey?.toBase58();
      if (!publicKey) throw new Error("No wallet address");
      setWallet({ publicKey });

      // Get challenge from backend
      const { data: challengeData } = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/github/challenge`,
        { github_username: githubUsername }
      );
      const challenge = challengeData.challenge;

      // Sign challenge
      if (!solWallet.signMessage) throw new Error("Wallet does not support signMessage");
      const encoded = new TextEncoder().encode(challenge);
      const sig = await solWallet.signMessage(encoded);
      const sigBase64 = btoa(String.fromCharCode(...sig));

      // Send signature to backend to link GitHub <-> wallet
      await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/github/link`,
        {
          github_username: githubUsername,
          wallet_address: publicKey,
          signature: sigBase64,
          challenge,
        }
      );

      setWallet({ publicKey, signature: sigBase64, githubUsername });
      toast.success("Successfully linked GitHub and wallet!");

      // Send to extension API if needed
      window.postMessage(
        {
          action: "linkGitHubWallet",
          githubUsername,
          walletAddress: publicKey,
        },
        "*"
      );

      localStorage.setItem("onboarded", "1");
      navigate("/dashboard");
    } catch (error) {
      toast.error(error.response?.data?.error || error.message || "Connection error");
    } finally {
      setConnecting(false);
    }
  };

  // Initialize onboarding flow
  const startOnboarding = () => {
    if (!githubConnected) {
      window.location.href = getGithubAuthUrl();
    } else if (!solWallet.connected) {
      // Let wallet adapter handle this
    } else {
      linkWalletToGitHub();
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            borderRadius: '8px',
            background: '#333',
            color: '#fff',
          },
        }}
      />
      
      {/* Extension Modal */}
      <ExtensionModal isOpen={showExtensionModal} onClose={() => setShowExtensionModal(false)} />
      
      {/* Header */}
      <header className="bg-white py-6 px-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center">
            <span className="text-2xl font-bold text-indigo-600">SkillMint</span>
          </div>
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#features" className="text-gray-600 hover:text-indigo-600 transition">Features</a>
            <a href="#how-it-works" className="text-gray-600 hover:text-indigo-600 transition">How It Works</a>
            <a href="#testimonials" className="text-gray-600 hover:text-indigo-600 transition">Testimonials</a>
            <a href="#faq" className="text-gray-600 hover:text-indigo-600 transition">FAQ</a>
          </nav>
          <div>
            {solWallet.connected ? (
              <div className="flex items-center space-x-3">
                <span className="text-sm text-gray-600">Connected</span>
                <div className="h-2 w-2 rounded-full bg-green-500"></div>
              </div>
            ) : (
              <WalletMultiButton className="text-indigo-600 border border-indigo-600 rounded-lg px-4 py-2 hover:bg-indigo-50 transition" />
            )}
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-gradient-to-r from-indigo-50 to-indigo-100 py-20 px-4">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 mb-10 md:mb-0">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Own Your Developer Skills with On-Chain Credentials
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              SkillMint transforms your achievements into verifiable badges on Solana. Showcase your real skills and get recognized by top projects and DAOs.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={startOnboarding}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-6 py-3 rounded-lg transition flex items-center justify-center"
                disabled={connecting}
              >
                {connecting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {connectStatus || "Connecting..."}
                  </>
                ) : (
                  <>
                    {!githubConnected ? "Connect GitHub" : !solWallet.connected ? "Connect Wallet" : "Link Accounts"}
                  </>
                )}
              </button>
              
              <button 
                onClick={() => setShowExtensionModal(true)}
                className="border border-indigo-600 text-indigo-600 hover:bg-indigo-50 font-medium px-6 py-3 rounded-lg transition"
              >
                Install Extension
              </button>
            </div>
            
            {/* Status information */}
            {githubConnected && (
              <div className="mt-4 flex items-center">
                <div className="flex items-center bg-green-50 text-green-700 text-sm px-3 py-1 rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                  </svg>
                  GitHub Connected: {githubUsername}
                </div>
              </div>
            )}
          </div>
          
          <div className="md:w-1/2 md:pl-10">
            <div className="relative">
              <img
                src="https://miro.medium.com/v2/resize:fit:1100/format:webp/1*6Cq5sNQKUvT1oKIslU9WvQ.png"
                alt="SkillMint Dashboard"
                className="rounded-lg shadow-xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose SkillMint</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Showcase your real skills and get recognized by top projects and DAOs with verifiable on-chain badges.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition">
                <div className="text-3xl mb-4">{feature.icon}</div>
                <h3 className="font-semibold text-xl mb-2 text-gray-900">{feature.title}</h3>
                <p className="text-gray-600">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="bg-gray-50 py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">How SkillMint Works</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Simple steps to showcase your skills and get recognized in the Solana ecosystem.
            </p>
          </div>
          
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="md:w-1/2">
              <img
                src="https://i.ibb.co/BVwwrwQV/Screenshot-2025-05-14-193004.png"
                alt="SkillMint Dashboard"
                className="rounded-lg shadow-lg"
              />
            </div>
            
            <div className="md:w-1/2 space-y-8">
              <div className="flex items-start">
                <div className="bg-indigo-100 rounded-full p-3 mr-4">
                  <span className="text-indigo-600 font-semibold">1</span>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Connect Your Accounts</h3>
                  <p className="text-gray-600">Link your GitHub and Solana wallet in seconds. Our secure flow keeps your credentials safe.</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="bg-indigo-100 rounded-full p-3 mr-4">
                  <span className="text-indigo-600 font-semibold">2</span>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Earn Badges</h3>
                  <p className="text-gray-600">Get recognized for real achievements like contributing to open source, building dApps, or mastering Solana tools.</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="bg-indigo-100 rounded-full p-3 mr-4">
                  <span className="text-indigo-600 font-semibold">3</span>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Build Your Profile</h3>
                  <p className="text-gray-600">Showcase your badges and create a trustless developer profile that stands out to recruiters and DAOs.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">What Developers & Teams Say</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Join the growing community of developers who showcase their skills on SkillMint.
            </p>
          </div>
          
          <div className="relative bg-white rounded-xl shadow-md p-8 max-w-3xl mx-auto">
            <div className="mb-8">
              <p className="text-xl text-gray-700 italic">"{testimonials[activeTestimonial].text}"</p>
            </div>
            
            <div className="flex items-center">
              <img
                src={testimonials[activeTestimonial].img}
                alt={testimonials[activeTestimonial].name}
                className="w-12 h-12 rounded-full mr-4"
              />
              <div>
                <h4 className="font-semibold text-gray-900">{testimonials[activeTestimonial].name}</h4>
                <p className="text-sm text-gray-600">{testimonials[activeTestimonial].role}</p>
              </div>
            </div>
            
            <div className="absolute bottom-8 right-8 flex space-x-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setActiveTestimonial(index)}
                  className={`w-2 h-2 rounded-full ${
                    index === activeTestimonial ? "bg-indigo-600" : "bg-gray-300"
                  }`}
                  aria-label={`View testimonial ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="bg-indigo-600 py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-6">Ready to showcase your skills?</h2>
          <p className="text-xl text-indigo-100 mb-8">
            Join the growing community of developers who showcase their real achievements on SkillMint.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={startOnboarding}
              className="bg-white hover:bg-indigo-50 text-indigo-600 font-medium px-8 py-3 rounded-lg transition"
            >
              {!githubConnected ? "Connect GitHub" : !solWallet.connected ? "Connect Wallet" : "Go to Dashboard"}
            </button>
            <button
              onClick={() => setShowExtensionModal(true)}
              className="border border-white text-white hover:bg-indigo-700 font-medium px-8 py-3 rounded-lg transition"
            >
              Install Extension
            </button>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Common questions about SkillMint and on-chain skill verification.
            </p>
          </div>
          
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Is my data safe?</h3>
              <p className="text-gray-600">
                All wallet signatures are processed locally. No private keys ever leave your device. We use industry-standard security protocols for all GitHub and wallet interactions.
              </p>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">What if I lose my wallet?</h3>
              <p className="text-gray-600">
                Badges are on-chain and recoverable with your wallet. When you regain access to your wallet, you automatically regain access to all your badges.
              </p>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Who can issue badges?</h3>
              <p className="text-gray-600">
                Verified organizations and trusted community reviewers. You have full control over which badges you accept and display on your profile.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div>
              <h3 className="text-2xl font-bold mb-4">SkillMint</h3>
              <p className="text-gray-400 mb-6">
                Own your skills. Own your future.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-white transition">
                  <span className="sr-only">GitHub</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition">
                  <span className="sr-only">Twitter</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </a>
              <a href="#" className="text-gray-400 hover:text-white transition">
  <span className="sr-only">Discord</span>
  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.608 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1634-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286z" />
  </svg>
</a>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold text-lg mb-4">Resources</h3>
              <ul className="space-y-3">
                <li><a href="#" className="text-gray-400 hover:text-white transition">Documentation</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition">GitHub Repository</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition">API Reference</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition">Extension Guide</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-lg mb-4">Contact</h3>
              <ul className="space-y-3">
                <li><a href="#" className="text-gray-400 hover:text-white transition">Email Us</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition">Join Discord</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition">Follow on Twitter</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition">Submit Issue</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400 text-sm">
            <p>&copy; {new Date().getFullYear()} SkillMint. All rights reserved.</p>
            <p className="mt-2">Built with 💜 for the Solana community</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
