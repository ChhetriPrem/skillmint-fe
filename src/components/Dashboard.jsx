import { useUserStore } from "../store/useUserStore";
import { BrowserRouter as Router, Routes, Route, Link, Navigate, Outlet, useLocation } from "react-router-dom";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useState } from "react";

export default function DashboardLayout() {
  const [activeTab, setActiveTab] = useState('home');

  return (
    <>
      {/* NAVBAR - Modern style matching landing page */}
      <nav className="bg-white py-6 px-4 flex justify-between items-center shadow-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto flex justify-between items-center w-full">
          <div className="flex items-center">
            <span className="text-2xl font-bold text-indigo-600">SkillMint</span>
          </div>
          
          <div className="hidden md:flex items-center space-x-8">
            <Link 
              to="/dashboard" 
              className={`${activeTab === 'home' ? 'text-indigo-600' : 'text-gray-600 hover:text-indigo-600'} transition`}
              onClick={() => setActiveTab('home')}
            >
              Home
            </Link>
            <Link 
              to="/dashboard/template" 
              className={`${activeTab === 'templates' ? 'text-indigo-600' : 'text-gray-600 hover:text-indigo-600'} transition`}
              onClick={() => setActiveTab('templates')}
            >
              Templates
            </Link>
            <Link 
              to="/dashboard/badges" 
              className={`${activeTab === 'badges' ? 'text-indigo-600' : 'text-gray-600 hover:text-indigo-600'} transition`}
              onClick={() => setActiveTab('badges')}
            >
              Badges
            </Link>
            <Link 
              to="/cv/renao" 
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-4 py-2 rounded-lg transition"
            >
              My CV
            </Link>
          </div>
          
          <WalletMultiButton className="!bg-indigo-600 !hover:bg-indigo-700 !text-white !rounded-lg !shadow-sm" />
        </div>
      </nav>

      {/* MAIN CONTENT */}
      <main className="min-h-screen bg-gradient-to-r from-indigo-50 to-indigo-100 flex flex-col items-center py-20 px-4">
        {/* Step-by-step Instructions Card */}
        <section className="w-full max-w-2xl mb-10">
          <div className="bg-white rounded-xl shadow-md p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">How SkillMint Works</h2>
            <ol className="list-none space-y-6 text-gray-600">
              {[
                {
                  step: "Install Extension",
                  description: "Install the SkillMint browser extension and log in with your GitHub account.",
                  icon: "🔗"
                },
                {
                  step: "Register Users",
                  description: "Make sure both you and the person you want to mint a badge for are registered on SkillMint.",
                  icon: "👥"
                }, 
                {
                  step: "Link Accounts",
                  description: "If you installed the extension after logging in, please log out and log in again to link your wallet and GitHub.",
                  icon: "🔄"
                },
                {
                  step: "Create Templates", 
                  description: "Create a badge template (see below), then mint a badge to a contributor in your PR or repo!",
                  icon: "✏️"
                },
                {
                  step: "View Badges",
                  description: "The recipient can view their badges in My Badges after logging in.",
                  icon: "🏅"
                },
                {
                  step: "Share Your CV",
                  description: "Scan a QR code (coming soon) to quickly view a SkillMint CV!",
                  icon: "📱"
                }
              ].map((item, index) => (
                <li key={index} className="flex items-start">
                  <div className="bg-indigo-100 rounded-full p-3 mr-4 text-center flex-shrink-0">
                    <span className="text-xl">{item.icon}</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-indigo-600">{item.step}</h3>
                    <p className="text-gray-600">{item.description}</p>
                  </div>
                </li>
              ))}
              <li className="flex items-start">
                <div className="bg-indigo-100 rounded-full p-3 mr-4 text-center flex-shrink-0">
                  <span className="text-xl">🔒</span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-indigo-600">On-Chain Security</h3>
                  <p className="text-gray-600">All your templates are stored on-chain for transparency and proof.</p>
                </div>
              </li>
            </ol>
          </div>
        </section>

        {/* Navigation Cards */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-3xl mb-12">
          <Link to="/dashboard/template" className="group bg-white rounded-xl shadow-md hover:shadow-lg p-8 flex flex-col items-center transition transform hover:-translate-y-1">
            <div className="bg-indigo-100 rounded-full p-4 mb-6">
              <span className="text-3xl">📝</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-indigo-600 transition">Create Badge Template</h3>
            <p className="text-gray-600 text-center">Design and publish new badge templates for your open source project or community.</p>
          </Link>
          <Link to="/dashboard/badges" className="group bg-white rounded-xl shadow-md hover:shadow-lg p-8 flex flex-col items-center transition transform hover:-translate-y-1">
            <div className="bg-indigo-100 rounded-full p-4 mb-6">
              <span className="text-3xl">🏅</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-indigo-600 transition">View Badges</h3>
            <p className="text-gray-600 text-center">See all the badges you've minted and received, and share your achievements.</p>
          </Link>
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
            <h4 className="text-xl font-bold text-gray-900 mb-4">Project Paused for Now</h4>
            <p className="text-gray-600 leading-relaxed">
              Building SkillMint has been an amazing journey, but for now, I'm taking a break due to upcoming exams and the reality of financial priorities. Sometimes, stepping back is the best way to come back stronger—especially when you want to build something truly impactful and sustainable.
            </p>
            <div className="my-4 h-px bg-gray-100"></div>
            <p className="text-gray-600">
              <span className="font-medium text-indigo-600">SkillMint isn't abandoned—just paused.</span> When the time and resources align, I'll return with fresh energy and new ideas. Until then, thank you for your support and curiosity!
            </p>
          </div>
        </section>

        <div className="text-xs mt-8 text-gray-400">No Anchor JS used. All serialization is manual.</div>
      </main>
    </>
  );
}
