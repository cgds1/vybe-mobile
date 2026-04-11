import { apiClient } from '@/services/api/client';
import type { CreateProfileInput, UpdateProfileInput, MyProfile, PublicProfile } from './types';

export async function createProfileApi(
  input: CreateProfileInput,
  accessToken: string,
): Promise<void> {
  await apiClient.post('/users/profile', input, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
}

export async function getMyProfileApi(): Promise<MyProfile> {
  const { data } = await apiClient.get<MyProfile>('/users/me');
  return data;
}

export async function updateProfileApi(input: UpdateProfileInput): Promise<void> {
  await apiClient.patch('/users/profile', input);
}

export async function getUserProfileApi(userId: string): Promise<PublicProfile> {
  const { data } = await apiClient.get<PublicProfile>(`/users/${userId}`);
  return data;
}

export async function uploadAvatarApi(uri: string, accessToken: string): Promise<void> {
  const formData = new FormData();
  formData.append('file', {
    uri,
    name: 'avatar.jpg',
    type: 'image/jpeg',
  } as unknown as Blob);

  const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/files/avatar`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}` },
    body: formData,
  });

  if (!res.ok) {
    throw new Error(`Avatar upload failed: ${res.status}`);
  }
}
