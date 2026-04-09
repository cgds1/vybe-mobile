import { useCallback, useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getChats } from '@/features/chat/api/chat.api';
import type { Chat } from '@/features/chat/api/types';
import { useChatStore } from '@/features/chat/store/chatStore';
import { colors, fontFamilies, fontSizes, radius, spacing } from '@/theme';

function formatTime(iso?: string): string {
  if (!iso) return '';
  const date = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffDays === 0) {
    return date.toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' });
  }
  if (diffDays === 1) return 'Ayer';
  if (diffDays < 7) {
    return date.toLocaleDateString('es', { weekday: 'short' });
  }
  return date.toLocaleDateString('es', { day: '2-digit', month: '2-digit' });
}

function ChatItem({ chat }: { chat: Chat }) {
  function handlePress() {
    router.push({
      pathname: '/chat/[chatId]',
      params: {
        chatId: chat.id,
        name: chat.participantName,
        avatar: chat.participantAvatar ?? '',
      },
    });
  }

  return (
    <Pressable style={styles.item} onPress={handlePress}>
      <View style={styles.avatar}>
        <Text style={styles.avatarInitial}>
          {chat.participantName.charAt(0).toUpperCase()}
        </Text>
      </View>
      <View style={styles.itemContent}>
        <View style={styles.itemRow}>
          <Text style={styles.name} numberOfLines={1}>
            {chat.participantName}
          </Text>
          <Text style={styles.time}>{formatTime(chat.lastMessageAt)}</Text>
        </View>
        <View style={styles.itemRow}>
          <Text style={styles.preview} numberOfLines={1}>
            {chat.lastMessage ?? 'Inicia la conversación'}
          </Text>
          {chat.unreadCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {chat.unreadCount > 99 ? '99+' : chat.unreadCount}
              </Text>
            </View>
          )}
        </View>
      </View>
    </Pressable>
  );
}

export default function ChatsScreen() {
  const { top } = useSafeAreaInsets();
  const { activeChats, setChats } = useChatStore();
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);

  const load = useCallback(async () => {
    setIsLoading(true);
    setHasError(false);
    try {
      const chats = await getChats();
      setChats(chats);
    } catch {
      setHasError(true);
    } finally {
      setIsLoading(false);
    }
  }, [setChats]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <View style={[styles.screen, { paddingTop: top }]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mensajes</Text>
      </View>

      {isLoading && activeChats.length === 0 ? (
        <View style={styles.center}>
          <View style={styles.skeleton} />
          <View style={[styles.skeleton, styles.skeletonShort]} />
          <View style={styles.skeleton} />
        </View>
      ) : hasError ? (
        <View style={styles.center}>
          <Text style={styles.stateTitle}>Error al cargar chats</Text>
          <Pressable style={styles.retryBtn} onPress={load}>
            <Text style={styles.retryText}>Reintentar</Text>
          </Pressable>
        </View>
      ) : activeChats.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyIcon}>💬</Text>
          <Text style={styles.stateTitle}>Sin conversaciones</Text>
          <Text style={styles.stateSubtitle}>
            Cuando hagas match con alguien, aquí aparecerá el chat.
          </Text>
        </View>
      ) : (
        <FlashList
          data={activeChats}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <ChatItem chat={item} />}
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.midnight,
  },
  header: {
    paddingHorizontal: spacing[5],
    paddingVertical: spacing[4],
  },
  headerTitle: {
    fontFamily: fontFamilies.display.bold,
    fontSize: fontSizes.xl,
    color: colors.text.primary,
  },
  listContent: {
    paddingBottom: spacing[4],
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing[5],
    paddingVertical: spacing[3],
    gap: spacing[3],
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceRaised,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  avatarInitial: {
    fontFamily: fontFamilies.display.semiBold,
    fontSize: fontSizes.lg,
    color: colors.coral,
  },
  itemContent: {
    flex: 1,
    gap: 4,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing[2],
  },
  name: {
    flex: 1,
    fontFamily: fontFamilies.body.semiBold,
    fontSize: fontSizes.md,
    color: colors.text.primary,
  },
  time: {
    fontFamily: fontFamilies.body.regular,
    fontSize: fontSizes.xs,
    color: colors.text.secondary,
    flexShrink: 0,
  },
  preview: {
    flex: 1,
    fontFamily: fontFamilies.body.regular,
    fontSize: fontSizes.sm,
    color: colors.text.secondary,
  },
  badge: {
    minWidth: 20,
    height: 20,
    borderRadius: radius.full,
    backgroundColor: colors.coral,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    flexShrink: 0,
  },
  badgeText: {
    fontFamily: fontFamilies.body.bold,
    fontSize: fontSizes.xs,
    color: colors.offWhite,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[3],
    paddingHorizontal: spacing[8],
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: spacing[2],
  },
  stateTitle: {
    fontFamily: fontFamilies.display.semiBold,
    fontSize: fontSizes.lg,
    color: colors.text.primary,
    textAlign: 'center',
  },
  stateSubtitle: {
    fontFamily: fontFamilies.body.regular,
    fontSize: fontSizes.sm,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  retryBtn: {
    marginTop: spacing[2],
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[6],
    backgroundColor: colors.coral,
    borderRadius: radius.full,
  },
  retryText: {
    fontFamily: fontFamilies.body.semiBold,
    fontSize: fontSizes.sm,
    color: colors.offWhite,
  },
  skeleton: {
    width: '100%',
    height: 72,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    opacity: 0.6,
  },
  skeletonShort: {
    width: '70%',
  },
});
