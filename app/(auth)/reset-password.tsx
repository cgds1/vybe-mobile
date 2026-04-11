import { isAxiosError } from 'axios';
import { useMutation } from '@tanstack/react-query';
import { router, useLocalSearchParams } from 'expo-router';
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
import { resetPassword } from '@/features/auth/api';
import { Button, Input } from '@/shared/components';
import { colors, fontFamilies, fontSizes, spacing } from '@/theme';

function validateNewPassword(password: string): string | undefined {
  if (!password) return 'La contraseña es requerida';
  if (password.length < 8) return 'Mínimo 8 caracteres';
  if (!/[A-Z]/.test(password)) return 'Necesita al menos una mayúscula';
  if (!/[a-z]/.test(password)) return 'Necesita al menos una minúscula';
  if (!/[0-9]/.test(password)) return 'Necesita al menos un número';
  return undefined;
}

export default function ResetPasswordScreen() {
  const insets = useSafeAreaInsets();
  const { email: emailParam } = useLocalSearchParams<{ email: string }>();
  const email = emailParam ?? '';

  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [errors, setErrors] = useState<{ code?: string; password?: string }>({});
  const [successMessage, setSuccessMessage] = useState<string | undefined>();

  const passwordRef = useRef<TextInput>(null);

  const { mutate, isPending, error } = useMutation({
    mutationFn: () => resetPassword(email, code.trim(), newPassword),
    onSuccess: () => {
      setSuccessMessage('Contraseña actualizada. Ya podés iniciar sesión');
      setTimeout(() => router.replace('/(auth)/login'), 1500);
    },
  });

  const validate = (): boolean => {
    const next: typeof errors = {};
    if (code.trim().length !== 6) next.code = 'Ingresá el código de 6 dígitos';
    const pwdErr = validateNewPassword(newPassword);
    if (pwdErr !== undefined) next.password = pwdErr;
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    mutate();
  };

  const apiError = (() => {
    if (!error) return undefined;
    if (isAxiosError(error)) {
      const msg = error.response?.data?.message as string | undefined;
      if (typeof msg === 'string') {
        if (msg.includes('Too many failed attempts') || msg.includes('expired')) {
          return 'Código expirado o inválido. Pedí uno nuevo en "Olvidé mi contraseña"';
        }
        if (msg.includes('Invalid')) return 'Código incorrecto';
      }
      if (error.response?.status === 422) return 'La contraseña no cumple los requisitos';
      if (error.response?.status === 429) return 'Demasiados intentos. Esperá un momento';
    }
    return 'Error al resetear la contraseña. Intenta de nuevo';
  })();

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

        <Text style={styles.title}>Nueva contraseña</Text>
        <Text style={styles.subtitle}>
          Ingresá el código que recibiste por email y elegí tu nueva contraseña.
        </Text>

        <View style={styles.form}>
          <Input
            label="Código de verificación"
            value={code}
            onChangeText={(v) => {
              setCode(v.replace(/\D/g, '').slice(0, 6));
              if (errors.code) setErrors((e) => { const { code: _c, ...rest } = e; return rest; });
            }}
            error={errors.code}
            placeholder="000000"
            keyboardType="number-pad"
            maxLength={6}
            returnKeyType="next"
            onSubmitEditing={() => passwordRef.current?.focus()}
            style={styles.codeInput}
          />

          <Input
            ref={passwordRef}
            label="Nueva contraseña"
            value={newPassword}
            onChangeText={(v) => {
              setNewPassword(v);
              if (errors.password) setErrors((e) => { const { password: _p, ...rest } = e; return rest; });
            }}
            error={errors.password}
            placeholder="Mín. 8 · mayúscula · minúscula · número"
            secureTextEntry
            maxLength={128}
            returnKeyType="done"
            onSubmitEditing={handleSubmit}
          />

          {apiError !== undefined && (
            <View style={styles.errorBanner}>
              <Text style={styles.errorBannerText}>{apiError}</Text>
            </View>
          )}

          {successMessage !== undefined && (
            <View style={styles.successBanner}>
              <Text style={styles.successBannerText}>{successMessage}</Text>
            </View>
          )}

          <Button
            label="Cambiar contraseña"
            onPress={handleSubmit}
            loading={isPending}
            fullWidth
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.midnight },

  container: {
    flexGrow: 1,
    paddingHorizontal: spacing[6],
    paddingBottom: spacing[10],
  },

  backBtn: {
    alignSelf: 'flex-start',
    padding: spacing[1],
    marginBottom: spacing[4],
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
    marginBottom: spacing[2],
  },
  subtitle: {
    fontFamily: fontFamilies.body.regular,
    fontSize: fontSizes.md,
    color: colors.text.secondary,
    lineHeight: fontSizes.md * 1.5,
    marginBottom: spacing[6],
  },

  form: { gap: spacing[4] },

  codeInput: {
    fontSize: fontSizes.xl,
    letterSpacing: 8,
    textAlign: 'center',
  },

  errorBanner: {
    backgroundColor: `${colors.error}20`,
    borderWidth: 1,
    borderColor: `${colors.error}50`,
    borderRadius: 8,
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[4],
  },
  errorBannerText: {
    fontFamily: fontFamilies.body.medium,
    fontSize: fontSizes.sm,
    color: colors.error,
    textAlign: 'center',
  },

  successBanner: {
    backgroundColor: `${colors.coral}20`,
    borderWidth: 1,
    borderColor: `${colors.coral}50`,
    borderRadius: 8,
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[4],
  },
  successBannerText: {
    fontFamily: fontFamilies.body.medium,
    fontSize: fontSizes.sm,
    color: colors.coral,
    textAlign: 'center',
  },
});
