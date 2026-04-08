export interface DiscoveryProfile {
  id: string;
  displayName: string;
  avatarUrl?: string | undefined;
  age: number;
  bio?: string | undefined;
  distance?: number | undefined;
}

export type SwipeAction = 'LIKE' | 'PASS';

export interface SwipeInput {
  targetId: string;
  action: SwipeAction;
}
