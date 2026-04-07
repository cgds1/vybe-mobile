import { useMutation } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  Keyboard,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { forgotPassword } from '@/features/auth/api';
import { Button, Input } from '@/shared/components';
import { colors, fontFamilies, fontSizes, spacing } from '@/theme';

export default function ForgotPasswordScreen() {
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState<string | undefined>();

  const { mutate, isPending, isSuccess } = useMutation({
    mutationFn: () => forgotPassword(email.trim()),
  });

  const validate = (): boolean => {
    if (!email.trim()) {
      setEmailError('El email es requerido');
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim())) {
      setEmailError('Email inválido');
      return false;
    }
    setEmailError(undefined);
    return true;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    mutate();
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={[styles.outer, { paddingTop: insets.top + spacing[4] }]}>
          {/* Back button — anclado al top */}
          <Pressable onPress={() => router.back()} style={styles.backBtn} hitSlop={16}>
            <View style={styles.chevron} />
          </Pressable>

          {/* Contenido centrado verticalmente en el espacio restante */}
          <View style={styles.content}>
            <Text style={styles.title}>Recuperar contraseña</Text>

            {isSuccess ? (
              <View style={styles.successBox}>
                <View style={styles.successIconWrapper}>
                  <Text style={styles.successIconText}>✓</Text>
                </View>
                <Text style={styles.successTitle}>¡Revisa tu email!</Text>
                <Text style={styles.successMessage}>
                  Si existe una cuenta con ese email, recibirás instrucciones para recuperar tu contraseña.
                </Text>
                <Button
                  label="Volver al login"
                  variant="secondary"
                  onPress={() => router.back()}
                  fullWidth
                />
              </View>
            ) : (
              <View style={styles.form}>
                <Text style={styles.subtitle}>
                  Ingresa tu email y te enviaremos las instrucciones para recuperar tu contraseña.
                </Text>
                <Input
                  label="Email"
                  value={email}
                  onChangeText={(t) => {
                    setEmail(t);
                    if (emailError) setEmailError(undefined);
                  }}
                  error={emailError}
                  placeholder="tu@email.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  maxLength={254}
                  returnKeyType="done"
                  onSubmitEditing={handleSubmit}
                />
                <Button
                  label="Enviar instrucciones"
                  onPress={handleSubmit}
                  loading={isPending}
                  fullWidth
                />
              </View>
            )}
          </View>
        </View>
      </TouchableWithoutFeedback>
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

  // Ocupa todo el espacio restante y centra verticalmente
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingBottom: spacing[8],
  },

  title: {
    fontFamily: fontFamilies.display.bold,
    fontSize: fontSizes['2xl'],
    color: colors.text.primary,
    marginBottom: spacing[6],
  },

  form: { gap: spacing[4] },

  subtitle: {
    fontFamily: fontFamilies.body.regular,
    fontSize: fontSizes.md,
    color: colors.text.secondary,
    lineHeight: fontSizes.md * 1.5,
  },

  successBox: {
    alignItems: 'center',
    gap: spacing[4],
  },
  successIconWrapper: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: `${colors.success}20`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  successIconText: {
    fontSize: 32,
    color: colors.success,
    lineHeight: 40,
  },
  successTitle: {
    fontFamily: fontFamilies.display.bold,
    fontSize: fontSizes.xl,
    color: colors.text.primary,
    textAlign: 'center',
  },
  successMessage: {
    fontFamily: fontFamilies.body.regular,
    fontSize: fontSizes.md,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: fontSizes.md * 1.5,
  },
});
