import { useCallback, useEffect, useRef, useState } from 'react';
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getDiscovery, swipe } from '@/features/discovery/api/discovery.api';
import { SwipeCard, SwipeCardRef, CARD_WIDTH, CARD_HEIGHT } from '@/features/discovery/components/SwipeCard';
import { useDiscoveryStore } from '@/features/discovery/store/discoveryStore';
import { openChat } from '@/features/chat/api/chat.api';
import { useToast } from '@/shared/context/ToastContext';
import type { SwipeAction } from '@/features/discovery/api/types';
import { colors, fontFamilies, fontSizes, radius, shadows, spacing } from '@/theme';

export default function DiscoveryScreen() {
  const { top, bottom } = useSafeAreaInsets();
  const { showToast } = useToast();
  const { swipeQueue, currentIndex, setSwipeQueue, appendToQueue, incrementIndex } = useDiscoveryStore();
  const cardRef = useRef<SwipeCardRef>(null);
  const isLoadingRef = useRef(false);
  const isInitialLoadRef = useRef(true);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);

  const currentProfile = swipeQueue[currentIndex];
  const nextProfile = swipeQueue[currentIndex + 1];
  const isEmpty = !isLoading && !hasError && !currentProfile;

  const loadProfiles = useCallback(async () => {
    if (isLoadingRef.current) return;
    isLoadingRef.current = true;
    setIsLoading(true);
    setHasError(false);
    try {
      const profiles = await getDiscovery();
      if (isInitialLoadRef.current) {
        isInitialLoadRef.current = false;
        setSwipeQueue(profiles);
      } else {
        appendToQueue(profiles);
      }
    } catch {
      setHasError(true);
    } finally {
      isLoadingRef.current = false;
      setIsLoading(false);
    }
  }, [setSwipeQueue, appendToQueue]);

  useEffect(() => {
    loadProfiles();
  }, [loadProfiles]);

  const handleSwipe = useCallback(
    async (action: SwipeAction) => {
      if (!currentProfile) return;
      const targetId = currentProfile.id;
      const profileName = currentProfile.displayName;
      incrementIndex();
      if (currentIndex >= swipeQueue.length - 2) {
        loadProfiles();
      }
      try {
        const result = await swipe(targetId, action);
        if (result.match) {
          try {
            const chatId = await openChat(result.match.id);
            showToast(`¡Match con ${profileName}! 🎉`, 'success');
            router.push({ pathname: '/chat/[chatId]', params: { chatId, name: profileName } });
          } catch {
            showToast(`¡Match con ${profileName}! Ve a Mensajes. 🎉`, 'success');
            router.push('/(tabs)/chats');
          }
        }
      } catch {
        // silencioso — el swipe ya avanzó visualmente
      }
    },
    [currentProfile, currentIndex, swipeQueue.length, incrementIndex, loadProfiles, showToast],
  );

  const handlePressPass = useCallback(() => {
    cardRef.current?.triggerSwipe('PASS');
  }, []);

  const handlePressLike = useCallback(() => {
    cardRef.current?.triggerSwipe('LIKE');
  }, []);

  const header = (
    <View style={styles.header}>
      <Text style={styles.headerTitle}>Vybe</Text>
    </View>
  );

  // Loading skeleton
  if (isLoading && !currentProfile) {
    return (
      <View style={[styles.screen, { paddingTop: top, paddingBottom: bottom }]}>
        {header}
        <View style={styles.cardStack}>
          <View style={styles.skeleton} />
        </View>
        <View style={styles.actionsRow}>
          <View style={[styles.actionBtn, styles.skeletonBtn]} />
          <View style={[styles.actionBtn, styles.skeletonBtn]} />
        </View>
      </View>
    );
  }

  // Error state
  if (hasError) {
    return (
      <View style={[styles.screen, { paddingTop: top, paddingBottom: bottom }]}>
        {header}
        <View style={styles.stateContainer}>
          <View style={styles.stateRing}>
            <View style={styles.stateRingInner}>
              <Text style={styles.stateIcon}>!</Text>
            </View>
          </View>
          <Text style={styles.stateTitle}>Sin conexión</Text>
          <Text style={styles.stateSubtitle}>
            No pudimos cargar perfiles.{'\n'}Revisa tu conexión e inténtalo de nuevo.
          </Text>
          <Pressable style={styles.actionCallout} onPress={loadProfiles}>
            <Text style={styles.actionCalloutText}>Reintentar</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  // Empty state
  if (isEmpty) {
    return (
      <View style={[styles.screen, { paddingTop: top, paddingBottom: bottom }]}>
        {header}
        <ScrollView
          contentContainerStyle={styles.stateContainer}
          refreshControl={
            <RefreshControl refreshing={isLoading} onRefresh={loadProfiles} tintColor={colors.coral} />
          }
        >
          <View style={styles.stateRing}>
            <View style={styles.stateRingInner}>
              <Text style={styles.stateIcon}>✦</Text>
            </View>
          </View>
          <Text style={styles.stateTitle}>Ya los viste a todos</Text>
          <Text style={styles.stateSubtitle}>
            Estás al día con los perfiles de tu zona.{'\n'}Deslizá hacia abajo para actualizar.
          </Text>
          <Pressable style={styles.actionCallout} onPress={loadProfiles}>
            <Text style={styles.actionCalloutText}>Actualizar</Text>
          </Pressable>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={[styles.screen, { paddingTop: top, paddingBottom: bottom }]}>
      {header}
      <View style={styles.cardStack}>
        {/* Next card — behind, slightly scaled down */}
        {nextProfile ? (
          <View style={styles.nextCardWrapper}>
            <SwipeCard profile={nextProfile} onSwipe={() => {}} isActive={false} />
          </View>
        ) : null}

        {/* Active card */}
        {currentProfile ? (
          <SwipeCard
            key={currentIndex}
            ref={cardRef}
            profile={currentProfile}
            onSwipe={handleSwipe}
            isActive
          />
        ) : null}
      </View>

      <View style={styles.actionsRow}>
        <Pressable
          style={[styles.actionBtn, styles.passBtn]}
          onPress={handlePressPass}
          hitSlop={12}
        >
          <Text style={styles.passIcon}>✕</Text>
        </Pressable>
        <Pressable
          style={[styles.actionBtn, styles.likeBtn]}
          onPress={handlePressLike}
          hitSlop={12}
        >
          <Text style={styles.likeIcon}>♥</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.midnight,
    alignItems: 'center',
  },
  stateContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[4],
    paddingHorizontal: spacing[8],
    paddingBottom: spacing[16],
  },
  stateRing: {
    width: 128,
    height: 128,
    borderRadius: 64,
    borderWidth: 1,
    borderColor: colors.border.strong,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing[3],
  },
  stateRingInner: {
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 1,
    borderColor: colors.border.default,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stateIcon: {
    fontSize: 34,
    color: colors.coral,
  },
  cardStack: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextCardWrapper: {
    position: 'absolute',
    transform: [{ scale: 0.94 }, { translateY: 14 }],
    opacity: 0.8,
  },
  skeleton: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 24,
    backgroundColor: colors.surface,
    opacity: 0.6,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: spacing[10],
    paddingTop: spacing[4],
    paddingBottom: spacing[6],
  },
  actionBtn: {
    width: 64,
    height: 64,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.md,
  },
  passBtn: {
    backgroundColor: colors.midnight,
    borderWidth: 2,
    borderColor: colors.coral,
  },
  likeBtn: {
    backgroundColor: colors.midnight,
    borderWidth: 2,
    borderColor: colors.success,
  },
  skeletonBtn: {
    backgroundColor: colors.surface,
    opacity: 0.5,
  },
  passIcon: {
    fontSize: 22,
    color: colors.coral,
    fontWeight: '700',
  },
  likeIcon: {
    fontSize: 26,
    color: colors.success,
  },
  stateTitle: {
    fontFamily: fontFamilies.display.semiBold,
    fontSize: fontSizes.xl,
    color: colors.text.primary,
    textAlign: 'center',
  },
  stateSubtitle: {
    fontFamily: fontFamilies.body.regular,
    fontSize: fontSizes.md,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  actionCallout: {
    marginTop: spacing[4],
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[8],
    backgroundColor: colors.coral,
    borderRadius: radius.full,
  },
  actionCalloutText: {
    fontFamily: fontFamilies.body.semiBold,
    fontSize: fontSizes.md,
    color: colors.offWhite,
  },
  header: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing[5],
    paddingVertical: spacing[3],
  },
  headerTitle: {
    fontFamily: fontFamilies.display.bold,
    fontSize: fontSizes.xl,
    color: colors.text.primary,
    letterSpacing: 1,
  },
});
