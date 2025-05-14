// src/components/BadgeAccepter.js
import React, { useCallback, useState } from "react";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { findIssuerPDA, findTemplatePDA, findBadgePDA } from "../utils/pdas";
import { serializeAcceptBadgeArgs } from "../utils/serialization";
import { PROGRAM_ID } from "../utils/constants";
import { Transaction, TransactionInstruction } from "@solana/web3.js";

export default function BadgeAccepter({ issuer, template, badgeReceiver }) {
  const { publicKey, signTransaction, connected } = useWallet();
  const { connection } = useConnection();
  const [status, setStatus] = useState("");

  const handleAccept = useCallback(async () => {
    if (!connected || !publicKey) {
      setStatus("Wallet not connected.");
      return;
    }
    setStatus("Accepting badge...");
    try {
      // Derive PDAs
      const issuerPda = await findIssuerPDA(issuer);
      const templatePda = await findTemplatePDA(issuerPda, template);
      const badgePda = await findBadgePDA(badgeReceiver, templatePda);

      // Build instruction
      const data = serializeAcceptBadgeArgs();
      const keys = [
        { pubkey: badgePda, isSigner: false, isWritable: true },
        { pubkey: publicKey, isSigner: true, isWritable: false },
      ];
      const ix = new TransactionInstruction({
        programId: PROGRAM_ID,
        keys,
        data,
      });
      const tx = new Transaction().add(ix);
      tx.feePayer = publicKey;
      tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
      const signed = await signTransaction(tx);
      const sig = await connection.sendRawTransaction(signed.serialize());
      await connection.confirmTransaction(sig, "confirmed");
      setStatus(`✅ Badge accepted! Tx: ${sig}`);
    } catch (e) {
      setStatus(`❌ Error: ${e.message}`);
    }
  }, [connection, publicKey, signTransaction, connected, issuer, template, badgeReceiver]);

  return (
    <div className="flex flex-col items-center">
      <button
        onClick={handleAccept}
        className="bg-green-600 text-white px-4 py-2 rounded shadow hover:bg-green-700"
        disabled={!connected}
      >
        Accept Badge
      </button>
      {status && <div className="mt-2 text-xs">{status}</div>}
    </div>
  );
}
