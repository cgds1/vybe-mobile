import { isAxiosError } from 'axios';
import { useMutation } from '@tanstack/react-query';
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
import { login } from '@/features/auth/api';
import { useAuthStore } from '@/features/auth/store/authStore';
import { registerPushToken } from '@/features/notifications/notifications';
import { Button, Input } from '@/shared/components';
import { colors, fontFamilies, fontSizes, radius, spacing } from '@/theme';

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim());
}

function validatePassword(password: string): string | undefined {
  if (!password) return 'La contraseña es requerida';
  if (password.length < 6) return 'Mínimo 6 caracteres';
  if (!/[A-Z]/.test(password)) return 'Necesita al menos una mayúscula';
  if (!/[a-z]/.test(password)) return 'Necesita al menos una minúscula';
  return undefined;
}

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{ email?: string | undefined; password?: string | undefined }>({});
  const passwordRef = useRef<TextInput>(null);

  const { setTokens, setUser } = useAuthStore();

  const { mutate, isPending, error } = useMutation({
    mutationFn: () => login({ email: email.trim(), password }),
    onSuccess: async (data) => {
      setTokens(data.accessToken, data.refreshToken);
      setUser(data.user);
      await registerPushToken();
    },
    onError: (err) => {
      if (isAxiosError(err) && err.response?.status === 403) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        router.push({ pathname: '/(auth)/verify-email' as any, params: { email: email.trim() } });
      }
    },
  });

  const validate = (): boolean => {
    const errors: typeof fieldErrors = {};
    if (!email.trim()) errors.email = 'El email es requerido';
    else if (!isValidEmail(email)) errors.email = 'Email inválido';
    const pwdError = validatePassword(password);
    if (pwdError !== undefined) errors.password = pwdError;
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleLogin = () => {
    if (!validate()) return;
    mutate();
  };

  const apiError = (() => {
    if (!error) return undefined;
    if (isAxiosError(error)) {
      const status = error.response?.status;
      if (status === 403) return undefined; // manejado en onError con redirect
      if (status === 401 || status === 404) return 'Email o contraseña incorrectos';
      if (status === 429) return 'Demasiados intentos. Esperá un momento';
    }
    return 'Error al iniciar sesión. Intenta de nuevo';
  })();

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.logo}>Vybe</Text>
          <Text style={styles.tagline}>Encuentra tu gente</Text>
        </View>

        <View style={styles.form}>
          <Input
            label="Email"
            value={email}
            onChangeText={(t) => {
              setEmail(t);
              if (fieldErrors.email) setFieldErrors(({ email: _e, ...rest }) => rest);
            }}
            error={fieldErrors.email}
            placeholder="test@vybe.app"
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
            value={password}
            onChangeText={(t) => {
              setPassword(t);
              if (fieldErrors.password) setFieldErrors(({ password: _p, ...rest }) => rest);
            }}
            error={fieldErrors.password}
            placeholder="••••••••"
            secureTextEntry
            maxLength={128}
            returnKeyType="done"
            onSubmitEditing={handleLogin}
          />

          {apiError !== undefined && (
            <View style={styles.errorBanner}>
              <Text style={styles.errorBannerText}>{apiError}</Text>
            </View>
          )}

          <Button label="Entrar" onPress={handleLogin} loading={isPending} fullWidth />

          <Pressable
            onPress={() => router.push('/(auth)/forgot-password')}
            style={styles.forgotLinkWrapper}
            hitSlop={8}
          >
            <Text style={styles.forgotLinkText}>¿Olvidaste tu contraseña?</Text>
          </Pressable>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>¿No tienes cuenta? </Text>
          <Pressable onPress={() => router.push('/(auth)/register')} hitSlop={8}>
            <Text style={styles.registerText}>Regístrate</Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: 'transparent' },

  container: {
    flexGrow: 1,
    paddingHorizontal: spacing[6],
    paddingBottom: spacing[10],
    justifyContent: 'center',
  },

  header: {
    alignItems: 'center',
    marginBottom: spacing[12],
  },
  logo: {
    fontFamily: fontFamilies.display.bold,
    fontSize: 52,
    color: colors.coral,
    letterSpacing: -1,
  },
  tagline: {
    fontFamily: fontFamilies.body.regular,
    fontSize: fontSizes.md,
    color: colors.text.secondary,
    marginTop: spacing[1],
  },

  form: { gap: spacing[4] },

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

  forgotLinkWrapper: { alignSelf: 'center', paddingVertical: spacing[1] },
  forgotLinkText: {
    fontFamily: fontFamilies.body.medium,
    fontSize: fontSizes.sm,
    color: colors.text.secondary,
    textDecorationLine: 'underline',
  },

  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing[10],
  },
  footerText: {
    fontFamily: fontFamilies.body.regular,
    fontSize: fontSizes.sm,
    color: colors.text.secondary,
  },
  registerText: {
    fontFamily: fontFamilies.body.bold,
    fontSize: fontSizes.sm,
    color: colors.coral,
  },
});
