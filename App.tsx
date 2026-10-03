import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Image,
  Linking,
  NativeSyntheticEvent,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  type LayoutChangeEvent,
  type NativeScrollEvent,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import { Fraunces_600SemiBold, Fraunces_700Bold } from '@expo-google-fonts/fraunces';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  Inter_800ExtraBold,
} from '@expo-google-fonts/inter';

import Dashboard from './src/admin/Dashboard';
import CartSheet from './src/components/CartSheet';
import ProductCard from './src/components/ProductCard';
import Logo from './src/components/Logo';
import ProductDetail from './src/components/ProductDetail';
import { CATEGORIES, CategoryId, formatIDR, Product, Variant } from './src/catalog';
import { useCatalog } from './src/catalogStore';
import { BRAND, FAQ, HIGHLIGHTS, STEPS } from './src/config';
import { colors, font, kicker, radius, shadow, space, transition } from './src/theme';
import { useCart } from './src/useCart';
import { useViewportWidth } from './src/useViewportWidth';
import { applyFavicon, applyWebMeta } from './src/webMeta';
import { openWhatsAppChat } from './src/whatsapp';

const MAX_WIDTH = 1180;
const PAD = 20;
const GAP = 20;
const HEADER_TALL = 76;
const HEADER_SHORT = 62;

type SectionKey = 'katalog' | 'cara' | 'faq';

const COLLAGE_SPOTS = [
  { width: 200, height: 240, top: 0, right: 0, transform: [{ rotate: '5deg' }] },
  { width: 170, height: 200, top: 50, left: 10, transform: [{ rotate: '-7deg' }] },
  { width: 140, height: 140, bottom: 0, right: 40, transform: [{ rotate: '-2deg' }] },
];

const IS_DASHBOARD =
  typeof window !== 'undefined' &&
  window.location.pathname.replace(/\/+$/, '').toLowerCase() === '/dashboard';

export default function App() {
  const [fontsLoaded] = useFonts({
    Fraunces_600SemiBold,
    Fraunces_700Bold,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    Inter_800ExtraBold,
  });

  useEffect(applyFavicon, []);

  if (!fontsLoaded) {
    return (
      <View style={styles.splash}>
        <Logo height={72} />
      </View>
    );
  }

  return IS_DASHBOARD ? <Dashboard /> : <Storefront />;
}

