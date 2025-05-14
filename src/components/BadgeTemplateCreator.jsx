import React, { useState } from "react";
import {
  SystemProgram,
  Transaction,
  TransactionInstruction,
} from "@solana/web3.js";
import { useWallet } from "@solana/wallet-adapter-react";
import { serializeCreateBadgeTemplateArgs } from "../utils/serialization";
import { findIssuerPDA, findTemplatePDA } from "../utils/pdas";
import { PROGRAM_ID } from "../utils/constants";
import { motion, AnimatePresence } from "framer-motion";

export default function BadgeTemplateCreator({ connection }) {
  const wallet = useWallet();
  const [templateName, setTemplateName] = useState("");
  const [description, setDescription] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  const resetForm = () => {
    setTemplateName("");
    setDescription("");
    setImageFile(null);
  };

  const handleCreate = async () => {
    setLoading(true);
    setStatus("🔗 Connecting to Solana...");
    try {
      if (!wallet.connected) {
        setStatus("⚠️ Please connect your wallet first.");
        setLoading(false);
        return;
      }
      if (!templateName || !description || !imageFile) {
        setStatus("⚠️ All fields are required.");
        setLoading(false);
        return;
      }
      if (templateName.length > 64) {
        setStatus("⚠️ Template name must be at most 64 characters.");
        setLoading(false);
        return;
      }
      if (description.length > 256) {
        setStatus("⚠️ Description must be at most 256 characters.");
        setLoading(false);
        return;
      }

      setStatus("🚀 Creating template on-chain...");
      const [issuerPda] = await findIssuerPDA(wallet.publicKey);
      const [templatePda] = await findTemplatePDA(issuerPda, templateName);

      const data = serializeCreateBadgeTemplateArgs(
        templateName,
        description,
        ""
      );

      const keys = [
        { pubkey: issuerPda, isSigner: false, isWritable: true },
        { pubkey: templatePda, isSigner: false, isWritable: true },
        { pubkey: wallet.publicKey, isSigner: true, isWritable: true },
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

      setStatus(
        <>
          <span role="img" aria-label="success">✅</span> 
          <span>Template created on-chain!</span>
          <br />
          <a
            href={`https://explorer.solana.com/tx/${sig}?cluster=devnet`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 underline"
          >
            View on Solana Explorer
          </a>
          <br />
          <span>Uploading image & metadata...</span>
        </>
      );

      // 2. Upload image & metadata to backend
      let metadataUri, imageUrl;
      try {
        const formData = new FormData();
        formData.append("templateName", templateName);
        formData.append("description", description);
        formData.append("file", imageFile);

        const res = await fetch(`${process.env.BACKEND_URL}/api/create-template`, {
          method: "POST",
          body: formData,
        });
        if (!res.ok) {
          const errorText = await res.text();
          throw new Error(errorText);
        }
        ({ metadataUri, imageUrl } = await res.json());
      } catch (e) {
        setStatus(`❌ Image/metadata upload failed: ${e.message}`);
        setLoading(false);
        return;
      }

      // 3. Store everything in DB (including txSignature)
      setStatus("💾 Saving template in database...");
      try {
        const dbRes = await fetch(`${process.env.BACKEND_URL}/api/store-template`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            templateName,
            description,
            metadataUri,
            imageUrl,
            txSignature: sig,
          }),
        });
        if (!dbRes.ok) {
          const errorText = await dbRes.text();
          throw new Error(errorText);
        }
      } catch (e) {
        setStatus(`❌ Database save failed: ${e.message}`);
        setLoading(false);
        return;
      }

      setStatus(
        <>
          <span role="img" aria-label="party">🎉</span> 
          <span>Template created and saved!</span>
          <br />
          <a
            href={`https://explorer.solana.com/tx/${sig}?cluster=devnet`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 underline"
          >
            View Transaction
          </a>
        </>
      );
      resetForm();
    } catch (e) {
      setStatus("❌ Error: " + (e.message || e.toString()));
    }
    setLoading(false);
  };

  return (
    <div className="relative flex items-center justify-center min-h-[600px]">
      {/* Futuristic animated background blobs */}
      <motion.div
        className="absolute -top-24 -left-24 w-[300px] h-[300px] rounded-full bg-purple-700 opacity-30 blur-3xl z-0"
        animate={{ x: [0, 40, 0], y: [0, 30, 0] }}
        transition={{ duration: 8, repeat: Infinity, repeatType: "reverse" }}
      />
      <motion.div
        className="absolute bottom-[-80px] right-[-80px] w-[250px] h-[250px] rounded-full bg-pink-500 opacity-20 blur-3xl z-0"
        animate={{ x: [0, -30, 0], y: [0, -20, 0] }}
        transition={{ duration: 7, repeat: Infinity, repeatType: "reverse" }}
      />
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 w-full max-w-xl bg-[#18192A]/90 backdrop-blur-xl rounded-3xl p-10 shadow-[0_0_40px_rgba(139,92,246,0.5)] border border-purple-700"
      >
        <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 mb-8 text-center drop-shadow-lg select-none">
          🏷️ Create a Badge Template
        </h2>
        <div className="mb-6">
          <label className="block font-semibold mb-2 text-purple-300">Template Name</label>
          <input
            className="border-2 border-purple-600 bg-[#22223A] text-white px-4 py-3 rounded-xl w-full focus:outline-none focus:ring-2 focus:ring-pink-500 transition"
            placeholder="Template Name (max 64)"
            value={templateName}
            maxLength={64}
            onChange={e => setTemplateName(e.target.value)}
            disabled={loading}
          />
        </div>
        <div className="mb-6">
          <label className="block font-semibold mb-2 text-purple-300">Description</label>
          <textarea
            className="border-2 border-purple-600 bg-[#22223A] text-white px-4 py-3 rounded-xl w-full focus:outline-none focus:ring-2 focus:ring-pink-500 transition"
            placeholder="Description (max 256)"
            value={description}
            maxLength={256}
            onChange={e => setDescription(e.target.value)}
            disabled={loading}
            rows={3}
          />
        </div>
        <div className="mb-8">
          <label className="block font-semibold mb-2 text-purple-300">Badge Image</label>
          <input
            type="file"
            accept="image/*"
            className="border-2 border-purple-600 bg-[#22223A] text-white px-4 py-3 rounded-xl w-full file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-gradient-to-r file:from-pink-500 file:to-purple-500 file:text-white hover:file:from-pink-600 hover:file:to-purple-600 transition"
            onChange={e => setImageFile(e.target.files[0])}
            disabled={loading}
          />
        </div>
        <motion.button
          whileHover={{ scale: loading || !wallet.connected ? 1 : 1.04, boxShadow: loading || !wallet.connected ? "none" : "0 0 18px #a78bfa" }}
          whileTap={{ scale: 0.98 }}
          className={`px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl w-full font-bold shadow-lg transition text-lg ${
            loading || !wallet.connected
              ? "opacity-60 cursor-not-allowed"
              : "hover:from-purple-600 hover:to-pink-600"
          }`}
          onClick={handleCreate}
          disabled={loading || !wallet.connected}
        >
          {loading ? (
            <span className="animate-pulse">Working...</span>
          ) : (
            "Create Template"
          )}
        </motion.button>
        <AnimatePresence>
          {status && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 12 }}
              className="text-base mt-8 min-h-[48px] text-center transition-all"
            >
              <div
                className={
                  typeof status === "string"
                    ? status.startsWith("❌")
                      ? "text-red-400"
                      : status.startsWith("✅") || status.startsWith("🎉")
                      ? "text-green-400"
                      : "text-purple-200"
                    : "text-purple-200"
                }
              >
                {status}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
      {/* Cartoonish floating badge */}
      <motion.div
        className="absolute top-10 right-14 text-pink-400 text-4xl select-none z-10"
        animate={{ y: [0, -18, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      >
        🏅
      </motion.div>
      {/* Sparkles */}
      <motion.div
        className="absolute bottom-16 left-14 text-purple-300 text-3xl select-none z-10"
        animate={{ rotate: [0, 18, -18, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      >
        ✨
      </motion.div>
    </div>
  );
}
