import { apiClient } from '@/services/api/client';
import type { CreateProfileInput } from './types';

export async function createProfileApi(
  input: CreateProfileInput,
  accessToken: string,
): Promise<void> {
  await apiClient.post('/users/profile', input, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
}
