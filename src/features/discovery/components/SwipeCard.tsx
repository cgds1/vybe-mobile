import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { forwardRef, useEffect, useImperativeHandle } from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  Extrapolation,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { colors, fontFamilies, fontSizes, radius, spacing } from '@/theme';
import type { SwipeAction } from '../api/types';
import type { DiscoveryProfile } from '../store/discoveryStore';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const CARD_WIDTH = SCREEN_WIDTH - spacing[8];
export const CARD_HEIGHT = CARD_WIDTH * 1.38;

const SWIPE_THRESHOLD = 120;
const VELOCITY_THRESHOLD = 800;
const FLY_DISTANCE = SCREEN_WIDTH + 200;

export interface SwipeCardRef {
  triggerSwipe: (action: SwipeAction) => void;
}

interface Props {
  profile: DiscoveryProfile;
  onSwipe: (action: SwipeAction) => void;
  isActive: boolean;
}

function triggerHaptic() {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
}

export const SwipeCard = forwardRef<SwipeCardRef, Props>(({ profile, onSwipe, isActive }, ref) => {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  // Mount animation: active card scales in from 0.94 → 1.0 to match the "behind" card position
  const mountScale = useSharedValue(isActive ? 0.94 : 1);

  useEffect(() => {
    if (isActive) {
      mountScale.value = withSpring(1, { damping: 20, stiffness: 280 });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useImperativeHandle(ref, () => ({
    triggerSwipe(action: SwipeAction) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      const dir = action === 'LIKE' ? 1 : -1;
      translateX.value = withTiming(dir * FLY_DISTANCE, { duration: 350 }, (ok) => {
        if (ok) runOnJS(onSwipe)(action);
      });
      translateY.value = withTiming(30, { duration: 350 });
    },
  }));

  const pan = Gesture.Pan()
    .enabled(isActive)
    .onUpdate((e) => {
      translateX.value = e.translationX;
      translateY.value = e.translationY * 0.25;
    })
    .onEnd((e) => {
      const shouldSwipe =
        Math.abs(e.translationX) > SWIPE_THRESHOLD ||
        Math.abs(e.velocityX) > VELOCITY_THRESHOLD;

      if (shouldSwipe) {
        const action: SwipeAction = e.translationX > 0 ? 'LIKE' : 'PASS';
        const dir = e.translationX > 0 ? 1 : -1;
        runOnJS(triggerHaptic)();
        translateX.value = withTiming(dir * FLY_DISTANCE, { duration: 300 }, (ok) => {
          if (ok) runOnJS(onSwipe)(action);
        });
        translateY.value = withTiming(e.translationY * 0.25 + 30, { duration: 300 });
      } else {
        translateX.value = withSpring(0, { damping: 15, stiffness: 200 });
        translateY.value = withSpring(0, { damping: 15, stiffness: 200 });
      }
    });

  const cardStyle = useAnimatedStyle(() => {
    const rotate = interpolate(
      translateX.value,
      [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
      [-12, 0, 12],
      Extrapolation.CLAMP,
    );
    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { rotateZ: `${rotate}deg` },
        { scale: mountScale.value },
      ],
    };
  });

  const likeOpacity = useAnimatedStyle(() => ({
    opacity: interpolate(translateX.value, [20, 110], [0, 1], Extrapolation.CLAMP),
  }));

  const passOpacity = useAnimatedStyle(() => ({
    opacity: interpolate(translateX.value, [-110, -20], [1, 0], Extrapolation.CLAMP),
  }));

  if (!isActive) {
    return (
      <View style={styles.card}>
        <CardContent profile={profile} />
      </View>
    );
  }

  return (
    <GestureDetector gesture={pan}>
      <Animated.View style={[styles.card, cardStyle]}>
        <CardContent profile={profile} />
        <Animated.View style={[styles.badge, styles.likeBadge, likeOpacity]}>
          <Text style={styles.likeLabel}>LIKE</Text>
        </Animated.View>
        <Animated.View style={[styles.badge, styles.passBadge, passOpacity]}>
          <Text style={styles.passLabel}>PASS</Text>
        </Animated.View>
      </Animated.View>
    </GestureDetector>
  );
});

SwipeCard.displayName = 'SwipeCard';

function CardContent({ profile }: { profile: DiscoveryProfile }) {
  const initials = profile.displayName
    ? profile.displayName
        .split(' ')
        .slice(0, 2)
        .map((w) => w[0])
        .join('')
        .toUpperCase()
    : '?';

  const nameLabel = profile.displayName
    ? `${profile.displayName}, ${profile.age}`
    : String(profile.age);

  return (
    <>
      {profile.avatarUrl ? (
        <Image
          source={{ uri: profile.avatarUrl }}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          transition={200}
          onError={() => console.warn('[SwipeCard] imagen falló:', profile.avatarUrl)}
        />
      ) : (
        <View style={[StyleSheet.absoluteFill, styles.avatarFallback]}>
          <Text style={styles.initialsText}>{initials}</Text>
        </View>
      )}
      <LinearGradient
        colors={['transparent', 'rgba(14,22,40,0.82)', 'rgba(14,22,40,0.97)']}
        locations={[0.3, 0.62, 1]}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.profileInfo}>
        <Text style={styles.nameText}>{nameLabel}</Text>
        {profile.bio ? (
          <Text style={styles.bioText} numberOfLines={3}>
            {profile.bio}
          </Text>
        ) : null}
        {profile.distance !== undefined ? (
          <Text style={styles.distanceText}>{profile.distance} km de distancia</Text>
        ) : null}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: radius.xl,
    overflow: 'hidden',
    backgroundColor: colors.surface,
  },
  avatarFallback: {
    backgroundColor: colors.surfaceRaised,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initialsText: {
    fontFamily: fontFamilies.display.bold,
    fontSize: 72,
    color: colors.text.disabled,
  },
  profileInfo: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing[5],
    gap: spacing[2],
  },
  nameText: {
    fontFamily: fontFamilies.display.bold,
    fontSize: fontSizes['2xl'],
    color: colors.text.primary,
  },
  bioText: {
    fontFamily: fontFamilies.body.regular,
    fontSize: fontSizes.sm,
    color: colors.text.secondary,
    lineHeight: fontSizes.sm * 1.55,
  },
  distanceText: {
    fontFamily: fontFamilies.body.medium,
    fontSize: fontSizes.xs,
    color: colors.text.disabled,
    marginTop: spacing[1],
  },
  badge: {
    position: 'absolute',
    top: spacing[8],
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[4],
    borderRadius: radius.sm,
    borderWidth: 3,
  },
  likeBadge: {
    left: spacing[5],
    borderColor: colors.success,
    transform: [{ rotate: '-20deg' }],
  },
  passBadge: {
    right: spacing[5],
    borderColor: colors.coral,
    transform: [{ rotate: '20deg' }],
  },
  likeLabel: {
    fontFamily: fontFamilies.display.bold,
    fontSize: fontSizes.xl,
    color: colors.success,
    letterSpacing: 2,
  },
  passLabel: {
    fontFamily: fontFamilies.display.bold,
    fontSize: fontSizes.xl,
    color: colors.coral,
    letterSpacing: 2,
  },
});
