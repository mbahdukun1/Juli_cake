import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Image, Pressable, Text, TextInput, View } from 'react-native';
import type { Session } from '@supabase/supabase-js';
import { CATEGORIES, formatIDR, Product, PRODUCTS } from '../catalog';
import { deleteProduct, fetchProducts, IS_DEMO, saveOrder, saveProduct } from '../catalogStore';
import { ADMIN_EMAIL, supabase } from '../supabase';
import { colors } from '../theme';
import { FeedbackProvider, useFeedback } from './feedback';
import ProductEditor from './ProductEditor';
import { Centered, IconBtn, messageOf, Shell, styles } from './ui';
import Logo from '../components/Logo';

export default function Dashboard() {
  const [session, setSession] = useState<Session | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    document.title = 'Dashboard · Juli Cake';
    const robots = document.createElement('meta');
    robots.name = 'robots';
    robots.content = 'noindex, nofollow';
    document.head.appendChild(robots);

    if (!supabase) {
      setChecking(false);
      return;
    }
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setChecking(false);
    });
    const { data } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => data.subscription.unsubscribe();
  }, []);

  return (
    <FeedbackProvider>
      {!supabase || session ? (
        <AdminHome />
      ) : checking ? (
        <Centered>
          <ActivityIndicator color={colors.primary} />
        </Centered>
      ) : (
        <Login />
      )}
    </FeedbackProvider>
  );
}

function Login() {
  const [email, setEmail] = useState(ADMIN_EMAIL);
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const submit = async () => {
    if (!supabase || !password) return;
    setBusy(true);
    setError('');
    const { error: err } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    setBusy(false);
    if (err) setError('Password salah atau akun admin belum dibuat.');
  };

  return (
    <Centered>
      <View style={styles.loginCard}>
        <Logo height={64} />
        <Text style={styles.loginTitle}>Masuk ke dashboard</Text>
        <Text style={styles.muted}>Masuk untuk mengatur menu, foto, dan harga.</Text>

        {!ADMIN_EMAIL ? (
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="Email admin"
            placeholderTextColor={colors.faint}
            autoCapitalize="none"
            style={styles.input}
          />
        ) : null}
        <TextInput
          value={password}
          onChangeText={setPassword}
          onSubmitEditing={submit}
          placeholder="Password"
          placeholderTextColor={colors.faint}
          secureTextEntry
          autoFocus
          style={styles.input}
        />
        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Pressable
          onPress={submit}
          disabled={busy}
          style={({ pressed }) => [styles.btnPrimary, (pressed || busy) && styles.pressed]}
        >
          <Text style={styles.btnPrimaryText}>{busy ? 'Masuk…' : 'Masuk'}</Text>
        </Pressable>
      </View>
    </Centered>
  );
}

