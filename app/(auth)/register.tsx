import { useMutation } from '@tanstack/react-query';
import * as ImagePicker from 'expo-image-picker';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { register } from '@/features/auth/api';
import { useAuthStore } from '@/features/auth/store/authStore';
import { createProfileApi, uploadAvatarApi } from '@/features/users/api/users.api';
import { registerPushToken } from '@/features/notifications/notifications';
import { Button, Input } from '@/shared/components';
import { colors, fontFamilies, fontSizes, radius, spacing } from '@/theme';

// ── Helpers ────────────────────────────────────────────────────────────────

function formatDob(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, 8);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
}

function validateDob(dob: string): string | undefined {
  if (!dob) return 'La fecha de nacimiento es requerida';
  if (dob.length < 10) return 'Formato: DD/MM/AAAA';
  const parts = dob.split('/');
  const day = parseInt(parts[0] ?? '', 10);
  const month = parseInt(parts[1] ?? '', 10);
  const year = parseInt(parts[2] ?? '', 10);
  const date = new Date(year, month - 1, day);
  if (
    isNaN(date.getTime()) ||
    date.getDate() !== day ||
    date.getMonth() !== month - 1 ||
    date.getFullYear() !== year ||
    month < 1 || month > 12 ||
    day < 1 || day > 31
  ) {
    return 'Fecha inválida';
  }
  const today = new Date();
  const age =
    today.getFullYear() -
    year -
    (today < new Date(today.getFullYear(), month - 1, day) ? 1 : 0);
  if (age < 18) return 'Debes tener al menos 18 años';
  if (age > 120) return 'Fecha inválida';
  return undefined;
}

function validatePassword(password: string): string | undefined {
  if (!password) return 'La contraseña es requerida';
  if (password.length < 6) return 'Mínimo 6 caracteres';
  if (!/[A-Z]/.test(password)) return 'Necesita al menos una mayúscula';
  if (!/[a-z]/.test(password)) return 'Necesita al menos una minúscula';
  return undefined;
}

// ── Types ──────────────────────────────────────────────────────────────────

interface FormState {
  name: string;
  email: string;
  password: string;
  dob: string;
  bio: string;
  avatarUri?: string | undefined;
}

interface FormErrors {
  name?: string | undefined;
  email?: string | undefined;
  password?: string | undefined;
  dob?: string | undefined;
}

// ── Component ──────────────────────────────────────────────────────────────

