import { isAxiosError } from 'axios';
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
    onSuccess: () => {
      // El backend responde igual si el email existe o no (anti-enumeración)
      // Navegar a reset-password con el email para que el usuario ingrese el código
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      router.push({ pathname: '/(auth)/reset-password' as any, params: { email: email.trim() } });
    },
    onError: (err) => {
      if (isAxiosError(err) && err.response?.status === 429) {
        setEmailError('Demasiados intentos. Esperá un momento');
      }
    },
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
          <Pressable onPress={() => router.back()} style={styles.backBtn} hitSlop={16}>
            <View style={styles.chevron} />
          </Pressable>

          <View style={styles.content}>
            <Text style={styles.title}>Recuperar contraseña</Text>

            <View style={styles.form}>
              <Text style={styles.subtitle}>
                Ingresá tu email y te enviaremos un código para crear una nueva contraseña.
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
                label="Enviar código"
                onPress={handleSubmit}
                loading={isPending}
                fullWidth
              />
            </View>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: 'transparent' },

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
});
