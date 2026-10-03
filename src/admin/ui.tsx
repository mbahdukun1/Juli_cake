import type { ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { supabase } from '../supabase';
import { colors, font, radius, shadow } from '../theme';
import { useFeedback } from './feedback';
import Logo from '../components/Logo';

export function Shell({ children, right }: { children: ReactNode; right?: ReactNode }) {
  const { confirm } = useFeedback();

  const signOut = async () => {
    const ok = await confirm({
      title: 'Keluar dari dashboard?',
      message: 'Kamu perlu login lagi untuk mengubah menu.',
      confirmLabel: 'Keluar',
    });
    if (ok) supabase?.auth.signOut();
  };

  return (
    <View style={styles.root}>
      <View style={styles.topbar}>
        <View style={styles.topbarInner}>
          <View style={styles.brandWrap}>
            <Logo height={40} />
            <View style={styles.brandBadge}>
              <Text style={styles.brandBadgeText}>Dashboard</Text>
            </View>
          </View>
          <View style={styles.topActions}>
            <Pressable onPress={() => window.open('/', '_blank')}>
              <Text style={styles.link}>Lihat website ↗</Text>
            </Pressable>
            {supabase ? (
              <Pressable onPress={signOut}>
                <Text style={styles.link}>Keluar</Text>
              </Pressable>
            ) : null}
          </View>
        </View>
      </View>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.page}>
          {right ? <View style={styles.pageAction}>{right}</View> : null}
          {children}
        </View>
      </ScrollView>
    </View>
  );
}

export function Centered({ children }: { children: ReactNode }) {
  return <View style={[styles.root, styles.centered]}>{children}</View>;
}

export function IconBtn({
  label,
  onPress,
  disabled,
  danger,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  danger?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [styles.iconBtn, (pressed || disabled) && styles.pressed]}
    >
      <Text style={[styles.iconBtnText, danger && { color: colors.primary }]}>{label}</Text>
    </Pressable>
  );
}

export function messageOf(e: unknown): string {
  if (e && typeof e === 'object' && 'message' in e) return String((e as { message: unknown }).message);
  return 'Terjadi kesalahan. Coba lagi.';
}

export const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  centered: { alignItems: 'center', justifyContent: 'center', padding: 16 },
  pressed: { opacity: 0.55 },
  muted: { fontFamily: font.body, fontSize: 14, lineHeight: 21, color: colors.muted },
  error: {
    fontFamily: font.semibold,
    fontSize: 13,
    color: colors.primary,
    backgroundColor: colors.primarySoft,
    padding: 12,
    borderRadius: radius.sm,
  },

  topbar: {
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  topbarInner: {
    width: '100%',
    maxWidth: 960,
    alignSelf: 'center',
    paddingHorizontal: 16,
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brandWrap: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  brandBadge: {
    backgroundColor: colors.accentSoft,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.pill,
  },
  brandBadgeText: { fontSize: 11, color: colors.accent, fontFamily: font.extrabold, letterSpacing: 0.6 },
  topActions: { flexDirection: 'row', gap: 18 },
  link: { fontFamily: font.bold, fontSize: 13, color: colors.muted },

  scroll: { paddingBottom: 80 },
  page: { width: '100%', maxWidth: 960, alignSelf: 'center', padding: 16, paddingTop: 28, gap: 6 },
  pageAction: { position: 'absolute', top: 28, right: 16, zIndex: 1 },
  pageTitle: { fontFamily: font.displayBold, fontSize: 30, color: colors.ink },

  loginCard: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 28,
    gap: 12,
    boxShadow: shadow.card,
  },
  loginTitle: { fontFamily: font.displayBold, fontSize: 24, color: colors.ink, marginTop: 6 },
  input: {
    fontFamily: font.body,
    fontSize: 14,
    color: colors.ink,
    backgroundColor: colors.bg,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },

  btnPrimary: {
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: radius.pill,
    alignItems: 'center',
  },
  btnPrimaryText: { color: '#fff', fontFamily: font.bold, fontSize: 14 },
  btnGhost: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  btnGhostText: { color: colors.ink, fontFamily: font.bold, fontSize: 14 },
  iconBtn: {
    minWidth: 34,
    height: 34,
    paddingHorizontal: 10,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBtnText: { fontFamily: font.bold, fontSize: 12, color: colors.ink },

  list: { marginTop: 20, gap: 10 },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 14,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 12,
  },
  rowHidden: { backgroundColor: colors.cream },
  thumb: {
    width: 60,
    height: 60,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  thumbImg: { width: '100%', height: '100%' },
  rowInfo: { flex: 1, minWidth: 180, gap: 3 },
  rowName: { fontFamily: font.bold, fontSize: 15, color: colors.ink },
  rowMeta: { fontFamily: font.body, fontSize: 12, color: colors.muted },
  rowActions: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 6 },
  pill: {
    paddingHorizontal: 12,
    height: 34,
    justifyContent: 'center',
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  pillOn: { borderColor: '#BFE6CD', backgroundColor: '#EAF7EF' },
  pillOff: { borderColor: colors.border, backgroundColor: colors.bg },
  pillText: { fontFamily: font.bold, fontSize: 12, color: colors.muted },

  emptyBox: {
    marginTop: 24,
    padding: 24,
    gap: 12,
    borderRadius: radius.md,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.borderStrong,
  },
  emptyTitle: { fontFamily: font.displayBold, fontSize: 20, color: colors.ink },

  demo: {
    marginTop: 16,
    padding: 16,
    gap: 6,
    borderRadius: radius.md,
    backgroundColor: colors.accentSoft,
    borderWidth: 1,
    borderColor: '#E8D2A8',
  },
  demoTitle: { fontFamily: font.extrabold, fontSize: 12, letterSpacing: 1.2, textTransform: 'uppercase', color: colors.accent },
  demoText: { fontFamily: font.body, fontSize: 13, lineHeight: 20, color: colors.ink },
  demoLink: { fontFamily: font.bold, fontSize: 13, color: colors.primary, marginTop: 2 },
  steps: { marginTop: 8, gap: 8 },
  step: { fontFamily: font.body, fontSize: 14, lineHeight: 22, color: colors.ink },
});
