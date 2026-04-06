import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

export interface DiscoveryProfile {
  id: string;
  name: string;
  age: number;
  avatarUrl: string;
  bio?: string | undefined;
  distance?: number | undefined;
}

interface DiscoveryState {
  swipeQueue: DiscoveryProfile[];
  currentIndex: number;
  setSwipeQueue: (queue: DiscoveryProfile[]) => void;
  incrementIndex: () => void;
  resetQueue: () => void;
}

export const useDiscoveryStore = create<DiscoveryState>()(
  devtools(
    (set) => ({
      swipeQueue: [],
      currentIndex: 0,
      setSwipeQueue: (queue) => set({ swipeQueue: queue, currentIndex: 0 }),
      incrementIndex: () => set((s) => ({ currentIndex: s.currentIndex + 1 })),
      resetQueue: () => set({ swipeQueue: [], currentIndex: 0 }),
    }),
    { name: 'DiscoveryStore', enabled: __DEV__ },
  ),
);
