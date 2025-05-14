import React, { useState } from "react";
import { SystemProgram, Transaction, TransactionInstruction, PublicKey } from "@solana/web3.js";
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
        setStatus("Connect your wallet first!");
        setLoading(false);
        return;
      }
      if (!issuerName || !website) {
        setStatus("Fill both fields.");
        setLoading(false);
        return;
      }
      if (issuerName.length > 64 || website.length > 64) {
        setStatus("Issuer name and website must be at most 64 characters.");
        setLoading(false);
        return;
      }

      // The authority is always the connected wallet
      const authorityPubkey = wallet.publicKey;
      const [issuerPda] = await findIssuerPDA(authorityPubkey);
      const data = serializeInitializeIssuerArgs(issuerName, website);

      // Order must match Rust struct: issuer, authority, system_program
      const keys = [
        { pubkey: issuerPda, isSigner: false, isWritable: true },         // issuer
        { pubkey: authorityPubkey, isSigner: true, isWritable: true },    // authority (must be signer and mutable)
        { pubkey: SystemProgram.programId, isSigner: false, isWritable: false }, // system_program
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
    <div className="border rounded p-4 mb-4 bg-white shadow">
      <h3 className="font-bold mb-2 text-lg">Initialize Issuer</h3>
      <input
        className="border px-2 py-1 rounded mb-2 w-full"
        placeholder="Issuer Name (max 64)"
        value={issuerName}
        maxLength={64}
        onChange={e => setIssuerName(e.target.value)}
      />
      <input
        className="border px-2 py-1 rounded mb-2 w-full"
        placeholder="Website (max 64)"
        value={website}
        maxLength={64}
        onChange={e => setWebsite(e.target.value)}
      />
      <button
        className="px-4 py-2 bg-blue-600 text-white rounded w-full"
        onClick={handleInit}
        disabled={loading || !wallet.connected}
      >
        {loading ? "Initializing..." : "Initialize"}
      </button>
      <div className="text-sm mt-2">{status}</div>
    </div>
  );
}