export default function RegisterScreen() {
  const insets = useSafeAreaInsets();
  const [form, setForm] = useState<FormState>({
    name: '',
    email: '',
    password: '',
    dob: '',
    bio: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});

  const emailRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);
  const dobRef = useRef<TextInput>(null);
  const bioRef = useRef<TextInput>(null);

  const { setTokens, setUser } = useAuthStore();

  const { mutate, isPending, error } = useMutation({
    mutationFn: async () => {
      const authData = await register({
        email: form.email.trim(),
        password: form.password,
      });

      // Calculate age from DD/MM/YYYY
      const [dd, mm, yyyy] = form.dob.split('/').map(Number);
      const today = new Date();
      let age = today.getFullYear() - (yyyy ?? 0);
      if (today < new Date(today.getFullYear(), (mm ?? 1) - 1, dd ?? 1)) age--;

      await createProfileApi(
        {
          displayName: form.name.trim(),
          age,
          bio: form.bio.trim() || undefined,
        },
        authData.accessToken,
      );

      if (form.avatarUri !== undefined) {
        await uploadAvatarApi(form.avatarUri, authData.accessToken);
      }

      return authData;
    },
    onSuccess: async (data) => {
      setTokens(data.accessToken, data.refreshToken);
      setUser(data.user);
      await registerPushToken();
    },
  });

  const clearError = (key: keyof FormErrors) =>
    setErrors((e) => { const next = { ...e }; delete next[key]; return next; });

  const set = (key: keyof FormState) => (value: string) =>
    setForm((f) => ({ ...f, [key]: value }));

  const validate = (): boolean => {
    const next: FormErrors = {};
    if (!form.name.trim()) next.name = 'El nombre es requerido';
    if (!form.email.trim()) next.email = 'El email es requerido';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.email.trim()))
      next.email = 'Email inválido';
    const pwdError = validatePassword(form.password);
    if (pwdError !== undefined) next.password = pwdError;
    const dobError = validateDob(form.dob);
    if (dobError !== undefined) next.dob = dobError;
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    mutate();
  };

  const pickAvatar = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    const uri = result.assets?.[0]?.uri;
    if (!result.canceled && uri !== undefined) {
      setForm((f) => ({ ...f, avatarUri: uri }));
    }
  };

  const apiError =
    error instanceof Error
      ? error.message
      : error != null
        ? 'Error al crear la cuenta'
        : undefined;

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={[styles.container, { paddingTop: insets.top + spacing[4] }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Pressable onPress={() => router.back()} style={styles.backBtn} hitSlop={16}>
          <View style={styles.chevron} />
        </Pressable>

        <Text style={styles.title}>Crear cuenta</Text>
        <Text style={styles.subtitle}>Únete a Vybe</Text>

        {/* Avatar picker */}
        <View style={styles.avatarSection}>
          <Pressable onPress={pickAvatar} style={styles.avatarWrapper}>
            {form.avatarUri !== undefined ? (
              <Image
                source={{ uri: form.avatarUri }}
                style={styles.avatarImage}
                contentFit="cover"
              />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarPlaceholderIcon}>+</Text>
              </View>
            )}
          </Pressable>
          <Text style={styles.avatarHint}>Foto de perfil (opcional)</Text>
        </View>

        {/* Fields */}
        <View style={styles.form}>
          <Input
            label="Nombre"
            value={form.name}
            onChangeText={(v) => { set('name')(v); clearError('name'); }}
            error={errors.name}
            placeholder="¿Cómo te llamas?"
            autoCapitalize="words"
            maxLength={50}
            returnKeyType="next"
            onSubmitEditing={() => emailRef.current?.focus()}
          />

          <Input
            ref={emailRef}
            label="Email"
            value={form.email}
            onChangeText={(v) => { set('email')(v); clearError('email'); }}
            error={errors.email}
            placeholder="tu@email.com"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            maxLength={254}
            returnKeyType="next"
            onSubmitEditing={() => passwordRef.current?.focus()}
          />

          <Input
            ref={passwordRef}
            label="Contraseña"
            value={form.password}
            onChangeText={(v) => { set('password')(v); clearError('password'); }}
            error={errors.password}
            placeholder="Mín. 6 · mayúscula · minúscula"
            secureTextEntry
            maxLength={128}
            returnKeyType="next"
            onSubmitEditing={() => dobRef.current?.focus()}
          />

          <Input
            ref={dobRef}
            label="Fecha de nacimiento"
            value={form.dob}
            onChangeText={(v) => {
              set('dob')(formatDob(v));
              clearError('dob');
            }}
            error={errors.dob}
            placeholder="DD/MM/AAAA"
            keyboardType="number-pad"
            maxLength={10}
            returnKeyType="next"
            onSubmitEditing={() => bioRef.current?.focus()}
          />

          <Input
            ref={bioRef}
            label="Bio (opcional)"
            value={form.bio}
            onChangeText={set('bio')}
            placeholder="Cuéntanos algo sobre ti…"
            multiline
            numberOfLines={3}
            maxLength={200}
            returnKeyType="done"
            style={styles.bioInput}
          />

          {apiError !== undefined && (
            <View style={styles.errorBanner}>
              <Text style={styles.errorBannerText}>{apiError}</Text>
            </View>
          )}

          <Button
            label="Crear cuenta"
            onPress={handleSubmit}
            loading={isPending}
            fullWidth
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const AVATAR_SIZE = 88;

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.midnight },

  container: {
    flexGrow: 1,
    paddingHorizontal: spacing[6],
    paddingBottom: spacing[10],
  },

  backBtn: {
    alignSelf: 'flex-start',
    marginBottom: spacing[4],
    padding: spacing[1],
  },
  chevron: {
    width: 12,
    height: 12,
    borderLeftWidth: 2.5,
    borderBottomWidth: 2.5,
    borderColor: colors.text.primary,
    transform: [{ rotate: '45deg' }],
    marginLeft: 4,
  },

  title: {
    fontFamily: fontFamilies.display.bold,
    fontSize: fontSizes['2xl'],
    color: colors.text.primary,
  },
  subtitle: {
    fontFamily: fontFamilies.body.regular,
    fontSize: fontSizes.md,
    color: colors.text.secondary,
    marginTop: spacing[1],
    marginBottom: spacing[5],
  },

  avatarSection: {
    alignItems: 'center',
    marginBottom: spacing[5],
    gap: spacing[2],
  },
  avatarWrapper: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    overflow: 'hidden',
  },
  avatarImage: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
  },
  avatarPlaceholder: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.coral,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarPlaceholderIcon: {
    fontSize: 28,
    color: colors.coral,
    lineHeight: 32,
  },
  avatarHint: {
    fontFamily: fontFamilies.body.regular,
    fontSize: fontSizes.xs,
    color: colors.text.secondary,
  },

  form: { gap: spacing[4] },

  bioInput: {
    minHeight: 80,
    textAlignVertical: 'top',
    paddingTop: spacing[3],
  },

  errorBanner: {
    backgroundColor: `${colors.error}20`,
    borderWidth: 1,
    borderColor: `${colors.error}50`,
    borderRadius: radius.md,
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[4],
  },
  errorBannerText: {
    fontFamily: fontFamilies.body.medium,
    fontSize: fontSizes.sm,
    color: colors.error,
    textAlign: 'center',
  },
});
