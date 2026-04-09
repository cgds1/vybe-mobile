import { create } from 'zustand';
import type { Chat, Message } from '../api/types';

export type { Chat, Message };

interface ChatState {
  activeChats: Chat[];
  messages: Record<string, Message[]>; // chatId → Message[]
  typingUsers: Record<string, string[]>; // chatId → userId[]
  unreadCount: number;

  setChats: (chats: Chat[]) => void;

  setMessages: (chatId: string, messages: Message[]) => void;
  prependMessages: (chatId: string, messages: Message[]) => void;

  // Optimistic: agrega inmediato con status='sending'
  addMessage: (message: Message) => void;
  // Confirma: reemplaza el mensaje temporal por el real del servidor
  confirmMessage: (chatId: string, tempId: string, confirmed: Message) => void;

  setTyping: (chatId: string, userId: string, isTyping: boolean) => void;
  markRead: (chatId: string) => void;
  incrementUnread: () => void;
}

export const useChatStore = create<ChatState>()((set) => ({
  activeChats: [],
  messages: {},
  typingUsers: {},
  unreadCount: 0,

  setChats: (chats) => {
    const unread = chats.reduce((sum, c) => sum + c.unreadCount, 0);
    set({ activeChats: chats, unreadCount: unread });
  },

  setMessages: (chatId, msgs) =>
    set((s) => ({
      messages: { ...s.messages, [chatId]: msgs },
    })),

  prependMessages: (chatId, msgs) =>
    set((s) => ({
      messages: {
        ...s.messages,
        [chatId]: [...(s.messages[chatId] ?? []), ...msgs],
      },
    })),

  addMessage: (message) =>
    set((s) => ({
      messages: {
        ...s.messages,
        [message.chatId]: [message, ...(s.messages[message.chatId] ?? [])],
      },
    })),

  confirmMessage: (chatId, tempId, confirmed) =>
    set((s) => ({
      messages: {
        ...s.messages,
        [chatId]: (s.messages[chatId] ?? []).map((m) =>
          m.id === tempId ? confirmed : m,
        ),
      },
    })),

  setTyping: (chatId, userId, isTyping) =>
    set((s) => {
      const current = s.typingUsers[chatId] ?? [];
      const updated = isTyping
        ? current.includes(userId) ? current : [...current, userId]
        : current.filter((id) => id !== userId);
      return { typingUsers: { ...s.typingUsers, [chatId]: updated } };
    }),

  markRead: (chatId) =>
    set((s) => {
      const lost = s.activeChats.find((c) => c.id === chatId)?.unreadCount ?? 0;
      return {
        activeChats: s.activeChats.map((c) =>
          c.id === chatId ? { ...c, unreadCount: 0 } : c,
        ),
        unreadCount: Math.max(0, s.unreadCount - lost),
      };
    }),

  incrementUnread: () =>
    set((s) => ({ unreadCount: s.unreadCount + 1 })),
}));
