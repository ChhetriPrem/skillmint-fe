import React, { useState } from "react";
import { useUserStore } from "../store/useUserStore";
import { 
  BrowserRouter as Router,
  Routes, 
  Route, 
  Link, 
  Navigate, 
  Outlet, 
  useLocation 
} from "react-router-dom";
import { WalletModalProvider, WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { 
  Home, 
  FileText, 
  Award, 
  FileCode, 
  Menu, 
  X, 
  ChevronRight 
} from "lucide-react";

// Import your CSS file that includes Tailwind
import "./dashboardExtra.css";

export default function DashboardLayout() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeTooltip, setActiveTooltip] = useState(null);
  const location = useLocation();
  
  // Function to determine if a nav item is active
  const isActive = (path) => {
    return location.pathname === path;
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white">
      {/* Top Navigation Bar */}
      <nav className="bg-gray-800 bg-opacity-80 backdrop-blur-lg border-b border-gray-700 fixed w-full z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo and Brand */}
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-500">
                  SkillMint
                </span>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:block">
              <div className="ml-10 flex items-center space-x-4">
                <Link
                  to="/"
                  className={`px-3 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition duration-150 ${
                    isActive("/") 
                      ? "bg-blue-600 text-white" 
                      : "text-gray-300 hover:bg-gray-700 hover:text-white"
                  }`}
                >
                  <Home size={18} />
                  <span>Home</span>
                </Link>
                
                <Link
                  to="/templates"
                  className={`px-3 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition duration-150 ${
                    isActive("/templates") 
                      ? "bg-blue-600 text-white" 
                      : "text-gray-300 hover:bg-gray-700 hover:text-white"
                  }`}
                >
                  <FileCode size={18} />
                  <span>Templates</span>
                </Link>
                
                <Link
                  to="/badges"
                  className={`px-3 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition duration-150 ${
                    isActive("/badges") 
                      ? "bg-blue-600 text-white" 
                      : "text-gray-300 hover:bg-gray-700 hover:text-white"
                  }`}
                >
                  <Award size={18} />
                  <span>Badges</span>
                </Link>
                
                <Link
                  to="/my-cv"
                  className={`px-3 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition duration-150 ${
                    isActive("/my-cv") 
                      ? "bg-purple-600 text-white" 
                      : "bg-purple-700 text-white hover:bg-purple-600"
                  } shadow-lg`}
                >
                  <FileText size={18} />
                  <span>⭐ My CV</span>
                </Link>
              </div>
            </div>
            
            {/* Wallet Button */}
            <div className="flex items-center">
              <WalletModalProvider>
                <WalletMultiButton className="wallet-adapter-button" />
              </WalletModalProvider>
              
              {/* Mobile menu button */}
              <div className="md:hidden ml-4">
                <button
                  onClick={toggleMenu}
                  className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                >
                  <span className="sr-only">Open main menu</span>
                  {isMenuOpen ? (
                    <X className="block h-6 w-6" />
                  ) : (
                    <Menu className="block h-6 w-6" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        <div className={`${isMenuOpen ? 'block' : 'hidden'} md:hidden`}>
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link
              to="/"
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                isActive("/") 
                  ? "bg-blue-600 text-white" 
                  : "text-gray-300 hover:bg-gray-700 hover:text-white"
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              <div className="flex items-center gap-3">
                <Home size={18} />
                <span>Home</span>
              </div>
            </Link>
            
            <Link
              to="/templates"
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                isActive("/templates") 
                  ? "bg-blue-600 text-white" 
                  : "text-gray-300 hover:bg-gray-700 hover:text-white"
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              <div className="flex items-center gap-3">
                <FileCode size={18} />
                <span>Templates</span>
              </div>
            </Link>
            
            <Link
              to="/badges"
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                isActive("/badges") 
                  ? "bg-blue-600 text-white" 
                  : "text-gray-300 hover:bg-gray-700 hover:text-white"
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              <div className="flex items-center gap-3">
                <Award size={18} />
                <span>Badges</span>
              </div>
            </Link>
            
            <Link
              to="/my-cv"
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                isActive("/my-cv") 
                  ? "bg-purple-600 text-white" 
                  : "bg-purple-700 text-white hover:bg-purple-600"
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              <div className="flex items-center gap-3">
                <FileText size={18} />
                <span>⭐ My CV</span>
              </div>
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="pt-20 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Feature Cards for Desktop */}
        <div className="hidden md:block mb-10">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Templates Feature Card */}
            <div 
              className="bg-gray-800 bg-opacity-60 rounded-lg p-6 border border-gray-700 shadow-xl hover:border-blue-500 transition duration-300 relative overflow-hidden group"
              onMouseEnter={() => setActiveTooltip('templates')}
              onMouseLeave={() => setActiveTooltip(null)}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
              <div className="flex justify-between items-start">
                <div>
                  <FileCode className="h-10 w-10 text-blue-400 mb-4" />
                  <h3 className="text-xl font-bold mb-2">CV Templates</h3>
                  <p className="text-gray-300 mb-4">Choose from professional templates to showcase your skills and experience</p>
                </div>
                <span className="text-blue-400 group-hover:translate-x-2 transition-transform duration-300">
                  <ChevronRight size={24} />
                </span>
              </div>
              <div className="mt-4">
                <Link
                  to="/templates"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Browse Templates
                </Link>
              </div>
              
              {/* Tooltip */}
              <div className={`absolute bg-gray-900 text-white text-sm rounded-md p-3 bottom-full left-1/2 transform -translate-x-1/2 -translate-y-2 w-64 shadow-lg transition-opacity duration-200 ${activeTooltip === 'templates' ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                <p className="font-medium mb-1">What are Templates?</p>
                <p className="text-gray-300 text-xs">Templates are pre-designed CV layouts with metadata that you can mint on the blockchain. Choose one that best represents your professional style.</p>
                <div className="absolute h-2 w-2 bg-gray-900 transform rotate-45 left-1/2 -translate-x-1/2 -bottom-1"></div>
              </div>
            </div>

            {/* Badges Feature Card */}
            <div 
              className="bg-gray-800 bg-opacity-60 rounded-lg p-6 border border-gray-700 shadow-xl hover:border-blue-500 transition duration-300 relative overflow-hidden group"
              onMouseEnter={() => setActiveTooltip('badges')}
              onMouseLeave={() => setActiveTooltip(null)}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
              <div className="flex justify-between items-start">
                <div>
                  <Award className="h-10 w-10 text-purple-400 mb-4" />
                  <h3 className="text-xl font-bold mb-2">Skill Badges</h3>
                  <p className="text-gray-300 mb-4">Mint verified NFT badges that represent your skills and accomplishments</p>
                </div>
                <span className="text-purple-400 group-hover:translate-x-2 transition-transform duration-300">
                  <ChevronRight size={24} />
                </span>
              </div>
              <div className="mt-4">
                <Link
                  to="/badges"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                >
                  View Badges
                </Link>
              </div>
              
              {/* Tooltip */}
              <div className={`absolute bg-gray-900 text-white text-sm rounded-md p-3 bottom-full left-1/2 transform -translate-x-1/2 -translate-y-2 w-64 shadow-lg transition-opacity duration-200 ${activeTooltip === 'badges' ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                <p className="font-medium mb-1">What are Badges?</p>
                <p className="text-gray-300 text-xs">Badges are NFTs that verify your skills and achievements. They include metadata about your expertise and can be added to your blockchain CV.</p>
                <div className="absolute h-2 w-2 bg-gray-900 transform rotate-45 left-1/2 -translate-x-1/2 -bottom-1"></div>
              </div>
            </div>

            {/* My CV Feature Card */}
            <div 
              className="bg-gray-800 bg-opacity-60 rounded-lg p-6 border border-purple-700 shadow-xl hover:border-purple-500 transition duration-300 relative overflow-hidden group"
              onMouseEnter={() => setActiveTooltip('cv')}
              onMouseLeave={() => setActiveTooltip(null)}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-blue-600 opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
              <div className="flex justify-between items-start">
                <div>
                  <FileText className="h-10 w-10 text-indigo-400 mb-4" />
                  <h3 className="text-xl font-bold mb-2">⭐ My CV</h3>
                  <p className="text-gray-300 mb-4">Build and manage your blockchain-verified resume with minted templates and badges</p>
                </div>
                <span className="text-indigo-400 group-hover:translate-x-2 transition-transform duration-300">
                  <ChevronRight size={24} />
                </span>
              </div>
              <div className="mt-4">
                <Link
                  to="/my-cv"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Manage CV
                </Link>
              </div>
              
              {/* Tooltip */}
              <div className={`absolute bg-gray-900 text-white text-sm rounded-md p-3 bottom-full left-1/2 transform -translate-x-1/2 -translate-y-2 w-64 shadow-lg transition-opacity duration-200 ${activeTooltip === 'cv' ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                <p className="font-medium mb-1">What is My CV?</p>
                <p className="text-gray-300 text-xs">Your blockchain CV combines your selected template and earned badges into a verifiable digital resume. Manage all aspects of your professional identity here.</p>
                <div className="absolute h-2 w-2 bg-gray-900 transform rotate-45 left-1/2 -translate-x-1/2 -bottom-1"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="bg-gray-800 bg-opacity-60 rounded-lg border border-gray-700 p-6 min-h-screen">
          <Outlet />
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 border-t border-gray-800">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <span className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-500">
                SkillMint
              </span>
              <p className="text-gray-400 text-sm mt-1">Blockchain-verified professional credentials</p>
            </div>
            <div className="flex space-x-6">
              <a href="#" className="text-gray-400 hover:text-white">
                Privacy Policy
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                Terms of Service
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                Help
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
