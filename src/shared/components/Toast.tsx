import { useEffect } from 'react';
import { StyleSheet, Text } from 'react-native';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, fontFamilies, fontSizes, radius, spacing } from '@/theme';

type ToastType = 'success' | 'error' | 'info';

interface Props {
  message: string;
  type: ToastType;
  onDismiss: () => void;
}

const BG: Record<ToastType, string> = {
  success: colors.success,
  error: colors.error,
  info: colors.surfaceRaised,
};

export function Toast({ message, type, onDismiss }: Props) {
  const { top } = useSafeAreaInsets();
  const translateY = useSharedValue(-100);
  const translateX = useSharedValue(0);
  const opacity = useSharedValue(0);

  function dismiss() {
    translateY.value = withTiming(-120, { duration: 200 });
    opacity.value = withTiming(0, { duration: 200 }, () => runOnJS(onDismiss)());
  }

  useEffect(() => {
    translateY.value = withSpring(0, { damping: 20, stiffness: 200 });
    opacity.value = withTiming(1, { duration: 200 });
    const timer = setTimeout(dismiss, 3000);
    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const pan = Gesture.Pan()
    .onUpdate((e) => {
      if (e.translationY < 0) {
        translateY.value = e.translationY;
        opacity.value = 1 + e.translationY / 80;
      }
      translateX.value = e.translationX;
    })
    .onEnd((e) => {
      const swipedUp = e.translationY < -40;
      const swipedSide = Math.abs(e.translationX) > 80;
      if (swipedUp || swipedSide) {
        translateY.value = withTiming(-120, { duration: 150 });
        translateX.value = withTiming(e.translationX > 0 ? 400 : -400, { duration: 150 });
        opacity.value = withTiming(0, { duration: 150 }, () => runOnJS(onDismiss)());
      } else {
        translateY.value = withSpring(0);
        translateX.value = withSpring(0);
        opacity.value = withSpring(1);
      }
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value },
      { translateX: translateX.value },
    ],
    opacity: opacity.value,
  }));

  return (
    <GestureDetector gesture={pan}>
      <Animated.View
        style={[
          styles.container,
          { backgroundColor: BG[type], top: top + spacing[3] },
          animatedStyle,
        ]}
      >
        <Text style={styles.text} numberOfLines={2}>
          {message}
        </Text>
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: spacing[4],
    right: spacing[4],
    borderRadius: radius.lg,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    zIndex: 9999,
    elevation: 20,
  },
  text: {
    fontFamily: fontFamilies.body.medium,
    fontSize: fontSizes.sm,
    color: colors.offWhite,
    textAlign: 'center',
  },
});
