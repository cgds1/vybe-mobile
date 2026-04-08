import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

export interface DiscoveryProfile {
  id: string;
  displayName: string;
  age: number;
  avatarUrl?: string | undefined;
  bio?: string | undefined;
  distance?: number | undefined;
}

interface DiscoveryState {
  swipeQueue: DiscoveryProfile[];
  currentIndex: number;
  setSwipeQueue: (queue: DiscoveryProfile[]) => void;
  appendToQueue: (profiles: DiscoveryProfile[]) => void;
  incrementIndex: () => void;
  resetQueue: () => void;
}

export const useDiscoveryStore = create<DiscoveryState>()(
  devtools(
    (set) => ({
      swipeQueue: [],
      currentIndex: 0,
      setSwipeQueue: (queue) => set({ swipeQueue: queue, currentIndex: 0 }),
      appendToQueue: (profiles) =>
        set((s) => {
          const seen = new Set(s.swipeQueue.map((p) => p.id));
          const fresh = profiles.filter((p) => !seen.has(p.id));
          return fresh.length > 0 ? { swipeQueue: [...s.swipeQueue, ...fresh] } : {};
        }),
      incrementIndex: () => set((s) => ({ currentIndex: s.currentIndex + 1 })),
      resetQueue: () => set({ swipeQueue: [], currentIndex: 0 }),
    }),
    { name: 'DiscoveryStore', enabled: __DEV__ },
  ),
);
