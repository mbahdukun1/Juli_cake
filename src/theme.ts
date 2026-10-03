export const colors = {
  bg: '#FAF5EF',
  surface: '#FFFFFF',
  band: '#F1E7DC',
  cream: '#F6EDE3',
  border: '#E7D8C9',
  borderStrong: '#D6C0AB',

  primary: '#A63D26',
  primaryDark: '#82301D',
  primarySoft: '#F7E4DC',
  accent: '#B07A2E',
  accentSoft: '#F6E9D2',

  ink: '#2E211A',
  text: '#2E211A',
  muted: '#7C6A5D',
  faint: '#A8968A',

  success: '#1FA855',
  whatsapp: '#25D366',
  overlay: 'rgba(46, 33, 26, 0.55)',
};

export const radius = {
  xs: 8,
  sm: 12,
  md: 18,
  lg: 26,
  xl: 34,
  pill: 999,
};

export const space = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 36,
  section: 72,
};

export const shadow = {
  soft: '0px 2px 10px rgba(90, 60, 40, 0.07)',
  card: '0px 10px 30px rgba(90, 60, 40, 0.10)',
  hover: '0px 20px 44px rgba(90, 60, 40, 0.18)',
  lifted: '0px -8px 30px rgba(90, 60, 40, 0.16)',
  header: '0px 1px 0px rgba(231, 216, 201, 1)',
};

export const font = {
  displayBold: 'Fraunces_700Bold',
  displaySemi: 'Fraunces_600SemiBold',

  body: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semibold: 'Inter_600SemiBold',
  bold: 'Inter_700Bold',
  extrabold: 'Inter_800ExtraBold',
};

export const transition = (properties: string, ms = 180): object => ({
  transitionProperty: properties,
  transitionDuration: `${ms}ms`,
});

export const kicker = {
  fontSize: 11,
  letterSpacing: 2,
  textTransform: 'uppercase' as const,
  fontFamily: font.extrabold,
  color: colors.accent,
};
