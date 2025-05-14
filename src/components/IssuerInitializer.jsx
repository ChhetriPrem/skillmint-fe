import React, { useState } from "react";
import { SystemProgram, Transaction, TransactionInstruction } from "@solana/web3.js";
import { useWallet } from "@solana/wallet-adapter-react";
import { serializeInitializeIssuerArgs } from "../utils/serialization";
import { findIssuerPDA } from "../utils/pdas";
import { PROGRAM_ID } from "../utils/constants";

export default function IssuerInitializer({ connection }) {
  const wallet = useWallet();
  const [issuerName, setIssuerName] = useState("");
  const [website, setWebsite] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  const handleInit = async () => {
    setLoading(true);
    setStatus("");
    try {
      if (!wallet.connected) {
        setStatus("⚠️ Please connect your wallet first!");
        setLoading(false);
        return;
      }
      if (!issuerName || !website) {
        setStatus("⚠️ Please fill in both fields.");
        setLoading(false);
        return;
      }
      if (issuerName.length > 64 || website.length > 64) {
        setStatus("⚠️ Issuer name and website must be at most 64 characters.");
        setLoading(false);
        return;
      }

      const authorityPubkey = wallet.publicKey;
      const [issuerPda] = await findIssuerPDA(authorityPubkey);
      const data = serializeInitializeIssuerArgs(issuerName, website);

      const keys = [
        { pubkey: issuerPda, isSigner: false, isWritable: true },
        { pubkey: authorityPubkey, isSigner: true, isWritable: true },
        { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
      ];

      const ix = new TransactionInstruction({
        programId: PROGRAM_ID,
        keys,
        data,
      });
      const tx = new Transaction().add(ix);
      tx.feePayer = wallet.publicKey;
      tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
      const signed = await wallet.signTransaction(tx);
      const sig = await connection.sendRawTransaction(signed.serialize());
      setStatus(`✅ Issuer initialized! Tx: ${sig}`);
    } catch (e) {
      setStatus("❌ Error: " + (e.message || e.toString()));
    }
    setLoading(false);
  };

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-full max-w-lg bg-gradient-to-br from-purple-900/80 via-purple-800/80 to-indigo-900/80 rounded-3xl shadow-2xl p-8 border border-purple-700/50 backdrop-blur-lg">
        <div className="mb-6 text-center">
          <div className="flex justify-center mb-2">
            <div className="bg-purple-700/80 rounded-full p-4 shadow-lg">
              <svg width={36} height={36} fill="none" viewBox="0 0 24 24">
                <path fill="#a78bfa" d="M12 2a10 10 0 1 1 0 20 10 10 0 0 1 0-20Zm0 3a1 1 0 0 0-1 1v5.59l-3.3 3.3a1 1 0 1 0 1.42 1.42l3.59-3.59V6a1 1 0 0 0-1-1Z"/>
              </svg>
            </div>
          </div>
          <h3 className="text-3xl font-extrabold text-purple-200 mb-2 drop-shadow">Initialize Your Issuer</h3>
          <p className="text-purple-100 text-base mb-1">
            <span className="font-semibold text-purple-400">You only need to do this <span className="underline underline-offset-2">once</span> per wallet.</span>
          </p>
          <p className="text-purple-100 text-sm">
            After initializing, you can mint and manage badges as an issuer.
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-purple-200 font-medium mb-1" htmlFor="issuerName">
              Issuer Name
            </label>
            <input
              id="issuerName"
              className="w-full px-4 py-2 rounded-lg border border-purple-500 bg-purple-900/40 text-purple-100 placeholder-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-400"
              placeholder="Your Organization or Name (max 64)"
              value={issuerName}
              maxLength={64}
              onChange={e => setIssuerName(e.target.value)}
              disabled={loading}
              autoComplete="off"
            />
          </div>
          <div>
            <label className="block text-purple-200 font-medium mb-1" htmlFor="website">
              Website
            </label>
            <input
              id="website"
              className="w-full px-4 py-2 rounded-lg border border-purple-500 bg-purple-900/40 text-purple-100 placeholder-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-400"
              placeholder="https://yourwebsite.com (max 64)"
              value={website}
              maxLength={64}
              onChange={e => setWebsite(e.target.value)}
              disabled={loading}
              autoComplete="off"
            />
          </div>
          <button
            className={`w-full py-3 mt-2 rounded-xl font-bold text-lg transition
              ${loading || !wallet.connected
                ? 'bg-purple-700/60 text-purple-300 cursor-not-allowed'
                : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-lg'}
            `}
            onClick={handleInit}
            disabled={loading || !wallet.connected}
          >
            {loading ? "Initializing..." : "Initialize Issuer"}
          </button>
        </div>

        <div className="mt-6 text-center min-h-[28px]">
          {status && (
            <span className={`inline-block px-4 py-2 rounded-lg font-medium
              ${status.startsWith("✅") ? "bg-green-700/80 text-green-200" :
                status.startsWith("❌") ? "bg-red-700/80 text-red-200" :
                  "bg-yellow-700/80 text-yellow-200"}`}>
              {status}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
