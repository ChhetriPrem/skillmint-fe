import React, { useState } from "react";
import {
  SystemProgram,
  Transaction,
  TransactionInstruction,
} from "@solana/web3.js";
import { useWallet } from "@solana/wallet-adapter-react";
import { serializeInitializeIssuerArgs } from "../utils/serialization";
import { findIssuerPDA } from "../utils/pdas";
import { PROGRAM_ID } from "../utils/constants";
import {
  Check,
  AlertCircle,
  Info,
  Loader2,
  Globe,
  User,
  ArrowRight,
} from "lucide-react";

export default function IssuerInitializer({ connection }) {
  const wallet = useWallet();
  const [issuerName, setIssuerName] = useState("");
  const [website, setWebsite] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [formStep, setFormStep] = useState(1);

  // Progress tracking for visuals
  const [initProgress, setInitProgress] = useState(0);

  // Form validation
  const isNameValid = issuerName.length > 0 && issuerName.length <= 64;
  const isWebsiteValid = website.length > 0 && website.length <= 64;
  const isFormValid = isNameValid && isWebsiteValid;

  const handleInit = async () => {
    setLoading(true);
    setStatus("");

    // Reset progress
    setInitProgress(0);

    try {
      if (!wallet.connected) {
        setStatus("⚠️ Please connect your wallet first!");
        setLoading(false);
        return;
      }

      if (!isFormValid) {
        setStatus("⚠️ Please fill in both fields correctly.");
        setLoading(false);
        return;
      }

      // Update progress for visual feedback
      setInitProgress(10);

      const authorityPubkey = wallet.publicKey;
      setInitProgress(20);

      const [issuerPda] = await findIssuerPDA(authorityPubkey);
      setInitProgress(30);

      const data = serializeInitializeIssuerArgs(issuerName, website);
      setInitProgress(40);

      const keys = [
        { pubkey: issuerPda, isSigner: false, isWritable: true },
        { pubkey: authorityPubkey, isSigner: true, isWritable: true },
        { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
      ];

      setInitProgress(50);

      const ix = new TransactionInstruction({
        programId: PROGRAM_ID,
        keys,
        data,
      });

      setInitProgress(60);

      const tx = new Transaction().add(ix);
      tx.feePayer = wallet.publicKey;
      setInitProgress(70);

      tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
      setInitProgress(80);

      const signed = await wallet.signTransaction(tx);
      setInitProgress(90);

      const sig = await connection.sendRawTransaction(signed.serialize());
      setInitProgress(100);

      // Format the transaction signature for display
      const shortSig = `${sig.slice(0, 8)}...${sig.slice(-8)}`;
      const fullSig = sig;

      setStatus(`✅ Issuer initialized! Tx: ${shortSig}`);
    } catch (e) {
      setStatus("❌ Error: " + (e.message || e.toString()));
      setInitProgress(0);
    }
    setLoading(false);
  };

  const goToNextStep = () => {
    if (formStep === 1 && isNameValid) {
      setFormStep(2);
    }
  };

  const goToPrevStep = () => {
    if (formStep === 2) {
      setFormStep(1);
    }
  };

  const getStatusColor = () => {
    if (status.startsWith("✅")) return "bg-emerald-700/80 text-emerald-100";
    if (status.startsWith("❌")) return "bg-red-700/80 text-red-100";
    return "bg-amber-700/80 text-amber-100";
  };

  // Helper function to truncate wallet address
  const truncateAddress = (address) => {
    if (!address) return "";
    return `${address.toString().slice(0, 4)}...${address
      .toString()
      .slice(-4)}`;
  };

  return (
    <div className="flex items-center justify-center min-h-[70vh] px-4">
      <div className="w-full max-w-xl rounded-3xl shadow-2xl p-8 border border-red-600/30 backdrop-blur-lg relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-red-500/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-32 -left-20 w-72 h-72 bg-indigo-500/20 rounded-full blur-3xl"></div>

        {/* Header section */}
        <div className="mb-8 text-center relative z-10">
          <div className="flex justify-center mb-4">
            <div className=" rounded-full p-4 shadow-xl border border-red-500/30">
              <svg width={32} height={32} fill="none" viewBox="0 0 24 24">
                <path
                  fill="#c4b5fd"
                  d="M12 2a10 10 0 1 1 0 20 10 10 0 0 1 0-20Zm0 3a1 1 0 0 0-1 1v5.59l-3.3 3.3a1 1 0 1 0 1.42 1.42l3.59-3.59V6a1 1 0 0 0-1-1Z"
                />
              </svg>
            </div>
          </div>
          <h2 className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-black to-indigo-200 mb-2">
            Initialize Your Issuer
          </h2>
          <div className="w-20 h-1  mx-auto rounded-full mb-3"></div>
          <p className=" text-sm mb-2 max-w-md mx-auto">
            <span className="font-semibold text-black">
              You only need to do this{" "}
              <span className="underline underline-offset-2 text-black">
                once
              </span>{" "}
              per wallet.
            </span>{" "}
            After initializing, you can mint and manage badges as an issuer.
          </p>

          {/* Wallet status banner */}
          <div
            className={`mt-4 py-2 px-4 rounded-lg inline-flex items-center gap-2 text-sm 
            ${
              wallet.connected
                ? "bg-green-800/50 text-black"
                : "bg-amber-800/50 text-amber-200"
            }`}
          >
            <div
              className={`w-2 h-2 rounded-full ${
                wallet.connected ? "bg-green-900 border-black" : "bg-amber-400"
              }`}
            ></div>
            {wallet.connected
              ? `Connected: ${truncateAddress(wallet.publicKey)}`
              : "Wallet not connected"}
          </div>
        </div>

        {/* Form Section */}
        <div className="relative z-10">
          {/* Step indicator */}
          {!loading && status === "" && (
            <div className="flex justify-between items-center mb-6 px-2">
              <div className="flex w-full justify-center ml-13 items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    formStep === 1
                      ? "bg-indigo-600 text-white"
                      : "bg-indigo-800/70 text-indigo-300"
                  }`}
                >
                  1
                </div>
                <div
                  className={`h-1 w-12 ${
                    formStep === 1 ? "bg-indigo-700/50" : "bg-indigo-600"
                  } mx-1`}
                ></div>
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    formStep === 2
                      ? "bg-indigo-600 text-white"
                      : "bg-indigo-800/70 text-indigo-300"
                  }`}
                >
                  2
                </div>
              </div>
              <div className="text-sm w-23 text-indigo-300 font-medium">
                Step {formStep} of 2
              </div>
            </div>
          )}

          {/* Step 1: Name Input */}
          {formStep === 1 && !loading && status === "" && (
            <div className="space-y-6">
              <div className="space-y-2">
                <label
                  className="flex items-center gap-2 text-black font-medium mb-1"
                  htmlFor="issuerName"
                >
                  <User size={16} className="" />
                  Issuer Name
                </label>
                <input
                  id="issuerName"
                  className="w-full px-4 py-3 rounded-lg border border-red-500/50  placeholder-red-400/70 focus:outline-none focus:ring-2 focus:ring-red-400/70 transition-all shadow-inner"
                  placeholder="Your Organization or Project Name"
                  value={issuerName}
                  maxLength={64}
                  onChange={(e) => setIssuerName(e.target.value)}
                  disabled={loading}
                  autoComplete="off"
                />
                <div className="flex justify-between text-xs">
                  <span
                    className={`${
                      issuerName.length > 0 ? "text-red-300" : "text-red-500"
                    }`}
                  >
                    {issuerName.length > 0 ? (
                      <span className="flex items-center gap-1">
                        <Check size={12} /> Valid name
                      </span>
                    ) : (
                      "Required field"
                    )}
                  </span>
                  <span
                    className={`${
                      issuerName.length > 50 ? "text-amber-300" : "text-red-500"
                    }`}
                  >
                    {issuerName.length}/64
                  </span>
                </div>
              </div>

              <button
                className={`w-full py-3 px-4 rounded-xl font-semibold text-base transition flex items-center justify-center gap-2
                  ${
                    isNameValid
                      ? " hover:from-indigo-500 bg-purple bg-green-500 hover:to-red-500 text-white shadow-lg"
                      : "bg-indigo-800/50 text-indigo-300 bg-purple cursor-not-allowed"
                  }`}
                onClick={goToNextStep}
                disabled={!isNameValid}
              >
                Continue <ArrowRight size={18} />
              </button>
            </div>
          )}

          {/* Step 2: Website Input */}
          {formStep === 2 && !loading && status === "" && (
            <div className="space-y-6">
              <div className="space-y-2">
                <label
                  className="flex items-center gap-2 text-black font-medium mb-1"
                  htmlFor="website"
                >
                  <Globe size={16} className="text-red-400" />
                  Website URL
                </label>
                <input
                  id="website"
                  className="w-full px-4 py-3 rounded-lg border   text-red-100 placeholder-red-400/70 focus:outline-none focus:ring-2 focus:ring-red-400/70 transition-all shadow-inner"
                  placeholder="https://your-project.com"
                  value={website}
                  maxLength={64}
                  onChange={(e) => setWebsite(e.target.value)}
                  disabled={loading}
                  autoComplete="off"
                />
                <div className="flex justify-between text-xs">
                  <span
                    className={`${
                      website.length > 0 ? "text-green-300" : "text-red-500"
                    }`}
                  >
                    {website.length > 0 ? (
                      <span className="flex items-center gap-1">
                        <Check size={12} /> Valid URL
                      </span>
                    ) : (
                      "Required field"
                    )}
                  </span>
                  <span
                    className={`${
                      website.length > 50 ? "text-amber-300" : "text-red-500"
                    }`}
                  >
                    {website.length}/64
                  </span>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  className="py-3 px-6 rounded-xl font-semibold text-base transition border border-indigo-700/30"
                  onClick={goToPrevStep}
                >
                  Back
                </button>
                <button
                  className={`flex-1 py-3 px-4 rounded-xl font-semibold text-base transition flex items-center justify-center gap-2
                    ${
                      isFormValid && wallet.connected
                        ? " text-white shadow-lg"
                        : "bg-indigo-800/50 text-black-300 cursor-not-allowed"
                    }`}
                  onClick={handleInit}
                  disabled={!isFormValid || !wallet.connected || loading}
                >
                  Initialize Issuer
                </button>
              </div>
            </div>
          )}

          {/* Loading State */}
          {loading && (
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
                    className="text-red-500"
                    strokeWidth="8"
                    strokeDasharray={Math.PI * 84}
                    strokeLinecap="round"
                    strokeDashoffset={
                      ((100 - initProgress) / 100) * Math.PI * 84
                    }
                    stroke="currentColor"
                    fill="transparent"
                    r="42"
                    cx="50"
                    cy="50"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center text-xl font-bold">
                  {initProgress}%
                </div>
              </div>

              <h3 className="text-xl font-bold text-black mb-2 animate-pulse">
                Initializing Issuer
              </h3>
              <p className="text-red-300 text-sm max-w-xs text-center">
                Please confirm the transaction in your wallet when prompted.
              </p>
            </div>
          )}

          {/* Success/Error State */}
          {status && (
            <div className="py-6 flex flex-col items-center justify-center">
              <div
                className={`w-16 h-16 rounded-full flex items-center justify-center mb-6 
                ${
                  status.startsWith("✅")
                    ? "bg-green-700/30 text-green-400 border-2 border-green-500/50"
                    : status.startsWith("❌")
                    ? "bg-red-700/30 text-red-400 border-2 border-red-500/50"
                    : "bg-amber-700/30 text-amber-400 border-2 border-amber-500/50"
                }`}
              >
                {status.startsWith("✅") && <Check size={32} />}
                {status.startsWith("❌") && <AlertCircle size={32} />}
                {status.startsWith("⚠️") && <Info size={32} />}
              </div>

              <div
                className={`px-5 py-3 rounded-lg font-medium text-center ${getStatusColor()}`}
              >
                {status}
              </div>

              {status.startsWith("✅") && (
                <div className="mt-6 w-full">
                  <button
                    className="w-full py-3 px-4 rounded-xl font-semibold text-base transition
                       hover:from-green-600 hover:to-emerald-600 text-white shadow-lg"
                    onClick={() => setStatus("")}
                  >
                    Continue
                  </button>
                </div>
              )}

              {!status.startsWith("✅") && (
                <div className="mt-6 w-full">
                  <button
                    className="w-full py-3 px-4 rounded-xl font-semibold text-base transition
                      bg-indigo-900/60 text-indigo-300 hover:bg-indigo-900 border border-indigo-700/30"
                    onClick={() => setStatus("")}
                  >
                    Try Again
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Info footer */}
        <div className="mt-8 pt-4 border-t  text-center relative z-10">
          <p className="text-xs">
            This will create your unique issuer account on the Solana blockchain
          </p>
        </div>
      </div>
    </div>
  );
}
