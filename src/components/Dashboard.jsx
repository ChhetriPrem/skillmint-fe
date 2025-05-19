import { useUserStore } from "../store/useUserStore";
import { BrowserRouter as Router, Routes, Route, Link, Navigate, Outlet, useLocation } from "react-router-dom";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useState } from "react";

export default function DashboardLayout() {
  const [activeTab, setActiveTab] = useState('home');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const steps = [
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
    },
    {
      step: "On-Chain Security",
      description: "All your templates are stored on-chain for transparency and proof.",
      icon: "🔒"
    }
  ];

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
        {/* How SkillMint Works Button */}
        <section className="w-full max-w-2xl mb-10 flex justify-center">
          <button
            onClick={() => setIsDialogOpen(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-6 py-3 rounded-lg shadow-md transition flex items-center space-x-2"
          >
            <span>How SkillMint Works</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
            </svg>
          </button>
        </section>

        {/* Dialog for How SkillMint Works */}
        {isDialogOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">How SkillMint Works</h2>
                <button 
                  onClick={() => setIsDialogOpen(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <ol className="list-none space-y-6 text-gray-600">
                {steps.map((item, index) => (
                  <li key={index} className="flex items-start">
                    <div className="flex items-center mr-4">
                      <div className="bg-indigo-100 rounded-full p-3 mr-3 text-center flex-shrink-0">
                        <span className="text-xl">{item.icon}</span>
                      </div>
                      <div className="bg-indigo-600 text-white rounded-full h-6 w-6 flex items-center justify-center text-sm font-medium">
                        {index + 1}
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-indigo-600">{item.step}</h3>
                      <p className="text-gray-600">{item.description}</p>
                    </div>
                  </li>
                ))}
              </ol>
              
              <div className="mt-8 flex justify-end">
                <button
                  onClick={() => setIsDialogOpen(false)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-5 py-2 rounded-lg transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

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
