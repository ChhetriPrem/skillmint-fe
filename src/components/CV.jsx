import React, { useState, useEffect } from "react";
import QRCode from "react-qr-code";
import axios from "axios";

const fetchBackendData = async (githubUsername) => {
  const { data } = await axios.post(
    `${import.meta.env.VITE_BACKEND_URL}/api/users/getmybadges`,
    { githubUsername }
  );
  return data;
};



const emptyProfile = {
  name: "",
  avatar: "",
  tagline: "",
  bio: "",
  location: "",
  email: "",
  twitter: "",
  website: "",
  featuredProjects: [
    { name: "", desc: "", link: "", img: "" },
    { name: "", desc: "", link: "", img: "" },
  ],
};

export default function SkillMintCV() {
  const [backendData, setBackendData] = useState(null);
  const [isEditing, setIsEditing] = useState(true);
  const [profile, setProfile] = useState(emptyProfile);
  const [loading, setLoading] = useState(true);
  const [ipfsCid, setIpfsCid] = useState(""); // Only the CID
  const [blinkUrl, setBlinkUrl] = useState("");
  const [qrVisible, setQrVisible] = useState(false);
  const [uploading, setUploading] = useState(false);
  useEffect(() => {
    const githubUsername = localStorage.getItem("github_username");
    if (!githubUsername) return;

  useEffect(() => {
  fetchBackendData("renao").then((data) => setBackendData(data));
}, []);
  // Load from localStorage
  useEffect(() => {
    const hasExistingData = localStorage.getItem("cv-data");
    if (hasExistingData) {
      setProfile(JSON.parse(hasExistingData));
      setIsEditing(false);
    }
    setLoading(false);
  }, []);

  // Save the CV data (localStorage + Pinata)
  const handleSave = async () => {
    setUploading(true);
    localStorage.setItem("cv-data", JSON.stringify(profile));
    setIsEditing(false);

    try {
    
      const { data } = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/users/uploadcv`,
        {
          ...profile,
          githubUsername: backendData.githubUsername,
          githubUrl: backendData.githubUrl,
          wallet: backendData.wallet,
          badges: backendData.badges,
        }
      );
      setIpfsCid(data.cid);

      // Construct the Blink URL 
      const cid = data.cid.split("/ipfs/").pop(); // Use data.cid here
    const blink = `https://skillmint-fe.vercel.app/publiccv?cid=${cid}`

      setBlinkUrl(blink);
      setQrVisible(true);
      alert("Saved to Pinata! QR code ready.");
    } catch (err) {
      alert("Upload to Pinata failed.");
    }
    setUploading(false);
  };

  // Update form field handler
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.includes(".")) {
      const [section, index, field] = name.split(".");
      setProfile((prev) => {
        const newProfile = { ...prev };
        if (section === "featuredProjects") {
          newProfile.featuredProjects = [...prev.featuredProjects];
          newProfile.featuredProjects[index] = {
            ...newProfile.featuredProjects[index],
            [field]: value,
          };
        }
        return newProfile;
      });
    } else {
      setProfile((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  // Avatar upload handler
  const handleAvatarUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setProfile((prev) => ({
        ...prev,
        avatar: ev.target.result,
      }));
    };
    reader.readAsDataURL(file);
  };

  if (loading) return <div>Loading...</div>;

  const avatarSrc =
    profile.avatar ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(
      profile.name || backendData.githubUsername || "User"
    )}&background=0D8ABC&color=fff&size=150`;

  return (
    <div className="min-h-screen bg-gradient-to-tr from-slate-900 to-blue-900 text-white">
      <header className="px-6 py-4 flex justify-between items-center bg-black/30 backdrop-blur-md">
        <h1 className="text-2xl font-bold">
          <span className="text-blue-400">CV</span>
          <span className="text-white">Builder</span>
        </h1>
        <div className="flex gap-3">
          {isEditing ? (
            <button
              onClick={handleSave}
              disabled={uploading}
              className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 rounded-lg flex items-center gap-2 transition-colors"
            >
              {uploading ? "Saving..." : "Save & Get QR"}
            </button>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center gap-2 transition-colors"
            >
              Edit CV
            </button>
          )}
        </div>
      </header>

      <main className="container mx-auto p-6">
        {isEditing ? (
          <form className="space-y-8">
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-purple-400 border-b border-purple-500/30 pb-2">
                Personal Information
              </h3>
              <div className="flex flex-col items-center mb-6">
                <div className="relative">
                  <img
                    src={avatarSrc}
                    alt="Avatar"
                    className="w-32 h-32 rounded-full object-cover border-4 border-blue-600 shadow-lg"
                  />
                  <label className="absolute bottom-0 right-0 bg-blue-600 text-white rounded-full p-2 cursor-pointer hover:bg-blue-700 transition">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleAvatarUpload}
                    />
                    <span className="text-xs font-bold">📷</span>
                  </label>
                </div>
                <input
                  type="text"
                  name="avatar"
                  value={profile.avatar}
                  onChange={handleInputChange}
                  className="mt-2 w-60 bg-slate-700 border border-slate-600 rounded-lg px-4 py-2"
                  placeholder="Or paste avatar image URL"
                />
              </div>
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
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2"
                    placeholder="Your name"
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
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2"
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
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2"
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
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2"
                  placeholder="A short description about yourself and your expertise"
                />
              </div>
            </div>
            {/* Social Links Section */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-purple-400 border-b border-purple-500/30 pb-2">
                Social & Contact
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
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2"
                    placeholder="your-email@example.com"
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
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2"
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
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2"
                    placeholder="https://your-website.com"
                  />
                </div>
              </div>
            </div>
            {/* Projects Section */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-purple-400 border-b border-purple-500/30 pb-2">
                Featured Projects
              </h3>
              <div className="space-y-6">
                {profile.featuredProjects.map((proj, idx) => (
                  <div
                    key={idx}
                    className="flex flex-col md:flex-row gap-4 items-center bg-slate-700/60 rounded-xl p-4"
                  >
                    <div className="relative">
                      <img
                        src={
                          proj.img ||
                          `https://ui-avatars.com/api/?name=${encodeURIComponent(
                            proj.name || "Project"
                          )}&background=8b5cf6&color=fff&size=80`
                        }
                        alt="Project"
                        className="w-20 h-20 rounded-lg object-cover border-2 border-purple-600 shadow"
                      />
                      <label className="absolute bottom-0 right-0 bg-purple-600 text-white rounded-full p-1 cursor-pointer hover:bg-purple-700 transition">
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files[0];
                            if (!file) return;
                            const reader = new FileReader();
                            reader.onload = (ev) => {
                              setProfile((prev) => {
                                const updatedProjects = [
                                  ...prev.featuredProjects,
                                ];
                                updatedProjects[idx].img = ev.target.result;
                                return {
                                  ...prev,
                                  featuredProjects: updatedProjects,
                                };
                              });
                            };
                            reader.readAsDataURL(file);
                          }}
                        />
                        <span className="text-xs font-bold">📷</span>
                      </label>
                    </div>
                    <div className="flex-1 grid md:grid-cols-2 gap-2">
                      <input
                        type="text"
                        name={`featuredProjects.${idx}.name`}
                        value={proj.name}
                        onChange={handleInputChange}
                        className="bg-slate-700 border border-slate-600 rounded-lg px-4 py-2"
                        placeholder="Project name"
                      />
                      <input
                        type="text"
                        name={`featuredProjects.${idx}.link`}
                        value={proj.link}
                        onChange={handleInputChange}
                        className="bg-slate-700 border border-slate-600 rounded-lg px-4 py-2"
                        placeholder="https://project-link.com"
                      />
                      <textarea
                        name={`featuredProjects.${idx}.desc`}
                        value={proj.desc}
                        onChange={handleInputChange}
                        className="col-span-2 bg-slate-700 border border-slate-600 rounded-lg px-4 py-2"
                        placeholder="Short description"
                        rows={2}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </form>
        ) : (
          <div className="bg-slate-900/80 rounded-xl shadow-2xl p-8 border border-blue-700/30 max-w-2xl mx-auto">
            {/* Avatar & Name */}
            <div className="flex flex-col items-center mb-6">
              <img
                src={avatarSrc}
                alt="Avatar"
                className="w-32 h-32 rounded-full object-cover border-4 border-blue-600 shadow-lg"
              />
              <h2 className="text-3xl font-bold mt-4 text-blue-200">
                {profile.name || backendData.githubUsername}
              </h2>
              <div className="text-lg text-purple-300 font-semibold">
                {profile.tagline}
              </div>
              <div className="flex gap-3 text-blue-400 mt-2 items-center">
                {profile.location && (
                  <span className="flex items-center gap-1">
                    {profile.location}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  {backendData.wallet}
                </span>
              </div>
            </div>
            {/* Bio */}
            {profile.bio && (
              <div className="mb-6 text-blue-100 text-center">
                {profile.bio}
              </div>
            )}
            {/* GitHub (from backend) */}
            <div className="flex flex-wrap justify-center gap-6 mb-8">
              <a
                href={backendData.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-blue-300 hover:text-blue-400 transition"
              >
                Github: {backendData.githubUsername}
              </a>
              {profile.email && (
                <a
                  href={`mailto:${profile.email}`}
                  className="flex items-center gap-2 text-blue-300 hover:text-blue-400 transition"
                >
                  Email: {profile.email}
                </a>
              )}
              {profile.twitter && (
                <a
                  href={profile.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-blue-300 hover:text-blue-400 transition"
                >
                  Twitter
                </a>
              )}
              {profile.website && (
                <a
                  href={profile.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-blue-300 hover:text-blue-400 transition"
                >
                  Website
                </a>
              )}
            </div>
            {/* Badges (from backend) */}
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-purple-300 mb-2">
                Skills & Badges
              </h3>
              <div className="flex flex-wrap gap-4 justify-center">
                {backendData.badges.map((badge, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 bg-blue-800/70 px-4 py-2 rounded-lg shadow text-lg"
                  >
                    <span>{badge.icon}</span>
                    <span className="font-semibold">{badge.name}</span>
                  </div>
                ))}
              </div>
            </div>
            {/* Projects */}
            <div>
              <h3 className="text-xl font-semibold text-purple-300 mb-2">
                Featured Projects
              </h3>
              <div className="space-y-6">
                {profile.featuredProjects
                  .filter((p) => p.name)
                  .map((proj, idx) => (
                    <div
                      key={idx}
                      className="flex gap-4 items-center bg-slate-800/70 rounded-xl p-4"
                    >
                      <img
                        src={
                          proj.img ||
                          `https://ui-avatars.com/api/?name=${encodeURIComponent(
                            proj.name || "Project"
                          )}&background=8b5cf6&color=fff&size=80`
                        }
                        alt="Project"
                        className="w-20 h-20 rounded-lg object-cover border-2 border-purple-600 shadow"
                      />
                      <div>
                        <a
                          href={proj.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-lg font-bold text-blue-200 hover:underline"
                        >
                          {proj.name}
                        </a>
                        <div className="text-blue-100 text-sm">{proj.desc}</div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}

        {/* QR Code */}
        {blinkUrl && qrVisible && (
          <div className="mt-8 flex flex-col items-center">
            <div className="mb-2 text-yellow-400 font-semibold">
              Scan to View CV (Solana Blink)
            </div>
            <QRCode value={blinkUrl} size={180} />
            <div className="mt-2 text-xs text-blue-200 break-all">
              {blinkUrl}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
