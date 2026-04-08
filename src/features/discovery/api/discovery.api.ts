import { apiClient } from '@/services/api/client';
import type { DiscoveryProfile, SwipeAction } from './types';

export async function getDiscovery(): Promise<DiscoveryProfile[]> {
  const { data } = await apiClient.get<DiscoveryProfile[]>('/discovery');
  return data;
}

export async function swipe(
  targetId: string,
  action: SwipeAction,
): Promise<void> {
  await apiClient.post('/matches/swipe', { targetId, action });
}
