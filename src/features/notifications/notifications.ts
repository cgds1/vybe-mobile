import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { apiClient } from '@/services/api/client';

export async function registerPushToken(): Promise<string | null> {
  // Expo Go no soporta push tokens nativos — solo funciona en builds nativos
  if (Constants.appOwnership === 'expo') return null;

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

  if (finalStatus !== 'granted') return null;

  // El backend usa Firebase Admin SDK — necesita el token FCM nativo, no el Expo push token
  const { data: token } = await Notifications.getDevicePushTokenAsync();
  if (!token) return null;

  // Registrar el token en el backend
  try {
    await apiClient.post('/notifications/token', { token });
  } catch {
    // No crítico — la app funciona igual sin notificaciones
  }

  return token;
}

export async function unregisterPushToken(): Promise<void> {
  if (Constants.appOwnership === 'expo') return;
  try {
    await apiClient.delete('/notifications/token');
  } catch {
    // no crítico
  }
}
