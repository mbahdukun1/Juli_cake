import { useRef, useState, type ComponentProps, type ReactNode } from 'react';
import { ActivityIndicator, Image, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { CATEGORIES, CategoryId, Product } from '../catalog';
import { removeImages, saveProduct } from '../catalogStore';
import { colors, font, radius } from '../theme';
import { useFeedback } from './feedback';
import { pickImageFiles, uploadImage } from './images';
import { IconBtn, messageOf, Shell, styles as ui } from './ui';

type Props = {
  initial: Product | null;
  sortOrder: number;
  takenIds: string[];
  onDone: (savedName: string | null) => void;
};

const TINTS: [string, string][] = [
  ['#F4DBD4', '#E3B0A2'],
  ['#EEE1E8', '#D6BCCB'],
  ['#EDE0CF', '#D2B58E'],
  ['#E7D7C8', '#C0A184'],
  ['#F5E7CD', '#DEC28B'],
  ['#F1EAD2', '#D9CB9A'],
  ['#E3EAD8', '#B9C9A2'],
  ['#DCE6EC', '#A9BFCD'],
];

type VariantDraft = { label: string; price: string };

const EMPTY: Product = {
  id: '',
  name: '',
  category: 'cake',
  description: '',
  story: '',
  emoji: '🍰',
  tint: TINTS[0][0],
  tintDeep: TINTS[0][1],
  images: [],
  active: true,
  variants: [],
  badge: '',
  servings: '',
  readyIn: 'Pesan H-1',
  leadDays: 1,
  storage: '',
  ingredients: [],
  allergens: [],
};

const slugify = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 48);

const splitList = (s: string) =>
  s
    .split(/[\n,]/)
    .map((x) => x.trim())
    .filter(Boolean);

