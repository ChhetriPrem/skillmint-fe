// src/store/userStore.js
import { create } from 'zustand';

export const useUserStore = create((set) => ({
  github: null, // { username, avatar_url, accessToken }
  wallet: null, // { publicKey, signature }
  setGithub: (github) => set({ github }),
  setWallet: (wallet) => set({ wallet }),
  reset: () => set({ github: null, wallet: null }),
}));
