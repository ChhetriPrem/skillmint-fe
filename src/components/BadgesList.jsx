import React, { useEffect, useState } from "react";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { fetchBadgesForWallet2 } from "../utils/fetchBadges";
import BadgeAccepter from "./AcceptBadge";

export default function BadgeList() {
  const { publicKey } = useWallet();
  const { connection } = useConnection();
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!publicKey) return;
    setLoading(true);
    fetchBadgesForWallet2(connection, publicKey)
      .then(setBadges)
      .catch(() => setBadges([]))
      .finally(() => setLoading(false));
  }, [connection, publicKey]);

  if (!publicKey)
    return (
      <div className="text-center text-gray-400 mt-8">
        Connect your wallet to see badges.
      </div>
    );
  if (loading)
    return (
      <div className="text-center text-purple-400 mt-8 animate-pulse">
        Loading badges...
      </div>
    );
  if (badges.length === 0)
    return (
      <div className="text-center text-gray-400 mt-8">No badges found.</div>
    );

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mt-8">
      {badges.map((badge) => (
        <div
          key={badge.id}
          className="bg-gradient-to-br from-purple-900 via-gray-900 to-pink-900 rounded-2xl shadow-lg p-6 flex flex-col items-center border border-purple-700 hover:scale-105 transition"
        >
          <img
            src={badge.badge_metadata_uri}
            alt={badge.badge_name}
            className="w-24 h-24 rounded-xl border-4 border-pink-400 shadow mb-4 object-cover bg-white"
            onError={(e) => {
              e.target.src = "https://placehold.co/96x96?text=NFT";
            }}
          />
          <h3 className="text-2xl font-bold text-purple-200 mb-1">
            {badge.badge_name}
          </h3>
          <div className="text-sm text-pink-300 mb-2">Level: {badge.level}</div>
          <div className="flex flex-col gap-1 text-sm text-gray-300 w-full">
            <div>
              <b>Template ID:</b>{" "}
              <span className="text-white">{badge.template_id}</span>
            </div>
            <div>
              <b>Receiver:</b>{" "}
              <span className="text-white">{badge.receiver_github}</span>
            </div>
            <div>
              <b>Reviewer:</b>{" "}
              <span className="text-white">{badge.reviewer}</span>
            </div>
            <div>
              <b>PR Link:</b>{" "}
              <a
                href={badge.pr_link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 underline break-all hover:text-pink-400"
              >
                {badge.pr_link}
              </a>
            </div>
            <div>
              <b>Minted:</b>{" "}
              <span className="text-white">
                {badge.minted_at
                  ? new Date(badge.minted_at).toLocaleString(undefined, {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "Unknown"}
              </span>
            </div>
          </div>
          {/* If you want to show accepted/accept UI, uncomment below */}
          {/* <div className="mt-3">
            <b>Accepted:</b> {badge.accepted ? "✅" : "❌"}
            {!badge.accepted && (
              <BadgeAccepter
                issuer={badge.issuer}
                template={badge.template}
                badgeReceiver={badge.receiver}
              />
            )}
          </div> */}
        </div>
      ))}
    </div>
  );
}
