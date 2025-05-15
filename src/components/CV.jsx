import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Save, Edit, Eye, Briefcase, MapPin, Mail, Globe, Code, Github, Twitter, Award } from "lucide-react";

// Default empty profile template
const emptyProfile = {
  name: "",
  avatar: "/api/placeholder/150/150",
  tagline: "",
  bio: "",
  location: "",
  email: "",
  github: "",
  twitter: "",
  website: "",
  wallet: "",
  badges: [
    { name: "", icon: "🟣" },
    { name: "", icon: "🌟" },
    { name: "", icon: "🏆" },
    { name: "", icon: "🦀" },
  ],
  featuredProjects: [
    {
      name: "",
      desc: "",
      link: "",
      img: "/api/placeholder/80/80",
    },
    {
      name: "",
      desc: "",
      link: "",
      img: "/api/placeholder/80/80",
    },
  ],
};

// Sample profile for testing
const sampleProfile = {
  name: "Renao",
  avatar: "/api/placeholder/150/150",
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
      img: "/api/placeholder/80/80",
    },
    {
      name: "NFT Gallery",
      desc: "A beautiful Solana NFT explorer.",
      link: "https://nftgallery.dev",
      img: "/api/placeholder/80/80",
    },
  ],
};

export default function CVApp() {
  // State management
  const [isFirstVisit, setIsFirstVisit] = useState(true);
  const [isEditing, setIsEditing] = useState(true);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [profile, setProfile] = useState(emptyProfile);
  const [loading, setLoading] = useState(true);

  // Simulate fetching data from API
  useEffect(() => {
    const fetchData = async () => {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Check if user has data (simulate localStorage or API)
      const hasExistingData = localStorage.getItem('cv-data');
      
      if (hasExistingData) {
        setProfile(JSON.parse(hasExistingData));
        setIsFirstVisit(false);
        setIsEditing(false);
      } else {
        setProfile(emptyProfile);
        setIsFirstVisit(true);
        setIsEditing(true);
      }
      
      setLoading(false);
    };

    fetchData();
  }, []);

  // Save the CV data
  const handleSave = () => {
    localStorage.setItem('cv-data', JSON.stringify(profile));
    setIsEditing(false);
    setIsPreviewing(false);
    setIsFirstVisit(false);
  };

  // Update form field handler
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    // Handle nested properties
    if (name.includes('.')) {
      const [section, index, field] = name.split('.');
      
      setProfile(prev => {
        const newProfile = {...prev};
        if (section === 'badges') {
          newProfile.badges = [...prev.badges];
          newProfile.badges[index] = {
            ...newProfile.badges[index],
            [field]: value
          };
        } else if (section === 'featuredProjects') {
          newProfile.featuredProjects = [...prev.featuredProjects];
          newProfile.featuredProjects[index] = {
            ...newProfile.featuredProjects[index],
            [field]: value
          };
        }
        return newProfile;
      });
    } else {
      setProfile(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-tr from-gray-900 to-gray-800 flex items-center justify-center">
        <div className="text-white text-xl">Loading your CV...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-tr from-slate-900 to-blue-900 text-white">
      {/* App header */}
      <header className="px-6 py-4 flex justify-between items-center bg-black/30 backdrop-blur-md">
        <h1 className="text-2xl font-bold">
          <span className="text-blue-400">CV</span>
          <span className="text-white">Builder</span>
        </h1>
        
        <div className="flex gap-3">
          {!isFirstVisit && !isEditing && (
            <button 
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center gap-2 transition-colors"
            >
              <Edit size={16} />
              Edit CV
            </button>
          )}
          
          {isEditing && (
            <>
              <button 
                onClick={() => setIsPreviewing(!isPreviewing)}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg flex items-center gap-2 transition-colors"
              >
                <Eye size={16} />
                {isPreviewing ? "Back to Edit" : "Preview"}
              </button>
              
              <button 
                onClick={handleSave}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg flex items-center gap-2 transition-colors"
              >
                <Save size={16} />
                Save CV
              </button>
            </>
          )}
        </div>
      </header>
      
      <main className="container mx-auto p-6">
        {/* Form Mode */}
        {isEditing && !isPreviewing && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="bg-slate-800/70 backdrop-blur-md rounded-xl p-6 shadow-xl border border-blue-600/30"
          >
            <h2 className="text-2xl font-bold mb-6 text-blue-400">
              {isFirstVisit ? "Create Your CV" : "Edit Your CV"}
            </h2>
            
            <form className="space-y-8">
              {/* Personal Info Section */}
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-purple-400 border-b border-purple-500/30 pb-2">
                  Personal Information
                </h3>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1 text-blue-300">
                      Full Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={profile.name}
                      onChange={handleInputChange}
                      className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Your name"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1 text-blue-300">
                      Avatar URL
                    </label>
                    <input
                      type="text"
                      name="avatar"
                      value={profile.avatar}
                      onChange={handleInputChange}
                      className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="https://your-avatar-url.com/image.jpg"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1 text-blue-300">
                      Tagline
                    </label>
                    <input
                      type="text"
                      name="tagline"
                      value={profile.tagline}
                      onChange={handleInputChange}
                      className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Developer • Designer • Creator"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1 text-blue-300">
                      Location
                    </label>
                    <input
                      type="text"
                      name="location"
                      value={profile.location}
                      onChange={handleInputChange}
                      className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="City, Country"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1 text-blue-300">
                    Bio
                  </label>
                  <textarea
                    name="bio"
                    value={profile.bio}
                    onChange={handleInputChange}
                    rows="3"
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="A short description about yourself and your expertise"
                  />
                </div>
              </div>
              
              {/* Contact Section */}
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-purple-400 border-b border-purple-500/30 pb-2">
                  Contact & Social
                </h3>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1 text-blue-300">
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={profile.email}
                      onChange={handleInputChange}
                      className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="your-email@example.com"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1 text-blue-300">
                      Wallet Address
                    </label>
                    <input
                      type="text"
                      name="wallet"
                      value={profile.wallet}
                      onChange={handleInputChange}
                      className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Your wallet address (shortened if needed)"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1 text-blue-300">
                      GitHub URL
                    </label>
                    <input
                      type="text"
                      name="github"
                      value={profile.github}
                      onChange={handleInputChange}
                      className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="https://github.com/yourusername"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1 text-blue-300">
                      Twitter URL
                    </label>
                    <input
                      type="text"
                      name="twitter"
                      value={profile.twitter}
                      onChange={handleInputChange}
                      className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="https://twitter.com/yourusername"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1 text-blue-300">
                      Website
                    </label>
                    <input
                      type="text"
                      name="website"
                      value={profile.website}
                      onChange={handleInputChange}
                      className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="https://your-website.com"
                    />
                  </div>
                </div>
              </div>
              
              {/* Badges/Skills Section */}
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-purple-400 border-b border-purple-500/30 pb-2">
                  Skills & Badges
                </h3>
                
                <div className="space-y-4">
                  {profile.badges.map((badge, index) => (
                    <div key={index} className="flex gap-4 items-center">
                      <div className="w-12 text-center text-2xl">
                        <select
                          name={`badges.${index}.icon`}
                          value={badge.icon}
                          onChange={handleInputChange}
                          className="w-full bg-slate-700 border border-slate-600 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="🟣">🟣</option>
                          <option value="🌟">🌟</option>
                          <option value="🏆">🏆</option>
                          <option value="🦀">🦀</option>
                          <option value="🚀">🚀</option>
                          <option value="⚡">⚡</option>
                          <option value="💻">💻</option>
                          <option value="🔥">🔥</option>
                        </select>
                      </div>
                      
                      <div className="flex-1">
                        <input
                          type="text"
                          name={`badges.${index}.name`}
                          value={badge.name}
                          onChange={handleInputChange}
                          className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Skill or badge name"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Projects Section */}
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-purple-400 border-b border-purple-500/30 pb-2">
                  Featured Projects
                </h3>
                
                {profile.featuredProjects.map((project, index) => (
                  <div key={index} className="bg-slate-700/50 rounded-lg p-4 space-y-3">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1 text-blue-300">
                          Project Name
                        </label>
                        <input
                          type="text"
                          name={`featuredProjects.${index}.name`}
                          value={project.name}
                          onChange={handleInputChange}
                          className="w-full bg-slate-600 border border-slate-500 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Project name"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-1 text-blue-300">
                          Project Image URL
                        </label>
                        <input
                          type="text"
                          name={`featuredProjects.${index}.img`}
                          value={project.img}
                          onChange={handleInputChange}
                          className="w-full bg-slate-600 border border-slate-500 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="https://project-image-url.com/image.jpg"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-1 text-blue-300">
                        Project Description
                      </label>
                      <input
                        type="text"
                        name={`featuredProjects.${index}.desc`}
                        value={project.desc}
                        onChange={handleInputChange}
                        className="w-full bg-slate-600 border border-slate-500 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Brief description of your project"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-1 text-blue-300">
                        Project Link
                      </label>
                      <input
                        type="text"
                        name={`featuredProjects.${index}.link`}
                        value={project.link}
                        onChange={handleInputChange}
                        className="w-full bg-slate-600 border border-slate-500 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="https://your-project-url.com"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </form>
          </motion.div>
        )}
        
        {/* Preview Mode (Preview when editing or View mode when saved) */}
        {(isPreviewing || (!isEditing && !isFirstVisit)) && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="flex justify-center py-8"
          >
            <CVPreview profile={profile} />
          </motion.div>
        )}
      </main>
    </div>
  );
}

// CV Preview Component
const CVPreview = ({ profile }) => {
  return (
    <div className="w-full max-w-4xl relative">
      {/* Animated orbs */}
      <motion.div
        className="absolute top-0 left-0 w-64 h-64 rounded-full bg-blue-500 opacity-20 blur-3xl -z-10"
        animate={{ 
          x: [0, 40, 0],
          y: [0, 30, 0],
          borderRadius: ["60% 40% 30% 70% / 60% 30% 70% 40%", "30% 60% 70% 40% / 50% 70% 30% 60%", "60% 40% 30% 70% / 60% 30% 70% 40%"]
        }}
        transition={{ duration: 8, repeat: Infinity, repeatType: "reverse" }}
      />
      
      <motion.div
        className="absolute bottom-0 right-0 w-80 h-80 rounded-full bg-purple-500 opacity-20 blur-3xl -z-10"
        animate={{ 
          x: [0, -30, 0],
          y: [0, -20, 0],
          borderRadius: ["30% 60% 70% 40% / 50% 70% 30% 60%", "60% 40% 30% 70% / 60% 30% 70% 40%", "30% 60% 70% 40% / 50% 70% 30% 60%"]
        }}
        transition={{ duration: 10, repeat: Infinity, repeatType: "reverse", delay: 1 }}
      />
      
      <div className="bg-gray-900/80 backdrop-blur-md rounded-2xl overflow-hidden shadow-2xl border border-blue-600/30">
        {/* Header section with avatar and name */}
        <div className="relative h-48 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 flex items-end">
          <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-gray-900/90 to-transparent"></div>
          
          <div className="container mx-auto px-6 pb-4 relative z-10 flex items-end">
            <div className="mr-6">
              <img 
                src={profile.avatar || "/api/placeholder/150/150"}
                alt={profile.name}
                className="w-28 h-28 rounded-xl border-4 border-gray-800 shadow-xl"
              />
            </div>
            
            <div className="flex-1">
              <h1 className="text-4xl font-bold text-white">{profile.name || "Your Name"}</h1>
              <p className="text-blue-300 text-lg">{profile.tagline || "Your Tagline"}</p>
            </div>
          </div>
        </div>
        
        {/* Main content */}
        <div className="container mx-auto px-6 py-8">
          {/* Bio and basic info */}
          <div className="mb-8">
            <p className="text-gray-300 mb-6">
              {profile.bio || "Your professional bio will appear here."}
            </p>
            
            <div className="flex flex-wrap gap-x-8 gap-y-3 text-sm">
              {profile.location && (
                <div className="flex items-center text-blue-400">
                  <MapPin size={16} className="mr-2" />
                  {profile.location}
                </div>
              )}
              
              {profile.email && (
                <div className="flex items-center text-blue-400">
                  <Mail size={16} className="mr-2" />
                  {profile.email}
                </div>
              )}
              
              {profile.website && (
                <div className="flex items-center text-blue-400">
                  <Globe size={16} className="mr-2" />
                  {profile.website.replace(/^https?:\/\//, '')}
                </div>
              )}
              
              {profile.wallet && (
                <div className="flex items-center text-blue-400">
                  <Code size={16} className="mr-2" />
                  {profile.wallet}
                </div>
              )}
            </div>
          </div>
          
          {/* Contact links */}
          <div className="flex flex-wrap gap-3 mb-10">
            {profile.github && (
              <a 
                href={profile.github} 
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-blue-900 rounded-lg transition-colors border border-slate-700"
              >
                <Github size={16} />
                GitHub
              </a>
            )}
            
            {profile.twitter && (
              <a 
                href={profile.twitter} 
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-blue-900 rounded-lg transition-colors border border-slate-700"
              >
                <Twitter size={16} />
                Twitter
              </a>
            )}
            
            {profile.email && (
              <a 
                href={`mailto:${profile.email}`}
                className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-blue-900 rounded-lg transition-colors border border-slate-700"
              >
                <Mail size={16} />
                Email
              </a>
            )}
            
            {profile.website && (
              <a 
                href={profile.website} 
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-blue-900 rounded-lg transition-colors border border-slate-700"
              >
                <Globe size={16} />
                Website
              </a>
            )}
          </div>
          
          {/* Skills and badges */}
          <div className="mb-10">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Award size={20} className="text-purple-400" />
              Skills & Badges
            </h2>
            
            <div className="flex flex-wrap gap-3">
              {profile.badges.filter(b => b.name).map((badge, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-900/50 rounded-lg border border-blue-700/40"
                >
                  <span>{badge.icon}</span>
                  <span>{badge.name}</span>
                </div>
              ))}
              
              {!profile.badges.filter(b => b.name).length && (
                <div className="text-gray-400 italic">No skills added yet</div>
              )}
            </div>
          </div>
          
          {/* Featured projects */}
          <div>
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Briefcase size={20} className="text-purple-400" />
              Featured Projects
            </h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              {profile.featuredProjects.filter(p => p.name).map((project, index) => (
                <a
                  key={index}
                  href={project.link || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-slate-800/70 hover:bg-slate-800 border border-slate-700 rounded-xl p-4 flex gap-4 transition-all hover:scale-105 hover:shadow-lg"
                >
                  <img 
                    src={project.img || "/api/placeholder/80/80"} 
                    alt={project.name}
                    className="w-16 h-16 rounded-lg object-cover"
                  />
                  
                  <div>
                    <h3 className="text-lg font-semibold text-blue-400">{project.name}</h3>
                    <p className="text-gray-400 text-sm">{project.desc}</p>
                  </div>
                </a>
              ))}
              
              {!profile.featuredProjects.filter(p => p.name).length && (
                <div className="text-gray-400 italic col-span-2">No projects added yet</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
