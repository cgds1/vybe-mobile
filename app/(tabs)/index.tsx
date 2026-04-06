import { StyleSheet, Text, View } from 'react-native';
import { colors, fontFamilies, fontSizes } from '@/theme';

export default function HomeTab() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Discovery — Fase 3</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.midnight, alignItems: 'center', justifyContent: 'center' },
  text: { fontFamily: fontFamilies.body.regular, fontSize: fontSizes.md, color: colors.text.secondary },
});
