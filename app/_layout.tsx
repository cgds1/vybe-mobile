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
import { DarkTheme, ThemeProvider } from '@react-navigation/native';
import { QueryClientProvider } from '@tanstack/react-query';
import { SplashScreen, Stack, router } from 'expo-router';
import { useEffect } from 'react';
import { ImageBackground, StyleSheet, View } from 'react-native';

import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Constants from 'expo-constants';
import { useAuthStore } from '@/features/auth/store/authStore';
import { queryClient } from '@/services/api/queryClient';
import { ErrorBoundary } from '@/shared/components/ErrorBoundary';
import { ToastProvider } from '@/shared/context/ToastContext';

const bgImage = require('../assets/bg.jpg');

const AppTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: 'transparent',
    card: 'transparent',
  },
};

SplashScreen.preventAutoHideAsync();

// Mostrar notificaciones FCM aunque la app esté en primer plano
// Solo en builds nativos — expo-notifications no soporta push en Expo Go desde SDK 53
if (Constants.appOwnership !== 'expo') {
  import('expo-notifications').then((Notifications) => {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
      }),
    });
  });
}

function RootNavigator() {
  const { isHydrated, accessToken, user } = useAuthStore();

  // Deep link desde push notifications
  useEffect(() => {
    let cleanup: (() => void) | undefined;

    async function setup() {
      // Solo en builds nativos (no Expo Go)
      if (Constants.appOwnership === 'expo') return;

      const Notifications = await import('expo-notifications');

      // Manejar tap en notificación cuando la app está en background/cerrada
      const bgSub = Notifications.addNotificationResponseReceivedListener(async (response) => {
        // Descartar la notificación del centro de notificaciones al abrirla
        await Notifications.dismissNotificationAsync(
          response.notification.request.identifier,
        );

        const data = response.notification.request.content.data as Record<string, unknown>;
        const type = data?.type as string | undefined;
        const chatId = data?.chatId as string | undefined;
        const userId = data?.userId as string | undefined;

        if (type === 'new_message' && chatId) {
          router.push({
            pathname: '/chat/[chatId]',
            params: { chatId, name: (data?.name as string) ?? 'Chat' },
          });
        } else if (type === 'chat' && chatId) {
          router.push({
            pathname: '/chat/[chatId]',
            params: { chatId, name: (data?.name as string) ?? 'Chat' },
          });
        } else if (type === 'match' && userId) {
          router.push('/(tabs)/chats');
        }
      });

      // Manejar notificación cuando la app está en foreground
      const fgSub = Notifications.addNotificationReceivedListener((notification) => {
        const data = notification.request.content.data as Record<string, unknown>;
        const type = data?.type as string | undefined;
        const chatId = data?.chatId as string | undefined;
        const name = (data?.name as string) ?? 'Chat';

        if (type === 'new_message' && chatId) {
          router.push({
            pathname: '/chat/[chatId]',
            params: { chatId, name },
          });
        }
      });

      cleanup = () => {
        bgSub.remove();
        fgSub.remove();
      };
    }

    setup();
    return () => cleanup?.();
  }, []);

  useEffect(() => {
    if (!isHydrated) return;
    if (accessToken) {
      if (user?.isVerified === false) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        router.replace({ pathname: '/(auth)/verify-email' as any, params: { email: user.email } });
      } else {
        router.replace('/(tabs)');
      }
    } else {
      router.replace('/(auth)/login');
    }
  }, [isHydrated, accessToken, user?.isVerified]);

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: 'transparent' },
        animation: 'fade',
      }}
    >
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="chat/[chatId]" />
      <Stack.Screen name="user/settings" />
      <Stack.Screen name="user/[userId]" />
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
        <GestureHandlerRootView style={styles.root}>
          <ImageBackground source={bgImage} style={styles.root} resizeMode="cover">
            <View style={styles.overlay}>
              <ThemeProvider value={AppTheme}>
                <SafeAreaProvider>
                  <KeyboardProvider>
                    <ToastProvider>
                      <RootNavigator />
                    </ToastProvider>
                  </KeyboardProvider>
                </SafeAreaProvider>
              </ThemeProvider>
            </View>
          </ImageBackground>
        </GestureHandlerRootView>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(14, 22, 40, 0.80)',
  },
});
