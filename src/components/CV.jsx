import { useState, useEffect } from "react";
import {
  User,
  Briefcase,
  Mail,
  Twitter,
  Globe,
  MapPin,
  Edit2,
  Save,
  QrCode,
  Camera,
  Upload,
} from "lucide-react";

const fetchBackendData = async (githubUsername) => {
  // Simulated for this demo
  return {
    githubUsername: githubUsername || "devuser",
    githubUrl: `https://github.com/${githubUsername || "devuser"}`,
    wallet: "0x1234...5678",
    badges: [
      { name: "React", icon: "⚛️" },
      { name: "Solidity", icon: "🔷" },
      { name: "TypeScript", icon: "🔵" },
    ],
  };
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

export default function ModernSkillMintCV() {
  const defaultBackendData = {
    githubUsername: "",
    githubUrl: "",
    wallet: "",
    badges: [],
  };

  const [backendData, setBackendData] = useState(defaultBackendData);
  const [isEditing, setIsEditing] = useState(true);
  const [profile, setProfile] = useState(emptyProfile);
  const [loading, setLoading] = useState(true);
  const [ipfsCid, setIpfsCid] = useState("");
  const [blinkUrl, setBlinkUrl] = useState("");
  const [qrVisible, setQrVisible] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const githubUsername = localStorage.getItem("github_username");
    if (!githubUsername) return;
    fetchBackendData(githubUsername)
      .then((data) => setBackendData(data || defaultBackendData))
      .catch(() => setBackendData(defaultBackendData));
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

  // Save the CV data
  const handleSave = async () => {
    setUploading(true);
    localStorage.setItem("cv-data", JSON.stringify(profile));
    setIsEditing(false);

    try {
      // Simulated upload response
      setTimeout(() => {
        const mockCid = "Qm123456789abcdef";
        setIpfsCid(mockCid);
        const blink = `https://skillmint-fe.vercel.app/publiccv?cid=${mockCid}`;
        setBlinkUrl(blink);
        setQrVisible(true);
      }, 1500);
    } catch (err) {
      alert("Upload failed.");
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

  if (loading)
    return (
      <div className="min-h-screen bg-gradient-to-tr from-slate-900 to-blue-900 flex items-center justify-center">
        <div className="bg-white/10 p-8 rounded-lg backdrop-blur-lg animate-pulse">
          Loading...
        </div>
      </div>
    );

  const avatarSrc =
    profile.avatar ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(
      profile.name || backendData?.githubUsername || "User"
    )}&background=0D8ABC&color=fff&size=150`;

  // Mock QR code component since react-qr-code is not available
  const MockQRCode = ({ value, size }) => (
    <div
      className="bg-white p-2 rounded-lg"
      style={{ width: size, height: size }}
    >
      <div className="w-full h-full bg-slate-100 flex items-center justify-center">
        <QrCode size={size / 2} />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <div className="absolute inset-0 bg-grid-white/5 pointer-events-none"></div>

      {/* Clean Header */}
      <header className="sticky top-0 z-50 px-6 py-3 flex justify-between items-center bg-slate-800 shadow-md border-b border-slate-700">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <Briefcase size={20} className="text-white" />
          </div>
          <span className="text-white">SkillMint CV</span>
        </h1>

        <div className="flex gap-3">
          {isEditing ? (
            <button
              onClick={handleSave}
              disabled={uploading}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center gap-2 transition-colors"
            >
              {uploading ? (
                <>
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save size={18} />
                  <span>Save & Get QR</span>
                </>
              )}
            </button>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg flex items-center gap-2 transition-colors"
            >
              <Edit2 size={18} />
              <span>Edit CV</span>
            </button>
          )}
        </div>
      </header>

      <main className="container mx-auto p-6">
        {/* QR Modal */}
        {blinkUrl && qrVisible && (
          <div className="mb-8 flex justify-center">
            <div className="bg-slate-800 p-6 rounded-xl shadow-lg border border-slate-700 flex flex-col items-center max-w-md transform transition-all animate-fadeIn">
              <div className="mb-3 text-blue-400 font-semibold">
                Scan to View Your CV
              </div>
              <MockQRCode value={blinkUrl} size={180} />
              <div className="mt-4 px-4 py-2 bg-slate-700 rounded-full text-xs text-blue-200 break-all">
                {blinkUrl}
              </div>
            </div>
          </div>
        )}

        {isEditing ? (
          <form className="space-y-8 max-w-4xl mx-auto">
            <div className="space-y-6 bg-slate-800 p-6 rounded-xl shadow-md border border-slate-700">
              <h3 className="text-xl font-semibold text-blue-400 border-b border-slate-700 pb-2">
                Personal Information
              </h3>

              <div className="flex flex-col items-center mb-6">
                <div className="relative group">
                  <img
                    src={avatarSrc}
                    alt="Avatar"
                    className="w-32 h-32 rounded-full object-cover border-4 border-slate-700 shadow-md"
                  />
                  <label className="absolute bottom-0 right-0 bg-blue-600 text-white rounded-full p-2 cursor-pointer hover:bg-blue-700 transition-colors shadow-md">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleAvatarUpload}
                    />
                    <Camera size={16} />
                  </label>
                </div>
                <input
                  type="text"
                  name="avatar"
                  value={profile.avatar}
                  onChange={handleInputChange}
                  className="mt-4 w-60 bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none transition"
                  placeholder="Or paste avatar image URL"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-blue-300">
                    Full Name
                  </label>
                  <div className="relative">
                    <User
                      size={16}
                      className="absolute left-3 top-3 text-slate-400"
                    />
                    <input
                      type="text"
                      name="name"
                      value={profile.name}
                      onChange={handleInputChange}
                      className="w-full bg-slate-700 border border-slate-600 rounded-lg pl-10 pr-4 py-2 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none transition"
                      placeholder="Your name"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-sm font-medium text-blue-300">
                    Tagline
                  </label>
                  <input
                    type="text"
                    name="tagline"
                    value={profile.tagline}
                    onChange={handleInputChange}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none transition"
                    placeholder="Developer • Designer • Creator"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-sm font-medium text-blue-300">
                    Location
                  </label>
                  <div className="relative">
                    <MapPin
                      size={16}
                      className="absolute left-3 top-3 text-slate-400"
                    />
                    <input
                      type="text"
                      name="location"
                      value={profile.location}
                      onChange={handleInputChange}
                      className="w-full bg-slate-700 border border-slate-600 rounded-lg pl-10 pr-4 py-2 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none transition"
                      placeholder="City, Country"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-medium text-blue-300">
                  Bio
                </label>
                <textarea
                  name="bio"
                  value={profile.bio}
                  onChange={handleInputChange}
                  rows="3"
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none transition"
                  placeholder="A short description about yourself and your expertise"
                />
              </div>
            </div>

            {/* Social Links Section */}
            <div className="space-y-6 bg-slate-800 p-6 rounded-xl shadow-md border border-slate-700">
              <h3 className="text-xl font-semibold text-blue-400 border-b border-slate-700 pb-2">
                Social & Contact
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-blue-300">
                    Email
                  </label>
                  <div className="relative">
                    <Mail
                      size={16}
                      className="absolute left-3 top-3 text-slate-400"
                    />
                    <input
                      type="email"
                      name="email"
                      value={profile.email}
                      onChange={handleInputChange}
                      className="w-full bg-slate-700 border border-slate-600 rounded-lg pl-10 pr-4 py-2 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none transition"
                      placeholder="your-email@example.com"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-sm font-medium text-blue-300">
                    Twitter URL
                  </label>
                  <div className="relative">
                    <Twitter
                      size={16}
                      className="absolute left-3 top-3 text-slate-400"
                    />
                    <input
                      type="text"
                      name="twitter"
                      value={profile.twitter}
                      onChange={handleInputChange}
                      className="w-full bg-slate-700 border border-slate-600 rounded-lg pl-10 pr-4 py-2 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none transition"
                      placeholder="https://twitter.com/yourusername"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-sm font-medium text-blue-300">
                    Website
                  </label>
                  <div className="relative">
                    <Globe
                      size={16}
                      className="absolute left-3 top-3 text-slate-400"
                    />
                    <input
                      type="text"
                      name="website"
                      value={profile.website}
                      onChange={handleInputChange}
                      className="w-full bg-slate-700 border border-slate-600 rounded-lg pl-10 pr-4 py-2 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none transition"
                      placeholder="https://your-website.com"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Projects Section */}
            <div className="space-y-6 bg-white/5 backdrop-blur-md p-6 rounded-2xl shadow-lg border border-white/10">
              <h3 className="text-xl font-semibold bg-gradient-to-r from-blue-400 to-purple-400 text-transparent bg-clip-text border-b border-purple-500/30 pb-2">
                Featured Projects
              </h3>
              <div className="space-y-6">
                {profile.featuredProjects.map((proj, idx) => (
                  <div
                    key={idx}
                    className="flex flex-col md:flex-row gap-4 items-center bg-slate-800/50 rounded-xl p-4 border border-white/5 hover:border-blue-500/20 transition-all hover:shadow-lg"
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
                        className="w-20 h-20 rounded-lg object-cover border-2 border-purple-500/50 shadow-md"
                      />
                      <label className="absolute bottom-0 right-0 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-full p-1 cursor-pointer hover:scale-110 transition-transform shadow-md">
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
                        <Camera size={14} />
                      </label>
                    </div>
                    <div className="flex-1 grid md:grid-cols-2 gap-2">
                      <input
                        type="text"
                        name={`featuredProjects.${idx}.name`}
                        value={proj.name}
                        onChange={handleInputChange}
                        className="bg-slate-800/80 border border-slate-700/80 rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 outline-none transition"
                        placeholder="Project name"
                      />
                      <input
                        type="text"
                        name={`featuredProjects.${idx}.link`}
                        value={proj.link}
                        onChange={handleInputChange}
                        className="bg-slate-800/80 border border-slate-700/80 rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 outline-none transition"
                        placeholder="https://project-link.com"
                      />
                      <textarea
                        name={`featuredProjects.${idx}.desc`}
                        value={proj.desc}
                        onChange={handleInputChange}
                        className="col-span-2 bg-slate-800/80 border border-slate-700/80 rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 outline-none transition"
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
          <div className="max-w-2xl mx-auto">
            <div className="bg-gradient-to-br from-slate-800/70 to-slate-900/70 rounded-2xl shadow-2xl p-8 border border-white/10 backdrop-blur-md transform transition-all hover:shadow-blue-900/20">
              {/* Avatar & Name */}
              <div className="flex flex-col items-center mb-8">
                <div className="p-1 rounded-full bg-gradient-to-r from-blue-500 to-purple-500">
                  <img
                    src={avatarSrc}
                    alt="Avatar"
                    className="w-32 h-32 rounded-full object-cover border-4 border-slate-900 shadow-lg"
                  />
                </div>
                <h2 className="text-3xl font-bold mt-4 bg-gradient-to-r from-blue-300 to-purple-300 text-transparent bg-clip-text">
                  {profile.name || backendData?.githubUsername}
                </h2>
                <div className="text-lg text-purple-300 font-medium mt-1">
                  {profile.tagline}
                </div>
                <div className="flex gap-3 text-blue-400 mt-3 items-center text-sm">
                  {profile.location && (
                    <span className="flex items-center gap-1 px-3 py-1 bg-blue-900/30 rounded-full border border-blue-700/30">
                      <MapPin size={14} />
                      {profile.location}
                    </span>
                  )}
                  <span className="flex items-center gap-1 px-3 py-1 bg-blue-900/30 rounded-full border border-blue-700/30">
                    {backendData.wallet}
                  </span>
                </div>
              </div>

              {/* Bio */}
              {profile.bio && (
                <div className="mb-8 text-blue-100 text-center px-6 py-4 bg-blue-900/20 rounded-xl border border-blue-800/30">
                  {profile.bio}
                </div>
              )}

              {/* Contact Links */}
              <div className="flex flex-wrap justify-center gap-3 mb-8">
                <a
                  href={backendData.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-blue-300 hover:text-blue-200 px-3 py-2 bg-blue-900/30 rounded-lg border border-blue-800/30 transition-all hover:bg-blue-800/40"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    className="text-blue-300"
                  >
                    <path
                      fill="currentColor"
                      d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"
                    />
                  </svg>
                  {backendData?.githubUsername}
                </a>

                {profile.email && (
                  <a
                    href={`mailto:${profile.email}`}
                    className="flex items-center gap-2 text-blue-300 hover:text-blue-200 px-3 py-2 bg-blue-900/30 rounded-lg border border-blue-800/30 transition-all hover:bg-blue-800/40"
                  >
                    <Mail size={16} />
                    {profile.email}
                  </a>
                )}

                {profile.twitter && (
                  <a
                    href={profile.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-blue-300 hover:text-blue-200 px-3 py-2 bg-blue-900/30 rounded-lg border border-blue-800/30 transition-all hover:bg-blue-800/40"
                  >
                    <Twitter size={16} />
                    Twitter
                  </a>
                )}

                {profile.website && (
                  <a
                    href={profile.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-blue-300 hover:text-blue-200 px-3 py-2 bg-blue-900/30 rounded-lg border border-blue-800/30 transition-all hover:bg-blue-800/40"
                  >
                    <Globe size={16} />
                    Website
                  </a>
                )}
              </div>

              {/* Badges (from backend) */}
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-purple-300 mb-4 flex items-center gap-2">
                  <div className="w-6 h-6 bg-purple-500/30 rounded-md flex items-center justify-center">
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z" />
                      <path d="m9 12 2 2 4-4" />
                    </svg>
                  </div>
                  Skills & Badges
                </h3>
                <div className="flex flex-wrap gap-3 justify-center">
                  {backendData.badges.map((badge, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 bg-gradient-to-br from-blue-700/40 to-purple-700/40 px-4 py-2 rounded-lg shadow-md border border-blue-600/30 hover:border-purple-500/50 transition-all hover:shadow-purple-900/30"
                    >
                      <span className="text-2xl">{badge.icon}</span>
                      <span className="font-medium">{badge.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Projects */}
              <div>
                <h3 className="text-xl font-semibold text-purple-300 mb-4 flex items-center gap-2">
                  <div className="w-6 h-6 bg-purple-500/30 rounded-md flex items-center justify-center">
                    <Briefcase size={14} />
                  </div>
                  Featured Projects
                </h3>
                <div className="space-y-4">
                  {profile.featuredProjects
                    .filter((p) => p.name)
                    .map((proj, idx) => (
                      <div
                        key={idx}
                        className="flex gap-4 items-center bg-gradient-to-br from-slate-800/70 to-slate-900/90 rounded-xl p-4 border border-blue-900/30 hover:border-blue-700/30 transition-all hover:shadow-lg group"
                      >
                        <img
                          src={
                            proj.img ||
                            `https://ui-avatars.com/api/?name=${encodeURIComponent(
                              proj.name || "Project"
                            )}&background=8b5cf6&color=fff&size=80`
                          }
                          alt="Project"
                          className="w-20 h-20 rounded-lg object-cover border-2 border-purple-700/50 shadow group-hover:border-purple-500/70 transition-all"
                        />
                        <div>
                          <a
                            href={proj.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-lg font-bold bg-gradient-to-r from-blue-300 to-purple-300 text-transparent bg-clip-text hover:underline flex items-center gap-2"
                          >
                            {proj.name}
                            <svg
                              width="12"
                              height="12"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="opacity-0 group-hover:opacity-100 transition-opacity ml-1"
                            >
                              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                              <polyline points="15 3 21 3 21 9"></polyline>
                              <line x1="10" y1="14" x2="21" y2="3"></line>
                            </svg>
                          </a>
                          <div className="text-blue-100 text-sm mt-1">
                            {proj.desc}
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer with additional styling */}
      <footer className="mt-12 py-6 px-6 bg-black/20 border-t border-white/5 text-center text-sm text-blue-300/70">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-blue-500/20 rounded-md flex items-center justify-center">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M3 9h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9Z" />
                <path d="M3 9V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v4" />
                <path d="M13 13h4" />
                <path d="M13 17h4" />
                <path d="M9 13h.01" />
                <path d="M9 17h.01" />
              </svg>
            </div>
            <span>SkillMint CV Builder</span>
          </div>
          <div>Powered by IPFS & Blockchain Technology</div>
          <div className="flex gap-3">
            <a href="#" className="hover:text-blue-300 transition-colors">
              Privacy
            </a>
            <a href="#" className="hover:text-blue-300 transition-colors">
              Terms
            </a>
            <a href="#" className="hover:text-blue-300 transition-colors">
              Help
            </a>
          </div>
        </div>
      </footer>

      {/* Floating add project button */}
      {isEditing && (
        <button
          onClick={() => {
            setProfile((prev) => ({
              ...prev,
              featuredProjects: [
                ...prev.featuredProjects,
                { name: "", desc: "", link: "", img: "" },
              ],
            }));
          }}
          className="fixed bottom-8 right-8 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 w-12 h-12 rounded-full flex items-center justify-center text-white shadow-lg hover:shadow-xl transition-all hover:scale-105"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
        </button>
      )}
    </div>
  );
}
