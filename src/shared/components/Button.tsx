import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  type PressableProps,
} from 'react-native';
import { colors, fontFamilies, fontSizes, radius, spacing } from '@/theme';

type Variant = 'primary' | 'secondary' | 'ghost';

interface ButtonProps extends PressableProps {
  label: string;
  variant?: Variant;
  loading?: boolean;
  fullWidth?: boolean;
}

export const Button = ({
  label,
  variant = 'primary',
  loading = false,
  fullWidth = false,
  disabled,
  style,
  ...rest
}: ButtonProps) => {
  const isDisabled = disabled === true || loading;

  return (
    <Pressable
      {...rest}
      disabled={isDisabled}
      style={(state) => [
        styles.base,
        styles[variant],
        fullWidth && styles.fullWidth,
        state.pressed && styles.pressed,
        isDisabled && styles.disabled,
        typeof style === 'function' ? style(state) : style,
      ]}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'primary' ? colors.offWhite : colors.coral}
          size="small"
        />
      ) : (
        <Text style={[styles.label, styles[`${variant}Label`]]}>{label}</Text>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[6],
    borderRadius: radius.lg,
    minHeight: 52,
  },
  fullWidth: { width: '100%' },
  pressed: { opacity: 0.85 },
  disabled: { opacity: 0.4 },

  primary: { backgroundColor: colors.coral },
  secondary: { backgroundColor: colors.surface },
  ghost: { backgroundColor: 'transparent' },

  label: {
    fontFamily: fontFamilies.body.semiBold,
    fontSize: fontSizes.md,
    letterSpacing: 0.2,
  },
  primaryLabel: { color: colors.offWhite },
  secondaryLabel: { color: colors.offWhite },
  ghostLabel: { color: colors.coral },
});
