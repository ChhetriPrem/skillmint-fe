import React from "react";
import { motion } from "framer-motion";

// Example data (replace with your real info or props/store)
const profile = {
  name: "Renao",
  avatar: "https://avatars.githubusercontent.com/u/123456?v=4",
  tagline: "Solana Developer • Web3 Engineer • Open Source",
  bio: "Building decentralized futures. Passionate about on-chain reputation, NFTs, and developer empowerment.",
  location: "Bangalore, India",
  email: "renao@example.com",
  github: "https://github.com/renao",
  twitter: "https://twitter.com/renaodev",
  website: "https://renaosol.dev",
  wallet: "7T3x...abcd", // Shortened for display
  badges: [
    { name: "Solana Contributor", icon: "🟣" },
    { name: "Open Source Reviewer", icon: "🌟" },
    { name: "Hackathon Winner", icon: "🏆" },
    { name: "Rust Wizard", icon: "🦀" },
  ],
  featuredProjects: [
    {
      name: "SkillMint",
      desc: "On-chain, verifiable skill badges for Solana developers.",
      link: "https://skillmint.dev",
      img: "https://superteam.fun/logo.png",
    },
    {
      name: "NFT Gallery",
      desc: "A beautiful Solana NFT explorer.",
      link: "https://nftgallery.dev",
      img: "https://placehold.co/80x80",
    },
  ],
};

export default function MyOnlineCV() {
  return (
    <div className="min-h-screen bg-gradient-to-tr from-[#0f172a] via-[#1e293b] to-[#0f172a] flex items-center justify-center p-6 relative overflow-hidden text-white">
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

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 w-full max-w-3xl bg-[#111827]/90 backdrop-blur-md rounded-3xl p-10 shadow-[0_0_40px_rgba(139,92,246,0.6)] border border-purple-700"
      >
        {/* Header */}
        <div className="flex flex-col items-center gap-4">
          <img
            src={profile.avatar}
            alt={profile.name}
            className="w-32 h-32 rounded-full border-4 border-purple-500 shadow-lg"
          />
          <h1 className="text-4xl font-extrabold bg-gradient-to-r from-purple-400 via-pink-400 to-yellow-300 bg-clip-text text-transparent drop-shadow-lg">
            {profile.name}
          </h1>
          <div className="text-lg text-pink-300 font-semibold">{profile.tagline}</div>
          <div className="text-gray-300 text-center max-w-xl">{profile.bio}</div>
        </div>

        {/* Links */}
        <div className="flex flex-wrap gap-4 justify-center mt-6 mb-6">
          <a href={profile.github} target="_blank" rel="noopener noreferrer"
             className="px-4 py-2 bg-[#181f2a] rounded-lg border border-purple-700 hover:bg-purple-900/40 transition">
            🐙 GitHub
          </a>
          <a href={profile.twitter} target="_blank" rel="noopener noreferrer"
             className="px-4 py-2 bg-[#181f2a] rounded-lg border border-pink-700 hover:bg-pink-900/40 transition">
            🐦 Twitter
          </a>
          <a href={profile.website} target="_blank" rel="noopener noreferrer"
             className="px-4 py-2 bg-[#181f2a] rounded-lg border border-yellow-500 hover:bg-yellow-900/40 transition">
            🌐 Website
          </a>
          <a href={`mailto:${profile.email}`}
             className="px-4 py-2 bg-[#181f2a] rounded-lg border border-gray-700 hover:bg-gray-900/40 transition">
            ✉️ Email
          </a>
        </div>

        {/* Details */}
        <div className="flex flex-wrap justify-center gap-6 mb-8">
          <div>
            <span className="font-bold text-purple-400">Location:</span>{" "}
            <span className="text-pink-400">{profile.location}</span>
          </div>
          <div>
            <span className="font-bold text-purple-400">Wallet:</span>{" "}
            <span className="text-pink-400 font-mono">{profile.wallet}</span>
          </div>
        </div>

        {/* Badges / Skills */}
        <div className="mb-10">
          <h2 className="text-2xl font-bold text-purple-300 mb-4 text-center">Skills & Badges</h2>
          <div className="flex flex-wrap gap-4 justify-center">
            {profile.badges.map((badge) => (
              <div
                key={badge.name}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-500 font-semibold shadow-lg text-white"
              >
                <span className="text-xl">{badge.icon}</span>
                {badge.name}
              </div>
            ))}
          </div>
        </div>

        {/* Projects */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-purple-300 mb-4 text-center">Featured Projects</h2>
          <div className="flex flex-wrap gap-6 justify-center">
            {profile.featuredProjects.map((proj) => (
              <a
                key={proj.name}
                href={proj.link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center bg-[#181f2a] rounded-2xl p-4 w-56 shadow-lg border border-purple-700 hover:scale-105 hover:border-pink-500 transition"
              >
                <img src={proj.img} alt={proj.name} className="w-20 h-20 rounded-xl mb-2" />
                <div className="font-bold text-pink-300">{proj.name}</div>
                <div className="text-gray-400 text-sm text-center">{proj.desc}</div>
              </a>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Animated floating stars */}
      <motion.div
        className="absolute top-10 left-10 text-pink-500 text-2xl select-none"
        animate={{ rotate: [0, 15, -15, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      >
        ⭐
      </motion.div>
      <motion.div
        className="absolute bottom-20 right-14 text-purple-400 text-3xl select-none"
        animate={{ y: [0, -15, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      >
        ✨
      </motion.div>

      <style jsx="true" global="true">{`
        @keyframes blob {
          0%, 100% {
            border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%;
          }
          50% {
            border-radius: 30% 60% 70% 40% / 50% 70% 30% 60%;
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
      `}</style>
    </div>
  );
}