export default function ProductEditor({ initial, sortOrder, takenIds, onDone }: Props) {
  const base = initial ?? EMPTY;
  const [p, setP] = useState<Product>(base);
  const [variants, setVariants] = useState<VariantDraft[]>(
    base.variants.length
      ? base.variants.map((v) => ({ label: v.label, price: String(v.price) }))
      : [{ label: '', price: '' }]
  );
  const [ingredients, setIngredients] = useState(base.ingredients.join('\n'));
  const [allergens, setAllergens] = useState(base.allergens.join(', '));
  const [leadDays, setLeadDays] = useState(String(base.leadDays));

  const { confirm, toast } = useFeedback();
  const [uploading, setUploading] = useState(0);
  const [saving, setSaving] = useState(false);
  const uploadedNow = useRef<string[]>([]);
  const folder = useRef(initial?.id ?? `baru-${Date.now().toString(36)}`);

  const snapshot = JSON.stringify({ p, variants, ingredients, allergens, leadDays });
  const initialSnapshot = useRef(snapshot);
  const dirty = snapshot !== initialSnapshot.current;

  const set = <K extends keyof Product>(key: K, value: Product[K]) =>
    setP((prev) => ({ ...prev, [key]: value }));

  const addPhotos = async () => {
    const files = await pickImageFiles();
    if (!files.length) return;
    setUploading((n) => n + files.length);
    let done = 0;
    for (const file of files) {
      try {
        const url = await uploadImage(file, folder.current);
        uploadedNow.current.push(url);
        setP((prev) => ({ ...prev, images: [...prev.images, url] }));
        done++;
      } catch (e) {
        toast(`Gagal unggah ${file.name}: ${messageOf(e)}`, 'error');
      } finally {
        setUploading((n) => n - 1);
      }
    }
    if (done) toast(`${done} foto ditambahkan — jangan lupa simpan`, 'info');
  };

  const moveImage = (i: number, delta: number) =>
    setP((prev) => {
      const images = [...prev.images];
      const [img] = images.splice(i, 1);
      images.splice(i + delta, 0, img);
      return { ...prev, images };
    });

  const removeImage = async (i: number) => {
    const ok = await confirm({
      title: 'Hapus foto ini?',
      message: i === 0 && p.images.length > 1 ? 'Foto berikutnya akan otomatis jadi sampul.' : undefined,
      confirmLabel: 'Hapus foto',
      tone: 'danger',
    });
    if (ok) setP((prev) => ({ ...prev, images: prev.images.filter((_, j) => j !== i) }));
  };

  const cancel = async () => {
    if (dirty || uploading) {
      const ok = await confirm({
        title: 'Buang perubahan?',
        message: 'Perubahan yang belum disimpan, termasuk foto yang baru diunggah, akan hilang.',
        confirmLabel: 'Buang',
        cancelLabel: 'Lanjut edit',
        tone: 'danger',
      });
      if (!ok) return;
    }
    await removeImages(uploadedNow.current).catch(() => {});
    onDone(null);
  };

  const invalid = (message: string) => toast(message, 'error');

  const save = async () => {
    const name = p.name.trim();
    const cleanVariants = variants
      .map((v) => ({ label: v.label.trim(), price: Number(v.price.replace(/\D/g, '')) }))
      .filter((v) => v.label || v.price);

    if (!name) return invalid('Nama menu wajib diisi.');
    if (!cleanVariants.length) return invalid('Isi minimal satu ukuran dan harga.');
    if (cleanVariants.some((v) => !v.label || !(v.price > 0)))
      return invalid('Setiap ukuran harus punya label dan harga.');
    if (new Set(cleanVariants.map((v) => v.label)).size !== cleanVariants.length)
      return invalid('Label ukuran tidak boleh kembar.');
    if (uploading) return invalid('Tunggu foto selesai diunggah.');

    let id = initial?.id ?? '';
    if (!id) {
      const root = slugify(name) || 'menu';
      id = root;
      for (let n = 2; takenIds.includes(id); n++) id = `${root}-${n}`;
    }

    const product: Product = {
      ...p,
      id,
      name,
      variants: cleanVariants,
      ingredients: splitList(ingredients),
      allergens: splitList(allergens),
      leadDays: Math.max(0, parseInt(leadDays, 10) || 0),
      badge: p.badge?.trim() || undefined,
    };

    setSaving(true);
    try {
      await saveProduct(product, sortOrder);
      const dropped = [...base.images, ...uploadedNow.current].filter(
        (u) => !product.images.includes(u)
      );
      await removeImages(dropped).catch(() => {});
      onDone(product.name);
    } catch (e) {
      toast(`Gagal menyimpan: ${messageOf(e)}`, 'error');
      setSaving(false);
    }
  };

  return (
    <Shell>
      <Pressable onPress={cancel} style={{ alignSelf: 'flex-start', marginBottom: 6 }}>
        <Text style={ui.link}>← Kembali ke daftar</Text>
      </Pressable>
      <Text style={ui.pageTitle}>{initial ? `Edit ${initial.name}` : 'Menu baru'}</Text>

      <Section title="Foto" note="Foto pertama jadi sampul kartu. Bisa pilih banyak sekaligus.">
        <View style={s.photoGrid}>
          {p.images.map((uri, i) => (
            <View key={uri} style={s.photo}>
              <Image source={{ uri }} style={s.photoImg} />
              {i === 0 ? (
                <View style={s.coverTag}>
                  <Text style={s.coverText}>Sampul</Text>
                </View>
              ) : null}
              <View style={s.photoActions}>
                <PhotoBtn label="‹" disabled={i === 0} onPress={() => moveImage(i, -1)} />
                <PhotoBtn label="✕" onPress={() => removeImage(i)} />
                <PhotoBtn
                  label="›"
                  disabled={i === p.images.length - 1}
                  onPress={() => moveImage(i, 1)}
                />
              </View>
            </View>
          ))}
          {Array.from({ length: uploading }).map((_, i) => (
            <View key={`up-${i}`} style={[s.photo, s.photoAdd]}>
              <ActivityIndicator color={colors.primary} />
            </View>
          ))}
          <Pressable
            onPress={addPhotos}
            style={({ pressed }) => [s.photo, s.photoAdd, pressed && ui.pressed]}
          >
            <Text style={s.photoAddPlus}>+</Text>
            <Text style={s.photoAddText}>Upload foto</Text>
          </Pressable>
        </View>
      </Section>

      <Section title="Info menu">
        <Field label="Nama menu">
          <Input value={p.name} onChangeText={(v) => set('name', v)} placeholder="Red Velvet Cake" />
        </Field>

        <Field label="Kategori">
          <View style={s.chipRow}>
            {CATEGORIES.map((c) => (
              <Chip
                key={c.id}
                label={`${c.emoji} ${c.label}`}
                active={p.category === c.id}
                onPress={() => set('category', c.id as CategoryId)}
              />
            ))}
          </View>
        </Field>

        <Field label="Deskripsi singkat (di kartu)">
          <Input
            value={p.description}
            onChangeText={(v) => set('description', v)}
            placeholder="Lembut, cream cheese frosting asli, tidak eneg."
          />
        </Field>

        <Field label="Cerita / caption lengkap (di halaman detail)">
          <Input
            value={p.story}
            onChangeText={(v) => set('story', v)}
            multiline
            placeholder="Ceritakan bahan, cara buat, dan tips menikmatinya."
          />
        </Field>

        <View style={s.cols}>
          <Field label="Label pojok (opsional)" flex>
            <Input
              value={p.badge ?? ''}
              onChangeText={(v) => set('badge', v)}
              placeholder="Best Seller"
            />
          </Field>
          <Field label="Emoji (kalau belum ada foto)" flex>
            <Input value={p.emoji} onChangeText={(v) => set('emoji', v)} placeholder="🍰" />
          </Field>
        </View>

        <Field label="Warna latar kartu">
          <View style={s.chipRow}>
            {TINTS.map(([tint, deep]) => (
              <Pressable
                key={tint}
                onPress={() => setP((prev) => ({ ...prev, tint, tintDeep: deep }))}
                style={[s.swatch, { backgroundColor: tint }, p.tint === tint && s.swatchActive]}
              >
                <View style={[s.swatchDot, { backgroundColor: deep }]} />
              </Pressable>
            ))}
          </View>
        </Field>
      </Section>

      <Section title="Ukuran & harga" note="Pembeli memilih salah satu ukuran ini.">
        {variants.map((v, i) => (
          <View key={i} style={s.variantRow}>
            <Input
              value={v.label}
              onChangeText={(label) =>
                setVariants((vs) => vs.map((x, j) => (j === i ? { ...x, label } : x)))
              }
              placeholder="20 cm / Box isi 6"
              style={{ flex: 1.3 }}
            />
            <View style={[s.priceWrap, { flex: 1 }]}>
              <Text style={s.pricePrefix}>Rp</Text>
              <Input
                value={v.price ? Number(v.price.replace(/\D/g, '') || 0).toLocaleString('id-ID') : ''}
                onChangeText={(price) =>
                  setVariants((vs) =>
                    vs.map((x, j) => (j === i ? { ...x, price: price.replace(/\D/g, '') } : x))
                  )
                }
                placeholder="185.000"
                keyboardType="numeric"
                style={s.priceInput}
              />
            </View>
            <IconBtn
              label="✕"
              disabled={variants.length === 1}
              onPress={() => setVariants((vs) => vs.filter((_, j) => j !== i))}
            />
          </View>
        ))}
        <Pressable
          onPress={() => setVariants((vs) => [...vs, { label: '', price: '' }])}
          style={({ pressed }) => [ui.btnGhost, pressed && ui.pressed]}
        >
          <Text style={ui.btnGhostText}>+ Tambah ukuran</Text>
        </Pressable>
      </Section>

      <Section title="Detail pesanan">
        <View style={s.cols}>
          <Field label="Porsi" flex>
            <Input
              value={p.servings}
              onChangeText={(v) => set('servings', v)}
              placeholder="8–10 potong"
            />
          </Field>
          <Field label="Penyimpanan" flex>
            <Input
              value={p.storage}
              onChangeText={(v) => set('storage', v)}
              placeholder="Chiller, tahan 3 hari"
            />
          </Field>
        </View>
        <View style={s.cols}>
          <Field label="Label waktu siap" flex>
            <Input
              value={p.readyIn}
              onChangeText={(v) => set('readyIn', v)}
              placeholder="Pesan H-1 / Ready stock"
            />
          </Field>
          <Field label="Minimal pesan H-berapa (0 = bisa hari ini)" flex>
            <Input
              value={leadDays}
              onChangeText={(v) => setLeadDays(v.replace(/\D/g, ''))}
              keyboardType="numeric"
              placeholder="1"
            />
          </Field>
        </View>
      </Section>

      <Section title="Bahan & alergen">
        <Field label="Bahan-bahan (satu per baris)">
          <Input
            value={ingredients}
            onChangeText={setIngredients}
            multiline
            placeholder={'Tepung terigu\nButter asli\nTelur'}
          />
        </Field>
        <Field label="Alergen (pisahkan dengan koma)">
          <Input value={allergens} onChangeText={setAllergens} placeholder="Gluten, Telur, Susu" />
        </Field>
      </Section>

      <Section title="Tampilkan di website">
        <Pressable onPress={() => set('active', !p.active)} style={s.toggleRow}>
          <View style={[s.toggle, p.active && s.toggleOn]}>
            <View style={[s.knob, p.active && s.knobOn]} />
          </View>
          <Text style={s.toggleText}>
            {p.active ? 'Tampil ke pembeli' : 'Disembunyikan (draft)'}
          </Text>
        </Pressable>
      </Section>


      <View style={s.saveBar}>
        <Pressable onPress={cancel} style={({ pressed }) => [ui.btnGhost, pressed && ui.pressed]}>
          <Text style={ui.btnGhostText}>Batal</Text>
        </Pressable>
        <Pressable
          onPress={save}
          disabled={saving}
          style={({ pressed }) => [ui.btnPrimary, (pressed || saving) && ui.pressed]}
        >
          <Text style={ui.btnPrimaryText}>{saving ? 'Menyimpan…' : 'Simpan menu'}</Text>
        </Pressable>
      </View>
    </Shell>
  );
}

