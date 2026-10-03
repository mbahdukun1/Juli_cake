import { Linking } from 'react-native';
import { formatIDR } from './catalog';
import { WHATSAPP_NUMBER, BRAND } from './config';
import type { CartLine } from './useCart';

export type OrderForm = {
  name: string;
  date: string;
  note: string;
};

export function buildOrderMessage(
  items: CartLine[],
  total: number,
  form: OrderForm
): string {
  const rows = items.map(
    (l, i) =>
      `${i + 1}. ${l.product.name} (${l.variant.label})\n` +
      `    ${l.qty} x ${formatIDR(l.variant.price)} = ${formatIDR(l.qty * l.variant.price)}`
  );

  const lines = [
    `Halo ${BRAND.name}! 👋`,
    'Saya mau pesan:',
    '',
    ...rows,
    '',
    `*TOTAL: ${formatIDR(total)}*`,
    '',
    `Nama    : ${form.name.trim() || '-'}`,
    `Tgl ambil : ${form.date.trim() || '-'}`,
    `Catatan : ${form.note.trim() || '-'}`,
    '',
    'Mohon dikonfirmasi ketersediaan & ongkirnya ya. Terima kasih yayayaya',
  ];

  return lines.join('\n');
}

export function openWhatsAppOrder(
  items: CartLine[],
  total: number,
  form: OrderForm
) {
  const text = encodeURIComponent(buildOrderMessage(items, total, form));
  return Linking.openURL(`https://wa.me/${WHATSAPP_NUMBER}?text=${text}`);
}

export function openWhatsAppChat(message = `Halo ${BRAND.name}, saya mau tanya-tanya dulu 🙂`) {
  return Linking.openURL(
    `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`
  );
}
