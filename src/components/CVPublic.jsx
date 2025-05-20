import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Briefcase,
  MapPin,
  Mail,
  Globe,
  Github,
  Twitter,
  Award,
} from "lucide-react";

// Simulated backend data (replace with real API call in production)

export default function PublicCV() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Get CID from query string and fetch the CV from IPFS
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const cid = params.get("cid");
    if (!cid) {
      setError("No CV found.");
      setLoading(false);
      return;
    }
    fetch(`https://gateway.pinata.cloud/ipfs/${cid}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch CV");
        return res.json();
      })
      .then(setProfile)
      .catch(() => setError("Failed to load CV."))
      .finally(() => setLoading(false));
  }, []);

  if (loading)
    return (
      <div className="min-h-screen bg-gradient-to-tr from-gray-900 to-gray-800 flex items-center justify-center">
        <div className="text-white text-xl">Loading CV...</div>
      </div>
    );
  if (error)
    return (
      <div className="min-h-screen bg-gradient-to-tr from-gray-900 to-gray-800 flex items-center justify-center">
        <div className="text-red-400 text-xl">{error}</div>
      </div>
    );
  if (!profile)
    return (
      <div className="min-h-screen bg-gradient-to-tr from-gray-900 to-gray-800 flex items-center justify-center">
        <div className="text-white text-xl">No CV data.</div>
      </div>
    );

  // Avatar logic
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
          <span className="text-white">Viewer</span>
        </h1>
        <div className="flex gap-3">
          <span className="px-4 py-2 bg-blue-600 rounded-lg text-white font-bold">
            Public CV
          </span>
        </div>
      </header>

      <main className="container mx-auto p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-slate-800/70 backdrop-blur-md rounded-xl p-6 shadow-xl border border-blue-600/30 max-w-2xl mx-auto"
        >
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
                  <MapPin size={16} />
                  {profile.location}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Briefcase size={16} />
                {backendData.wallet}
              </span>
            </div>
          </div>
          {/* Bio */}
          {profile.bio && (
            <div className="mb-6 text-blue-100 text-center">{profile.bio}</div>
          )}
          {/* Social & Contact */}
          <div className="flex flex-wrap justify-center gap-6 mb-8">
            <a
              href={backendData.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-blue-300 hover:text-blue-400 transition"
            >
              <Github size={16} />
              {backendData.githubUsername}
            </a>
            {profile.email && (
              <a
                href={`mailto:${profile.email}`}
                className="flex items-center gap-2 text-blue-300 hover:text-blue-400 transition"
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
                className="flex items-center gap-2 text-blue-300 hover:text-blue-400 transition"
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
                className="flex items-center gap-2 text-blue-300 hover:text-blue-400 transition"
              >
                <Globe size={16} />
                Website
              </a>
            )}
          </div>
          {/* Badges */}
<div className="mb-8">
  <h3 className="text-2xl font-bold text-purple-400 mb-6 text-center">
    Skills & Badges
  </h3>
  <div className="flex flex-wrap gap-6 justify-center">
    {backendData.badges.map((badge, idx) => (
      <div
        key={idx}
        className="relative group w-36 bg-gradient-to-br from-blue-800/60 to-purple-800/60 p-4 rounded-xl shadow-lg border border-blue-700/50 hover:border-purple-500 transition-colors cursor-pointer flex flex-col items-center"
      >
        {/* Badge Image */}
        <img
          src={badge.metadata?.image || "https://via.placeholder.com/64"}
          alt={badge.name}
          className="w-20 h-20 rounded-full border-4 border-purple-500 shadow-md object-cover mb-3"
        />
        {/* Badge Name */}
        <span className="text-white text-lg font-semibold truncate text-center">
          {badge.name}
        </span>

        {/* Tooltip */}
        <div className="absolute z-20 left-1/2 -translate-x-1/2 top-full mt-3 w-80 bg-gradient-to-tr from-gray-900 to-gray-800 text-gray-100 text-sm rounded-lg shadow-xl p-4 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-opacity duration-300">
          <p className="font-semibold mb-2">{badge.metadata?.description}</p>
          <div className="space-y-1 mb-2">
            {badge.metadata?.attributes?.map((attr, i) => (
              <div key={i} className="flex justify-between">
                <span className="font-medium">{attr.trait_type}:</span>
                <span className="truncate max-w-[60%]">{attr.value}</span>
              </div>
            ))}
          </div>
          {badge.metadata?.external_url && (
            <a
              href={badge.metadata.external_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block text-blue-400 hover:text-blue-500 underline font-medium break-words"
            >
              View on GitHub →
            </a>
          )}
          {/* Tooltip arrow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 w-4 h-4 bg-gradient-to-tr from-gray-900 to-gray-800 rotate-45"></div>
        </div>
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
              {profile.featuredProjects &&
                profile.featuredProjects
                  .filter((p) => p.name)
                  .map((proj, idx) => (
                    <div
                      key={idx}
                      className="flex gap-4 items-center bg-slate-700/60 rounded-xl p-4"
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
        </motion.div>
      </main>
    </div>
  );
}
