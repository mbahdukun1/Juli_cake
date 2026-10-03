export type Variant = {
  label: string;
  price: number;
};

export type Product = {
  id: string;
  name: string;
  category: CategoryId;
  description: string;
  story: string;
  emoji: string;
  tint: string;
  tintDeep: string;
  images: string[];
  active: boolean;
  variants: Variant[];
  badge?: string;
  servings: string;
  readyIn: string;
  leadDays: number;
  storage: string;
  ingredients: string[];
  allergens: string[];
};

export type CategoryId = 'cake' | 'brownies' | 'pastry' | 'cookies';

export const CATEGORIES: { id: CategoryId; label: string; emoji: string }[] = [
  { id: 'cake', label: 'Cake', emoji: '🎂' },
  { id: 'brownies', label: 'Brownies', emoji: '🍫' },
  { id: 'pastry', label: 'Pastry', emoji: '🥐' },
  { id: 'cookies', label: 'Cookies', emoji: '🍪' },
];

type SeedProduct = Omit<Product, 'images' | 'active'>;

const SEED: SeedProduct[] = [
  {
    id: 'red-velvet',
    name: 'Red Velvet Cake',
    category: 'cake',
    description: 'Lembut, cream cheese frosting asli, tidak eneg.',
    story:
      'Base red velvet dengan buttermilk supaya remahnya halus dan lembap. Frosting-nya cream cheese asli — bukan buttercream berpewarna — jadi rasanya segar dan tidak bikin enek walau makan dua potong.',
    emoji: '🍰',
    tint: '#F4DBD4',
    tintDeep: '#E3B0A2',
    badge: 'Best Seller',
    servings: '8–10 potong',
    readyIn: 'Pesan H-1',
    leadDays: 1,
    storage: 'Chiller, tahan 3 hari',
    ingredients: [
      'Tepung terigu protein rendah',
      'Buttermilk',
      'Cream cheese',
      'Butter Wijsman',
      'Telur ayam kampung',
      'Cocoa powder',
      'Pewarna makanan food grade',
    ],
    allergens: ['Gluten', 'Telur', 'Susu'],
    variants: [
      { label: '16 cm', price: 185000 },
      { label: '20 cm', price: 265000 },
    ],
  },
  {
    id: 'rainbow',
    name: 'Rainbow Cake',
    category: 'cake',
    description: 'Enam lapis warna dengan buttercream vanilla.',
    story:
      'Enam lapis sponge cake dipanggang terpisah supaya warnanya bersih dan tegas. Diisi buttercream vanilla ringan berbahan butter asli, jadi manisnya pas untuk acara ulang tahun anak.',
    emoji: '🌈',
    tint: '#EEE1E8',
    tintDeep: '#D6BCCB',
    servings: '10–12 potong',
    readyIn: 'Pesan H-2',
    leadDays: 2,
    storage: 'Chiller, tahan 3 hari',
    ingredients: [
      'Tepung terigu',
      'Butter asli',
      'Gula kastor',
      'Telur',
      'Susu segar',
      'Vanilla bourbon',
      'Pewarna makanan food grade',
    ],
    allergens: ['Gluten', 'Telur', 'Susu'],
    variants: [
      { label: '16 cm', price: 195000 },
      { label: '20 cm', price: 275000 },
    ],
  },
  {
    id: 'tiramisu',
    name: 'Tiramisu Box',
    category: 'cake',
    description: 'Mascarpone + espresso, disajikan dingin.',
    story:
      'Ladyfinger direndam espresso segar, dilapis krim mascarpone yang dikocok dingin. Tanpa alkohol, jadi aman untuk semua umur. Paling enak dimakan langsung dari kulkas.',
    emoji: '🍮',
    tint: '#EDE0CF',
    tintDeep: '#D2B58E',
    servings: '2–4 orang per box',
    readyIn: 'Pesan H-1',
    leadDays: 1,
    storage: 'Chiller, tahan 2 hari',
    ingredients: [
      'Keju mascarpone',
      'Espresso segar',
      'Ladyfinger',
      'Krim kocok',
      'Kuning telur',
      'Cocoa powder',
    ],
    allergens: ['Gluten', 'Telur', 'Susu', 'Kafein'],
    variants: [
      { label: 'Box kecil', price: 55000 },
      { label: 'Box besar', price: 98000 },
    ],
  },
  {
    id: 'brownies-fudge',
    name: 'Brownies Fudge',
    category: 'brownies',
    description: 'Cokelat Belgia, tengahnya lumer, topping almond.',
    story:
      'Dipanggang dengan suhu rendah supaya bagian tengahnya tetap fudgy dan lumer. Cokelat couverture Belgia 55%, ditabur almond slice panggang di atasnya. Hangatkan 10 detik di microwave sebelum makan.',
    emoji: '🍫',
    tint: '#E7D7C8',
    tintDeep: '#C0A184',
    badge: 'Favorit',
    servings: '9 potong',
    readyIn: 'Ready stock',
    leadDays: 0,
    storage: 'Suhu ruang 3 hari / chiller 7 hari',
    ingredients: [
      'Cokelat couverture Belgia 55%',
      'Butter asli',
      'Telur',
      'Gula palem',
      'Tepung terigu',
      'Almond slice',
    ],
    allergens: ['Gluten', 'Telur', 'Susu', 'Kacang'],
    variants: [
      { label: 'Reguler', price: 65000 },
      { label: 'Jumbo', price: 115000 },
    ],
  },
  {
    id: 'brownies-cheese',
    name: 'Brownies Cream Cheese',
    category: 'brownies',
    description: 'Marble cokelat dan cream cheese panggang.',
    story:
      'Adonan brownies dan cream cheese dipilin jadi motif marble sebelum dipanggang. Rasanya berlapis: pahit cokelat di awal, gurih asin keju di akhir.',
    emoji: '🧀',
    tint: '#F5E7CD',
    tintDeep: '#DEC28B',
    servings: '9 potong',
    readyIn: 'Ready stock',
    leadDays: 0,
    storage: 'Chiller, tahan 5 hari',
    ingredients: [
      'Cokelat couverture',
      'Cream cheese',
      'Butter asli',
      'Telur',
      'Tepung terigu',
      'Gula kastor',
    ],
    allergens: ['Gluten', 'Telur', 'Susu'],
    variants: [
      { label: 'Reguler', price: 75000 },
      { label: 'Jumbo', price: 125000 },
    ],
  },
  {
    id: 'croissant',
    name: 'Butter Croissant',
    category: 'pastry',
    description: '72 jam proofing, butter Prancis, renyah berlapis.',
    story:
      'Adonan difermentasi 72 jam lalu dilipat 27 lapis dengan butter Prancis. Hasilnya kulit yang renyah berserpih dan dalamnya berongga seperti sarang lebah. Panggang ulang 5 menit untuk mengembalikan kriuknya.',
    emoji: '🥐',
    tint: '#F7E7CB',
    tintDeep: '#E2C28B',
    servings: '1 orang per pcs',
    readyIn: 'Pesan H-1, ambil pagi',
    leadDays: 1,
    storage: 'Terbaik dimakan di hari yang sama',
    ingredients: [
      'Tepung terigu protein tinggi',
      'Butter Prancis 82%',
      'Ragi alami',
      'Susu segar',
      'Gula',
      'Garam laut',
    ],
    allergens: ['Gluten', 'Susu'],
    variants: [
      { label: 'Satuan', price: 18000 },
      { label: 'Box isi 6', price: 98000 },
    ],
  },
  {
    id: 'cheese-danish',
    name: 'Cheese Danish',
    category: 'pastry',
    description: 'Puff pastry dengan custard keju dan sedikit lemon.',
    story:
      'Puff pastry buatan sendiri diisi custard keju yang dimasak manual, lalu dikasih parutan kulit lemon supaya rasanya tidak berat. Dipanggang sampai pinggirannya karamel keemasan.',
    emoji: '🧈',
    tint: '#F1EAD2',
    tintDeep: '#D9CB9A',
    servings: '1 orang per pcs',
    readyIn: 'Pesan H-1, ambil pagi',
    leadDays: 1,
    storage: 'Terbaik dimakan di hari yang sama',
    ingredients: [
      'Puff pastry homemade',
      'Cream cheese',
      'Custard susu',
      'Kulit lemon',
      'Telur',
      'Gula halus',
    ],
    allergens: ['Gluten', 'Telur', 'Susu'],
    variants: [
      { label: 'Satuan', price: 20000 },
      { label: 'Box isi 6', price: 110000 },
    ],
  },
  {
    id: 'choco-chip',
    name: 'Choco Chip Cookies',
    category: 'cookies',
    description: 'Chewy di tengah, crispy di pinggir. Toples 250 gr.',
    story:
      'Adonan diistirahatkan semalam di kulkas supaya rasanya lebih dalam dan teksturnya chewy. Pakai chocolate chunk, bukan chip, jadi ada kantong cokelat yang lumer di tiap gigitan.',
    emoji: '🍪',
    tint: '#EADBC9',
    tintDeep: '#CBAF90',
    servings: '± 18 keping per 250 gr',
    readyIn: 'Ready stock',
    leadDays: 0,
    storage: 'Toples tertutup, tahan 3 minggu',
    ingredients: [
      'Chocolate chunk',
      'Butter asli',
      'Gula palem',
      'Telur',
      'Tepung terigu',
      'Garam laut',
    ],
    allergens: ['Gluten', 'Telur', 'Susu'],
    variants: [
      { label: 'Toples 250 gr', price: 58000 },
      { label: 'Toples 500 gr', price: 105000 },
    ],
  },
  {
    id: 'nastar',
    name: 'Nastar Premium',
    category: 'cookies',
    description: 'Selai nanas asli, butter Wijsman, lumer di mulut.',
    story:
      'Selai nanasnya dimasak sendiri dari nanas segar selama 4 jam sampai pekat — tidak pakai selai instan. Kulitnya pakai butter Wijsman dan kuning telur, teksturnya langsung hancur begitu masuk mulut.',
    emoji: '🥧',
    tint: '#F8E5C6',
    tintDeep: '#E4C186',
    badge: 'Musiman',
    servings: '± 30 butir per 250 gr',
    readyIn: 'Pesan H-3',
    leadDays: 3,
    storage: 'Toples tertutup, tahan 1 bulan',
    ingredients: [
      'Nanas segar',
      'Butter Wijsman',
      'Kuning telur',
      'Tepung terigu',
      'Susu bubuk',
      'Keju edam',
    ],
    allergens: ['Gluten', 'Telur', 'Susu'],
    variants: [
      { label: 'Toples 250 gr', price: 78000 },
      { label: 'Toples 500 gr', price: 145000 },
    ],
  },
];

