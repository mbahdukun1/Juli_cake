import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { Modal, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, font, radius, shadow } from '../theme';

type Tone = 'danger' | 'default';

type ConfirmOptions = {
  title: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: Tone;
};

type ToastKind = 'success' | 'error' | 'info';

type Toast = { id: number; message: string; kind: ToastKind };

type Feedback = {
  confirm: (options: ConfirmOptions) => Promise<boolean>;
  toast: (message: string, kind?: ToastKind) => void;
};

const FeedbackContext = createContext<Feedback | null>(null);

export function useFeedback(): Feedback {
  const ctx = useContext(FeedbackContext);
  if (!ctx) throw new Error('useFeedback harus di dalam FeedbackProvider');
  return ctx;
}

export function FeedbackProvider({ children }: { children: ReactNode }) {
  const [dialog, setDialog] = useState<ConfirmOptions | null>(null);
  const resolver = useRef<((ok: boolean) => void) | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextId = useRef(1);

  const confirm = useCallback(
    (options: ConfirmOptions) =>
      new Promise<boolean>((resolve) => {
        resolver.current = resolve;
        setDialog(options);
      }),
    []
  );

  const close = useCallback((ok: boolean) => {
    resolver.current?.(ok);
    resolver.current = null;
    setDialog(null);
  }, []);

  const toast = useCallback((message: string, kind: ToastKind = 'success') => {
    const id = nextId.current++;
    setToasts((list) => [...list.slice(-2), { id, message, kind }]);
    setTimeout(() => setToasts((list) => list.filter((t) => t.id !== id)), 3200);
  }, []);

  return (
    <FeedbackContext.Provider value={{ confirm, toast }}>
      {children}
      <ConfirmDialog options={dialog} onClose={close} />
      <View style={styles.toastStack}>
        {toasts.map((t) => (
          <ToastItem
            key={t.id}
            toast={t}
            onDismiss={() => setToasts((list) => list.filter((x) => x.id !== t.id))}
          />
        ))}
      </View>
    </FeedbackContext.Provider>
  );
}

const keyframes = (from: object, ms: number): object => ({
  animationKeyframes: [{ from, to: { opacity: 1, transform: 'none' } }],
  animationDuration: `${ms}ms`,
  animationTimingFunction: 'cubic-bezier(0.2, 0.9, 0.3, 1.15)',
  animationFillMode: 'both',
});

function ConfirmDialog({
  options,
  onClose,
}: {
  options: ConfirmOptions | null;
  onClose: (ok: boolean) => void;
}) {
  const danger = options?.tone === 'danger';

  useEffect(() => {
    if (!options || Platform.OS !== 'web') return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose(false);
      if (e.key === 'Enter') onClose(true);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [options, onClose]);

  if (!options) return null;

  return (
    <Modal visible transparent animationType="fade" onRequestClose={() => onClose(false)}>
      <View style={styles.backdrop}>
        <Pressable style={StyleSheet.absoluteFill} onPress={() => onClose(false)} />
        <View style={[styles.dialog, styles.dialogIn]}>
          <View style={[styles.icon, danger ? styles.iconDanger : styles.iconDefault]}>
            <Text style={styles.iconText}>{danger ? '🗑️' : '💬'}</Text>
          </View>

          <Text style={styles.title}>{options.title}</Text>
          {options.message ? <Text style={styles.message}>{options.message}</Text> : null}

          <View style={styles.actions}>
            <Pressable
              onPress={() => onClose(false)}
              style={({ pressed }) => [styles.btn, styles.btnGhost, pressed && styles.pressed]}
            >
              <Text style={styles.btnGhostText}>{options.cancelLabel ?? 'Batal'}</Text>
            </Pressable>
            <Pressable
              onPress={() => onClose(true)}
              style={({ pressed }) => [
                styles.btn,
                danger ? styles.btnDanger : styles.btnPrimary,
                pressed && styles.pressed,
              ]}
            >
              <Text style={styles.btnSolidText}>{options.confirmLabel ?? 'Ya, lanjutkan'}</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const TOAST_LOOK: Record<ToastKind, { icon: string; accent: string }> = {
  success: { icon: '✓', accent: colors.success },
  error: { icon: '!', accent: colors.primary },
  info: { icon: 'i', accent: colors.accent },
};

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: () => void }) {
  const look = TOAST_LOOK[toast.kind];

  return (
    <View style={[styles.toast, styles.toastIn]}>
      <View style={[styles.toastIcon, { backgroundColor: look.accent }]}>
        <Text style={styles.toastIconText}>{look.icon}</Text>
      </View>
      <Text style={styles.toastText}>{toast.message}</Text>
      <Pressable onPress={onDismiss} hitSlop={8}>
        <Text style={styles.toastClose}>✕</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: colors.overlay,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  dialog: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: 26,
    alignItems: 'center',
    boxShadow: shadow.hover,
  },
  dialogIn: keyframes({ opacity: 0, transform: 'scale(0.94)' }, 260),
  icon: {
    width: 56,
    height: 56,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  iconDanger: { backgroundColor: colors.primarySoft },
  iconDefault: { backgroundColor: colors.accentSoft },
  iconText: { fontSize: 24, fontFamily: font.body },
  title: {
    fontFamily: font.displayBold,
    fontSize: 21,
    lineHeight: 28,
    color: colors.ink,
    textAlign: 'center',
  },
  message: {
    fontFamily: font.body,
    fontSize: 14,
    lineHeight: 21,
    color: colors.muted,
    textAlign: 'center',
    marginTop: 8,
  },
  actions: { flexDirection: 'row', gap: 10, marginTop: 24, alignSelf: 'stretch' },
  btn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: radius.pill,
    alignItems: 'center',
  },
  btnGhost: { borderWidth: 1, borderColor: colors.borderStrong },
  btnGhostText: { fontFamily: font.bold, fontSize: 14, color: colors.ink },
  btnPrimary: { backgroundColor: colors.ink },
  btnDanger: { backgroundColor: colors.primary },
  btnSolidText: { fontFamily: font.bold, fontSize: 14, color: '#fff' },
  pressed: { opacity: 0.75 },

  toastStack: {
    position: 'absolute',
    pointerEvents: 'box-none',
    left: 0,
    right: 0,
    bottom: 24,
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    maxWidth: 440,
    width: '100%',
    backgroundColor: colors.ink,
    borderRadius: radius.md,
    paddingVertical: 12,
    paddingLeft: 12,
    paddingRight: 16,
    boxShadow: shadow.hover,
  },
  toastIn: keyframes({ opacity: 0, transform: 'translateY(16px)' }, 240),
  toastIcon: {
    width: 26,
    height: 26,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toastIconText: { color: '#fff', fontFamily: font.extrabold, fontSize: 13 },
  toastText: { flex: 1, color: '#fff', fontFamily: font.semibold, fontSize: 13, lineHeight: 19 },
  toastClose: { color: 'rgba(255,255,255,0.5)', fontFamily: font.bold, fontSize: 13 },
});
