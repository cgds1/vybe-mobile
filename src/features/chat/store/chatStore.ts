import { create } from 'zustand';

export interface Chat {
  id: string;
  participantId: string;
  participantName: string;
  participantAvatar?: string | undefined;
  lastMessage?: string | undefined;
  lastMessageAt?: string | undefined;
  unreadCount: number;
}

interface ChatState {
  activeChats: Chat[];
  typingUsers: Record<string, boolean>;
  unreadCount: number;
  setChats: (chats: Chat[]) => void;
  setTyping: (userId: string, isTyping: boolean) => void;
  markRead: (chatId: string) => void;
  incrementUnread: () => void;
}

export const useChatStore = create<ChatState>()((set) => ({
  activeChats: [],
  typingUsers: {},
  unreadCount: 0,

  setChats: (chats) => {
    const unread = chats.reduce((sum, c) => sum + c.unreadCount, 0);
    set({ activeChats: chats, unreadCount: unread });
  },

  setTyping: (userId, isTyping) =>
    set((s) => ({
      typingUsers: { ...s.typingUsers, [userId]: isTyping },
    })),

  markRead: (chatId) =>
    set((s) => ({
      activeChats: s.activeChats.map((c) =>
        c.id === chatId ? { ...c, unreadCount: 0 } : c,
      ),
      unreadCount: Math.max(
        0,
        s.unreadCount -
          (s.activeChats.find((c) => c.id === chatId)?.unreadCount ?? 0),
      ),
    })),

  incrementUnread: () =>
    set((s) => ({ unreadCount: s.unreadCount + 1 })),
}));
