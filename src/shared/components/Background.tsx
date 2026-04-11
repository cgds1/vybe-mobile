import { ImageBackground, StyleSheet, View } from 'react-native';

const bgImage = require('../../../assets/bg.jpg');

interface Props {
  children: React.ReactNode;
}

export function Background({ children }: Props) {
  return (
    <ImageBackground source={bgImage} style={styles.root} resizeMode="cover">
      <View style={styles.overlay}>{children}</View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(14, 22, 40, 0.80)',
  },
});
