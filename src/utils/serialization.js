import { sha256 } from '@noble/hashes/sha2';
import { PublicKey } from "@solana/web3.js";
import { PROGRAM_ID, TOKEN_METADATA_PROGRAM_ID } from "./constants";

// --- Utility Functions ---
export function encodeI64(num) {
  const buf = Buffer.alloc(8);
  buf.writeBigInt64LE(BigInt(num), 0);
  return buf;
}

export function getDiscriminator(ixName) {
  const preimage = `global:${ixName}`;
  const hash = sha256(new TextEncoder().encode(preimage));
  return Buffer.from(hash).subarray(0, 8);
}

export function encodeString(str) {
  if (typeof str !== "string") {
    throw new Error(`encodeString expected a string but got: ${str}`);
  }
  const buf = Buffer.from(str, "utf8");
  const len = Buffer.alloc(4);
  len.writeUInt32LE(buf.length, 0);
  return Buffer.concat([len, buf]);
}


export function encodeFixedString(str, length) {
  const buf = Buffer.alloc(length);
  Buffer.from(str, "utf8").copy(buf);
  return buf;
}

// --- Serialization for Mint Badge ---
export function serializeMintBadgeArgs(timestamp, uniqueSeed, badgeName, templateName, metadataUri) {
  return Buffer.concat([
    getDiscriminator("mint_badge"),
    encodeI64(timestamp),
    encodeI64(uniqueSeed),
    encodeFixedString(badgeName, 32),
    encodeFixedString(templateName, 32),
    encodeString(metadataUri),
  ]);
}

// --- Other Serializers ---
export function serializeInitializeIssuerArgs(issuerName, website) {
  return Buffer.concat([
    getDiscriminator("initialize_issuer"),
    encodeString(issuerName),
    encodeString(website),
  ]);
}

export function serializeCreateBadgeTemplateArgs(templateName, description, metadataUri) {
  return Buffer.concat([
    getDiscriminator("create_badge_template"),
    encodeString(templateName),
    encodeString(description),
    encodeString(metadataUri),
  ]);
}

export function serializeAcceptBadgeArgs() {
  return getDiscriminator("accept_badge");
}

// --- PDA Finders ---
export async function findIssuerPDA(authorityPubkey) {
  return (await PublicKey.findProgramAddress(
    [Buffer.from("issuer"), authorityPubkey.toBuffer()],
    PROGRAM_ID
  ))[0];
}

export async function findTemplatePDA(issuerPda, templateName) {
  return (await PublicKey.findProgramAddress(
    [Buffer.from("template"), issuerPda.toBuffer(), Buffer.from(templateName)],
    PROGRAM_ID
  ))[0];
}

export async function findBadgePDA(receiver, templatePda, uniqueSeed) {
  return (await PublicKey.findProgramAddress(
    [
      Buffer.from("badge"),
      receiver.toBuffer(),
      templatePda.toBuffer(),
      encodeI64(uniqueSeed)
    ],
    PROGRAM_ID
  ))[0];
}

export async function findMetadataPDA(mintPk) {
  return (await PublicKey.findProgramAddress(
    [
      Buffer.from("metadata"),
      TOKEN_METADATA_PROGRAM_ID.toBuffer(),
      mintPk.toBuffer(),
    ],
    TOKEN_METADATA_PROGRAM_ID
  ))[0];
}

export async function findMasterEditionPDA(mintPk) {
  return (await PublicKey.findProgramAddress(
    [
      Buffer.from("metadata"),
      TOKEN_METADATA_PROGRAM_ID.toBuffer(),
      mintPk.toBuffer(),
      Buffer.from("edition"),
    ],
    TOKEN_METADATA_PROGRAM_ID
  ))[0];
}