function Section({ title, note, children }: { title: string; note?: string; children: ReactNode }) {
  return (
    <View style={s.section}>
      <Text style={s.sectionTitle}>{title}</Text>
      {note ? <Text style={[ui.muted, { fontSize: 13 }]}>{note}</Text> : null}
      <View style={{ gap: 14, marginTop: 8 }}>{children}</View>
    </View>
  );
}

function Field({ label, flex, children }: { label: string; flex?: boolean; children: ReactNode }) {
  return (
    <View style={[{ gap: 6 }, flex && { flex: 1, minWidth: 220 }]}>
      <Text style={s.label}>{label}</Text>
      {children}
    </View>
  );
}

function Input(props: ComponentProps<typeof TextInput>) {
  return (
    <TextInput
      placeholderTextColor={colors.faint}
      {...props}
      style={[ui.input, props.multiline && s.multiline, props.style]}
    />
  );
}

function Chip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={[s.chip, active && s.chipActive]}>
      <Text style={[s.chipText, active && { color: '#fff' }]}>{label}</Text>
    </Pressable>
  );
}

function PhotoBtn({ label, onPress, disabled }: { label: string; onPress: () => void; disabled?: boolean }) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [s.photoBtn, (pressed || disabled) && { opacity: 0.4 }]}
    >
      <Text style={s.photoBtnText}>{label}</Text>
    </Pressable>
  );
}

