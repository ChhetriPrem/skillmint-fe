import React, { useState, useEffect } from "react";
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

// Sample pre-uploaded images
const preUploadedImages = [
  {
    id: 1,
    url: "/badge1.png",
    name: "Gold Medal",
  },
  {
    id: 2,
    url: "/badge2.png",
    name: "Bronze Star",
  },
  {
    id: 3,
    url: "/badge3.png",
    name: "Diamond Award",
  },
  {
    id: 4,
    url: "/badge4.png",
    name: "Platinum Trophy",
  },
];


export default function BadgeTemplateCreator({ connection }) {
  const wallet = useWallet();
  const [templateName, setTemplateName] = useState("");
  const [description, setDescription] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [selectedPreUploadedImage, setSelectedPreUploadedImage] =
    useState(null);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [progressValue, setProgressValue] = useState(0);
  const [progressStep, setProgressStep] = useState("");
  const [activeTab, setActiveTab] = useState("upload"); // "upload" or "preUploaded"
  const [previewUrl, setPreviewUrl] = useState(null);

  // Reset form function
  const resetForm = () => {
    setTemplateName("");
    setDescription("");
    setImageFile(null);
    setSelectedPreUploadedImage(null);
    setPreviewUrl(null);
  };

  // Update preview when file is selected
  useEffect(() => {
    if (imageFile) {
      const url = URL.createObjectURL(imageFile);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    } else if (selectedPreUploadedImage) {
      setPreviewUrl(selectedPreUploadedImage.url);
    } else {
      setPreviewUrl(null);
    }
  }, [imageFile, selectedPreUploadedImage]);

  // Handle image selection from file upload
  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setImageFile(e.target.files[0]);
      setSelectedPreUploadedImage(null);
      setActiveTab("upload");
    }
  };

  // Handle pre-uploaded image selection
  const handlePreUploadedImageSelect = (image) => {
    setSelectedPreUploadedImage(image);
    setImageFile(null);
    setActiveTab("preUploaded");
  };

  const handleCreate = async () => {
    setLoading(true);
    setProgressValue(10);
    setProgressStep("Connecting to Solana...");
    setStatus("🔄 Connecting to Solana...");

    try {
      if (!wallet.connected) {
        setStatus("⚠️ Please connect your wallet first.");
        setLoading(false);
        return;
      }
      if (
        !templateName ||
        !description ||
        (!imageFile && !selectedPreUploadedImage)
      ) {
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

      setProgressValue(30);
      setProgressStep("Creating template on-chain...");
      setStatus("🔄 Creating template on-chain...");

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

      setProgressValue(50);
      setProgressStep("Awaiting signature...");
      setStatus("🔄 Please sign the transaction in your wallet...");

      const signed = await wallet.signTransaction(tx);

      setProgressValue(60);
      setProgressStep("Sending transaction...");
      setStatus("🔄 Sending transaction to Solana network...");

      const sig = await connection.sendRawTransaction(signed.serialize());

      setProgressValue(70);
      setProgressStep("Transaction confirmed!");
      setStatus(
        <>
          <span role="img" aria-label="success">
            ✅
          </span>
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
      setProgressValue(80);
      setProgressStep("Uploading image & metadata...");

      let metadataUri, imageUrl;
      try {
        const formData = new FormData();
        formData.append("templateName", templateName);
        formData.append("description", description);

        if (imageFile) {
          formData.append("file", imageFile);
        } else if (selectedPreUploadedImage) {
          formData.append("preUploadedImageId", selectedPreUploadedImage.id);
        }

        const res = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/api/create-template`,
          {
            method: "POST",
            body: formData,
          }
        );
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
      setProgressValue(90);
      setProgressStep("Saving to database...");
      setStatus("💾 Saving template in database...");

      try {
        const dbRes = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/api/store-template`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              templateName,
              description,
              metadataUri,
              imageUrl,
              txSignature: sig,
              preUploadedImageId: selectedPreUploadedImage?.id || null,
            }),
          }
        );
        if (!dbRes.ok) {
          const errorText = await dbRes.text();
          throw new Error(errorText);
        }
      } catch (e) {
        setStatus(`❌ Database save failed: ${e.message}`);
        setLoading(false);
        return;
      }

      setProgressValue(100);
      setProgressStep("Complete!");
      setStatus(
        <>
          <span role="img" aria-label="party">
            🎉
          </span>
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

      // Wait 2 seconds to show 100% completion before resetting
      setTimeout(() => {
        resetForm();
        setLoading(false);
      }, 2000);
    } catch (e) {
      setStatus("❌ Error: " + (e.message || e.toString()));
      setLoading(false);
    }
  };

  // Tab indicator animation properties
  const tabIndicatorProps = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.2 },
    className:
      "absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-pink-500 to-purple-500 rounded-t-full",
  };

  return (
    <div className="relative flex items-center justify-center min-h-[700px] px-4 py-10">
      {/* Animated background elements */}
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
        className="absolute top-1/2 left-1/3 w-[180px] h-[180px] rounded-full bg-blue-500 opacity-20 blur-3xl z-0"
        animate={{ x: [0, 20, 0], y: [0, -30, 0] }}
        transition={{ duration: 10, repeat: Infinity, repeatType: "reverse" }}
      />

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 w-full max-w-3xl bg-white backdrop-blur-xl rounded-3xl p-8 shadow-[0_0_40px_rgba(139,92,246,0.5)] border border-purple-700"
      >
        {/* Header */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 text-center drop-shadow-lg select-none">
            🏷️ Create a Badge Template
          </h2>
          <p className="text-black text-center mt-2 opacity-80">
            Design a unique badge to reward achievements on the Solana
            blockchain
          </p>
        </motion.div>

        {/* Loading Overlay - displayed when loading is true */}
        {loading ? (
          <div className="py-8 flex flex-col items-center justify-center">
            <div className="relative w-24 h-24 mb-6">
              {/* Progress circle */}
              <svg className="w-full h-full" viewBox="0 0 100 100">
                <circle
                  className="text-indigo-900/30"
                  strokeWidth="8"
                  stroke="currentColor"
                  fill="transparent"
                  r="42"
                  cx="50"
                  cy="50"
                />
                <circle
                  className="text-purple-500"
                  strokeWidth="8"
                  strokeDasharray={Math.PI * 84}
                  strokeLinecap="round"
                  strokeDashoffset={
                    ((100 - progressValue) / 100) * Math.PI * 84
                  }
                  stroke="currentColor"
                  fill="transparent"
                  r="42"
                  cx="50"
                  cy="50"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center text-xl font-bold">
                {progressValue}%
              </div>
            </div>

            <h3 className="text-xl font-bold text-black mb-2 animate-pulse">
              {progressStep}
            </h3>
            <p className="text-purple-500 text-sm max-w-xs text-center">
              Please confirm the transaction in your wallet when prompted.
            </p>
          </div>
        ) : (
          <>
            <div className="flex flex-col md:flex-row gap-8">
              {/* Left column - Form */}
              <div className="flex-1">
                <div className="mt-1">
                  <label className="block font-semibold mb-2 text-purple-300">
                    Template Name
                  </label>
                  <input
                    className="border-2 border-purple-600 text-black px-4 py-3 rounded-xl w-full focus:outline-none focus:ring-2 focus:ring-pink-100 transition"
                    placeholder="Template Name (max 64)"
                    value={templateName}
                    maxLength={64}
                    onChange={(e) => setTemplateName(e.target.value)}
                    disabled={loading}
                  />
                  <div className="text-xs text-purple-400 mt-1 text-right">
                    {templateName.length}/64 characters
                  </div>
                </div>

                <div className="mb-6">
                  <label className="block font-semibold mb-2 text-purple-900">
                    Description
                  </label>
                  <textarea
                    className="border-2 border-purple-600 text-black px-4 py-3 rounded-xl w-full focus:outline-none focus:ring-2 focus:ring-pink-100 transition resize-none"
                    placeholder="Description (max 256)"
                    value={description}
                    maxLength={256}
                    onChange={(e) => setDescription(e.target.value)}
                    disabled={loading}
                    rows={4}
                  />
                  <div className="text-xs text-purple-400 mt-1 text-right">
                    {description.length}/256 characters
                  </div>
                </div>
              </div>

              {/* Right column - Image selection */}
              <div className="flex-1">
                <div className="mb-4">
                  <label className="block font-semibold mb-2 text-purple-300">
                    Badge Image
                  </label>

                  {/* Tabs */}
                  <div className="flex border-b border-purple-600 mb-4">
                    <div className="relative mr-4">
                      <button
                        className={`px-4 py-2 font-medium ${
                          activeTab === "upload"
                            ? "text-pink-400"
                            : "text-purple-300 hover:text-purple-200"
                        }`}
                        onClick={() => setActiveTab("upload")}
                      >
                        Upload Image
                      </button>
                      {activeTab === "upload" && (
                        <motion.div {...tabIndicatorProps} />
                      )}
                    </div>
                    <div className="relative">
                      <button
                        className={`px-4 py-2 font-medium ${
                          activeTab === "preUploaded"
                            ? "text-pink-400"
                            : "text-purple-300 hover:text-purple-200"
                        }`}
                        onClick={() => setActiveTab("preUploaded")}
                      >
                        Pre-uploaded
                      </button>
                      {activeTab === "preUploaded" && (
                        <motion.div {...tabIndicatorProps} />
                      )}
                    </div>
                  </div>

                  <AnimatePresence mode="wait">
                    {activeTab === "upload" ? (
                      <motion.div
                        key="upload"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <input
                          type="file"
                          accept="image/*"
                          id="file-upload"
                          className="hidden"
                          onChange={handleFileChange}
                          disabled={loading}
                        />
                        <label
                          htmlFor="file-upload"
                          className="flex flex-col items-center justify-center border-2 border-dashed border-purple-500 rounded-xl p-6 cursor-pointer hover:bg-[#22223A] transition-all"
                        >
                          <span className="text-5xl mb-2">📤</span>
                          <span className="text-purple-300 text-center">
                            {imageFile
                              ? imageFile.name
                              : "Click to upload image"}
                          </span>
                          <span className="text-purple-400 text-xs mt-1">
                            PNG, JPG, GIF up to 5MB
                          </span>
                        </label>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="preUploaded"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 max-h-48 overflow-y-auto pr-1 pb-2">
                          {preUploadedImages.map((image) => (
                            <motion.div
                              key={image.id}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() =>
                                handlePreUploadedImageSelect(image)
                              }
                              className={`border-2 rounded-lg overflow-hidden cursor-pointer transition-all ${
                                selectedPreUploadedImage?.id === image.id
                                  ? "border-pink-500 shadow-[0_0_12px_rgba(236,72,153,0.5)]"
                                  : "border-purple-700 hover:border-purple-500"
                              }`}
                            >
                              <div className="aspect-square relative">
                                <img
                                  src={image.url}
                                  alt={image.name}
                                  className="object-cover w-full h-full"
                                />
                                {selectedPreUploadedImage?.id === image.id && (
                                  <div className="absolute inset-0 bg-pink-500/20 flex items-center justify-center">
                                    <span className="text-2xl">✓</span>
                                  </div>
                                )}
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Preview box - if image selected */}
                {previewUrl && (
                  <div className="mt-4">
                    <label className="block font-semibold mb-2 text-purple-300">
                      Preview
                    </label>
                    <div className="border-2 border-purple-600 rounded-xl p-2 flex justify-center">
                      <img
                        src={previewUrl}
                        alt="Badge Preview"
                        className="max-h-32 object-contain"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Submit button */}
            <motion.button
              whileHover={{
                scale: !wallet.connected ? 1 : 1.03,
                boxShadow: !wallet.connected ? "none" : "0 0 18px #a78bfa",
              }}
              whileTap={{ scale: 0.98 }}
              className={`mt-8 px-6 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl w-full font-bold shadow-lg transition text-lg ${
                !wallet.connected
                  ? "opacity-60 cursor-not-allowed"
                  : "hover:from-purple-600 hover:to-pink-600"
              }`}
              onClick={handleCreate}
              disabled={!wallet.connected}
            >
              {!wallet.connected
                ? "Connect Wallet to Continue"
                : "Create Badge Template"}
            </motion.button>
          </>
        )}

        {/* Status messages */}
        <AnimatePresence>
          {status && !loading && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 12 }}
              className="text-base mt-6 min-h-[48px] text-center transition-all p-4 bg-[#22223A]/70 rounded-xl"
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

      {/* Decorative elements */}
      <motion.div
        className="absolute top-10 right-14 text-pink-400 text-5xl select-none z-10"
        animate={{ y: [0, -18, 0], rotate: [0, 5, 0, -5, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      >
        🏅
      </motion.div>
      <motion.div
        className="absolute bottom-20 left-20 text-purple-300 text-3xl select-none z-10"
        animate={{ rotate: [0, 18, -18, 0], scale: [1, 1.1, 1] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      >
        ✨
      </motion.div>
      <motion.div
        className="absolute top-24 left-32 text-blue-300 text-4xl select-none z-10 opacity-80"
        animate={{ y: [0, -15, 0], opacity: [0.8, 0.6, 0.8] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
      >
        🔶
      </motion.div>
    </div>
  );
}