const photo = (id: string) =>
  `https://images.unsplash.com/photo-${id}?w=1200&h=900&fit=crop&auto=format&q=75`;

const DUMMY_PHOTOS: Record<string, string[]> = {
  'red-velvet': ['1586788680434-30d324b2d46f', '1535141192574-5d4897c12636', '1559620192-032c4bc4674e'],
  rainbow: ['1464349095431-e9a21285b5f3', '1621303837174-89787a7d4729', '1519869325930-281384150729'],
  tiramisu: ['1571877227200-a0d98ea607e9', '1488477181946-6428a0291777', '1565958011703-44f9829ba187'],
  'brownies-fudge': ['1606313564200-e75d5e30476c', '1578985545062-69928b1d9587', '1606890737304-57a1ca8a5b62'],
  'brownies-cheese': ['1607920591413-4ec007e70023', '1542826438-bd32f43d626f', '1626803775151-61d756612f97'],
  croissant: ['1555507036-ab1f4038808a', '1623334044303-241021148842', '1530610476181-d83430b64dcd'],
  'cheese-danish': ['1495147466023-ac5c588e2e94', '1517433670267-08bbd4be890f', '1509440159596-0249088772ff'],
  'choco-chip': ['1558961363-fa8fdf82db35', '1499636136210-6f4ee915583e', '1590080875515-8a3a8dc5735e'],
  nastar: ['1612201142855-7873bc1661b4', '1563729784474-d77dbb933a9e', '1587668178277-295251f900ce'],
};

export const PRODUCTS: Product[] = SEED.map((p) => ({
  ...p,
  images: (DUMMY_PHOTOS[p.id] ?? []).map(photo),
  active: true,
}));

export function formatIDR(value: number): string {
  return 'Rp' + value.toLocaleString('id-ID');
}
