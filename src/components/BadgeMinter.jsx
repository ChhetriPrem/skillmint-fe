import React, { useState } from "react";
import {
    PublicKey ,
  SystemProgram,
  Transaction,
  TransactionInstruction,
  Keypair,
  SYSVAR_RENT_PUBKEY,
} from "@solana/web3.js";
import {
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  getAssociatedTokenAddress,
  createInitializeMintInstruction,
  MINT_SIZE,
  createAssociatedTokenAccountInstruction,
} from "@solana/spl-token";
import { useWallet } from "@solana/wallet-adapter-react";
import { serializeMintBadgeArgs } from "../utils/serialization";
import { findIssuerPDA, findTemplatePDA, findBadgePDA, findMetadataPDA, findMasterEditionPDA } from "../utils/pdas";
import { PROGRAM_ID, TOKEN_METADATA_PROGRAM_ID } from "../utils/constants";

export default function BadgeMinter({ connection }) {
  const wallet = useWallet();
  const [receiver, setReceiver] = useState("");
  const [templateName, setTemplateName] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  const handleMint = async () => {
    setLoading(true);
    setStatus("");
    try {
      if (!wallet.connected) {
        setStatus("Connect your wallet first!");
        setLoading(false);
        return;
      }
      if (!receiver || !templateName) {
        setStatus("Receiver and template required.");
        setLoading(false);
        return;
      }
      let receiverPk;
      try {
  receiverPk = new PublicKey(receiver);
      } catch {
        setStatus("Invalid receiver address.");
        setLoading(false);
        return;
      }

      const issuerPda = await findIssuerPDA(wallet);
      const templatePda = await findTemplatePDA(issuerPda, templateName);
      const badgePda = await findBadgePDA(receiverPk, templatePda);

      const mintKeypair = Keypair.generate();
      const mintPk = mintKeypair.publicKey;

      const tokenAccountPk = await getAssociatedTokenAddress(
        mintPk,
        receiverPk,
        false,
        TOKEN_PROGRAM_ID,
        ASSOCIATED_TOKEN_PROGRAM_ID
      );

      const metadataPk = await findMetadataPDA(mintPk);
      const masterEditionPk = await findMasterEditionPDA(mintPk);

      const data = serializeMintBadgeArgs(Date.now());

      const lamports = await connection.getMinimumBalanceForRentExemption(MINT_SIZE);
      const createMintIx = SystemProgram.createAccount({
        fromPubkey: wallet.publicKey,
        newAccountPubkey: mintPk,
        space: MINT_SIZE,
        lamports,
        programId: TOKEN_PROGRAM_ID,
      });
      const initMintIx = createInitializeMintInstruction(
        mintPk,
        0,
        wallet.publicKey,
        wallet.publicKey
      );
      const createATAIx = createAssociatedTokenAccountInstruction(
        wallet.publicKey,
        tokenAccountPk,
        receiverPk,
        mintPk,
        TOKEN_PROGRAM_ID,
        ASSOCIATED_TOKEN_PROGRAM_ID
      );

      const keys = [
        { pubkey: issuerPda, isSigner: false, isWritable: true },
        { pubkey: templatePda, isSigner: false, isWritable: false },
        { pubkey: badgePda, isSigner: false, isWritable: true },
        { pubkey: wallet.publicKey, isSigner: true, isWritable: true },
        { pubkey: receiverPk, isSigner: false, isWritable: false },
        { pubkey: mintPk, isSigner: true, isWritable: true },
        { pubkey: tokenAccountPk, isSigner: false, isWritable: true },
        { pubkey: metadataPk, isSigner: false, isWritable: true },
        { pubkey: masterEditionPk, isSigner: false, isWritable: true },
        { pubkey: TOKEN_METADATA_PROGRAM_ID, isSigner: false, isWritable: false },
        { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
        { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
        { pubkey: SYSVAR_RENT_PUBKEY, isSigner: false, isWritable: false },
        { pubkey: ASSOCIATED_TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
      ];

      const ix = new TransactionInstruction({
        programId: PROGRAM_ID,
        keys,
        data,
      });
      const tx = new Transaction()
        .add(createMintIx)
        .add(initMintIx)
        .add(createATAIx)
        .add(ix);
      tx.feePayer = wallet.publicKey;
      tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
      tx.partialSign(mintKeypair);
      const signed = await wallet.signTransaction(tx);
      const sig = await connection.sendRawTransaction(signed.serialize());
      setStatus(`✅ Badge minted! Tx: ${sig}`);
    } catch (e) {
      setStatus("❌ Error: " + (e.message || e.toString()));
    }
    setLoading(false);
  };

  return (
    <div className="border rounded p-4 mb-4 bg-white shadow">
      <h3 className="font-bold mb-2 text-lg">Mint Badge</h3>
      <input
        className="border px-2 py-1 rounded mb-2 w-full"
        placeholder="Receiver Address"
        value={receiver}
        onChange={e => setReceiver(e.target.value)}
      />
      <input
        className="border px-2 py-1 rounded mb-2 w-full"
        placeholder="Badge Template Name"
        value={templateName}
        onChange={e => setTemplateName(e.target.value)}
      />
      <button
        className="px-4 py-2 bg-purple-600 text-white rounded w-full"
        onClick={handleMint}
        disabled={loading || !wallet.connected}
      >
        {loading ? "Minting..." : "Mint Badge"}
      </button>
      <div className="text-sm mt-2">{status}</div>
    </div>
  );
}
