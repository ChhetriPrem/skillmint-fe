// src/components/Dashboard.jsx
import { useUserStore } from "../store/useUserStore";

export default function DashboardLayout() {
  return (
    <>
      <nav className="bg-gray-900 text-white py-3 px-8 flex justify-between items-center shadow-lg">
        <div className="text-2xl font-extrabold tracking-tight text-purple-400">
          SkillMint
        </div>
        <div className="flex gap-6 items-center">
          <Link to="/dashboard" className="hover:text-purple-400 transition">Home</Link>
          <Link to="/dashboard/template" className="hover:text-purple-400 transition">Template</Link>
          <Link to="/dashboard/badges" className="hover:text-purple-400 transition">Badges</Link>
          {/* Special My CV Button */}
      
        </div>
            <Link
            to="/cv/renao"
            className="absolute right-60 bg-gradient-to-r from-yellow-400 to-pink-500 text-white font-bold px-4 py-2 rounded-lg shadow-lg hover:scale-105 transition"
   
          >
            ⭐ My CV
          </Link>
        <WalletMultiButton />
      </nav>
      <main className="min-h-screen bg-gradient-to-tr from-gray-950 via-gray-900 to-gray-800 flex flex-col items-center p-4">
        <Outlet />
        <div className="text-xs mt-8 text-gray-400">No Anchor JS used. All serialization is manual.</div>
      </main>
    </>
  );
}
