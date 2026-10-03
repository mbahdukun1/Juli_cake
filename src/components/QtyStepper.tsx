import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, font, radius } from '../theme';

type Props = {
  qty: number;
  onChange: (delta: number) => void;
  size?: 'sm' | 'md';
};

export default function QtyStepper({ qty, onChange, size = 'md' }: Props) {
  const dim = size === 'sm' ? 28 : 34;

  return (
    <View style={[styles.wrap, { height: dim + 6 }]}>
      <Pressable
        accessibilityLabel="Kurangi jumlah"
        onPress={() => onChange(-1)}
        style={({ pressed }) => [
          styles.btn,
          { width: dim, height: dim },
          pressed && styles.pressed,
        ]}
      >
        <Text style={styles.sign}>−</Text>
      </Pressable>

      <Text style={[styles.qty, size === 'sm' && { fontSize: 14 }]}>{qty}</Text>

      <Pressable
        accessibilityLabel="Tambah jumlah"
        onPress={() => onChange(1)}
        style={({ pressed }) => [
          styles.btn,
          styles.btnPlus,
          { width: dim, height: dim },
          pressed && styles.pressed,
        ]}
      >
        <Text style={[styles.sign, styles.signPlus]}>+</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primarySoft,
    borderRadius: radius.pill,
    paddingHorizontal: 3,
    gap: 2,
  },
  btn: {
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  btnPlus: { backgroundColor: colors.primary },
  pressed: { opacity: 0.65 },
  sign: {
    fontSize: 18,
    lineHeight: 20,
    fontFamily: font.bold,
    color: colors.primary,
  },
  signPlus: { color: '#fff' },
  qty: {
    minWidth: 28,
    textAlign: 'center',
    fontSize: 15,
    fontFamily: font.bold,
    color: colors.text,
  },
});
