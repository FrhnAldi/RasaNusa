import { Gift, Percent, Users, Zap } from 'lucide-react';
import type { Category } from '../types/pos';

export interface PromoRequirement {
  /** Minimum quantity of items from this category that must be in the cart. */
  category?: Category;
  /** Minimum quantity of items carrying this badge that must be in the cart (e.g. 'Pedas'). */
  badge?: string;
  minQuantity: number;
  label: string;
}

export interface Promo {
  id: string;
  icon: typeof Percent;
  accent: string;
  tag: string;
  title: string;
  description: string;
  code: string;
  image: string;
  discountPercent: number;
  /** All of these must be satisfied simultaneously for the promo to be applicable. */
  requirements: PromoRequirement[];
  /** Only valid within these hours (24h, inclusive start / exclusive end). Omit if always valid. */
  validHours?: { start: number; end: number };
  /** Only valid on these JS getDay() values (0 = Sunday ... 5 = Friday). Omit if valid every day. */
  validDays?: number[];
  /** Can only be applied once per customer (their first order). */
  firstOrderOnly?: boolean;
  /** Short note shown to explain the condition, e.g. discount is capped or applies to a subset. */
  note?: string;
}

export const PROMOS: Promo[] = [
  {
    id: 'promo-siang',
    icon: Percent,
    accent: '#D9A441',
    tag: 'Diskon Harian',
    title: 'Hemat 20% Menu Makan Siang',
    description: 'Berlaku untuk semua menu makanan setiap pukul 11.00–14.00 WIB.',
    code: 'SIANG20',
    image: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=700&h=500&fit=crop&auto=format',
    discountPercent: 20,
    requirements: [{ category: 'makanan', minQuantity: 1, label: 'Minimal 1 menu makanan di keranjang' }],
    validHours: { start: 11, end: 14 },
  },
  {
    id: 'promo-keluarga',
    icon: Users,
    accent: '#A85C34',
    tag: 'Paket Keluarga',
    title: 'Paket Baraya untuk 4 Orang',
    description: '4 menu utama + 4 minuman, hemat hingga 30% dari harga satuan.',
    code: 'KELUARGA4',
    image: 'https://images.unsplash.com/photo-1645696301019-35adcc18fc21?w=700&h=500&fit=crop&auto=format',
    discountPercent: 30,
    requirements: [
      { category: 'makanan', minQuantity: 4, label: 'Minimal 4 menu makanan' },
      { category: 'minuman', minQuantity: 4, label: 'Minimal 4 menu minuman' },
    ],
  },
  {
    id: 'promo-member',
    icon: Gift,
    accent: '#1D6B76',
    tag: 'Member Baru',
    title: 'Gratis Es Teh Manis',
    description: 'Daftar sebagai pelanggan baru dan dapatkan minuman gratis di kunjungan pertama.',
    code: 'HALOBARAYA',
    image: 'https://images.unsplash.com/photo-1601390395693-364c0e22031a?w=700&h=500&fit=crop&auto=format',
    discountPercent: 10,
    requirements: [{ minQuantity: 1, label: 'Minimal 1 item di keranjang' }],
    firstOrderOnly: true,
    note: 'Hanya berlaku untuk pesanan pertamamu',
  },
  {
    id: 'promo-jumat',
    icon: Zap,
    accent: '#C4432B',
    tag: 'Flash Sale',
    title: 'Jumat Pedas: Beli 1 Gratis 1',
    description: 'Khusus menu bertanda pedas, berlaku setiap Jumat sampai persediaan habis.',
    code: 'JUMATPEDAS',
    image: 'https://images.unsplash.com/photo-1680674774705-90b4904b3a7f?w=700&h=500&fit=crop&auto=format',
    discountPercent: 50,
    requirements: [{ badge: 'Pedas', minQuantity: 2, label: 'Minimal 2 menu bertanda Pedas' }],
    validDays: [5],
    note: 'Diskon dihitung dari menu bertanda Pedas saja',
  },
];
