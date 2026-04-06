import { StyleSheet, Text, View } from 'react-native';
import { colors, fontFamilies, fontSizes, spacing } from '@/theme';

export default function LoginScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Vybe</Text>
      <Text style={styles.subtitle}>Login — coming in Fase 2</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.midnight,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing[6],
  },
  title: {
    fontFamily: fontFamilies.display.bold,
    fontSize: fontSizes['4xl'],
    color: colors.coral,
    marginBottom: spacing[2],
  },
  subtitle: {
    fontFamily: fontFamilies.body.regular,
    fontSize: fontSizes.md,
    color: colors.text.secondary,
  },
});
