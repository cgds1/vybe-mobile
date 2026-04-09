import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts as useInterFonts,
} from '@expo-google-fonts/inter';
import {
  SpaceGrotesk_400Regular,
  SpaceGrotesk_500Medium,
  SpaceGrotesk_600SemiBold,
  SpaceGrotesk_700Bold,
  useFonts as useSpaceGroteskFonts,
} from '@expo-google-fonts/space-grotesk';
import { QueryClientProvider } from '@tanstack/react-query';
import { SplashScreen, Stack, router } from 'expo-router';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useAuthStore } from '@/features/auth/store/authStore';
import { queryClient } from '@/services/api/queryClient';
import { ErrorBoundary } from '@/shared/components/ErrorBoundary';
import { ToastProvider } from '@/shared/context/ToastContext';
import { colors } from '@/theme';

SplashScreen.preventAutoHideAsync();

function RootNavigator() {
  const { isHydrated, accessToken } = useAuthStore();

  // Deep link desde push notifications
  useEffect(() => {
    let cleanup: (() => void) | undefined;

    async function setup() {
      // Solo en builds nativos (no Expo Go)
      const Constants = await import('expo-constants');
      if (Constants.default.appOwnership === 'expo') return;

      const Notifications = await import('expo-notifications');

      // Manejar tap en notificación cuando la app está en background/cerrada
      const sub = Notifications.addNotificationResponseReceivedListener((response) => {
        const data = response.notification.request.content.data as Record<string, unknown>;
        const type = data?.type as string | undefined;
        const chatId = data?.chatId as string | undefined;
        const userId = data?.userId as string | undefined;

        if (type === 'chat' && chatId) {
          router.push({
            pathname: '/chat/[chatId]',
            params: { chatId, name: (data?.name as string) ?? 'Chat' },
          });
        } else if (type === 'match' && userId) {
          // Navega a chats cuando hay un nuevo match
          router.push('/(tabs)/chats');
        }
      });

      cleanup = () => sub.remove();
    }

    setup();
    return () => cleanup?.();
  }, []);

  useEffect(() => {
    if (!isHydrated) return;
    if (accessToken) {
      router.replace('/(tabs)');
    } else {
      router.replace('/(auth)/login');
    }
  }, [isHydrated, accessToken]);

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.midnight },
        animation: 'fade',
      }}
    >
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="chat" />
      <Stack.Screen name="user" />
    </Stack>
  );
}

export default function RootLayout() {
  const [sgLoaded] = useSpaceGroteskFonts({
    SpaceGrotesk_400Regular,
    SpaceGrotesk_500Medium,
    SpaceGrotesk_600SemiBold,
    SpaceGrotesk_700Bold,
  });

  const [interLoaded] = useInterFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  const isHydrated = useAuthStore((s) => s.isHydrated);
  const fontsLoaded = sgLoaded && interLoaded;
  const ready = fontsLoaded && isHydrated;

  useEffect(() => {
    if (ready) {
      SplashScreen.hideAsync();
    }
  }, [ready]);

  if (!ready) return null;

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <GestureHandlerRootView style={{ flex: 1, backgroundColor: colors.midnight }}>
          <SafeAreaProvider>
            <KeyboardProvider>
              <ToastProvider>
                <RootNavigator />
              </ToastProvider>
            </KeyboardProvider>
          </SafeAreaProvider>
        </GestureHandlerRootView>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
