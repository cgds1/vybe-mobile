import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAuthStore } from '@/features/auth/store/authStore';
import { colors, fontFamilies, fontSizes, spacing } from '@/theme';

export default function HomeTab() {
  const logout = useAuthStore((s) => s.logout);

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Discovery — Fase 3</Text>
      <TouchableOpacity onPress={logout} style={styles.logoutBtn}>
        <Text style={styles.logoutText}>Cerrar sesión (temp)</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.midnight,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[6],
  },
  text: {
    fontFamily: fontFamilies.body.regular,
    fontSize: fontSizes.md,
    color: colors.text.secondary,
  },
  logoutBtn: {
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[4],
  },
  logoutText: {
    fontFamily: fontFamilies.body.medium,
    fontSize: fontSizes.sm,
    color: colors.coral,
  },
});
