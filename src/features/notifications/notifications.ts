import Constants from 'expo-constants';
import { Platform } from 'react-native';

export async function registerPushToken(): Promise<string | null> {
  // Expo Go (SDK 53+) no soporta push tokens remotos — solo funciona en dev/prod builds
  if (Constants.appOwnership === 'expo') return null;

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
