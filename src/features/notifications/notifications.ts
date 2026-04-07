import { Platform } from 'react-native';
import { mockDelay } from '@/shared/utils/mockDelay';

const USE_MOCK = process.env.EXPO_PUBLIC_USE_MOCK === 'true';

export async function registerPushToken(): Promise<string | null> {
  if (USE_MOCK) {
    await mockDelay(300);
    return 'mock-push-token-expo-xxxx';
  }

  // Import dinámico — evita que expo-notifications ejecute código al cargar el módulo
  const Notifications = await import('expo-notifications');

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
    });
  }

  const { status: existing } = await Notifications.getPermissionsAsync();
  let finalStatus = existing;

  if (existing !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    return null;
  }

  const token = await Notifications.getExpoPushTokenAsync();
  return token.data;
}
