// store/zIndexStore.ts
import { create } from "zustand";
interface ZIndexState {
  maxZ: number;
  bringToFront: () => number;
}
export const useZIndexStore = create<ZIndexState>((set, get) => ({
  maxZ: 100,
  bringToFront: () => {
    const newZ = get().maxZ + 1;
    set({ maxZ: newZ });
    return newZ;
  },
}));