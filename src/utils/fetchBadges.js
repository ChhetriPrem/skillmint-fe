import { PROGRAM_ID } from "./constants";
// import { parseBadgeAccount } from "./parseBadgeAccount"; // Not needed for backend sneak

// Offset of the receiver field in your struct (adjust if your struct changes)
const RECEIVER_OFFSET = 8 + 32 + 32; // 72

/**
 * Fetches all badge accounts for a given wallet.
 * This is designed for on-chain fetching, but currently uses a backend API for performance.
 * @param {Connection} connection - Solana web3 connection (not used in this fallback)
 * @param {PublicKey} walletPublicKey - The wallet public key to filter for
 * @returns {Promise<Array>} - Array of parsed badge objects
 */
export async function fetchBadgesForWallet(connection, walletPublicKey) {
  // --- On-chain fetching code  ---
  const accounts = await connection.getProgramAccounts(PROGRAM_ID, {
    filters: [
      { memcmp: { offset: RECEIVER_OFFSET, bytes: walletPublicKey.toBase58() } }
    ]
  });
  return accounts
    .map(acc => {
      try {
        return {
          pubkey: acc.pubkey,
          ...parseBadgeAccount(acc.account.data)
        };
      } catch {
        return null;
      }
    })
    .filter(Boolean);

  // ---  fallback ---
  // For demo/hackathon, fetch from backend instead of on-chain.
  const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/getbadges?wallet=${walletPublicKey.toBase58()}`);
  if (!response.ok) {
    throw new Error("Failed to fetch badges from backend");
  }
  return await response.json();
}

export async function fetchBadgesForWallet2(connection, walletPublicKey) {

  const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/badges?wallet=${walletPublicKey.toBase58()}`);
  if (!response.ok) throw new Error("Failed to fetch badges from backend");
  
  const data = await response.json();
  console.log(data.badges);
  return data.badges || [];
}
