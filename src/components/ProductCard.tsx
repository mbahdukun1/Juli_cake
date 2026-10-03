import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { formatIDR, Product, Variant } from '../catalog';
import { colors, font, radius, shadow, transition } from '../theme';
import PhotoCarousel from './PhotoCarousel';
import QtyStepper from './QtyStepper';

type Props = {
  product: Product;
  width: number;
  qtyOf: (productId: string, variantLabel: string) => number;
  onAdd: (product: Product, variant: Variant, delta: number) => void;
  onOpenDetail: (product: Product, variant: Variant) => void;
};

export default function ProductCard({
  product,
  width,
  qtyOf,
  onAdd,
  onOpenDetail,
}: Props) {
  const [variant, setVariant] = useState<Variant>(product.variants[0]);
  const [hovered, setHovered] = useState(false);
  const qty = qtyOf(product.id, variant.label);

  return (
    <View
      style={[
        styles.card,
        { width },
        hovered && styles.cardHovered,
        qty > 0 && styles.cardActive,
      ]}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
    >
      <PhotoCarousel
        images={product.images}
        width={width - 2}
        height={196}
        emoji={product.emoji}
        tint={product.tint}
        tintDeep={product.tintDeep}
        hovered={hovered}
        onPress={() => onOpenDetail(product, variant)}
        accessibilityLabel={`Lihat detail ${product.name}`}
      >
        {product.badge ? (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{product.badge}</Text>
          </View>
        ) : null}

        <View style={styles.readyTag}>
          <Text style={styles.readyText}>{product.readyIn}</Text>
        </View>

        <Pressable onPress={() => onOpenDetail(product, variant)} style={styles.detailHint}>
          <Text style={styles.detailHintText}>Lihat detail →</Text>
        </Pressable>
      </PhotoCarousel>

      <View style={styles.body}>
        <Pressable onPress={() => onOpenDetail(product, variant)}>
          <Text style={styles.name} numberOfLines={1}>
            {product.name}
          </Text>
          <Text style={styles.desc} numberOfLines={2}>
            {product.description}
          </Text>
        </Pressable>

        <View style={styles.metaRow}>
          <Text style={styles.metaText} numberOfLines={1}>
            🍽️ {product.servings}
          </Text>
        </View>

        <Text style={styles.ingredients} numberOfLines={1}>
          <Text style={styles.ingredientsLabel}>Bahan: </Text>
          {product.ingredients.slice(0, 3).join(', ').toLowerCase()}…
        </Text>

        <View style={styles.divider} />

        <View style={styles.variantRow}>
          {product.variants.map((v) => {
            const active = v.label === variant.label;
            return (
              <Pressable
                key={v.label}
                onPress={() => setVariant(v)}
                style={[styles.variantChip, active && styles.variantChipActive]}
              >
                <Text style={[styles.variantText, active && styles.variantTextActive]}>
                  {v.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.footer}>
          <View style={{ flexShrink: 1 }}>
            <Text style={styles.price}>{formatIDR(variant.price)}</Text>
            <Text style={[styles.subtotal, qty === 0 && styles.subtotalIdle]}>
              {qty > 0 ? `${qty} pcs · ${formatIDR(qty * variant.price)}` : 'per item'}
            </Text>
          </View>

          {qty > 0 ? (
            <QtyStepper qty={qty} size="sm" onChange={(d) => onAdd(product, variant, d)} />
          ) : (
            <Pressable
              onPress={() => onAdd(product, variant, 1)}
              style={({ pressed }) => [styles.addBtn, pressed && { opacity: 0.75 }]}
            >
              <Text style={styles.addText}>+ Pesan</Text>
            </Pressable>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    boxShadow: shadow.card,
    ...transition('box-shadow, border-color, transform'),
  },
  cardHovered: {
    boxShadow: shadow.hover,
    borderColor: colors.primarySoft,
    transform: [{ translateY: -3 }],
  },
  cardActive: { borderColor: colors.primary },

  badge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radius.pill,
    boxShadow: shadow.soft,
  },
  badgeText: {
    fontSize: 10,
    fontFamily: font.extrabold,
    letterSpacing: 0.6,
    color: '#fff',
    textTransform: 'uppercase',
  },
  readyTag: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(255,255,255,0.92)',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: radius.pill,
  },
  readyText: { fontSize: 10, fontFamily: font.bold, color: colors.accent },
  detailHint: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    backgroundColor: 'rgba(255,255,255,0.92)',
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: radius.pill,
  },
  detailHintText: { fontSize: 11, fontFamily: font.bold, color: colors.text },

  body: { padding: 16, gap: 7 },
  name: {
    fontSize: 18,
    color: colors.text,
    fontFamily: font.displayBold,
  },
  desc: { fontFamily: font.body, fontSize: 13, lineHeight: 19, color: colors.muted, minHeight: 38, marginTop: 3 },
  metaRow: { flexDirection: 'row', gap: 8 },
  metaText: { fontSize: 11, fontFamily: font.bold, color: colors.accent },
  ingredients: { fontFamily: font.body, fontSize: 11, lineHeight: 16, color: colors.muted },
  ingredientsLabel: { fontFamily: font.bold, color: colors.text },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: 3 },

  variantRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  variantChip: {
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.bg,
  },
  variantChipActive: {
    backgroundColor: colors.primarySoft,
    borderColor: colors.primary,
  },
  variantText: { fontSize: 12, fontFamily: font.semibold, color: colors.muted },
  variantTextActive: { color: colors.primary },

  footer: {
    marginTop: 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  price: { fontSize: 18, fontFamily: font.extrabold, color: colors.text },
  subtotal: { fontSize: 11, color: colors.primary, fontFamily: font.bold, marginTop: 2 },
  subtotalIdle: { color: colors.muted, fontFamily: font.semibold },
  addBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: radius.pill,
  },
  addText: { color: '#fff', fontFamily: font.bold, fontSize: 13 },
});
