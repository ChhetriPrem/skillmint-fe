import { useUserStore } from "../store/useUserStore";
import { Outlet } from "react-router-dom";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useState, useMemo } from "react";
import BadgeList from "./BadgesList";
import InitializeIssuer from "./IssuerInitializer";
import { PhantomWalletAdapter } from "@solana/wallet-adapter-wallets";
import CreateBadgeTemplate from "./BadgeTemplateCreator";
import { clusterApiUrl, Connection } from "@solana/web3.js";
import { NETWORK } from "../utils/constants";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import { Link } from "react-router-dom";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
export default function DashboardLayout() {
  const github = useUserStore((state) => state.github);
  const username = github?.username;

  const wallets = useMemo(() => [new PhantomWalletAdapter()], []);
  const connection = useMemo(() => new Connection(clusterApiUrl(NETWORK)), []);

  const [activeTab, setActiveTab] = useState("home");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState(null);
  const [dialogTitle, setDialogTitle] = useState("");

  // Helper to open dialog with a specific type and title
  const openDialog = (type, title) => {
    setDialogType(type);
    setDialogTitle(title);
    setIsDialogOpen(true);
  };

  // Helper to close dialog and reset state
  const closeDialog = () => {
    setIsDialogOpen(false);
    setDialogType(null);
    setDialogTitle("");
  };

  const steps = [
    {
      step: "Install Extension",
      description:
        "Install the SkillMint browser extension and log in with your GitHub account.",
      icon: "🔗",
    },
    {
      step: "Register Users",
      description:
        "Make sure both you and the person you want to mint a badge for are registered on SkillMint.",
      icon: "👥",
    },
    {
      step: "Link Accounts",
      description:
        "If you installed the extension after logging in, please log out and log in again to link your wallet and GitHub.",
      icon: "🔄",
    },
    {
      step: "Create Templates",
      description:
        "Create a badge template (see below), then mint a badge to a contributor in your PR or repo!",
      icon: "✏️",
    },
    {
      step: "View Badges",
      description:
        "The recipient can view their badges in My Badges after logging in.",
      icon: "🏅",
    },
    {
      step: "Share Your CV",
      description:
        "Scan a QR code (coming soon) to quickly view a SkillMint CV!",
      icon: "📱",
    },
    {
      step: "On-Chain Security",
      description:
        "All your templates are stored on-chain for transparency and proof.",
      icon: "🔒",
    },
  ];

  return (
    <>
      <ConnectionProvider endpoint={clusterApiUrl(NETWORK)}>
        <WalletProvider wallets={wallets} autoConnect>
          <WalletModalProvider>
            {/* NAVBAR */}
            <nav className="bg-white py-6 px-4 flex justify-between items-center shadow-sm sticky top-0 z-10">
              <div className="max-w-6xl mx-auto flex justify-between items-center w-full">
                <div className="flex items-center">
                  <span className="text-2xl font-bold text-indigo-600">
                    SkillMint
                  </span>
                </div>
                <div className="hidden md:flex items-center space-x-8">
                  <button
                    className={`bg-transparent border-none outline-none cursor-pointer ${
                      activeTab === "home"
                        ? "text-indigo-600"
                        : "text-gray-600 hover:text-indigo-600"
                    } transition`}
                    onClick={() => setActiveTab("home")}
                  >
                    Home
                  </button>
                  <button
                    className={`bg-transparent border-none outline-none cursor-pointer ${
                      activeTab === "templates"
                        ? "text-indigo-600"
                        : "text-gray-600 hover:text-indigo-600"
                    } transition`}
                    onClick={() => setActiveTab("templates")}
                  >
                    Templates
                  </button>
                  <button
                    className={`bg-transparent border-none outline-none cursor-pointer ${
                      activeTab === "badges"
                        ? "text-indigo-600"
                        : "text-gray-600 hover:text-indigo-600"
                    } transition`}
                    onClick={() => setActiveTab("badges")}
                  >
                    Badges
                  </button>
                  <Link
                    to={username ? `/cv/${username}` : "#"}
                    className={`bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-4 py-2 rounded-lg transition ${
                      !username && "opacity-50 pointer-events-none"
                    }`}
                  >
                    My CV
                  </Link>
                </div>
                <WalletMultiButton className="!bg-indigo-600 !hover:bg-indigo-700 !text-white !rounded-lg !shadow-sm" />
              </div>
            </nav>

            {/* MAIN CONTENT with conditional blur */}
            <main
              className={`min-h-screen bg-gradient-to-r from-indigo-50 to-indigo-100 flex flex-col items-center py-20 px-4 transition ${
                isDialogOpen ? "filter blur-sm" : ""
              }`}
            >
              {/* How SkillMint Works Button */}
              <section className="w-full max-w-2xl mb-10 flex justify-center">
                <button
                  onClick={() => openDialog("how", "How SkillMint Works")}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-6 py-3 rounded-lg shadow-md transition flex items-center space-x-2"
                >
                  <span>How SkillMint Works</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </section>

              {/* Navigation Cards: open dialog instead of redirect */}
              <section className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-5xl mb-12">
                {/* Initialize Issuer */}
                <button
                  type="button"
                  onClick={() => openDialog("issuer", "Initialize Issuer")}
                  className="group bg-white rounded-xl shadow-md hover:shadow-lg p-8 flex flex-col items-center transition transform hover:-translate-y-1 focus:outline-none"
                >
                  <div className="bg-indigo-100 rounded-full p-4 mb-6">
                    <span className="text-3xl">📝</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-indigo-600 transition">
                    Initialize Issuer
                  </h3>
                  <p className="text-gray-600 text-center">
                    Initialize Issuer (One time)
                  </p>
                </button>
                {/* Create Badge Template */}
                <button
                  type="button"
                  onClick={() =>
                    openDialog("template", "Create Badge Template")
                  }
                  className="group bg-white rounded-xl shadow-md hover:shadow-lg p-8 flex flex-col items-center transition transform hover:-translate-y-1 focus:outline-none"
                >
                  <div className="bg-indigo-100 rounded-full p-4 mb-6">
                    <span className="text-3xl">📝</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-indigo-600 transition">
                    Create Badge Template
                  </h3>
                  <p className="text-gray-600 text-center">
                    Design and publish new badge templates for your open source
                    project or community.
                  </p>
                </button>
                {/* View Badges */}
                <button
                  type="button"
                  onClick={() => openDialog("badges", "View Badges")}
                  className="group bg-white rounded-xl shadow-md hover:shadow-lg p-8 flex flex-col items-center transition transform hover:-translate-y-1 focus:outline-none"
                >
                  <div className="bg-indigo-100 rounded-full p-4 mb-6">
                    <span className="text-3xl">🏅</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-indigo-600 transition">
                    View Badges
                  </h3>
                  <p className="text-gray-600 text-center">
                    See all the badges you've minted and received, and share
                    your achievements.
                  </p>
                </button>
              </section>

              {/* Outlet for subroutes */}
              <div className="w-full max-w-4xl">
                <Outlet />
              </div>

              {/* Pause/Reflection Message */}
              <section className="w-full max-w-2xl mt-16 mb-8">
                <div className="bg-white rounded-xl shadow-md p-8 text-center">
                  <div className="inline-block bg-indigo-100 rounded-full p-3 mb-4">
                    <span className="text-2xl">⏸️</span>
                  </div>
                  <h4 className="text-xl font-bold text-gray-900 mb-4">
                    Project Paused for Now
                  </h4>
                  <p className="text-gray-600 leading-relaxed">
                    Building SkillMint has been an amazing journey, but for now,
                    I'm taking a break due to upcoming exams and the reality of
                    financial priorities. Sometimes, stepping back is the best
                    way to come back stronger-especially when you want to build
                    something truly impactful and sustainable.
                  </p>
                  <div className="my-4 h-px bg-gray-100"></div>
                  <p className="text-gray-600">
                    <span className="font-medium text-indigo-600">
                      SkillMint isn't abandoned-just paused.
                    </span>{" "}
                    When the time and resources align, I'll return with fresh
                    energy and new ideas. Until then, thank you for your support
                    and curiosity!
                  </p>
                </div>
              </section>

              <div className="text-xs mt-8 text-gray-400">
                No Anchor JS used. All serialization is manual.
              </div>
            </main>

            {/* DIALOG MODAL OVERLAY */}
            {isDialogOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center  bg-opacity-60 backdrop-blur-md">
                <div className="">
                  <div className="flex justify-between items-center relative ">
                    <h2 className="text-xl font-bold text-gray-900"></h2>
                    <button
                      onClick={closeDialog}
                      className="text-gray-500  hover:text-gray-700"
                      aria-label="Close dialog"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-9 absolute right-10 top-20 z-9999 w-9"
                        fill="none"
                        viewBox="0 0 30  24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                  <div>
                    {dialogType === "issuer" && (
                      <InitializeIssuer connection={connection} />
                    )}
                    {dialogType === "template" && (
                      <CreateBadgeTemplate connection={connection} />
                    )}
                    {dialogType === "badges" && <BadgeList />}
                    {dialogType === "how" && (
                      <div>
                        <ul className="space-y-4">
                          {steps.map((step, idx) => (
                            <li
                              key={idx}
                              className="flex items-start space-x-3"
                            >
                              <span className="text-2xl">{step.icon}</span>
                              <div>
                                <div className="font-semibold">{step.step}</div>
                                <div className="text-gray-600 text-sm">
                                  {step.description}
                                </div>
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </WalletModalProvider>
        </WalletProvider>
      </ConnectionProvider>
    </>
  );
}
