import { useEffect, useState } from 'react';
import { Dimensions, Platform } from 'react-native';

export function useViewportWidth(): number {
  const [width, setWidth] = useState(() => readWidth());

  useEffect(() => {
    if (Platform.OS === 'web') {
      const onResize = () => setWidth(readWidth());
      onResize();
      window.addEventListener('resize', onResize);

      const root = document.documentElement;
      const observer =
        typeof ResizeObserver !== 'undefined' && root ? new ResizeObserver(onResize) : null;
      observer?.observe(root);

      return () => {
        window.removeEventListener('resize', onResize);
        observer?.disconnect();
      };
    }

    const sub = Dimensions.addEventListener('change', ({ window: w }) => setWidth(w.width));
    return () => sub.remove();
  }, []);

  return width;
}

function readWidth(): number {
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    const w = window.innerWidth || document.documentElement?.clientWidth || 0;
    if (w > 0) return w;
  }
  return Dimensions.get('window').width;
}
