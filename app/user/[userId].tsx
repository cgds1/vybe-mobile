import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Pressable } from 'react-native';
import { getUserProfileApi } from '@/features/users/api/users.api';
import type { PublicProfile } from '@/features/users/api/types';
import { Background } from '@/shared/components/Background';
import { colors, fontFamilies, fontSizes, radius, spacing } from '@/theme';

type Params = { userId: string; name?: string };

export default function UserProfileScreen() {
  const { userId, name } = useLocalSearchParams<Params>();
  const { top } = useSafeAreaInsets();

  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const data = await getUserProfileApi(userId);
        setProfile(data);
      } catch {
        setHasError(true);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [userId]);

  const displayName = profile?.displayName ?? name ?? '';
  const avatarUrl = profile?.avatarUrl ?? null;
  const bio = profile?.bio;
  const interests = profile?.interests ?? [];

  return (
    <View style={[styles.screen, { paddingTop: top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Ionicons name="chevron-back" size={24} color={colors.text.primary} />
        </Pressable>
        <Text style={styles.headerTitle} numberOfLines={1}>{displayName}</Text>
        <View style={{ width: 24 }} />
      </View>

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.coral} />
        </View>
      ) : hasError ? (
        <View style={styles.center}>
          <Text style={styles.errorText}>No se pudo cargar el perfil</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {/* Avatar */}
          <View style={styles.avatarSection}>
            {avatarUrl ? (
              <Image
                source={{ uri: avatarUrl }}
                style={styles.avatar}
                contentFit="cover"
                transition={200}
              />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarInitial}>
                  {displayName.charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
            <Text style={styles.displayName}>{displayName}</Text>
            {profile?.age ? (
              <Text style={styles.age}>{profile.age} años</Text>
            ) : null}
          </View>

          {/* Bio */}
          {bio ? (
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Bio</Text>
              <Text style={styles.bioText}>{bio}</Text>
            </View>
          ) : null}

          {/* Intereses */}
          {interests.length > 0 ? (
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Intereses</Text>
              <View style={styles.chipsRow}>
                {interests.map((item) => (
                  <View key={item} style={styles.chip}>
                    <Text style={styles.chipText}>{item}</Text>
                  </View>
                ))}
              </View>
            </View>
          ) : null}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing[5],
    paddingVertical: spacing[4],
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontFamily: fontFamilies.display.semiBold,
    fontSize: fontSizes.lg,
    color: colors.text.primary,
    marginHorizontal: spacing[3],
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    fontFamily: fontFamilies.body.regular,
    fontSize: fontSizes.md,
    color: colors.text.secondary,
  },
  content: {
    padding: spacing[5],
    gap: spacing[6],
    paddingBottom: spacing[10],
  },
  avatarSection: {
    alignItems: 'center',
    gap: spacing[2],
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.surfaceRaised,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    fontFamily: fontFamilies.display.bold,
    fontSize: fontSizes['3xl'],
    color: colors.coral,
  },
  displayName: {
    fontFamily: fontFamilies.display.semiBold,
    fontSize: fontSizes.xl,
    color: colors.text.primary,
  },
  age: {
    fontFamily: fontFamilies.body.regular,
    fontSize: fontSizes.sm,
    color: colors.text.secondary,
  },
  section: {
    gap: spacing[3],
  },
  sectionLabel: {
    fontFamily: fontFamilies.body.semiBold,
    fontSize: fontSizes.xs,
    color: colors.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  bioText: {
    fontFamily: fontFamilies.body.regular,
    fontSize: fontSizes.md,
    color: colors.text.primary,
    lineHeight: fontSizes.md * 1.6,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[2],
  },
  chip: {
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[2],
    borderRadius: radius.full,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border.strong,
  },
  chipText: {
    fontFamily: fontFamilies.body.medium,
    fontSize: fontSizes.sm,
    color: colors.text.primary,
  },
});
