import { useMemo, useState, type ComponentProps } from 'react';
import {
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { formatIDR, Product, Variant } from '../catalog';
import { addDays, dateKey, formatFull, today } from '../dates';
import { colors, font, radius, shadow } from '../theme';
import type { CartLine } from '../useCart';
import { openWhatsAppOrder, OrderForm } from '../whatsapp';
import DatePicker from './DatePicker';
import QtyStepper from './QtyStepper';

type Props = {
  visible: boolean;
  items: CartLine[];
  total: number;
  onClose: () => void;
  onChangeQty: (product: Product, variant: Variant, delta: number) => void;
  onSent: () => void;
};

export default function CartSheet({
  visible,
  items,
  total,
  onClose,
  onChangeQty,
  onSent,
}: Props) {
  const [name, setName] = useState('');
  const [note, setNote] = useState('');
  const [pickedDate, setPickedDate] = useState<Date | null>(null);

  const leadDays = items.reduce((max, l) => Math.max(max, l.product.leadDays), 0);
  const earliest = useMemo(() => addDays(today(), leadDays), [leadDays]);

  const date =
    pickedDate && dateKey(pickedDate) >= dateKey(earliest) ? pickedDate : earliest;

  const slowest = items.reduce<CartLine | null>(
    (found, l) => (!found || l.product.leadDays > found.product.leadDays ? l : found),
    null
  );

  const send = () => {
    if (!items.length) return;
    const form: OrderForm = { name, date: formatFull(date), note };
    openWhatsAppOrder(items, total, form);
    onSent();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />

        <View style={styles.sheet}>
          <View style={styles.handle} />

          <View style={styles.head}>
            <Text style={styles.title}>Keranjang Pesanan</Text>
            <Pressable onPress={onClose} hitSlop={10}>
              <Text style={styles.close}>✕</Text>
            </Pressable>
          </View>

          <ScrollView
            style={{ maxHeight: 380 }}
            contentContainerStyle={{ paddingBottom: 8 }}
            keyboardShouldPersistTaps="handled"
          >
            {items.length === 0 ? (
              <Text style={styles.empty}>
                Keranjang masih kosong. Pilih kue favoritmu dulu ya 🧁
              </Text>
            ) : (
              items.map((l) => (
                <View key={l.key} style={styles.line}>
                  <View style={[styles.lineThumb, { backgroundColor: l.product.tint }]}>
                    {l.product.images[0] ? (
                      <Image source={{ uri: l.product.images[0] }} style={styles.lineImage} />
                    ) : (
                      <Text style={{ fontSize: 22 }}>{l.product.emoji}</Text>
                    )}
                  </View>

                  <View style={{ flex: 1 }}>
                    <Text style={styles.lineName} numberOfLines={1}>
                      {l.product.name}
                    </Text>
                    <Text style={styles.lineMeta}>
                      {l.variant.label} · {formatIDR(l.variant.price)}
                    </Text>
                    <Text style={styles.lineSubtotal}>
                      {formatIDR(l.qty * l.variant.price)}
                    </Text>
                  </View>

                  <QtyStepper
                    qty={l.qty}
                    size="sm"
                    onChange={(d) => onChangeQty(l.product, l.variant, d)}
                  />
                </View>
              ))
            )}

            {items.length > 0 ? (
              <View style={styles.form}>
                <Field
                  label="Nama pemesan"
                  placeholder="mis. Dicky"
                  value={name}
                  onChangeText={setName}
                />

                <View style={{ gap: 8 }}>
                  <Text style={styles.fieldLabel}>Tanggal ambil / kirim</Text>
                  <DatePicker earliest={earliest} selected={date} onSelect={setPickedDate} />
                  {leadDays > 0 && slowest ? (
                    <Text style={styles.leadNote}>
                      Paling cepat {formatFull(earliest)} — {slowest.product.name} butuh{' '}
                      {leadDays} hari persiapan.
                    </Text>
                  ) : (
                    <Text style={styles.leadNote}>
                      Semua item ready stock, bisa diambil hari ini.
                    </Text>
                  )}
                </View>

                <Field
                  label="Catatan (opsional)"
                  placeholder="Tulisan di kue, alamat antar, dll."
                  value={note}
                  onChangeText={setNote}
                  multiline
                />
              </View>
            ) : null}
          </ScrollView>

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>{formatIDR(total)}</Text>
          </View>

          <Pressable
            disabled={items.length === 0}
            onPress={send}
            style={({ pressed }) => [
              styles.waBtn,
              items.length === 0 && { opacity: 0.4 },
              pressed && { opacity: 0.85 },
            ]}
          >
            <Text style={styles.waText}>Kirim Pesanan via WhatsApp</Text>
          </Pressable>

          <Text style={styles.note}>
            Pesanan akan terbuka di WhatsApp dengan rincian yang sudah terisi otomatis.
          </Text>
        </View>
      </View>
    </Modal>
  );
}

function Field({
  label,
  ...input
}: { label: string } & ComponentProps<typeof TextInput>) {
  return (
    <View style={{ gap: 6 }}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        placeholderTextColor={colors.muted}
        {...input}
        style={[styles.input, input.multiline && { height: 70, paddingTop: 10 }]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: colors.overlay, justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: colors.bg,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 20,
    paddingBottom: 28,
    gap: 12,
    width: '100%',
    maxWidth: 560,
    alignSelf: 'center',
    boxShadow: shadow.lifted,
  },
  handle: {
    width: 44,
    height: 5,
    borderRadius: radius.pill,
    backgroundColor: colors.border,
    alignSelf: 'center',
  },
  head: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: { fontSize: 20, color: colors.text, fontFamily: font.displayBold },
  close: { fontFamily: font.body, fontSize: 18, color: colors.muted, paddingHorizontal: 6 },
  empty: { fontFamily: font.body, textAlign: 'center', color: colors.muted, paddingVertical: 28, fontSize: 14 },
  line: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  lineThumb: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  lineImage: { width: '100%', height: '100%' },
  lineName: { fontSize: 14, fontFamily: font.bold, color: colors.text },
  lineMeta: { fontFamily: font.body, fontSize: 12, color: colors.muted, marginTop: 1 },
  lineSubtotal: { fontSize: 13, fontFamily: font.bold, color: colors.primary, marginTop: 3 },
  form: { gap: 12, paddingTop: 16 },
  fieldLabel: { fontSize: 12, fontFamily: font.bold, color: colors.muted },
  leadNote: { fontSize: 11, lineHeight: 16, color: colors.accent, fontFamily: font.medium },
  input: {
    fontFamily: font.body,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    paddingHorizontal: 12,
    height: 42,
    fontSize: 14,
    color: colors.text,
    textAlignVertical: 'top',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  totalLabel: { fontSize: 14, color: colors.muted, fontFamily: font.semibold },
  totalValue: { fontSize: 22, fontFamily: font.extrabold, color: colors.text },
  waBtn: {
    backgroundColor: colors.whatsapp,
    paddingVertical: 15,
    borderRadius: radius.pill,
    alignItems: 'center',
  },
  waText: { color: '#fff', fontFamily: font.extrabold, fontSize: 15 },
  note: { fontFamily: font.body, fontSize: 11, color: colors.muted, textAlign: 'center' },
});
