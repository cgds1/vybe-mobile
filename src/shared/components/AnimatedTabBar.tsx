import { useEffect } from 'react';
import { Dimensions, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { colors, fontFamilies, fontSizes, radius, shadows, spacing } from '@/theme';

type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

const SPRING_CONFIG = { damping: 18, stiffness: 180 };
const TAB_BAR_HEIGHT = 64;
const PILL_INSET = 6;

type Props = BottomTabBarProps;

const ROUTE_ICONS: Record<string, { active: IoniconsName; inactive: IoniconsName }> = {
  index: { active: 'compass', inactive: 'compass-outline' },
  chats: { active: 'chatbubbles', inactive: 'chatbubbles-outline' },
  profile: { active: 'person', inactive: 'person-outline' },
};

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export function AnimatedTabBar({ state, navigation, descriptors }: Props) {
  const { bottom } = useSafeAreaInsets();
  const tabCount = state.routes.length;
  const tabBarWidth = SCREEN_WIDTH - spacing[8];
  const tabWidth = tabBarWidth / tabCount;
  const pillWidth = tabWidth - PILL_INSET * 2;

  const translateX = useSharedValue(state.index * tabWidth + PILL_INSET);

  useEffect(() => {
    translateX.value = withSpring(
      state.index * tabWidth + PILL_INSET,
      SPRING_CONFIG,
    );
  }, [state.index, tabWidth, translateX]);

  const pillStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <View style={[styles.wrapper, { paddingBottom: bottom > 0 ? bottom : spacing[3] }]}>
      <View style={[styles.bar, { width: tabBarWidth }]}>
        {/* Animated pill background */}
        <Animated.View style={[styles.pill, { width: pillWidth }, pillStyle]} />

        {/* Tabs */}
        {state.routes.map((route, index) => {
          const descriptor = descriptors[route.key];
          const isFocused = state.index === index;
          const rawLabel = descriptor?.options.tabBarLabel ?? route.name;
          const label = typeof rawLabel === 'string' ? rawLabel : route.name;
          const badge = descriptor?.options.tabBarBadge;
          const icons = ROUTE_ICONS[route.name] ?? { active: 'ellipse', inactive: 'ellipse-outline' };
          const iconName = isFocused ? icons.active : icons.inactive;
          const iconColor = isFocused ? colors.offWhite : colors.text.secondary;

          function onPress() {
            navigation.emit({
              type: 'tabPress',
              target: route.key,
            } as Parameters<typeof navigation.emit>[0]);
            if (!isFocused) {
              navigation.navigate(route.name, undefined);
            }
          }

          return (
            <Pressable
              key={route.key}
              style={[styles.tab, { width: tabWidth }]}
              onPress={onPress}
              accessibilityRole="button"
              accessibilityState={{ selected: isFocused }}
            >
              <View style={styles.tabContent}>
                <Ionicons name={iconName} size={20} color={iconColor} />
                <Text style={[styles.label, { color: iconColor }]} numberOfLines={1}>
                  {label}
                </Text>
                {badge != null && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{badge}</Text>
                  </View>
                )}
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    backgroundColor: 'transparent',
    paddingTop: spacing[2],
  },
  bar: {
    height: TAB_BAR_HEIGHT,
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
    ...shadows.lg,
  },
  pill: {
    position: 'absolute',
    height: TAB_BAR_HEIGHT - PILL_INSET * 2,
    borderRadius: radius.lg,
    backgroundColor: colors.coral,
    top: PILL_INSET,
  },
  tab: {
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabContent: {
    alignItems: 'center',
    gap: 2,
  },
  label: {
    fontFamily: fontFamilies.body.medium,
    fontSize: fontSizes.xs,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -12,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.error,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  badgeText: {
    fontFamily: fontFamilies.body.bold,
    fontSize: 9,
    color: colors.offWhite,
  },
});
