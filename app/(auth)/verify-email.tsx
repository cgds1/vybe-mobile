import { isAxiosError } from 'axios';
import { useMutation } from '@tanstack/react-query';
import { router, useLocalSearchParams } from 'expo-router';
import { useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { resendVerification, verifyEmail } from '@/features/auth/api';
import { useAuthStore } from '@/features/auth/store/authStore';
import { Button, Input } from '@/shared/components';
import { colors, fontFamilies, fontSizes, radius, spacing } from '@/theme';

export default function VerifyEmailScreen() {
  const insets = useSafeAreaInsets();
  const { email: emailParam } = useLocalSearchParams<{ email: string }>();
  const email = emailParam ?? '';

  const [code, setCode] = useState('');
  const [codeError, setCodeError] = useState<string | undefined>();
  const [resendMessage, setResendMessage] = useState<string | undefined>();
  const codeRef = useRef<TextInput>(null);

  const { accessToken, user, setUser } = useAuthStore();

  const { mutate: verify, isPending: verifying, error: verifyError } = useMutation({
    mutationFn: () => verifyEmail(email, code.trim()),
    onSuccess: () => {
      if (accessToken && user) {
        // Vino del registro — actualizar isVerified en el store para que
        // RootNavigator redirija a /(tabs)
        setUser({ ...user, isVerified: true });
      } else {
        // Vino del login 403 — no tiene tokens, debe loguearse de nuevo
        router.replace('/(auth)/login');
      }
    },
    onError: (err) => {
      if (isAxiosError(err)) {
        const msg = err.response?.data?.message as string | undefined;
        if (typeof msg === 'string') {
          if (msg.includes('Too many failed attempts')) {
            setCodeError('Demasiados intentos. Pedí un código nuevo');
            return;
          }
          if (msg.includes('expired')) {
            setCodeError('El código expiró. Pedí uno nuevo');
            return;
          }
          if (msg.includes('Invalid')) {
            setCodeError('Código incorrecto');
            return;
          }
          if (msg.includes('already verified')) {
            // Ya verificado, ir a login
            router.replace('/(auth)/login');
            return;
          }
        }
        if (err.response?.status === 429) {
          setCodeError('Demasiados intentos. Esperá un momento');
          return;
        }
      }
      setCodeError('Error al verificar. Intenta de nuevo');
    },
  });

  const { mutate: resend, isPending: resending } = useMutation({
    mutationFn: () => resendVerification(email),
    onSuccess: () => {
      setCode('');
      setCodeError(undefined);
      setResendMessage('Código reenviado. Revisá tu email');
    },
    onError: () => {
      setResendMessage('No se pudo reenviar. Esperá un momento');
    },
  });

  const handleVerify = () => {
    if (code.trim().length !== 6) {
      setCodeError('Ingresá el código de 6 dígitos');
      return;
    }
    setCodeError(undefined);
    setResendMessage(undefined);
    verify();
  };

  const handleResend = () => {
    setCodeError(undefined);
    setResendMessage(undefined);
    resend();
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={[styles.outer, { paddingTop: insets.top + spacing[4] }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn} hitSlop={16}>
          <View style={styles.chevron} />
        </Pressable>

        <View style={styles.content}>
          <View style={styles.iconWrapper}>
            <Text style={styles.icon}>✉️</Text>
          </View>

          <Text style={styles.title}>Verificá tu email</Text>
          <Text style={styles.subtitle}>
            Te enviamos un código de 6 dígitos a{'\n'}
            <Text style={styles.emailHighlight}>{email}</Text>
          </Text>

          <View style={styles.form}>
            <Input
              ref={codeRef}
              label="Código de verificación"
              value={code}
              onChangeText={(v) => {
                setCode(v.replace(/\D/g, '').slice(0, 6));
                if (codeError) setCodeError(undefined);
                if (resendMessage) setResendMessage(undefined);
              }}
              error={codeError}
              placeholder="000000"
              keyboardType="number-pad"
              maxLength={6}
              returnKeyType="done"
              onSubmitEditing={handleVerify}
              style={styles.codeInput}
            />

            {resendMessage !== undefined && (
              <Text style={styles.resendMessage}>{resendMessage}</Text>
            )}

            <Button
              label="Verificar"
              onPress={handleVerify}
              loading={verifying}
              fullWidth
            />

            <View style={styles.resendRow}>
              <Text style={styles.resendText}>¿No recibiste el código? </Text>
              <Pressable onPress={handleResend} disabled={resending} hitSlop={8}>
                <Text style={[styles.resendLink, resending && styles.resendLinkDisabled]}>
                  {resending ? 'Enviando…' : 'Reenviar'}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.midnight },

  outer: {
    flex: 1,
    paddingHorizontal: spacing[6],
    paddingBottom: spacing[10],
  },

  backBtn: {
    alignSelf: 'flex-start',
    padding: spacing[1],
    marginBottom: spacing[2],
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

  content: {
    flex: 1,
    justifyContent: 'center',
    paddingBottom: spacing[8],
  },

  iconWrapper: {
    alignItems: 'center',
    marginBottom: spacing[5],
  },
  icon: {
    fontSize: 52,
  },

  title: {
    fontFamily: fontFamilies.display.bold,
    fontSize: fontSizes['2xl'],
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: spacing[3],
  },
  subtitle: {
    fontFamily: fontFamilies.body.regular,
    fontSize: fontSizes.md,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: fontSizes.md * 1.6,
    marginBottom: spacing[6],
  },
  emailHighlight: {
    fontFamily: fontFamilies.body.medium,
    color: colors.text.primary,
  },

  form: { gap: spacing[4] },

  codeInput: {
    fontSize: fontSizes.xl,
    letterSpacing: 8,
    textAlign: 'center',
  },

  resendMessage: {
    fontFamily: fontFamilies.body.regular,
    fontSize: fontSizes.sm,
    color: colors.coral,
    textAlign: 'center',
  },

  resendRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing[2],
  },
  resendText: {
    fontFamily: fontFamilies.body.regular,
    fontSize: fontSizes.sm,
    color: colors.text.secondary,
  },
  resendLink: {
    fontFamily: fontFamilies.body.bold,
    fontSize: fontSizes.sm,
    color: colors.coral,
  },
  resendLinkDisabled: {
    opacity: 0.5,
  },
});
