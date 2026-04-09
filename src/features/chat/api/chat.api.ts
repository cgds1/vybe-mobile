import { apiClient } from '@/services/api/client';
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
