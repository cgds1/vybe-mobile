import { apiClient } from '@/services/api/client';
import { useAuthStore } from '@/features/auth/store/authStore';
import type { Chat, Message, MessagesResponse, OpenChatResponse, RawChat } from './types';

export async function openChat(matchId: string): Promise<string> {
  const { data } = await apiClient.post<OpenChatResponse>(`/chat/matches/${matchId}/open`);
  return data.id;
}

export async function getChats(): Promise<Chat[]> {
  const { data } = await apiClient.get<RawChat[]>('/chat');
  return data.map((raw) => ({
    id: raw.id,
    matchId: raw.matchId,
    participantId: raw.otherParticipant?.userId ?? '',
    participantName: raw.otherParticipant?.profile.displayName ?? 'Usuario',
    participantAvatar: raw.otherParticipant?.profile.avatarUrl ?? undefined,
    lastMessage: raw.lastMessage?.content,
    lastMessageAt: raw.lastMessage?.createdAt,
    unreadCount: 0,
  }));
}

export async function getMessages(
  chatId: string,
  cursor?: string,
): Promise<MessagesResponse> {
  const params: Record<string, string | number> = { limit: 20 };
  if (cursor) params.cursor = cursor;
  const { data } = await apiClient.get<MessagesResponse>(`/chat/${chatId}/messages`, { params });
  return data;
}

// Usa fetch (no axios) para evitar el bug de boundary en multipart/form-data en RN
export async function uploadChatImage(
  chatId: string,
  uri: string,
): Promise<Omit<Message, 'status'>> {
  const token = useAuthStore.getState().accessToken;
  const baseUrl = process.env.EXPO_PUBLIC_API_URL ?? '';

  const formData = new FormData();
  formData.append('file', {
    uri,
    type: 'image/jpeg',
    name: 'chat-image.jpg',
  } as unknown as Blob);

  const res = await fetch(`${baseUrl}/files/chat/${chatId}/image`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token ?? ''}` },
    body: formData,
  });

  if (!res.ok) {
    throw new Error(`Upload failed: ${res.status}`);
  }

  return res.json() as Promise<Omit<Message, 'status'>>;
}

export async function sendMessageRest(
  chatId: string,
  content: string,
): Promise<Omit<Message, 'status'>> {
  const { data } = await apiClient.post<Omit<Message, 'status'>>(`/chat/${chatId}/messages`, {
    content,
    type: 'TEXT',
  });
  return data;
}
