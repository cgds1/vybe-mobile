import { useCallback, useEffect, useRef } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { router, useLocalSearchParams } from 'expo-router';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { getMessages, uploadChatImage } from '@/features/chat/api/chat.api';
import { ChatInput } from '@/features/chat/components/ChatInput';
import { MessageBubble } from '@/features/chat/components/MessageBubble';
import { TypingIndicator } from '@/features/chat/components/TypingIndicator';
import { getChatSocket } from '@/features/chat/socket/chatSocket';
import { useChatStore } from '@/features/chat/store/chatStore';
import type { Message } from '@/features/chat/store/chatStore';
import { useAuthStore } from '@/features/auth/store/authStore';
import { colors, fontFamilies, fontSizes, spacing } from '@/theme';

type Params = {
  chatId: string;
  name: string;
  avatar?: string;
};

export default function ChatScreen() {
  const { chatId, name } = useLocalSearchParams<Params>();
  const { bottom } = useSafeAreaInsets();

  const { accessToken, user } = useAuthStore();
  const { messages, setMessages, addMessage, confirmMessage, setTyping, typingUsers } =
    useChatStore();

  const chatMessages = messages[chatId] ?? [];
  const typingInChat = typingUsers[chatId] ?? [];
  const isOtherTyping = typingInChat.length > 0;

  const nextCursorRef = useRef<string | null>(null);
  const isLoadingMoreRef = useRef(false);
  const tempIdCounterRef = useRef(0);

  const loadInitial = useCallback(async () => {
    try {
      const res = await getMessages(chatId);
      nextCursorRef.current = res.nextCursor;
      const mapped: Message[] = res.data.map((m) => ({ ...m, status: 'sent' as const }));
      setMessages(chatId, mapped);
    } catch {
      // silencioso
    }
  }, [chatId, setMessages]);

  const loadMore = useCallback(async () => {
    if (!nextCursorRef.current || isLoadingMoreRef.current) return;
    isLoadingMoreRef.current = true;
    try {
      const res = await getMessages(chatId, nextCursorRef.current);
      nextCursorRef.current = res.nextCursor;
      const mapped: Message[] = res.data.map((m) => ({ ...m, status: 'sent' as const }));
      useChatStore.getState().prependMessages(chatId, mapped);
    } catch {
      // silencioso
    } finally {
      isLoadingMoreRef.current = false;
    }
  }, [chatId]);

  useEffect(() => {
    if (!accessToken) return;

    const socket = getChatSocket(accessToken);
    socket.emit('join_chat', { chatId });

    function onNewMessage(msg: Omit<Message, 'status'>) {
      if (msg.senderId === user?.id) return;
      addMessage({ ...msg, status: 'sent' });
    }

    function onUserTyping({ userId }: { chatId: string; userId: string }) {
      setTyping(chatId, userId, true);
    }

    function onUserStopTyping({ userId }: { chatId: string; userId: string }) {
      setTyping(chatId, userId, false);
    }

    socket.on('new_message', onNewMessage);
    socket.on('user_typing', onUserTyping);
    socket.on('user_stop_typing', onUserStopTyping);

    return () => {
      socket.emit('leave_chat', { chatId });
      socket.off('new_message', onNewMessage);
      socket.off('user_typing', onUserTyping);
      socket.off('user_stop_typing', onUserStopTyping);
    };
  }, [chatId, accessToken, user?.id, addMessage, setTyping]);

  useEffect(() => {
    loadInitial();
  }, [loadInitial]);

  function handleSend(text: string) {
    if (!accessToken || !user) return;

    const tempId = `temp_${Date.now()}_${tempIdCounterRef.current++}`;

    const optimistic: Message = {
      id: tempId,
      chatId,
      senderId: user.id,
      content: text,
      type: 'TEXT',
      status: 'sending',
      createdAt: new Date().toISOString(),
    };

    addMessage(optimistic);

    const socket = getChatSocket(accessToken);
    socket.emit('send_message', { chatId, content: text, type: 'TEXT' });

    function onConfirm(msg: Omit<Message, 'status'>) {
      if (msg.senderId !== user!.id) return;
      confirmMessage(chatId, tempId, { ...msg, status: 'sent' });
      socket.off('new_message', onConfirm);
    }

    socket.on('new_message', onConfirm);

    setTimeout(() => {
      socket.off('new_message', onConfirm);
      confirmMessage(chatId, tempId, { ...optimistic, status: 'sent' });
    }, 10000);
  }

  async function handleSendImage(uri: string) {
    if (!user) return;

    const tempId = `temp_img_${Date.now()}_${tempIdCounterRef.current++}`;

    const optimistic: Message = {
      id: tempId,
      chatId,
      senderId: user.id,
      content: uri,
      type: 'IMAGE',
      status: 'sending',
      createdAt: new Date().toISOString(),
    };

    addMessage(optimistic);

    const confirmed = await uploadChatImage(chatId, uri);
    confirmMessage(chatId, tempId, { ...confirmed, status: 'sent' });
  }

  function handleTypingStart() {
    if (!accessToken) return;
    getChatSocket(accessToken).emit('typing', { chatId });
  }

  function handleTypingStop() {
    if (!accessToken) return;
    getChatSocket(accessToken).emit('stop_typing', { chatId });
  }

  return (
    <KeyboardAvoidingView style={styles.screen} behavior="padding">
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={12} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={colors.text.primary} />
        </Pressable>
        <View style={styles.headerInfo}>
          <Text style={styles.headerName} numberOfLines={1}>
            {name}
          </Text>
        </View>
      </View>

      {/* Mensajes — FlashList v2 no tiene `inverted`, usamos scaleY(-1) */}
      <View style={styles.listContainer}>
        <FlashList
          data={chatMessages}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.invertedItem}>
              <MessageBubble message={item} isOwn={item.senderId === user?.id} />
            </View>
          )}
          onStartReached={loadMore}
          onStartReachedThreshold={0.3}
          ListFooterComponent={isOtherTyping ? (
            <View style={styles.invertedItem}>
              <TypingIndicator />
            </View>
          ) : null}
          contentContainerStyle={{ paddingVertical: spacing[2] }}
        />
      </View>

      {/* Input */}
      <View style={{ paddingBottom: bottom }}>
        <ChatInput
          onSend={handleSend}
          onSendImage={handleSendImage}
          onTypingStart={handleTypingStart}
          onTypingStop={handleTypingStop}
        />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.midnight,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing[4],
    paddingTop: spacing[12],
    paddingBottom: spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: colors.border.default,
    gap: spacing[3],
  },
  backBtn: {
    flexShrink: 0,
  },
  headerInfo: {
    flex: 1,
  },
  headerName: {
    fontFamily: fontFamilies.display.semiBold,
    fontSize: fontSizes.lg,
    color: colors.text.primary,
  },
  listContainer: {
    flex: 1,
    transform: [{ scaleY: -1 }],
  },
  invertedItem: {
    transform: [{ scaleY: -1 }],
  },
});
