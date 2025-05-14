import { PublicKey } from "@solana/web3.js";
import { PROGRAM_ID, TOKEN_METADATA_PROGRAM_ID } from "./constants";

// Helper: encode a JS number as 8-byte little-endian buffer (for i64 seeds)
export function encodeI64(num) {
  const buf = Buffer.alloc(8);
  buf.writeBigInt64LE(BigInt(num), 0);
  return buf;
}

// PDA finders (all async, all return [pda, bump])
export async function findIssuerPDA(authorityPubkey) {
  return await PublicKey.findProgramAddress(
    [Buffer.from("issuer"), authorityPubkey.toBuffer()],
    PROGRAM_ID
  );
}

export async function findTemplatePDA(issuerPda, templateName) {
  return await PublicKey.findProgramAddress(
    [Buffer.from("template"), issuerPda.toBuffer(), Buffer.from(templateName, "utf8")],
    PROGRAM_ID
  );
}

export async function findBadgePDA(receiverPubkey, templatePda, uniqueSeed) {
  return await PublicKey.findProgramAddress(
    [
      Buffer.from("badge"),
      receiverPubkey.toBuffer(),
      templatePda.toBuffer(),
      encodeI64(uniqueSeed)
    ],
    PROGRAM_ID
  );
}

export async function findMetadataPDA(mintPubkey) {
  return await PublicKey.findProgramAddress(
    [
      Buffer.from("metadata"),
      TOKEN_METADATA_PROGRAM_ID.toBuffer(),
      mintPubkey.toBuffer(),
    ],
    TOKEN_METADATA_PROGRAM_ID
  );
}

export async function findMasterEditionPDA(mintPubkey) {
  return await PublicKey.findProgramAddress(
    [
      Buffer.from("metadata"),
      TOKEN_METADATA_PROGRAM_ID.toBuffer(),
      mintPubkey.toBuffer(),
      Buffer.from("edition"),
    ],
    TOKEN_METADATA_PROGRAM_ID
  );
}
