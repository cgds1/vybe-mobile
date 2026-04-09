// Shape del backend — /chat
export interface RawChat {
  id: string;
  matchId: string;
  updatedAt: string;
  lastMessage: {
    content: string;
    type: 'TEXT' | 'IMAGE';
    createdAt: string;
    senderId: string;
  } | null;
  otherParticipant: {
    userId: string;
    profile: {
      displayName: string;
      avatarUrl: string | null;
    };
  } | null;
}

// Shape normalizado para el store/UI
export interface Chat {
  id: string;
  matchId: string;
  participantId: string;
  participantName: string;
  participantAvatar?: string | undefined;
  lastMessage?: string | undefined;
  lastMessageAt?: string | undefined;
  unreadCount: number;
}

export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  content: string;
  type: 'TEXT' | 'IMAGE';
  status: 'sending' | 'sent';
  createdAt: string;
}

export interface MessagesResponse {
  data: Omit<Message, 'status'>[];
  nextCursor: string | null;
}

export interface OpenChatResponse {
  id: string;
  matchId: string;
  createdAt: string;
  participants: { userId: string }[];
}
