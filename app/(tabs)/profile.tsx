import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { getMyProfileApi, updateProfileApi, uploadAvatarApi } from '@/features/users/api/users.api';
import type { MyProfile } from '@/features/users/api/types';
import { useAuthStore } from '@/features/auth/store/authStore';
import { Skeleton } from '@/shared/components/Skeleton';
import { useToast } from '@/shared/context/ToastContext';
import { colors, fontFamilies, fontSizes, radius, spacing } from '@/theme';

const INTEREST_PRESETS = [
  'Música', 'Cine', 'Viajes', 'Deporte', 'Lectura',
  'Arte', 'Gaming', 'Cocina', 'Tecnología', 'Yoga',
];

export default function ProfileScreen() {
  const { top } = useSafeAreaInsets();
  const { accessToken, user, setUser } = useAuthStore();
  const { showToast } = useToast();

  const [profile, setProfile] = useState<MyProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  const [bio, setBio] = useState('');
  const [interests, setInterests] = useState<string[]>([]);
  const [isDirty, setIsDirty] = useState(false);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getMyProfileApi();
      setProfile(data);
      setBio(data.profile?.bio ?? '');
      setInterests(data.profile?.interests ?? []);
    } catch {
      showToast('Error al cargar el perfil', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleSave() {
    if (!isDirty) return;
    setIsSaving(true);
    try {
      await updateProfileApi({ bio, interests });
      setIsDirty(false);
      showToast('Perfil actualizado', 'success');
    } catch {
      showToast('Error al guardar', 'error');
    } finally {
      setIsSaving(false);
    }
  }

  async function handlePickAvatar() {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (result.canceled || !result.assets[0]) return;

    const compressed = await ImageManipulator.manipulateAsync(
      result.assets[0].uri,
      [{ resize: { width: 512 } }],
      { compress: 0.85, format: ImageManipulator.SaveFormat.JPEG },
    );

    setIsUploadingAvatar(true);
    try {
      await uploadAvatarApi(compressed.uri, accessToken ?? '');
      if (user) {
        setUser({ ...user, avatarUrl: compressed.uri });
      }
      showToast('Foto actualizada', 'success');
    } catch {
      showToast('Error al subir la foto', 'error');
    } finally {
      setIsUploadingAvatar(false);
    }
  }

  function toggleInterest(interest: string) {
    setInterests((prev) =>
      prev.includes(interest)
        ? prev.filter((i) => i !== interest)
        : [...prev, interest],
    );
    setIsDirty(true);
  }

  const displayName = profile?.profile?.displayName ?? user?.name ?? '';
  const avatarUrl = user?.avatarUrl ?? profile?.profile?.avatarUrl ?? null;

  return (
    <View style={[styles.screen, { paddingTop: top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mi perfil</Text>
        <Pressable onPress={() => router.push('/user/settings')} hitSlop={12}>
          <Ionicons name="settings-outline" size={24} color={colors.text.secondary} />
        </Pressable>
      </View>

      {isLoading ? (
        <View style={styles.skeletonContainer}>
          <Skeleton width={96} height={96} borderRadius={48} />
          <Skeleton width="60%" height={24} style={{ marginTop: spacing[4] }} />
          <Skeleton width="100%" height={80} style={{ marginTop: spacing[6] }} />
          <Skeleton width="100%" height={48} style={{ marginTop: spacing[4] }} />
          <Skeleton width="80%" height={48} style={{ marginTop: spacing[3] }} />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {/* Avatar */}
          <View style={styles.avatarSection}>
            <Pressable onPress={handlePickAvatar} style={styles.avatarWrapper}>
              {avatarUrl ? (
                <Image source={{ uri: avatarUrl }} style={styles.avatar} contentFit="cover" />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Text style={styles.avatarInitial}>
                    {displayName.charAt(0).toUpperCase()}
                  </Text>
                </View>
              )}
              <View style={styles.avatarOverlay}>
                {isUploadingAvatar ? (
                  <ActivityIndicator size="small" color={colors.offWhite} />
                ) : (
                  <Ionicons name="camera" size={18} color={colors.offWhite} />
                )}
              </View>
            </Pressable>
            <Text style={styles.displayName}>{displayName}</Text>
            <Text style={styles.email}>{profile?.email ?? ''}</Text>
          </View>

          {/* Bio */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Bio</Text>
            <TextInput
              style={styles.bioInput}
              value={bio}
              onChangeText={(v) => { setBio(v); setIsDirty(true); }}
              placeholder="Cuéntanos sobre ti..."
              placeholderTextColor={colors.text.disabled}
              multiline
              maxLength={500}
            />
          </View>

          {/* Intereses */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Intereses</Text>
            <View style={styles.chipsRow}>
              {INTEREST_PRESETS.map((item) => {
                const active = interests.includes(item);
                return (
                  <Pressable
                    key={item}
                    style={[styles.chip, active && styles.chipActive]}
                    onPress={() => toggleInterest(item)}
                  >
                    <Text style={[styles.chipText, active && styles.chipTextActive]}>
                      {item}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* Save button */}
          <Pressable
            style={[styles.saveBtn, !isDirty && styles.saveBtnDisabled]}
            onPress={handleSave}
            disabled={!isDirty || isSaving}
          >
            {isSaving ? (
              <ActivityIndicator size="small" color={colors.offWhite} />
            ) : (
              <Text style={styles.saveBtnText}>Guardar cambios</Text>
            )}
          </Pressable>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.midnight,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing[5],
    paddingVertical: spacing[4],
  },
  headerTitle: {
    fontFamily: fontFamilies.display.bold,
    fontSize: fontSizes.xl,
    color: colors.text.primary,
  },
  skeletonContainer: {
    alignItems: 'center',
    padding: spacing[5],
    gap: spacing[2],
  },
  content: {
    paddingHorizontal: spacing[5],
    paddingBottom: spacing[8],
    gap: spacing[6],
  },
  avatarSection: {
    alignItems: 'center',
    paddingTop: spacing[4],
    gap: spacing[2],
  },
  avatarWrapper: {
    position: 'relative',
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
  },
  avatarPlaceholder: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.surfaceRaised,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    fontFamily: fontFamilies.display.bold,
    fontSize: fontSizes['3xl'],
    color: colors.coral,
  },
  avatarOverlay: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.coral,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.midnight,
  },
  displayName: {
    fontFamily: fontFamilies.display.semiBold,
    fontSize: fontSizes.lg,
    color: colors.text.primary,
  },
  email: {
    fontFamily: fontFamilies.body.regular,
    fontSize: fontSizes.sm,
    color: colors.text.secondary,
  },
  section: {
    gap: spacing[3],
  },
  sectionLabel: {
    fontFamily: fontFamilies.body.semiBold,
    fontSize: fontSizes.sm,
    color: colors.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  bioInput: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing[4],
    fontFamily: fontFamilies.body.regular,
    fontSize: fontSizes.md,
    color: colors.text.primary,
    minHeight: 80,
    textAlignVertical: 'top',
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
    borderWidth: 1,
    borderColor: colors.border.strong,
    backgroundColor: 'transparent',
  },
  chipActive: {
    backgroundColor: colors.coral,
    borderColor: colors.coral,
  },
  chipText: {
    fontFamily: fontFamilies.body.medium,
    fontSize: fontSizes.sm,
    color: colors.text.secondary,
  },
  chipTextActive: {
    color: colors.offWhite,
  },
  saveBtn: {
    height: 52,
    backgroundColor: colors.coral,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing[2],
  },
  saveBtnDisabled: {
    opacity: 0.4,
  },
  saveBtnText: {
    fontFamily: fontFamilies.body.semiBold,
    fontSize: fontSizes.md,
    color: colors.offWhite,
  },
});
