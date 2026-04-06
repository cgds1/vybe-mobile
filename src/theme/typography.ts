export const fontFamilies = {
  display: {
    regular: 'SpaceGrotesk_400Regular',
    medium: 'SpaceGrotesk_500Medium',
    semiBold: 'SpaceGrotesk_600SemiBold',
    bold: 'SpaceGrotesk_700Bold',
  },
  body: {
    regular: 'Inter_400Regular',
    medium: 'Inter_500Medium',
    semiBold: 'Inter_600SemiBold',
    bold: 'Inter_700Bold',
  },
} as const;

export const fontSizes = {
  xs: 11,
  sm: 13,
  md: 15,
  lg: 17,
  xl: 20,
  '2xl': 24,
  '3xl': 30,
  '4xl': 36,
} as const;

export const lineHeights = {
  tight: 1.2,
  normal: 1.5,
  relaxed: 1.75,
} as const;
