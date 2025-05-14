// import React, { useState } from "react";
// import { useWallet, useConnection } from "@solana/wallet-adapter-react";
// import {
//   PublicKey,
//   SystemProgram,
//   Transaction,
//   TransactionInstruction,
// } from "@solana/web3.js";
// import {
//   serializeCreateBadgeTemplateArgs,
//   serializeMintBadgeArgs,
// } from "../utils/serialization";
// import { PROGRAM_ID } from "../utils/constants";
// import {
//   findIssuerPDA,
//   findTemplatePDA,
//   findBadgePDA,
// } from "../utils/pdas";

// export default function OnChainSkillMintDashboard() {
//   const { connection } = useConnection();
//   const wallet = useWallet();

//   // Template state
//   const [templateName, setTemplateName] = useState("");
//   const [templateDesc, setTemplateDesc] = useState("");
//   const [templateMetadataUri, setTemplateMetadataUri] = useState("");
//   const [templateResult, setTemplateResult] = useState("");

//   // Badge state
//   const [badgeName, setBadgeName] = useState("");
//   const [badgeTemplateName, setBadgeTemplateName] = useState("");
//   const [receiver, setReceiver] = useState("");
//   const [badgeMetadataUri, setBadgeMetadataUri] = useState("");
//   const [badgeResult, setBadgeResult] = useState("");

//   const handleCreateTemplate = async (e) => {
//     e.preventDefault();
//     if (!wallet.publicKey) {
//   setTemplateResult(" Wallet not connected. Please connect your wallet.");
//   return;
// }

//     setTemplateResult("Sending transaction...");
//     try {
//       if (!wallet.publicKey) throw new Error("Connect wallet");

//       // Fetching PDAs
//       const issuerPda = await findIssuerPDA(wallet);
//       const templatePda = await findTemplatePDA(issuerPda, templateName);

//     if (!issuerPda) {
//       setTemplateResult(" Issuer PDA not found. Creating issuer first...");
//       // Implement issuer creation logic here if needed
//       return;
//     }
//       // Serializing data
//       const data = serializeCreateBadgeTemplateArgs(
//         templateName,
//         templateDesc,
//         templateMetadataUri
//       );

//       const ix = new TransactionInstruction({
//         keys: [
//           { pubkey: wallet.publicKey, isSigner: true, isWritable: false },
//           { pubkey: issuerPda, isSigner: false, isWritable: true },
//           { pubkey: templatePda, isSigner: false, isWritable: true },
//           { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
//         ],
//         programId: PROGRAM_ID,
//         data,
//       });

//       console.log("Transaction Instruction:", ix);  // Log transaction instruction

//       const tx = new Transaction().add(ix);
//       const latestBlockhash = await connection.getLatestBlockhash();

//       tx.recentBlockhash = latestBlockhash.blockhash;
//       tx.feePayer = wallet.publicKey;

//       const txid = await wallet.sendTransaction(tx, connection);
//       console.log("Transaction Sent:", txid);

//       // Confirming the transaction
//       await connection.confirmTransaction(
//         {
//           signature: txid,
//           blockhash: latestBlockhash.blockhash,
//           lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
//         },
//         "confirmed"
//       );

//       setTemplateResult(` Template created! Tx: ${txid}`);
//     } catch (err) {
//       setTemplateResult(" " + (err.message || err.toString()));
//       console.error("Transaction error:", err);
//     }
//   };

//   const handleMintBadge = async (e) => {
//     e.preventDefault();
//     setBadgeResult("Sending transaction...");
//     try {
//       if (!wallet.publicKey) throw new Error("Connect wallet");
//       if (!receiver) throw new Error("Receiver address required");

//       // Fetching necessary PDAs
//       const receiverPk = new PublicKey(receiver);
//       const issuerPda = await findIssuerPDA(wallet);
//       const templatePda = await findTemplatePDA(issuerPda, badgeTemplateName);
//       const badgePda = await findBadgePDA(receiverPk, templatePda);
//       const timestamp = Math.floor(Date.now() / 1000);

//       // Serializing data for minting badge
//       const data = serializeMintBadgeArgs(
//         timestamp,
//         badgeName,
//         badgeMetadataUri
//       );

//       const ix = new TransactionInstruction({
//         keys: [
//           { pubkey: wallet.publicKey, isSigner: true, isWritable: false },
//           { pubkey: receiverPk, isSigner: false, isWritable: true },
//           { pubkey: issuerPda, isSigner: false, isWritable: false },
//           { pubkey: templatePda, isSigner: false, isWritable: false },
//           { pubkey: badgePda, isSigner: false, isWritable: true },
//           { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
//         ],
//         programId: PROGRAM_ID,
//         data,
//       });

//       const tx = new Transaction().add(ix);
//       const latestBlockhash = await connection.getLatestBlockhash();

//       tx.recentBlockhash = latestBlockhash.blockhash;
//       tx.feePayer = wallet.publicKey;

//       const txid = await wallet.sendTransaction(tx, connection);

//       await connection.confirmTransaction(
//         {
//           signature: txid,
//           blockhash: latestBlockhash.blockhash,
//           lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
//         },
//         "confirmed"
//       );

//       setBadgeResult(` Badge minted! Tx: ${txid}`);
//     } catch (err) {
//       setBadgeResult(" " + (err.message || err.toString()));
//       console.error("Transaction error:", err);
//     }
//   };

//   return (
//     <div className="max-w-2xl mx-auto bg-white shadow rounded-lg p-6">
//       <h2 className="text-2xl font-bold mb-6">On-Chain SkillMint Dashboard</h2>

