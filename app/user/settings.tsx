import { useState } from 'react';
import { Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '@/features/auth/store/authStore';
import { useChatStore } from '@/features/chat/store/chatStore';
import { disconnectChatSocket } from '@/features/chat/socket/chatSocket';
import { Background } from '@/shared/components/Background';
import { colors, fontFamilies, fontSizes, radius, spacing } from '@/theme';

export default function SettingsScreen() {
  const { top } = useSafeAreaInsets();
  const logout = useAuthStore((s) => s.logout);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  function handleLogout() {
    disconnectChatSocket();
    useChatStore.setState({
      activeChats: [],
      messages: {},
      typingUsers: {},
      unreadCount: 0,
    });
    logout();
    router.replace('/(auth)/login');
  }

  return (
    <View style={[styles.screen, { paddingTop: top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Ionicons name="chevron-back" size={24} color={colors.text.primary} />
        </Pressable>
        <Text style={styles.headerTitle}>Configuración</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.content}>
        {/* Notificaciones */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Preferencias</Text>
          <View style={styles.row}>
            <View style={styles.rowInfo}>
              <Ionicons name="notifications-outline" size={20} color={colors.text.secondary} />
              <Text style={styles.rowLabel}>Notificaciones push</Text>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: colors.surface, true: colors.coral }}
              thumbColor={colors.offWhite}
            />
          </View>
        </View>

        {/* Cuenta */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Cuenta</Text>
          <Pressable style={styles.row} onPress={handleLogout}>
            <View style={styles.rowInfo}>
              <Ionicons name="log-out-outline" size={20} color={colors.error} />
              <Text style={[styles.rowLabel, { color: colors.error }]}>Cerrar sesión</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={colors.error} />
          </Pressable>
        </View>

        <Text style={styles.version}>Vybe v1.0.0</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing[5],
    paddingVertical: spacing[4],
  },
  headerTitle: {
    fontFamily: fontFamilies.display.semiBold,
    fontSize: fontSizes.lg,
    color: colors.text.primary,
  },
  content: {
    padding: spacing[5],
    gap: spacing[4],
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing[4],
    gap: spacing[3],
  },
  cardTitle: {
    fontFamily: fontFamilies.body.semiBold,
    fontSize: fontSizes.xs,
    color: colors.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing[2],
  },
  rowInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
  },
  rowLabel: {
    fontFamily: fontFamilies.body.medium,
    fontSize: fontSizes.md,
    color: colors.text.primary,
  },
  version: {
    fontFamily: fontFamilies.body.regular,
    fontSize: fontSizes.xs,
    color: colors.text.disabled,
    textAlign: 'center',
    marginTop: spacing[4],
  },
});