const s = StyleSheet.create({
  section: {
    marginTop: 18,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 18,
    gap: 4,
  },
  sectionTitle: { fontFamily: font.displayBold, fontSize: 18, color: colors.ink },
  label: { fontFamily: font.bold, fontSize: 12, color: colors.muted },
  multiline: { minHeight: 110, textAlignVertical: 'top' },
  cols: { flexDirection: 'row', flexWrap: 'wrap', gap: 14 },

  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.bg,
  },
  chipActive: { backgroundColor: colors.ink, borderColor: colors.ink },
  chipText: { fontFamily: font.bold, fontSize: 13, color: colors.muted },

  swatch: {
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    borderWidth: 2,
    borderColor: 'transparent',
    alignItems: 'flex-end',
    justifyContent: 'flex-start',
    overflow: 'hidden',
  },
  swatchActive: { borderColor: colors.ink },
  swatchDot: { width: 18, height: 18, borderRadius: radius.pill, marginTop: -3, marginRight: -3 },

  photoGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  photo: {
    width: 128,
    height: 128,
    borderRadius: radius.sm,
    overflow: 'hidden',
    backgroundColor: colors.cream,
  },
  photoImg: { width: '100%', height: '100%' },
  coverTag: {
    position: 'absolute',
    top: 6,
    left: 6,
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  coverText: { color: '#fff', fontFamily: font.extrabold, fontSize: 10 },
  photoActions: {
    position: 'absolute',
    bottom: 6,
    left: 6,
    right: 6,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  photoBtn: {
    width: 28,
    height: 28,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(255,255,255,0.92)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoBtnText: { fontFamily: font.bold, fontSize: 14, color: colors.ink },
  photoAdd: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: colors.borderStrong,
    backgroundColor: colors.bg,
  },
  photoAddPlus: { fontFamily: font.body, fontSize: 28, color: colors.muted },
  photoAddText: { fontFamily: font.bold, fontSize: 12, color: colors.muted },

  variantRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  priceWrap: { flexDirection: 'row', alignItems: 'center' },
  pricePrefix: {
    position: 'absolute',
    left: 14,
    zIndex: 1,
    fontFamily: font.bold,
    fontSize: 14,
    color: colors.muted,
  },
  priceInput: { flex: 1, paddingLeft: 40 },

  toggleRow: { flexDirection: 'row', alignItems: 'center', gap: 12, alignSelf: 'flex-start' },
  toggle: {
    width: 46,
    height: 26,
    borderRadius: radius.pill,
    backgroundColor: colors.borderStrong,
    padding: 3,
  },
  toggleOn: { backgroundColor: colors.success },
  knob: { width: 20, height: 20, borderRadius: radius.pill, backgroundColor: '#fff' },
  knobOn: { transform: [{ translateX: 20 }] },
  toggleText: { fontFamily: font.bold, fontSize: 14, color: colors.ink },

  saveBar: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 12, marginTop: 22 },
});
