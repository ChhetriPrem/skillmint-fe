// src/components/GithubLoginButton.jsx
const CLIENT_ID = "Ov23liifKtyIL6YtXpDr";
const REDIRECT_URI = "https://localhost:5173/oauth-callback"; // Change for prod

export default function GithubLoginButton() {
  const handleLogin = () => {
    const githubAuthUrl =
      `https://github.com/login/oauth/authorize?client_id=${CLIENT_ID}&scope=read:user&redirect_uri=${encodeURIComponent(REDIRECT_URI)}`;
    window.location.href = githubAuthUrl;
  };

  return (
    <button
      className="px-4 py-2 bg-black text-white rounded"
      onClick={handleLogin}
    >
      Login with GitHub
    </button>
  );
}
