import { Platform } from 'react-native';
import { BRAND } from './config';
import { ICON_URI } from './logo';

const TITLE = `${BRAND.name} — Kue Rumahan ${BRAND.address.split(',').pop()?.trim() ?? ''}`.trim();

const DESCRIPTION =
  'Kue rumahan yang dipanggang per pesanan: cake, brownies, pastry, dan cookies tanpa pengawet. Pilih ukuran, atur jumlah, lalu pesan langsung lewat WhatsApp.';

export function applyWebMeta() {
  if (Platform.OS !== 'web' || typeof document === 'undefined') return;

  document.title = TITLE;
  document.documentElement.lang = 'id';

  setMeta('name', 'description', DESCRIPTION);
  setMeta('name', 'theme-color', '#A63D26');

  setMeta('property', 'og:type', 'website');
  setMeta('property', 'og:site_name', BRAND.name);
  setMeta('property', 'og:title', TITLE);
  setMeta('property', 'og:description', DESCRIPTION);
  setMeta('property', 'og:locale', 'id_ID');

  setMeta('name', 'twitter:card', 'summary');
  setMeta('name', 'twitter:title', TITLE);
  setMeta('name', 'twitter:description', DESCRIPTION);
}

export function applyFavicon() {
  if (Platform.OS !== 'web' || typeof document === 'undefined') return;
  let link = document.head.querySelector<HTMLLinkElement>('link[rel="icon"]');
  if (!link) {
    link = document.createElement('link');
    link.rel = 'icon';
    document.head.appendChild(link);
  }
  link.type = 'image/svg+xml';
  link.href = ICON_URI;
}

function setMeta(keyAttr: 'name' | 'property', key: string, value: string) {
  let tag = document.head.querySelector<HTMLMetaElement>(`meta[${keyAttr}="${key}"]`);
  if (!tag) {
    tag = document.createElement('meta');
    tag.setAttribute(keyAttr, key);
    document.head.appendChild(tag);
  }
  tag.setAttribute('content', value);
}
