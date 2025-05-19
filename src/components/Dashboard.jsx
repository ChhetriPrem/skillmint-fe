import { useUserStore } from "../store/useUserStore";
import { BrowserRouter as Router, Routes, Route, Link, Navigate, Outlet, useLocation } from "react-router-dom";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";

export default function DashboardLayout() {
  return (
    <>
      {/* NAVBAR */}
      <nav className="bg-gradient-to-r from-indigo-900 via-purple-800 to-indigo-700 py-4 px-8 flex justify-between items-center shadow-lg relative">
        <div className="flex items-center gap-3">
          <span className="text-3xl font-extrabold tracking-tight text-white drop-shadow">SkillMint</span>
        </div>
        <div className="flex gap-6 items-center">
          <Link to="/dashboard" className="text-indigo-100 hover:text-white font-semibold transition">Home</Link>
          <Link to="/dashboard/template" className="text-indigo-100 hover:text-white font-semibold transition">Templates</Link>
          <Link to="/dashboard/badges" className="text-indigo-100 hover:text-white font-semibold transition">Badges</Link>
        </div>
        <Link
          to="/cv/renao"
          className="absolute right-56 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold px-4 py-2 rounded-lg shadow-lg hover:scale-105 transition"
        >
          🌟 My CV
        </Link>
        <WalletMultiButton className="!bg-indigo-600 !hover:bg-indigo-700 !text-white !rounded-lg !shadow" />
      </nav>

      {/* MAIN CONTENT */}
      <main className="min-h-screen bg-white flex flex-col items-center py-12 px-4">
        {/* Step-by-step Instructions */}
        <section className="w-full max-w-2xl mb-10">
          <div className="bg-indigo-50 rounded-xl shadow-md p-8 border border-indigo-100 mb-8">
            <h2 className="text-2xl font-bold text-indigo-800 mb-4">How SkillMint Works</h2>
            <ol className="list-decimal list-inside space-y-3 text-gray-700">
              <li>
                <span className="font-semibold text-indigo-600">Install the SkillMint browser extension</span> and log in with your GitHub account.
              </li>
              <li>
                <span className="font-semibold text-indigo-600">Make sure both you and the person you want to mint a badge for are registered on SkillMint</span> (with the extension installed).
              </li>
              <li>
                If you installed the extension <span className="font-semibold text-indigo-600">after</span> logging in, please log out and log in again to link your wallet and GitHub.
              </li>
              <li>
                <span className="font-semibold text-indigo-600">Create a badge template</span> (see below), then mint a badge to a contributor in your PR or repo!
              </li>
              <li>
                The recipient can view their badges in <span className="font-semibold text-indigo-600">My Badges</span> after logging in.
              </li>
              <li>
                <span className="font-semibold text-indigo-600">Scan a QR code</span> (coming soon) to quickly view a SkillMint CV!
              </li>
              <li>
                All your templates are stored on-chain for transparency and proof.
              </li>
            </ol>
          </div>
        </section>

        {/* Navigation Cards */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-3xl mb-12">
          <Link to="/dashboard/template" className="group bg-white hover:bg-indigo-50 rounded-xl shadow-md p-8 flex flex-col items-center transition transform hover:-translate-y-1 border border-indigo-100">
            <span className="text-4xl mb-4">📝</span>
            <h3 className="text-xl font-bold text-indigo-700 mb-2 group-hover:text-indigo-800 transition">Create Badge Template</h3>
            <p className="text-gray-600 text-center">Design and publish new badge templates for your open source project or community.</p>
          </Link>
          <Link to="/dashboard/badges" className="group bg-white hover:bg-indigo-50 rounded-xl shadow-md p-8 flex flex-col items-center transition transform hover:-translate-y-1 border border-indigo-100">
            <span className="text-4xl mb-4">🏅</span>
            <h3 className="text-xl font-bold text-indigo-700 mb-2 group-hover:text-indigo-800 transition">View Badges</h3>
            <p className="text-gray-600 text-center">See all the badges you've minted and received, and share your achievements.</p>
          </Link>
        </section>

        {/* Outlet for subroutes */}
        <div className="w-full max-w-4xl">
          <Outlet />
        </div>

        {/* Pause/Reflection Message */}
        <section className="w-full max-w-2xl mt-16 mb-8">
          <div className="bg-indigo-50 rounded-xl shadow-md p-6 border border-indigo-100 text-center">
            <h4 className="text-xl font-bold text-indigo-800 mb-3">⏸️ Project Paused for Now</h4>
            <p className="text-gray-700">
              Building SkillMint has been an amazing journey, but for now, I'm taking a break due to upcoming exams and the reality of financial priorities. Sometimes, stepping back is the best way to come back stronger—especially when you want to build something truly impactful and sustainable.<br /><br />
              <span className="font-semibold text-indigo-600">SkillMint isn't abandoned—just paused.</span> When the time and resources align, I'll return with fresh energy and new ideas. Until then, thank you for your support and curiosity!
            </p>
          </div>
        </section>

        <div className="text-xs mt-8 text-gray-500">No Anchor JS used. All serialization is manual.</div>
      </main>
    </>
  );
}
