import { useRef, useState, type ReactNode } from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type LayoutChangeEvent,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';
import { colors, font, radius, transition } from '../theme';

type Props = {
  images: string[];
  width?: number;
  height: number;
  emoji: string;
  tint: string;
  tintDeep: string;
  emojiSize?: number;
  hovered?: boolean;
  onPress?: () => void;
  accessibilityLabel?: string;
  thumbnails?: boolean;
  children?: ReactNode;
};

export default function PhotoCarousel({
  images,
  width: givenWidth,
  height,
  emoji,
  tint,
  tintDeep,
  emojiSize = 68,
  hovered,
  onPress,
  accessibilityLabel,
  thumbnails,
  children,
}: Props) {
  const [measured, setMeasured] = useState(0);
  const [index, setIndex] = useState(0);
  const scrollRef = useRef<ScrollView>(null);
  const many = images.length > 1;
  const width = givenWidth ?? measured;

  const onLayout = (e: LayoutChangeEvent) => setMeasured(e.nativeEvent.layout.width);

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (!width) return;
    const i = Math.round(e.nativeEvent.contentOffset.x / width);
    if (i !== index) setIndex(Math.max(0, Math.min(images.length - 1, i)));
  };

  const goTo = (i: number) => {
    const next = (i + images.length) % images.length;
    scrollRef.current?.scrollTo({ x: next * width, animated: true });
    setIndex(next);
  };

  const frame = (
    <View style={[styles.frame, { height, backgroundColor: tint }]} onLayout={onLayout}>
      {images.length === 0 ? (
        <Pressable
          onPress={onPress}
          disabled={!onPress}
          accessibilityLabel={accessibilityLabel}
          style={styles.placeholder}
        >
          <View style={[styles.blobLarge, { backgroundColor: tintDeep }]} />
          <View style={[styles.blobSmall, { backgroundColor: tintDeep }]} />
          <Text style={[styles.emoji, { fontSize: emojiSize }, hovered && styles.emojiHovered]}>
            {emoji}
          </Text>
        </Pressable>
      ) : width > 0 ? (
        <ScrollView
          ref={scrollRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={onScroll}
          scrollEventThrottle={32}
          style={StyleSheet.absoluteFill}
        >
          {images.map((uri, i) => (
            <Pressable
              key={uri + i}
              onPress={onPress}
              disabled={!onPress}
              accessibilityLabel={accessibilityLabel}
              style={{ width, height }}
            >
              <Image source={{ uri }} style={styles.image} resizeMode="cover" />
            </Pressable>
          ))}
        </ScrollView>
      ) : null}

      {children}

      {many ? (
        <>
          <Pressable
            onPress={() => goTo(index - 1)}
            accessibilityLabel="Foto sebelumnya"
            hitSlop={6}
            style={({ pressed }) => [styles.arrow, styles.arrowLeft, pressed && styles.pressed]}
          >
            <Text style={styles.arrowText}>‹</Text>
          </Pressable>
          <Pressable
            onPress={() => goTo(index + 1)}
            accessibilityLabel="Foto berikutnya"
            hitSlop={6}
            style={({ pressed }) => [styles.arrow, styles.arrowRight, pressed && styles.pressed]}
          >
            <Text style={styles.arrowText}>›</Text>
          </Pressable>

          <View style={styles.dots}>
            {images.map((uri, i) => (
              <View key={uri + i} style={[styles.dot, i === index && styles.dotActive]} />
            ))}
          </View>

          <View style={styles.counter}>
            <Text style={styles.counterText}>
              📷 {index + 1}/{images.length}
            </Text>
          </View>
        </>
      ) : null}
    </View>
  );

  if (!thumbnails || !many) return frame;

  return (
    <View>
      {frame}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.thumbRow}
      >
        {images.map((uri, i) => (
          <Pressable
            key={uri + i}
            onPress={() => goTo(i)}
            accessibilityLabel={`Foto ${i + 1}`}
            style={[styles.thumb, i === index && styles.thumbActive]}
          >
            <Image source={{ uri }} style={styles.image} resizeMode="cover" />
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  frame: { overflow: 'hidden', position: 'relative' },
  placeholder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  blobLarge: {
    position: 'absolute',
    pointerEvents: 'none',
    width: 190,
    height: 190,
    borderRadius: radius.pill,
    opacity: 0.55,
    top: -58,
    right: -52,
  },
  blobSmall: {
    position: 'absolute',
    pointerEvents: 'none',
    width: 110,
    height: 110,
    borderRadius: radius.pill,
    opacity: 0.4,
    bottom: -40,
    left: -28,
  },
  emoji: { fontFamily: font.body, ...transition('transform', 220) },
  emojiHovered: { transform: [{ scale: 1.12 }, { rotate: '-4deg' }] },
  image: { width: '100%', height: '100%' },

  arrow: {
    position: 'absolute',
    top: '50%',
    marginTop: -15,
    width: 30,
    height: 30,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrowLeft: { left: 10 },
  arrowRight: { right: 10 },
  arrowText: { fontSize: 20, lineHeight: 22, color: colors.ink, fontFamily: font.bold, marginTop: -2 },
  pressed: { opacity: 0.7 },

  dots: {
    position: 'absolute',
    pointerEvents: 'none',
    bottom: 12,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 5,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(255,255,255,0.6)',
    ...transition('width, background-color', 180),
  },
  dotActive: { width: 16, backgroundColor: '#fff' },
  counter: {
    position: 'absolute',
    pointerEvents: 'none',
    bottom: 12,
    left: 12,
    backgroundColor: 'rgba(46, 33, 26, 0.72)',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: radius.pill,
  },
  counterText: { fontSize: 11, fontFamily: font.bold, color: '#fff' },
  thumbRow: { flexDirection: 'row', gap: 8, paddingHorizontal: 20, paddingTop: 14 },
  thumb: {
    width: 64,
    height: 64,
    borderRadius: radius.sm,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
    opacity: 0.6,
    ...transition('opacity, border-color', 150),
  },
  thumbActive: { borderColor: colors.primary, opacity: 1 },
});
