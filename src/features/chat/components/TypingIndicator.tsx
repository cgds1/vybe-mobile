import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  withDelay,
} from 'react-native-reanimated';
import { colors, spacing } from '@/theme';

const DOT_SIZE = 7;
const ANIMATION_DURATION = 400;
const STAGGER = 160;

function Dot({ delay }: { delay: number }) {
  const translateY = useSharedValue(0);

  useEffect(() => {
    translateY.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(-6, { duration: ANIMATION_DURATION }),
          withTiming(0, { duration: ANIMATION_DURATION }),
        ),
        -1,
        false,
      ),
    );
  }, [translateY, delay]);

  const style = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  return <Animated.View style={[styles.dot, style]} />;
}

export function TypingIndicator() {
  return (
    <View style={styles.container}>
      <Dot delay={0} />
      <Dot delay={STAGGER} />
      <Dot delay={STAGGER * 2} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderBottomLeftRadius: 4,
    alignSelf: 'flex-start',
    marginLeft: spacing[4],
    marginVertical: spacing[1],
  },
  dot: {
    width: DOT_SIZE,
    height: DOT_SIZE,
    borderRadius: DOT_SIZE / 2,
    backgroundColor: colors.text.secondary,
  },
});
