import { create } from "zustand";

interface Wallet {
  id: string;
  currency: "USD" | "LBP";
  balance: number;
  updated_at: string;
}

interface WalletState {
  wallets: Wallet[];
  isLoading: boolean;
  setWallets: (wallets: Wallet[]) => void;
  setLoading: (loading: boolean) => void;
  getWalletByCurrency: (currency: "USD" | "LBP") => Wallet | undefined;
}

export const useWalletStore = create<WalletState>((set, get) => ({
  wallets: [],
  isLoading: false,
  setWallets: (wallets) => set({ wallets }),
  setLoading: (isLoading) => set({ isLoading }),
  getWalletByCurrency: (currency) =>
    get().wallets.find((w) => w.currency === currency),
}));
