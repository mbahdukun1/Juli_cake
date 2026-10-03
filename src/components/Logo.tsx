import { Image, Platform } from 'react-native';
import { LOGO_RATIO, LOGO_URI } from '../logo';

export default function Logo({ height = 44 }: { height?: number }) {
  const width = Math.round(height * LOGO_RATIO);

  if (Platform.OS === 'web') {
    return (
      <img
        src={LOGO_URI}
        alt="Juli Cake"
        width={width}
        height={height}
        style={{ display: 'block', transition: 'height 200ms, width 200ms' }}
      />
    );
  }

  return (
    <Image
      source={{ uri: LOGO_URI }}
      style={{ width, height }}
      resizeMode="contain"
      accessibilityLabel="Juli Cake"
    />
  );
}
