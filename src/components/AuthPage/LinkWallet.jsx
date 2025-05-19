// src/components/LinkWallet.jsx
import React, { useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useUserStore } from "../../store/useUserStore";
import bs58 from "bs58";

export default function LinkWallet() {
  const wallet = useWallet();
  const { github } = useUserStore();
  const [status, setStatus] = useState("");

  const handleLink = async () => {
    setStatus("Requesting challenge...");
    const res1 = await fetch(
      `${process.env.BACKEND_URL}/api/github/challenge`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ github_username: github.username }),
      }
    );
    const { challenge } = await res1.json();

    setStatus("Signing challenge...");
    const encoded = new TextEncoder().encode(challenge);
    const signed = await wallet.signMessage(encoded);
    const sigBase58 = bs58.encode(signed);

    setStatus("Linking...");
    const res2 = await fetch(`${process.env.BACKEND_URL}/api/github/link`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        github_username: github.username,
        wallet_address: wallet.publicKey.toBase58(),
        signature: sigBase58,
        challenge,
      }),
    });
    const out = await res2.json();
    if (res2.ok) setStatus("✅ Linked! " + JSON.stringify(out));
    else setStatus("❌ Error: " + out.error);
  };

  return (
    <div className="flex flex-col items-center">
      <h2 className="text-xl mb-2">Welcome, {github?.username}</h2>
      <img
        src={github?.avatar_url}
        alt="avatar"
        width={64}
        className="mb-2 rounded-full"
      />
      <button
        className="px-4 py-2 bg-blue-600 text-white rounded mb-2"
        disabled={!wallet.connected}
        onClick={handleLink}
      >
        Link GitHub & Wallet
      </button>
      <div>{status}</div>
    </div>
  );
}