function AdminHome() {
  const { confirm, toast } = useFeedback();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [editing, setEditing] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setProducts(await fetchProducts(false));
    } catch (e) {
      toast(`Gagal memuat menu: ${messageOf(e)}`, 'error');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    load();
  }, [load]);

  const run = async (id: string, task: () => Promise<void>, success?: string) => {
    setBusyId(id);
    try {
      await task();
      await load();
      if (success) toast(success);
    } catch (e) {
      toast(messageOf(e), 'error');
      await load();
    } finally {
      setBusyId(null);
    }
  };

  const remove = async (p: Product) => {
    const ok = await confirm({
      title: `Hapus ${p.name}?`,
      message: `Menu ini dan ${p.images.length} fotonya akan dihapus permanen dari website. Tindakan ini tidak bisa dibatalkan.`,
      confirmLabel: 'Ya, hapus',
      tone: 'danger',
    });
    if (ok) run(p.id, () => deleteProduct(p), `${p.name} dihapus`);
  };

  const toggle = (p: Product, index: number) =>
    run(
      p.id,
      () => saveProduct({ ...p, active: !p.active }, index),
      p.active ? `${p.name} disembunyikan dari website` : `${p.name} tampil lagi di website`
    );

  const move = (index: number, delta: number) => {
    const next = [...products];
    const [item] = next.splice(index, 1);
    next.splice(index + delta, 0, item);
    setProducts(next);
    run(item.id, () => saveOrder(next));
  };

  if (editing) {
    const index = products.findIndex((p) => p.id === editing);
    return (
      <ProductEditor
        initial={index >= 0 ? products[index] : null}
        sortOrder={index >= 0 ? index : products.length}
        takenIds={products.map((p) => p.id)}
        onDone={(saved) => {
          setEditing(null);
          if (saved) {
            toast(`${saved} disimpan`);
            load();
          }
        }}
      />
    );
  }

  return (
    <Shell
      right={
        <Pressable
          onPress={() => setEditing('new')}
          style={({ pressed }) => [styles.btnPrimary, pressed && styles.pressed]}
        >
          <Text style={styles.btnPrimaryText}>+ Menu baru</Text>
        </Pressable>
      }
    >
      <Text style={styles.pageTitle}>Menu</Text>
      <Text style={styles.muted}>
        Urutan di sini = urutan di website. Menu yang disembunyikan tidak tampil ke pembeli.
      </Text>

      {IS_DEMO ? <DemoBanner /> : null}

      {loading && !products.length ? (
        <ActivityIndicator color={colors.primary} style={{ marginTop: 40 }} />
      ) : products.length === 0 ? (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyTitle}>Belum ada menu di database</Text>
          <Text style={styles.muted}>
            Mulai dari nol dengan "+ Menu baru", atau import {PRODUCTS.length} menu contoh lalu
            tinggal ganti foto dan harganya.
          </Text>
          <Pressable
            onPress={() =>
              run('seed', () => saveOrder(PRODUCTS), `${PRODUCTS.length} menu contoh berhasil diimport`)
            }
            disabled={busyId === 'seed'}
            style={({ pressed }) => [styles.btnGhost, pressed && styles.pressed]}
          >
            <Text style={styles.btnGhostText}>
              {busyId === 'seed' ? 'Mengimport…' : 'Import menu contoh'}
            </Text>
          </Pressable>
        </View>
      ) : (
        <View style={styles.list}>
          {products.map((p, i) => {
            const prices = p.variants.map((v) => v.price);
            const busy = busyId === p.id;
            return (
              <View key={p.id} style={[styles.row, !p.active && styles.rowHidden, busy && styles.pressed]}>
                <View style={[styles.thumb, { backgroundColor: p.tint }]}>
                  {p.images[0] ? (
                    <Image source={{ uri: p.images[0] }} style={styles.thumbImg} />
                  ) : (
                    <Text style={{ fontSize: 26 }}>{p.emoji}</Text>
                  )}
                </View>

                <Pressable onPress={() => setEditing(p.id)} style={styles.rowInfo}>
                  <Text style={styles.rowName} numberOfLines={1}>
                    {p.name}
                  </Text>
                  <Text style={styles.rowMeta} numberOfLines={1}>
                    {CATEGORIES.find((c) => c.id === p.category)?.label ?? p.category} ·{' '}
                    {prices.length
                      ? Math.min(...prices) === Math.max(...prices)
                        ? formatIDR(prices[0])
                        : `${formatIDR(Math.min(...prices))} – ${formatIDR(Math.max(...prices))}`
                      : 'belum ada harga'}{' '}
                    · {p.images.length} foto
                  </Text>
                </Pressable>

                <View style={styles.rowActions}>
                  <Pressable
                    onPress={() => toggle(p, i)}
                    style={[styles.pill, p.active ? styles.pillOn : styles.pillOff]}
                  >
                    <Text style={[styles.pillText, p.active && { color: colors.success }]}>
                      {p.active ? '● Tampil' : '○ Disembunyikan'}
                    </Text>
                  </Pressable>
                  <IconBtn label="↑" disabled={i === 0 || !!busyId} onPress={() => move(i, -1)} />
                  <IconBtn
                    label="↓"
                    disabled={i === products.length - 1 || !!busyId}
                    onPress={() => move(i, 1)}
                  />
                  <IconBtn label="Edit" onPress={() => setEditing(p.id)} />
                  <IconBtn
                    label="Hapus"
                    danger
                    disabled={!!busyId}
                    onPress={() => remove(p)}
                  />
                </View>
              </View>
            );
          })}
        </View>
      )}
    </Shell>
  );
}

function DemoBanner() {
  const [open, setOpen] = useState(false);
  return (
    <View style={styles.demo}>
      <Text style={styles.demoTitle}>Mode demo</Text>
      <Text style={styles.demoText}>
        Supabase belum disetel, jadi data di halaman ini dummy. Silakan coba tambah, edit, upload
        foto, dan hapus — semua perubahan hilang saat halaman di-refresh dan tidak tampil ke
        pembeli.
      </Text>
      <Pressable onPress={() => setOpen(!open)}>
        <Text style={styles.demoLink}>{open ? 'Tutup langkah setup' : 'Cara mengaktifkan →'}</Text>
      </Pressable>
      {open ? (
      <View style={styles.steps}>
        {[
          'Buat project gratis di supabase.com.',
          'Buka SQL Editor, jalankan isi file supabase/schema.sql.',
          'Authentication → Users → Add user: buat 1 akun admin (email + password). Lalu matikan "Allow new users to sign up" di Authentication → Sign In / Providers.',
          'Salin .env.example jadi .env.local dan isi URL, anon key, dan email admin (Project Settings → API).',
          'Jalankan ulang `npx expo start --web`. Di Vercel, isi variabel yang sama di Project Settings → Environment Variables.',
        ].map((s, i) => (
          <Text key={i} style={styles.step}>
            {i + 1}. {s}
          </Text>
        ))}
      </View>
      ) : null}
    </View>
  );
}