function Storefront() {
  useEffect(applyWebMeta, []);

  const catalog = useCatalog();
  const PRODUCTS = catalog.products;
  const cart = useCart(PRODUCTS, catalog.ready);
  const measured = useViewportWidth();
  const width = measured > 0 ? measured : 1024;

  const [category, setCategory] = useState<CategoryId | 'all'>('all');
  const [query, setQuery] = useState('');
  const [cartOpen, setCartOpen] = useState(false);
  const [detail, setDetail] = useState<{ product: Product; variant: Variant } | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const scrollRef = useRef<ScrollView>(null);
  const sectionY = useRef<Record<SectionKey, number>>({ katalog: 0, cara: 0, faq: 0 });

  const wide = width >= 940;
  const mid = width >= 640;
  const content = Math.min(width, MAX_WIDTH) - PAD * 2;
  const columns = wide ? 3 : mid ? 2 : 1;
  const cardWidth = (content - GAP * (columns - 1)) / columns;

  const collage = useMemo(() => {
    const withPhoto = PRODUCTS.filter((p) => p.images.length);
    return (withPhoto.length >= 3 ? withPhoto : PRODUCTS).slice(0, 3);
  }, [PRODUCTS]);

  const featured: Product | undefined =
    PRODUCTS.find((p) => p.badge === 'Best Seller') ?? PRODUCTS[0];

  const products = useMemo(() => {
    const q = query.trim().toLowerCase();
    return PRODUCTS.filter((p) => {
      const byCat = category === 'all' || p.category === category;
      const byQuery =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.ingredients.some((i) => i.toLowerCase().includes(q));
      return byCat && byQuery;
    });
  }, [PRODUCTS, category, query]);

  const markSection = (key: SectionKey) => (e: LayoutChangeEvent) => {
    sectionY.current[key] = e.nativeEvent.layout.y;
  };

  const goTo = (key: SectionKey) =>
    scrollRef.current?.scrollTo({
      y: Math.max(sectionY.current[key] - HEADER_SHORT - 8, 0),
      animated: true,
    });

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) =>
    setScrolled(e.nativeEvent.contentOffset.y > 12);

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar style="dark" />

      <ScrollView
        ref={scrollRef}
        onScroll={onScroll}
        scrollEventThrottle={16}
        contentContainerStyle={{ paddingTop: HEADER_TALL }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.heroBand}>
          <View style={[styles.container, wide && styles.heroRow]}>
            <View style={[styles.heroCopy, wide && { flex: 1, paddingRight: 40 }]}>
              <Text style={styles.heroKicker}>Jakarta · Dapur rumahan</Text>
              <Text
                style={[
                  styles.heroTitle,
                  !wide && { fontSize: mid ? 40 : 33, lineHeight: mid ? 48 : 40 },
                ]}
              >
                {BRAND.headline}
              </Text>
              <Text style={styles.heroText}>{BRAND.description}</Text>

              <View style={styles.heroActions}>
                <Pressable
                  onPress={() => goTo('katalog')}
                  style={({ pressed }) => [styles.btnPrimary, pressed && styles.pressed]}
                >
                  <Text style={styles.btnPrimaryText}>Lihat katalog</Text>
                </Pressable>
                <Pressable
                  onPress={() => openWhatsAppChat()}
                  style={({ pressed }) => [styles.btnGhost, pressed && styles.pressed]}
                >
                  <Text style={styles.btnGhostText}>Tanya dulu via WhatsApp</Text>
                </Pressable>
              </View>

              <View style={styles.statRow}>
                {BRAND.stats.map((s, i) => (
                  <View key={s.label} style={[styles.stat, i > 0 && styles.statDivider]}>
                    <Text style={styles.statValue}>{s.value}</Text>
                    <Text style={styles.statLabel}>{s.label}</Text>
                  </View>
                ))}
              </View>
            </View>

            {featured ? (
              <View style={[styles.heroArt, wide ? { width: 400 } : { marginTop: 40 }]}>
                <View style={[styles.artPanel, { backgroundColor: featured.tint }]}>
                  <View style={[styles.artBlob, { backgroundColor: featured.tintDeep }]} />
                  {featured.images[0] ? (
                    <Image
                      source={{ uri: featured.images[0] }}
                      style={StyleSheet.absoluteFill}
                      resizeMode="cover"
                    />
                  ) : (
                    <Text style={styles.artEmoji}>{featured.emoji}</Text>
                  )}
                  <View style={styles.artTag}>
                    <Text style={styles.artTagText}>🔥 Baru keluar oven</Text>
                  </View>
                </View>

                <Pressable
                  onPress={() => setDetail({ product: featured, variant: featured.variants[0] })}
                  style={({ pressed }) => [styles.artCard, pressed && styles.pressed]}
                >
                  <View style={[styles.artCardIcon, { backgroundColor: featured.tint }]}>
                    {featured.images[0] ? (
                      <Image
                        source={{ uri: featured.images[0] }}
                        style={StyleSheet.absoluteFill}
                        resizeMode="cover"
                      />
                    ) : (
                      <Text style={{ fontSize: 22 }}>{featured.emoji}</Text>
                    )}
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.artCardKicker}>Paling sering dipesan</Text>
                    <Text style={styles.artCardName} numberOfLines={1}>
                      {featured.name}
                    </Text>
                  </View>
                  {featured.variants[0] ? (
                    <Text style={styles.artCardPrice}>
                      {formatIDR(featured.variants[0].price)}
                    </Text>
                  ) : null}
                </Pressable>
              </View>
            ) : null}
          </View>
        </View>

        <View style={styles.container}>
          <View style={styles.strip}>
            {HIGHLIGHTS.map((h, i) => (
              <View
                key={h.title}
                style={[
                  styles.stripItem,
                  { flexBasis: wide ? 0 : mid ? '46%' : '100%' },
                  wide && i > 0 && styles.stripDivider,
                ]}
              >
                <Text style={styles.stripIcon}>{h.icon}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.stripTitle}>{h.title}</Text>
                  <Text style={styles.stripText}>{h.text}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        <View onLayout={markSection('katalog')} style={styles.container}>
          <SectionHead
            title="Semua yang kami panggang"
            note={`${products.length} dari ${PRODUCTS.length} menu`}
            wide={wide}
          />

          <View style={[styles.toolbar, wide && { flexDirection: 'row', alignItems: 'center' }]}>
            <View style={[styles.searchWrap, wide && { width: 290 }]}>
              <Text style={styles.searchIcon}>🔍</Text>
              <TextInput
                value={query}
                onChangeText={setQuery}
                placeholder="Cari kue atau bahan…"
                placeholderTextColor={colors.faint}
                style={styles.searchInput}
              />
              {query.length > 0 ? (
                <Pressable onPress={() => setQuery('')} hitSlop={8}>
                  <Text style={styles.searchClear}>✕</Text>
                </Pressable>
              ) : null}
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.chipRow}
            >
              <Chip
                label="Semua"
                emoji="🍽️"
                active={category === 'all'}
                onPress={() => setCategory('all')}
              />
              {CATEGORIES.map((c) => (
                <Chip
                  key={c.id}
                  label={c.label}
                  emoji={c.emoji}
                  active={category === c.id}
                  onPress={() => setCategory(c.id)}
                />
              ))}
            </ScrollView>
          </View>

          <View style={[styles.grid, { gap: GAP }]}>
            {products.map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                width={cardWidth}
                qtyOf={cart.qtyOf}
                onAdd={cart.add}
                onOpenDetail={(product, variant) => setDetail({ product, variant })}
              />
            ))}
          </View>

          {!catalog.ready ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>Memuat menu…</Text>
            </View>
          ) : products.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyEmoji}>🍽️</Text>
              <Text style={styles.emptyTitle}>Belum ada yang cocok</Text>
              <Text style={styles.emptyText}>
                Coba kata kunci lain, atau reset filternya.
              </Text>
              <Pressable
                onPress={() => {
                  setQuery('');
                  setCategory('all');
                }}
                style={({ pressed }) => [styles.btnGhost, pressed && styles.pressed]}
              >
                <Text style={styles.btnGhostText}>Reset filter</Text>
              </Pressable>
            </View>
          ) : null}
        </View>

        <View onLayout={markSection('cara')} style={styles.band}>
          <View style={styles.container}>
            <SectionHead title="Cara pesan" wide={wide} />

            <View style={[styles.stepRow, !wide && { flexDirection: 'column', gap: 28 }]}>
              {wide ? <View style={styles.stepLine} /> : null}
              {STEPS.map((s, i) => (
                <View key={s.title} style={[styles.step, !wide && styles.stepMobile]}>
                  <View style={styles.stepNo}>
                    <Text style={styles.stepNoText}>{i + 1}</Text>
                  </View>
                  <View style={!wide ? { flex: 1 } : undefined}>
                    <Text style={styles.stepTitle}>{s.title}</Text>
                    <Text style={styles.stepText}>{s.text}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        </View>

        <View onLayout={markSection('faq')} style={styles.container}>
          <SectionHead
            title="Yang sering ditanyakan"
            wide={wide}
          />

          <View style={styles.faqList}>
            {FAQ.map((item, i) => {
              const open = openFaq === i;
              return (
                <Pressable
                  key={item.q}
                  onPress={() => setOpenFaq(open ? null : i)}
                  style={[styles.faqItem, open && styles.faqItemOpen]}
                >
                  <View style={styles.faqHead}>
                    <Text style={[styles.faqQ, open && { color: colors.primary }]}>
                      {item.q}
                    </Text>
                    <Text style={[styles.faqSign, open && { color: colors.primary }]}>
                      {open ? '−' : '+'}
                    </Text>
                  </View>
                  {open ? <Text style={styles.faqA}>{item.a}</Text> : null}
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={styles.container}>
          <View style={[styles.cta, wide && styles.ctaRow, !mid && { padding: 26 }]}>
            <View style={[styles.ctaGlow, styles.ctaGlowWarm]} />
            <View style={[styles.ctaGlow, styles.ctaGlowGold]} />

            <View style={[styles.ctaCopy, wide && { flex: 1 }]}>
              <View style={styles.ctaPill}>
                <Text style={styles.ctaPillText}>✨ Custom order</Text>
              </View>
              <Text style={[styles.ctaTitle, !mid && { fontSize: 28, lineHeight: 36 }]}>
                Kue custom untuk hari spesial, bisa kami buatkan.
              </Text>
              <Text style={styles.ctaText}>
                Ceritakan acaranya — ulang tahun, lamaran, atau syukuran. Kami bantu pilih rasa,
                ukuran, dan dekorasi yang pas dengan budget.
              </Text>

              <View style={styles.ctaPerks}>
                {['🎨 Tema & warna bebas', '✍️ Tulisan di kue gratis', '🎂 Ukuran sesuai tamu'].map(
                  (perk) => (
                    <View key={perk} style={styles.ctaPerk}>
                      <Text style={styles.ctaPerkText}>{perk}</Text>
                    </View>
                  )
                )}
              </View>

              <View style={styles.ctaActions}>
                <Pressable
                  onPress={() => openWhatsAppChat()}
                  style={({ pressed }) => [styles.ctaBtn, pressed && styles.pressed]}
                >
                  <Text style={styles.ctaBtnText}>💬 Diskusi di WhatsApp</Text>
                </Pressable>
                <Pressable
                  onPress={() => goTo('katalog')}
                  style={({ pressed }) => [styles.ctaGhost, pressed && styles.pressed]}
                >
                  <Text style={styles.ctaGhostText}>Lihat katalog</Text>
                </Pressable>
              </View>
              <Text style={styles.ctaHours}>Fast respon · {BRAND.hours}</Text>
            </View>

            {mid && collage.length ? (
              <View style={[styles.collage, !wide && { alignSelf: 'center', marginTop: 36 }]}>
                {collage.map((item, i) => (
                  <View
                    key={item.id}
                    style={[
                      styles.collageCard,
                      COLLAGE_SPOTS[i],
                      { backgroundColor: item.tint },
                    ]}
                  >
                    {item.images[0] ? (
                      <Image
                        source={{ uri: item.images[0] }}
                        style={styles.collageImg}
                        resizeMode="cover"
                      />
                    ) : (
                      <Text style={{ fontSize: 56 }}>{item.emoji}</Text>
                    )}
                  </View>
                ))}
                <View style={styles.collageBadge}>
                  <Text style={styles.collageBadgeIcon}>💬</Text>
                  <View>
                    <Text style={styles.collageBadgeTitle}>Konsultasi gratis</Text>
                    <Text style={styles.collageBadgeText}>Desain dibantu sampai cocok</Text>
                  </View>
                </View>
              </View>
            ) : null}
          </View>
        </View>

        <View style={styles.footer}>
          <View style={[styles.container, wide && styles.footerRow]}>
            <View style={[styles.footerCol, wide && { flex: 1.4 }]}>
              <Logo height={64} />
              <Text style={styles.footerText}>Delicious Home Made Cake</Text>
            </View>

            <View style={styles.footerCol}>
              <Text style={styles.footerLabel}>Kunjungi</Text>
              <Text style={styles.footerText}>{BRAND.address}</Text>
              <Text style={styles.footerText}>{BRAND.hours}</Text>
            </View>

            <View style={styles.footerCol}>
              <Text style={styles.footerLabel}>Terhubung</Text>
              <Pressable onPress={() => Linking.openURL(BRAND.instagramUrl)}>
                <Text style={styles.footerLink}>Instagram {BRAND.instagram} ↗</Text>
              </Pressable>
              <Pressable onPress={() => openWhatsAppChat()}>
                <Text style={styles.footerLink}>Chat WhatsApp →</Text>
              </Pressable>
            </View>
          </View>

          <View style={styles.container}>
            <View style={styles.footerRule} />
            <Text style={styles.footerFine}>
              © {new Date().getFullYear()} {BRAND.name}. Dibuat dengan sepenuh hati.
            </Text>
          </View>
        </View>

        <View style={{ height: cart.totalQty > 0 ? 110 : 24 }} />
      </ScrollView>

      <View
        style={[
          styles.header,
          { height: scrolled ? HEADER_SHORT : HEADER_TALL },
          scrolled && styles.headerScrolled,
        ]}
      >
        <View style={[styles.container, styles.headerRow]}>
          <Pressable
            onPress={() => scrollRef.current?.scrollTo({ y: 0, animated: true })}
            style={styles.brandWrap}
          >
            <Logo height={scrolled ? 44 : 58} />
            {!scrolled && mid ? (
              <View style={styles.brandDivider}>
                <Text style={styles.brandSub}>{BRAND.tagline}</Text>
              </View>
            ) : null}
          </Pressable>

          {wide ? (
            <View style={styles.nav}>
              <NavLink label="Katalog" onPress={() => goTo('katalog')} />
              <NavLink label="Cara pesan" onPress={() => goTo('cara')} />
              <NavLink label="FAQ" onPress={() => goTo('faq')} />
            </View>
          ) : null}

          <Pressable
            onPress={() => setCartOpen(true)}
            style={({ pressed }) => [styles.cartBtn, pressed && styles.pressed]}
          >
            <Text style={styles.cartIcon}>🛒</Text>
            {mid ? <Text style={styles.cartBtnText}>Keranjang</Text> : null}
            {cart.totalQty > 0 ? (
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>{cart.totalQty}</Text>
              </View>
            ) : null}
          </Pressable>
        </View>
      </View>

      {cart.totalQty > 0 && !cartOpen && !detail ? (
        <View style={styles.floatWrap}>
          <Pressable
            onPress={() => setCartOpen(true)}
            style={({ pressed }) => [styles.floatBar, pressed && styles.pressed]}
          >
            <View>
              <Text style={styles.floatQty}>{cart.totalQty} item di keranjang</Text>
              <Text style={styles.floatTotal}>{formatIDR(cart.totalPrice)}</Text>
            </View>
            <View style={styles.floatCta}>
              <Text style={styles.floatCtaText}>Pesan sekarang →</Text>
            </View>
          </Pressable>
        </View>
      ) : null}

      <ProductDetail
        product={detail?.product ?? null}
        initialVariant={detail?.variant ?? null}
        qtyOf={cart.qtyOf}
        onAdd={cart.add}
        onClose={() => setDetail(null)}
        onGoToCart={() => {
          setDetail(null);
          setCartOpen(true);
        }}
      />

      <CartSheet
        visible={cartOpen}
        items={cart.items}
        total={cart.totalPrice}
        onClose={() => setCartOpen(false)}
        onChangeQty={cart.add}
        onSent={() => setCartOpen(false)}
      />
    </SafeAreaView>
  );
}


function SectionHead({ title, note, wide }: { title: string; note?: string; wide: boolean }) {
  return (
    <View style={[styles.sectionHead, wide && styles.sectionHeadRow]}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {note ? <Text style={styles.sectionNote}>{note}</Text> : null}
    </View>
  );
}

function NavLink({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [pressed && styles.pressed]}>
      <Text style={styles.navText}>{label}</Text>
    </Pressable>
  );
}

function Chip({
  label,
  emoji,
  active,
  onPress,
}: {
  label: string;
  emoji: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={[styles.chip, active && styles.chipActive]}>
      <Text style={{ fontSize: 14 }}>{emoji}</Text>
      <Text style={[styles.chipText, active && styles.chipTextActive]}>{label}</Text>
    </Pressable>
  );
}


const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  splash: {
    flex: 1,
    backgroundColor: colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  container: {
    width: '100%',
    maxWidth: MAX_WIDTH,
    alignSelf: 'center',
    paddingHorizontal: PAD,
  },
  pressed: { opacity: 0.72 },

  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    justifyContent: 'center',
    backgroundColor: 'rgba(250, 245, 239, 0.92)',
    ...transition('height, background-color, box-shadow', 200),
  },
  headerScrolled: {
    backgroundColor: colors.surface,
    boxShadow: shadow.soft,
  },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  brandWrap: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  brandDivider: { borderLeftWidth: 1, borderLeftColor: colors.border, paddingLeft: 12, paddingVertical: 4 },
  brandSub: {
    fontFamily: font.body,
    fontSize: 9,
    letterSpacing: 2.2,
    textTransform: 'uppercase',
    color: colors.faint,
    marginTop: 1,
  },
  nav: { flexDirection: 'row', gap: 28 },
  navText: { fontSize: 14, fontFamily: font.semibold, color: colors.muted },
  cartBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.ink,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: radius.pill,
  },
  cartIcon: { fontFamily: font.body, fontSize: 14 },
  cartBtnText: { fontFamily: font.bold, color: '#fff', fontSize: 13 },
  cartBadge: {
    minWidth: 21,
    height: 21,
    paddingHorizontal: 6,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartBadgeText: { color: '#fff', fontSize: 11, fontFamily: font.extrabold },

  heroBand: { paddingTop: space.xxl, paddingBottom: space.section },
  heroRow: { flexDirection: 'row', alignItems: 'center' },
  heroCopy: { gap: 0 },
  heroKicker: { ...kicker, marginBottom: 16 },
  heroTitle: {
    fontSize: 52,
    lineHeight: 60,
    color: colors.ink,
    fontFamily: font.displayBold,
    letterSpacing: -0.5,
  },
  heroText: {
    fontFamily: font.body,
    fontSize: 16,
    lineHeight: 27,
    color: colors.muted,
    marginTop: 18,
    maxWidth: 520,
  },
  heroActions: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 28 },
  btnPrimary: {
    backgroundColor: colors.primary,
    paddingHorizontal: 26,
    paddingVertical: 15,
    borderRadius: radius.pill,
  },
  btnPrimaryText: { color: '#fff', fontFamily: font.bold, fontSize: 14 },
  btnGhost: {
    paddingHorizontal: 26,
    paddingVertical: 15,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.borderStrong,
  },
  btnGhostText: { color: colors.ink, fontFamily: font.bold, fontSize: 14 },

  statRow: { flexDirection: 'row', marginTop: 40, flexWrap: 'wrap' },
  stat: { paddingRight: 28 },
  statDivider: {
    borderLeftWidth: 1,
    borderLeftColor: colors.border,
    paddingLeft: 28,
  },
  statValue: { fontSize: 26, fontFamily: font.displayBold, color: colors.ink },
  statLabel: { fontSize: 11, color: colors.faint, marginTop: 3, fontFamily: font.semibold },

  heroArt: { alignSelf: 'stretch' },
  artPanel: {
    height: 340,
    borderRadius: radius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    boxShadow: shadow.card,
  },
  artBlob: {
    position: 'absolute',
    pointerEvents: 'none',
    width: 300,
    height: 300,
    borderRadius: radius.pill,
    opacity: 0.5,
    top: -90,
    right: -80,
  },
  artEmoji: { fontFamily: font.body, fontSize: 132 },
  artTag: {
    position: 'absolute',
    top: 18,
    left: 18,
    backgroundColor: 'rgba(255,255,255,0.93)',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: radius.pill,
  },
  artTagText: { fontSize: 11, fontFamily: font.bold, color: colors.ink },
  artCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: 12,
    marginTop: -34,
    marginHorizontal: 18,
    borderWidth: 1,
    borderColor: colors.border,
    boxShadow: shadow.card,
  },
  artCardIcon: {
    width: 42,
    height: 42,
    borderRadius: radius.sm,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  artCardKicker: { fontSize: 10, fontFamily: font.extrabold, color: colors.accent, letterSpacing: 0.6 },
  artCardName: { fontSize: 15, fontFamily: font.bold, color: colors.ink, marginTop: 2 },
  artCardPrice: { fontSize: 15, fontFamily: font.extrabold, color: colors.ink },

  strip: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 8,
    boxShadow: shadow.soft,
  },
  stripItem: {
    flexGrow: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 11,
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  stripDivider: { borderLeftWidth: 1, borderLeftColor: colors.border },
  stripIcon: { fontFamily: font.body, fontSize: 19 },
  stripTitle: { fontSize: 13, fontFamily: font.extrabold, color: colors.ink },
  stripText: { fontFamily: font.body, fontSize: 12, lineHeight: 17, color: colors.muted, marginTop: 2 },

  sectionHead: { marginTop: space.section, marginBottom: space.xl, gap: 10 },
  sectionHeadRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    fontSize: 34,
    lineHeight: 42,
    color: colors.ink,
    fontFamily: font.displayBold,
    letterSpacing: -0.3,
  },
  sectionNote: { fontSize: 13, color: colors.faint, fontFamily: font.semibold, paddingBottom: 6 },

  toolbar: { gap: 12, marginBottom: space.xl },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.pill,
    paddingHorizontal: 18,
    height: 48,
  },
  searchIcon: { fontFamily: font.body, fontSize: 13 },
  searchInput: { fontFamily: font.body, flex: 1, fontSize: 14, color: colors.ink, height: '100%' },
  searchClear: { fontSize: 13, color: colors.faint, fontFamily: font.bold },
  chipRow: { flexDirection: 'row', gap: 8, paddingRight: 8 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    paddingHorizontal: 16,
    height: 42,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    ...transition('background-color, border-color', 150),
  },
  chipActive: { backgroundColor: colors.ink, borderColor: colors.ink },
  chipText: { fontSize: 13, fontFamily: font.bold, color: colors.muted },
  chipTextActive: { color: '#fff' },

  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  emptyState: { alignItems: 'center', paddingVertical: 56, gap: 8 },
  emptyEmoji: { fontFamily: font.body, fontSize: 40, opacity: 0.5 },
  emptyTitle: { fontSize: 18, color: colors.ink, fontFamily: font.displayBold },
  emptyText: { fontFamily: font.body, fontSize: 13, color: colors.muted, marginBottom: 12 },

  band: { backgroundColor: colors.band, paddingBottom: space.section, marginTop: space.section },
  stepRow: { flexDirection: 'row', gap: GAP },
  stepLine: {
    position: 'absolute',
    pointerEvents: 'none',
    top: 26,
    left: 100,
    right: 100,
    height: 1,
    backgroundColor: colors.borderStrong,
  },
  step: { flex: 1, gap: 14 },
  stepMobile: { flexDirection: 'row', alignItems: 'flex-start', gap: 16 },
  stepNo: {
    width: 52,
    height: 52,
    borderRadius: radius.pill,
    backgroundColor: colors.band,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNoText: { fontFamily: font.displayBold, fontSize: 21, color: colors.primary },
  stepTitle: { fontSize: 17, color: colors.ink, fontFamily: font.displayBold },
  stepText: { fontFamily: font.body, fontSize: 14, lineHeight: 22, color: colors.muted, marginTop: 5, maxWidth: 330 },

  faqList: { gap: 10 },
  faqItem: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 18,
    ...transition('border-color, box-shadow', 150),
  },
  faqItemOpen: { borderColor: colors.primary, boxShadow: shadow.soft },
  faqHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 16 },
  faqQ: { flex: 1, fontSize: 15, fontFamily: font.bold, color: colors.ink },
  faqSign: { fontSize: 20, fontFamily: font.bold, color: colors.faint, lineHeight: 22 },
  faqA: { fontFamily: font.body, fontSize: 14, lineHeight: 23, color: colors.muted, marginTop: 12, paddingRight: 30 },

  cta: {
    marginTop: space.section,
    backgroundColor: colors.ink,
    borderRadius: radius.xl,
    padding: 48,
    overflow: 'hidden',
  },
  ctaRow: { flexDirection: 'row', alignItems: 'center', gap: 48 },
  ctaGlow: { position: 'absolute', pointerEvents: 'none', borderRadius: radius.pill },
  ctaGlowWarm: {
    width: 420,
    height: 420,
    top: -200,
    left: -120,
    backgroundColor: colors.primary,
    opacity: 0.28,
  },
  ctaGlowGold: {
    width: 360,
    height: 360,
    bottom: -220,
    right: -60,
    backgroundColor: colors.accent,
    opacity: 0.22,
  },
  ctaCopy: { gap: 16 },
  ctaPill: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.16)',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: radius.pill,
  },
  ctaPillText: { color: colors.accentSoft, fontFamily: font.bold, fontSize: 12 },
  ctaTitle: {
    fontSize: 38,
    lineHeight: 46,
    color: '#fff',
    fontFamily: font.displayBold,
    letterSpacing: -0.3,
    maxWidth: 520,
  },
  ctaText: {
    fontFamily: font.body,
    fontSize: 15,
    lineHeight: 24,
    color: 'rgba(255,255,255,0.72)',
    maxWidth: 480,
  },
  ctaPerks: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  ctaPerk: {
    backgroundColor: 'rgba(255,255,255,0.07)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radius.sm,
  },
  ctaPerkText: { color: '#fff', fontFamily: font.semibold, fontSize: 12 },
  ctaActions: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 6 },
  ctaBtn: {
    backgroundColor: colors.whatsapp,
    paddingHorizontal: 26,
    paddingVertical: 15,
    borderRadius: radius.pill,
  },
  ctaBtnText: { color: '#fff', fontFamily: font.extrabold, fontSize: 14 },
  ctaGhost: {
    paddingHorizontal: 24,
    paddingVertical: 15,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.28)',
  },
  ctaGhostText: { color: '#fff', fontFamily: font.bold, fontSize: 14 },
  ctaHours: { color: 'rgba(255,255,255,0.5)', fontFamily: font.semibold, fontSize: 12 },

  collage: { width: 360, height: 320 },
  collageCard: {
    position: 'absolute',
    borderRadius: radius.md,
    borderWidth: 5,
    borderColor: '#fff',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0px 18px 40px rgba(0,0,0,0.35)',
  },
  collageImg: { width: '100%', height: '100%' },
  collageBadge: {
    position: 'absolute',
    left: 0,
    bottom: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    paddingVertical: 10,
    paddingHorizontal: 14,
    boxShadow: shadow.hover,
  },
  collageBadgeIcon: { fontSize: 20, fontFamily: font.body },
  collageBadgeTitle: { fontFamily: font.extrabold, fontSize: 12, color: colors.ink },
  collageBadgeText: { fontFamily: font.body, fontSize: 11, color: colors.muted },

  footer: { paddingTop: space.section, paddingBottom: 32 },
  footerRow: { flexDirection: 'row', gap: 40 },
  footerCol: { flex: 1, gap: 6, marginBottom: 24 },
  footerLabel: {
    fontSize: 10,
    letterSpacing: 1.8,
    textTransform: 'uppercase',
    fontFamily: font.extrabold,
    color: colors.faint,
    marginBottom: 4,
  },
  footerText: { fontFamily: font.body, fontSize: 13, color: colors.muted, lineHeight: 22 },
  footerLink: { fontSize: 13, color: colors.primary, fontFamily: font.bold, marginTop: 4 },
  footerRule: { height: 1, backgroundColor: colors.border, marginBottom: 20 },
  footerFine: { fontFamily: font.body, fontSize: 12, color: colors.faint },

  floatWrap: {
    position: 'absolute',
    pointerEvents: 'box-none',
    left: 0,
    right: 0,
    bottom: 0,
    padding: 16,
    alignItems: 'center',
  },
  floatBar: {
    width: '100%',
    maxWidth: 540,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.ink,
    paddingVertical: 12,
    paddingLeft: 22,
    paddingRight: 12,
    borderRadius: radius.pill,
    boxShadow: shadow.lifted,
  },
  floatQty: { color: 'rgba(255,255,255,0.65)', fontSize: 12, fontFamily: font.semibold },
  floatTotal: { color: '#fff', fontSize: 18, fontFamily: font.extrabold, marginTop: 2 },
  floatCta: {
    backgroundColor: colors.whatsapp,
    paddingHorizontal: 20,
    paddingVertical: 13,
    borderRadius: radius.pill,
  },
  floatCtaText: { color: '#fff', fontFamily: font.extrabold, fontSize: 13 },
});
