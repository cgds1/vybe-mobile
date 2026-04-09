import { apiClient } from '@/services/api/client';
import type { DiscoveryProfile, SwipeAction } from './types';

interface RawDiscoveryItem {
  user: { id: string };
  profile: {
    displayName: string;
    age: number;
    bio?: string;
    interests: string[];
    avatarUrl: string | null;
  };
}

export async function getDiscovery(): Promise<DiscoveryProfile[]> {
  const { data } = await apiClient.get<RawDiscoveryItem[]>('/discovery');
  return data.map(({ user, profile }) => ({
    id: user.id,
    displayName: profile.displayName,
    age: profile.age,
    bio: profile.bio,
    avatarUrl: profile.avatarUrl ?? undefined,
  }));
}

interface SwipeResponse {
  swipe: { id: string; userId: string; targetId: string; action: SwipeAction };
  match: { id: string; user1Id: string; user2Id: string } | null;
}

export async function swipe(
  targetId: string,
  action: SwipeAction,
): Promise<SwipeResponse> {
  const { data } = await apiClient.post<SwipeResponse>('/matches/swipe', { targetId, action });
  return data;
}
