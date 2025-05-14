// src/components/Dashboard.jsx
import { useUserStore } from "../store/useUserStore";

export default function Dashboard() {
  const { github, wallet } = useUserStore();
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Dashboard</h2>
      <div className="mb-2">GitHub: <strong>{github?.username}</strong></div>
      <div className="mb-2">Wallet: <strong>{wallet?.publicKey?.toBase58?.() ?? "Not connected"}</strong></div>
      <div className="mb-2">
        <img src={github?.avatar_url} alt="avatar" width={64} className="rounded-full" />
      </div>
      <div>🎉 You are linked! Build out your badge features here.</div>
    </div>
  );
}
