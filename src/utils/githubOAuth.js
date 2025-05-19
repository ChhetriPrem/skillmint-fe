// utils/githubOAuth.js
const CLIENT_ID = "Ov23liifKtyIL6YtXpDr";
const REDIRECT_URI = `${import.meta.env.VITE_FRONTEND_URL}/oauth-callback`;
export function getGithubAuthUrl() {
  const scope = "read:user";
  return `https://github.com/login/oauth/authorize?client_id=${CLIENT_ID}&scope=${scope}&redirect_uri=${encodeURIComponent(
    REDIRECT_URI
  )}`;
}