//       {/* Create Template Form */}
//       <form onSubmit={handleCreateTemplate} className="mb-8 space-y-3">
//         <h3 className="text-lg font-semibold">Create Badge Template (on-chain)</h3>
//         <input
//           className="w-full border p-2 rounded"
//           placeholder="Template Name"
//           value={templateName}
//           onChange={(e) => setTemplateName(e.target.value)}
//           required
//         />
//         <input
//           className="w-full border p-2 rounded"
//           placeholder="Template Description"
//           value={templateDesc}
//           onChange={(e) => setTemplateDesc(e.target.value)}
//           required
//         />
//         <input
//           className="w-full border p-2 rounded"
//           placeholder="Metadata URI (IPFS)"
//           value={templateMetadataUri}
//           onChange={(e) => setTemplateMetadataUri(e.target.value)}
//           required
//         />
//         <button className="bg-blue-600 text-white px-4 py-2 rounded" type="submit">
//           Create Template
//         </button>
//         <div className="text-sm mt-2">{templateResult}</div>
//       </form>

//       {/* Mint Badge Form */}
//       <form onSubmit={handleMintBadge} className="mb-8 space-y-3">
//         <h3 className="text-lg font-semibold">Mint Badge (on-chain)</h3>
//         <input
//           className="w-full border p-2 rounded"
//           placeholder="Badge Name"
//           value={badgeName}
//           onChange={(e) => setBadgeName(e.target.value)}
//           required
//         />
//         <input
//           className="w-full border p-2 rounded"
//           placeholder="Template Name"
//           value={badgeTemplateName}
//           onChange={(e) => setBadgeTemplateName(e.target.value)}
//           required
//         />
//         <input
//           className="w-full border p-2 rounded"
//           placeholder="Receiver Wallet Address"
//           value={receiver}
//           onChange={(e) => setReceiver(e.target.value)}
//           required
//         />
//         <input
//           className="w-full border p-2 rounded"
//           placeholder="Badge Metadata URI (IPFS)"
//           value={badgeMetadataUri}
//           onChange={(e) => setBadgeMetadataUri(e.target.value)}
//           required
//         />
//         <button className="bg-green-600 text-white px-4 py-2 rounded" type="submit">
//           Mint Badge
//         </button>
//         <div className="text-sm mt-2">{badgeResult}</div>
//       </form>
//     </div>
//   );
// }



import React, { useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { SystemProgram, Transaction, TransactionInstruction } from "@solana/web3.js";
import { serializeCreateBadgeTemplateArgs } from "../utils/serialization";
import { findIssuerPDA, findTemplatePDA } from "../utils/pdas";
import { PROGRAM_ID } from "../utils/constants";

export default function SkillMintDashboard({ connection }) {
  const wallet = useWallet();
  const [templateName, setTemplateName] = useState("");
  const [description, setDescription] = useState("");
  const [metadataUri, setMetadataUri] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    setLoading(true);
    setStatus("");
    try {
      if (!wallet.connected || !wallet.publicKey) {
        setStatus("Connect your wallet first!");
        setLoading(false);
        return;
      }
      if (!templateName || !description || !metadataUri) {
        setStatus("All fields required.");
        setLoading(false);
        return;
      }
      // Find PDAs
      const issuerPda = await findIssuerPDA(wallet);
      const templatePda = await findTemplatePDA(issuerPda, templateName);
      // Serialize instruction data
      const data = serializeCreateBadgeTemplateArgs(templateName, description, metadataUri);
      // Prepare accounts
      const issuerAccountInfo = await connection.getAccountInfo(issuerPda);
console.log("Issuer Account Info:", issuerAccountInfo);
      const keys = [
        { pubkey: wallet.publicKey, isSigner: true, isWritable: false },
        { pubkey: issuerPda, isSigner: false, isWritable: true },
        { pubkey: templatePda, isSigner: false, isWritable: true },
        { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
      ];
      // Create instruction and transaction
      const ix = new TransactionInstruction({
        programId: PROGRAM_ID,
        keys,
        data,
      });
      const tx = new Transaction().add(ix);
      tx.feePayer = wallet.publicKey;
      tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
      // Sign and send transaction
      const signed = await wallet.signTransaction(tx);
      const sig = await connection.sendRawTransaction(signed.serialize());
      setStatus(`✅ Badge template created! Tx: ${sig}`);
    } catch (e) {
      setStatus("❌ Error: " + (e.message || e.toString()));
    }
    setLoading(false);
  };

  return (
    <div className="border rounded p-4 mb-4 bg-white shadow">
      <h3 className="font-bold mb-2 text-lg">Create Badge Template</h3>
      <input
        className="border px-2 py-1 rounded mb-2 w-full"
        placeholder="Template Name (max 64)"
        value={templateName}
        onChange={e => setTemplateName(e.target.value)}
      />
      <input
        className="border px-2 py-1 rounded mb-2 w-full"
        placeholder="Description (max 256)"
        value={description}
        onChange={e => setDescription(e.target.value)}
      />
      <input
        className="border px-2 py-1 rounded mb-2 w-full"
        placeholder="Metadata URI (max 256)"
        value={metadataUri}
        onChange={e => setMetadataUri(e.target.value)}
      />
      <button
        className="px-4 py-2 bg-green-600 text-white rounded w-full"
        onClick={handleCreate}
        disabled={loading || !wallet.connected}
      >
        {loading ? "Creating..." : "Create Template"}
      </button>
      <div className="text-sm mt-2">{status}</div>
    </div>
  );
}
