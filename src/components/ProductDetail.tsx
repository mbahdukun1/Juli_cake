import { useEffect, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { formatIDR, Product, Variant } from '../catalog';
import { colors, font, radius, shadow } from '../theme';
import { useViewportWidth } from '../useViewportWidth';
import PhotoCarousel from './PhotoCarousel';
import QtyStepper from './QtyStepper';

type Props = {
  product: Product | null;
  initialVariant: Variant | null;
  qtyOf: (productId: string, variantLabel: string) => number;
  onAdd: (product: Product, variant: Variant, delta: number) => void;
  onClose: () => void;
  onGoToCart: () => void;
};

export default function ProductDetail({
  product,
  initialVariant,
  qtyOf,
  onAdd,
  onClose,
  onGoToCart,
}: Props) {
  const [variant, setVariant] = useState<Variant | null>(initialVariant);
  const viewport = useViewportWidth();

  useEffect(() => setVariant(initialVariant), [initialVariant, product?.id]);

  if (!product || !variant) return null;
  const qty = qtyOf(product.id, variant.label);

  return (
    <Modal visible animationType="fade" transparent onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />

        <View style={styles.dialog}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 4 }}
          >
            <PhotoCarousel
              key={product.id}
              images={product.images}
              width={Math.min(560, viewport - 32)}
              height={product.images.length ? 320 : 190}
              thumbnails
              emoji={product.emoji}
              emojiSize={88}
              tint={product.tint}
              tintDeep={product.tintDeep}
            >
              <Pressable onPress={onClose} style={styles.closeBtn} hitSlop={8}>
                <Text style={styles.closeText}>✕</Text>
              </Pressable>

              {product.badge ? (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{product.badge}</Text>
                </View>
              ) : null}
            </PhotoCarousel>

            <View style={styles.content}>
              <Text style={styles.title}>{product.name}</Text>
              <Text style={styles.story}>{product.story}</Text>

              <View style={styles.factRow}>
                <Fact icon="🍽️" label="Porsi" value={product.servings} />
                <Fact icon="⏰" label="Waktu siap" value={product.readyIn} />
                <Fact icon="❄️" label="Penyimpanan" value={product.storage} />
              </View>

              <Text style={styles.sectionLabel}>Bahan-bahan</Text>
              <View style={styles.chipWrap}>
                {product.ingredients.map((item) => (
                  <View key={item} style={styles.ingredientChip}>
                    <Text style={styles.ingredientText}>{item}</Text>
                  </View>
                ))}
              </View>

              <View style={styles.allergenBox}>
                <Text style={styles.allergenTitle}>⚠️ Mengandung</Text>
                <Text style={styles.allergenText}>{product.allergens.join(' · ')}</Text>
              </View>

              <Text style={styles.sectionLabel}>Pilih ukuran</Text>
              <View style={styles.sizeWrap}>
                {product.variants.map((v) => {
                  const active = v.label === variant.label;
                  return (
                    <Pressable
                      key={v.label}
                      onPress={() => setVariant(v)}
                      style={[styles.sizeCard, active && styles.sizeCardActive]}
                    >
                      <Text style={[styles.sizeLabel, active && { color: colors.primary }]}>
                        {v.label}
                      </Text>
                      <Text style={[styles.sizePrice, active && { color: colors.primary }]}>
                        {formatIDR(v.price)}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          </ScrollView>

          <View style={styles.actionBar}>
            <View style={{ flexShrink: 1 }}>
              <Text style={styles.actionLabel}>
                {qty > 0 ? `${qty} × ${variant.label}` : variant.label}
              </Text>
              <Text style={styles.actionPrice}>
                {formatIDR(qty > 0 ? qty * variant.price : variant.price)}
              </Text>
            </View>

            {qty > 0 ? (
              <View style={styles.actionGroup}>
                <QtyStepper qty={qty} onChange={(d) => onAdd(product, variant, d)} />
                <Pressable
                  onPress={onGoToCart}
                  style={({ pressed }) => [styles.cartBtn, pressed && { opacity: 0.85 }]}
                >
                  <Text style={styles.cartBtnText}>Ke Keranjang</Text>
                </Pressable>
              </View>
            ) : (
              <Pressable
                onPress={() => onAdd(product, variant, 1)}
                style={({ pressed }) => [styles.addBtn, pressed && { opacity: 0.85 }]}
              >
                <Text style={styles.addBtnText}>+ Tambah ke Keranjang</Text>
              </Pressable>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
}

function Fact({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <View style={styles.fact}>
      <Text style={styles.factIcon}>{icon}</Text>
      <Text style={styles.factLabel}>{label}</Text>
      <Text style={styles.factValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  dialog: {
    width: '100%',
    maxWidth: 560,
    maxHeight: '92%',
    backgroundColor: colors.bg,
    borderRadius: radius.lg,
    overflow: 'hidden',
    boxShadow: shadow.hover,
  },

  closeBtn: {
    position: 'absolute',
    top: 14,
    right: 14,
    width: 32,
    height: 32,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(255,255,255,0.92)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: { fontSize: 15, color: colors.text, fontFamily: font.bold },
  badge: {
    position: 'absolute',
    top: 14,
    left: 14,
    backgroundColor: colors.primary,
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: radius.pill,
  },
  badgeText: {
    fontSize: 10,
    fontFamily: font.extrabold,
    letterSpacing: 0.6,
    color: '#fff',
    textTransform: 'uppercase',
  },

  content: { padding: 20, gap: 12 },
  title: { fontSize: 26, color: colors.text, fontFamily: font.displayBold },
  story: { fontFamily: font.body, fontSize: 14, lineHeight: 22, color: colors.muted },

  factRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 4 },
  fact: {
    flexGrow: 1,
    flexBasis: 140,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: 12,
    gap: 2,
  },
  factIcon: { fontFamily: font.body, fontSize: 16 },
  factLabel: {
    fontSize: 10,
    letterSpacing: 1,
    textTransform: 'uppercase',
    fontFamily: font.extrabold,
    color: colors.muted,
    marginTop: 2,
  },
  factValue: { fontSize: 13, fontFamily: font.bold, color: colors.text, lineHeight: 18 },

  sectionLabel: {
    fontSize: 11,
    letterSpacing: 1.6,
    textTransform: 'uppercase',
    fontFamily: font.extrabold,
    color: colors.accent,
    marginTop: 10,
  },
  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 7 },
  ingredientChip: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: radius.pill,
  },
  ingredientText: { fontSize: 12, color: colors.text, fontFamily: font.semibold },

  allergenBox: {
    backgroundColor: colors.cream,
    borderRadius: radius.md,
    padding: 12,
    marginTop: 6,
    gap: 3,
  },
  allergenTitle: { fontSize: 12, fontFamily: font.extrabold, color: colors.accent },
  allergenText: { fontFamily: font.body, fontSize: 12, color: colors.muted, lineHeight: 18 },

  sizeWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  sizeCard: {
    flexGrow: 1,
    flexBasis: 130,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingVertical: 12,
    paddingHorizontal: 14,
    gap: 3,
  },
  sizeCardActive: { borderColor: colors.primary, backgroundColor: colors.primarySoft },
  sizeLabel: { fontSize: 13, fontFamily: font.bold, color: colors.muted },
  sizePrice: { fontSize: 16, fontFamily: font.extrabold, color: colors.text },

  actionBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    flexWrap: 'wrap',
    padding: 16,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  actionLabel: { fontSize: 12, color: colors.muted, fontFamily: font.semibold },
  actionPrice: { fontSize: 20, fontFamily: font.extrabold, color: colors.text, marginTop: 2 },
  actionGroup: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  addBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 22,
    paddingVertical: 14,
    borderRadius: radius.pill,
  },
  addBtnText: { color: '#fff', fontFamily: font.extrabold, fontSize: 14 },
  cartBtn: {
    backgroundColor: colors.text,
    paddingHorizontal: 18,
    paddingVertical: 13,
    borderRadius: radius.pill,
  },
  cartBtnText: { color: '#fff', fontFamily: font.extrabold, fontSize: 13 },
});
