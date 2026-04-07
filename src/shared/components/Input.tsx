import React, { forwardRef } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  type TextInputProps,
  View,
} from 'react-native';
import { colors, fontFamilies, fontSizes, radius, spacing } from '@/theme';

interface InputProps extends TextInputProps {
  label?: string | undefined;
  error?: string | undefined;
}

export const Input = forwardRef<TextInput, InputProps>(
  ({ label, error, style, ...rest }, ref) => (
    <View style={styles.container}>
      {label !== undefined && (
        <Text style={styles.label}>{label}</Text>
      )}
      <TextInput
        ref={ref}
        style={[styles.input, error !== undefined && styles.inputError, style]}
        placeholderTextColor={colors.text.disabled}
        selectionColor={colors.coral}
        {...rest}
      />
      {error !== undefined && (
        <Text style={styles.error}>{error}</Text>
      )}
    </View>
  ),
);

Input.displayName = 'Input';

const styles = StyleSheet.create({
  container: { gap: spacing[1] },
  label: {
    fontFamily: fontFamilies.body.medium,
    fontSize: fontSizes.sm,
    color: colors.text.secondary,
  },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border.default,
    borderRadius: radius.md,
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[4],
    fontFamily: fontFamilies.body.regular,
    fontSize: fontSizes.md,
    color: colors.text.primary,
    minHeight: 52,
  },
  inputError: { borderColor: colors.error },
  error: {
    fontFamily: fontFamilies.body.regular,
    fontSize: fontSizes.xs,
    color: colors.error,
  },
});
