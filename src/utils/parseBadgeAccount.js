import { PublicKey } from "@solana/web3.js";

export function parseBadgeAccount(data) {
  // New struct: 170 bytes (with uniqueSeed, badgeName, templateName, etc.)
  if (data.length === 170) {
    let offset = 8;
    const template = new PublicKey(data.slice(offset, offset + 32));
    offset += 32;
    const issuer = new PublicKey(data.slice(offset, offset + 32));
    offset += 32;
    const receiver = new PublicKey(data.slice(offset, offset + 32));
    offset += 32;
    const timestamp = Number(BigInt.asIntN(64, data.readBigInt64LE(offset)));
    offset += 8;
    const uniqueSeed = Number(BigInt.asIntN(64, data.readBigInt64LE(offset)));
    offset += 8;
    const bump = data[offset];
    offset += 1;
    const accepted = !!data[offset];
    offset += 1;
    const badgeName = Buffer.from(data.slice(offset, offset + 32)).toString("utf8").replace(/\0/g, "");
    offset += 32;
    const templateName = Buffer.from(data.slice(offset, offset + 32)).toString("utf8").replace(/\0/g, "");
    offset += 32;

    return {
      template,
      issuer,
      receiver,
      timestamp,
      uniqueSeed,
      bump,
      accepted,
      badgeName,
      templateName,
    };
  }

  // Old struct: 113 bytes (no uniqueSeed, badgeName, templateName)
  if (data.length === 113) {
    let offset = 8;
    const template = new PublicKey(data.slice(offset, offset + 32));
    offset += 32;
    const issuer = new PublicKey(data.slice(offset, offset + 32));
    offset += 32;
    const receiver = new PublicKey(data.slice(offset, offset + 32));
    offset += 32;
    const timestamp = Number(BigInt.asIntN(64, data.readBigInt64LE(offset)));
    offset += 8;
    const bump = data[offset];
    offset += 1;
    const accepted = !!data[offset];
    // Fill missing fields with placeholders
    return {
      template,
      issuer,
      receiver,
      timestamp,
      uniqueSeed: null,
      bump,
      accepted,
      badgeName: "(old badge)",
      templateName: "(old badge)",
    };
  }

  // Unknown struct size: skip
  throw new Error(`Badge account data unexpected size: ${data.length}`);
}
