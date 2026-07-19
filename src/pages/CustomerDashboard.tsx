import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowUpRight,
  Award,
  ChefHat,
  ChevronDown,
  Clock3,
  Heart,
  LogOut,
  MessageSquareText,
  Plus,
  Receipt,
  Search,
  ShoppingBag,
  Sparkles,
  Star,
  Trash2,
  Utensils,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useAppData } from '../context/AppDataContext';
import { CATEGORY_LABELS, formatIDR } from '../data/products';
import { PROMOS } from '../data/promos';
import { checkPromoEligibility } from '../lib/promoEngine';
import { ORDER_STATUS_FLOW, ORDER_STATUS_META, formatRelativeTime } from '../data/orderStatus';
import type { Category, OrderType, PaymentMethod, Product } from '../types/pos';
import MenuCard from '../components/customer/MenuCard';
import PromoCarousel from '../components/customer/PromoCarousel';
import CartDrawer from '../components/customer/CartDrawer';
import OrderSuccessModal from '../components/customer/OrderSuccessModal';
import GlobalStyles from '../components/site/GlobalStyles';

const TABS: (Category | 'semua')[] = ['semua', 'makanan', 'camilan', 'minuman', 'dessert'];

const PAYMENT_LABELS: Record<PaymentMethod, string> = {
  tunai: 'Tunai di Kasir',
  qris: 'QRIS',
  kartu: 'Kartu',
  ewallet: 'E-Wallet',
};

// Basilico luxury design system — shared with CartDrawer & OrderSuccessModal:
// near-black stage, dual gold / burnt-orange accent, warm cream & gray text,
// Playfair Display for headings, Inter (light) for body copy.
const BLACK = '#070707';
const CREAM = '#F3EAD9';
const GOLD = '#D9A35F';
const BURNT = '#C97A2B';
const GRADIENT = `linear-gradient(135deg, ${GOLD}, ${BURNT})`;
const SERIF = "'Playfair Display', serif";
const SANS = 'Inter, sans-serif';

function tierFromOrders(orderCount: number) {
  if (orderCount >= 16) return { label: 'Platinum', next: null as number | null, floor: 16 };
  if (orderCount >= 8) return { label: 'Gold', next: 16, floor: 8 };
  if (orderCount >= 3) return { label: 'Silver', next: 8, floor: 3 };
  return { label: 'Anggota Baru', next: 3, floor: 0 };
}

export default function CustomerDashboard() {
  const { user, logout } = useAuth();
  const { products, transactions, recordTransaction, removeTransaction } = useAppData();
  const navigate = useNavigate();

  const [cart, setCart] = useState<Record<string, { quantity: number; note: string }>>({});
  const [activeTab, setActiveTab] = useState<Category | 'semua'>('semua');
  const [query, setQuery] = useState('');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [promoCode, setPromoCode] = useState<string | null>(null);
  const [promoError, setPromoError] = useState<string | null>(null);
  const [showAllOrders, setShowAllOrders] = useState(false);
  const [justOrdered, setJustOrdered] = useState<{
    id: string;
    items: { name: string; quantity: number; price: number; note?: string }[];
    subtotal: number;
    tax: number;
    discount: number;
    promoCode?: string | null;
    total: number;
    orderType: OrderType;
    tableNumber?: string;
    paymentMethod: PaymentMethod;
  } | null>(null);

  // Ticks every 30s so "x menit lalu" labels in the order history stay fresh
  // without needing a page refresh.
  const [nowTick, setNowTick] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNowTick(Date.now()), 30000);
    return () => clearInterval(id);
  }, []);

  const productMap = useMemo(() => {
    const map: Record<string, Product> = {};
    products.forEach((p) => (map[p.id] = p));
    return map;
  }, [products]);

  const bestSellers = useMemo(
    () => products.filter((p) => p.badge === 'Best Seller' && p.stock > 0).slice(0, 4),
    [products]
  );

  const filteredProducts = useMemo(() => {
    let list = activeTab === 'semua' ? products : products.filter((p) => p.category === activeTab);
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter((p) => p.name.toLowerCase().includes(q));
    }
    return list;
  }, [products, activeTab, query]);

  const cartLines = useMemo(
    () =>
      Object.entries(cart)
        .filter(([, entry]) => entry.quantity > 0)
        .map(([productId, entry]) => ({ product: productMap[productId], quantity: entry.quantity, note: entry.note }))
        .filter((line) => line.product),
    [cart, productMap]
  );

  const subtotal = cartLines.reduce((sum, l) => sum + l.product.price * l.quantity, 0);
  const cartCount = cartLines.reduce((sum, l) => sum + l.quantity, 0);

  const myOrders = useMemo(
    () =>
      transactions
        .filter((t) => t.customerUsername === user?.username)
        .sort((a, b) => b.timestamp - a.timestamp),
    [transactions, user]
  );

  const totalSpent = myOrders.reduce((sum, o) => sum + o.total, 0);
  const points = Math.floor(totalSpent / 1000);
  const tier = tierFromOrders(myOrders.length);

  const activePromo = promoCode ? PROMOS.find((p) => p.code === promoCode) ?? null : null;
  const promoCheck = useMemo(
    () =>
      activePromo
        ? checkPromoEligibility(activePromo, cartLines, { isFirstOrder: myOrders.length === 0 })
        : null,
    [activePromo, cartLines, myOrders.length]
  );
  const discount =
    activePromo && promoCheck?.eligible
      ? Math.round(promoCheck.discountableAmount * (activePromo.discountPercent / 100))
      : 0;
  const discountedSubtotal = Math.max(0, subtotal - discount);
  const tax = discountedSubtotal * 0.1;
  const total = discountedSubtotal + tax;

  const favoriteCategoryLabel = useMemo(() => {
    const counts: Record<string, number> = {};
    myOrders.forEach((o) =>
      o.items.forEach((item) => {
        const cat = productMap[item.productId]?.category;
        if (cat) counts[cat] = (counts[cat] ?? 0) + item.quantity;
      })
    );
    const top = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
    return top ? (CATEGORY_LABELS[top[0]] ?? top[0]) : 'Belum ada';
  }, [myOrders, productMap]);

  const handleAdd = (product: Product) => {
    setCart((prev) => {
      const current = prev[product.id]?.quantity ?? 0;
      if (current >= product.stock) return prev;
      return { ...prev, [product.id]: { quantity: current + 1, note: prev[product.id]?.note ?? '' } };
    });
  };

  const handleIncrement = (productId: string) => {
    const product = productMap[productId];
    setCart((prev) => {
      const current = prev[productId]?.quantity ?? 0;
      if (!product || current >= product.stock) return prev;
      return { ...prev, [productId]: { quantity: current + 1, note: prev[productId]?.note ?? '' } };
    });
  };

  const handleDecrement = (productId: string) => {
    setCart((prev) => {
      const current = prev[productId]?.quantity ?? 0;
      if (current <= 1) {
        const next = { ...prev };
        delete next[productId];
        return next;
      }
      return { ...prev, [productId]: { quantity: current - 1, note: prev[productId]?.note ?? '' } };
    });
  };

  const handleRemove = (productId: string) => {
    setCart((prev) => {
      const next = { ...prev };
      delete next[productId];
      return next;
    });
  };

  const handleNoteChange = (productId: string, note: string) => {
    setCart((prev) => {
      if (!prev[productId]) return prev;
      return { ...prev, [productId]: { ...prev[productId], note } };
    });
  };

  const handleApplyPromo = (code: string) => {
    const promo = PROMOS.find((p) => p.code === code);
    if (!promo) return;
    const check = checkPromoEligibility(promo, cartLines, { isFirstOrder: myOrders.length === 0 });
    if (!check.eligible) {
      setPromoCode(null);
      setPromoError(`Syarat belum terpenuhi: ${check.reasons.join(', ')}`);
      return;
    }
    setPromoError(null);
    setPromoCode(code);
  };

  const handleRemovePromo = () => {
    setPromoCode(null);
    setPromoError(null);
  };

  const handleConfirmOrder = (details: {
    orderType: OrderType;
    tableNumber?: string;
    paymentMethod: PaymentMethod;
  }) => {
    recordTransaction({
      items: cartLines,
      subtotal,
      tax,
      discount,
      promoCode: activePromo?.code,
      total,
      paymentMethod: details.paymentMethod,
      cashierName: 'Self-Order Pelanggan',
      customerUsername: user?.username,
      customerName: user?.name,
      orderType: details.orderType,
      tableNumber: details.tableNumber,
    });
    setJustOrdered({
      id: `#${Date.now().toString().slice(-6)}`,
      items: cartLines.map((l) => ({
        name: l.product.name,
        quantity: l.quantity,
        price: l.product.price,
        note: l.note?.trim() || undefined,
      })),
      subtotal,
      tax,
      discount,
      promoCode: activePromo?.code,
      total,
      orderType: details.orderType,
      tableNumber: details.tableNumber,
      paymentMethod: details.paymentMethod,
    });
    setCart({});
    setPromoCode(null);
    setPromoError(null);
    setIsCartOpen(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleDeleteOrder = (orderId: string) => {
    if (confirm('Hapus riwayat pesanan ini? Tindakan ini tidak dapat dibatalkan.')) {
      removeTransaction(orderId);
    }
  };

  const firstName = user?.name.split(' ')[0] ?? 'Sahabat RasaNusa';

  return (
    <div
      className="min-h-screen w-full"
      style={{
        fontFamily: SANS,
        backgroundColor: BLACK,
        backgroundImage:
          'radial-gradient(60% 40% at 12% 0%, rgba(217,163,95,0.07), transparent 60%), radial-gradient(50% 35% at 100% 30%, rgba(201,122,43,0.06), transparent 65%), radial-gradient(45% 30% at 20% 100%, rgba(217,163,95,0.05), transparent 60%)',
        backgroundAttachment: 'fixed',
      }}
    >
      <GlobalStyles />

      {/* Header */}
      <header
        className="sticky top-0 z-30"
        style={{
          backgroundColor: 'rgba(7,7,7,0.85)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(243,234,217,0.08)',
        }}
      >
        <div className="max-w-6xl mx-auto flex items-center gap-3 sm:gap-4 px-4 sm:px-6 py-3.5 sm:py-4">
          <Link
            to="/"
            className="hidden sm:block"
            style={{ fontFamily: "'Anton', sans-serif", color: CREAM, fontSize: 22, letterSpacing: '-0.01em' }}
          >
            RasaNusa
          </Link>
          <div className="h-5 w-px hidden sm:block" style={{ backgroundColor: 'rgba(243,234,217,0.15)' }} />
          <h1 className="text-sm sm:text-base font-light" style={{ color: 'rgba(243,234,217,0.85)' }}>
            Halo, <span style={{ color: GOLD, fontWeight: 600 }}>{firstName}</span>
          </h1>

          <div className="ml-auto flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-full transition-all duration-300 hover:border-[#D9A35F]/60"
              style={{
                color: 'rgba(243,234,217,0.85)',
                border: '1px solid rgba(217,163,95,0.22)',
                backgroundColor: 'rgba(217,163,95,0.05)',
                backdropFilter: 'blur(8px)',
              }}
            >
              <ShoppingBag size={14} />
              <span className="hidden sm:inline">Pesanan Saya</span>
              {cartCount > 0 && (
                <span
                  className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-bold flex items-center justify-center"
                  style={{ background: GRADIENT, color: BLACK, boxShadow: '0 0 10px rgba(217,163,95,0.4)' }}
                >
                  {cartCount}
                </span>
              )}
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-xs font-semibold px-3.5 py-2 rounded-full transition-all duration-300 hover:scale-105"
              style={{ background: GRADIENT, color: BLACK, boxShadow: '0 4px 20px -6px rgba(217,163,95,0.4)' }}
            >
              <LogOut size={14} />
              <span className="hidden sm:inline">Keluar</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 flex flex-col gap-8 pb-28">
        {/* Hero welcome banner */}
        <section
          className="relative overflow-hidden rounded-3xl px-6 py-8 sm:px-10 sm:py-10 animate-fade-up"
          style={{ border: '1px solid rgba(217,163,95,0.14)' }}
        >
          <img
            src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1600&q=80&auto=format&fit=crop"
            alt=""
            aria-hidden="true"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(100deg, rgba(7,7,7,0.94) 38%, rgba(7,7,7,0.75) 68%, rgba(7,7,7,0.5) 100%), radial-gradient(120% 140% at 100% 100%, rgba(7,7,7,0) 0%, rgba(7,7,7,0.55) 100%)',
            }}
          />
          <style>{`
            @keyframes cd-float {
              0%, 100% { transform: translateY(0) rotate(-3deg); }
              50% { transform: translateY(-10px) rotate(3deg); }
            }
            @keyframes cd-glow {
              0%, 100% { opacity: 0.8; transform: scale(1); }
              50% { opacity: 1; transform: scale(1.1); }
            }
            @keyframes cd-card-float {
              0%, 100% { transform: translateY(0); }
              50% { transform: translateY(-14px); }
            }
          `}</style>
          <div
            className="absolute -top-24 -right-24 w-72 h-72 rounded-full pointer-events-none"
            style={{
              background: 'radial-gradient(circle, rgba(217,163,95,0.22), transparent 70%)',
              animation: 'cd-glow 6s ease-in-out infinite',
            }}
          />
          <div
            className="absolute -bottom-16 left-10 hidden sm:block pointer-events-none"
            style={{ animation: 'cd-float 6s ease-in-out infinite', opacity: 0.12 }}
          >
            <Utensils size={90} color={CREAM} strokeWidth={1} />
          </div>

          <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
            <div className="max-w-xl">
              <p
                className="text-xs font-semibold uppercase tracking-[0.2em] mb-2 flex items-center gap-1.5"
                style={{ color: GOLD }}
              >
                <Sparkles size={13} /> Dashboard Pelanggan
              </p>
              <h2
                style={{
                  fontFamily: SERIF,
                  fontWeight: 600,
                  fontSize: 'clamp(28px, 4.4vw, 42px)',
                  color: CREAM,
                  letterSpacing: '-0.01em',
                  lineHeight: 1.1,
                }}
              >
                Sajian{' '}
                <span
                  style={{
                    background: GRADIENT,
                    WebkitBackgroundClip: 'text',
                    backgroundClip: 'text',
                    color: 'transparent',
                  }}
                >
                  Istimewa
                </span>{' '}
                Nusantara, Selamat Datang{' '}
                <span
                  style={{
                    background: GRADIENT,
                    WebkitBackgroundClip: 'text',
                    backgroundClip: 'text',
                    color: 'transparent',
                  }}
                >
                  {firstName}
                </span>
              </h2>
              <p className="text-sm mt-3 max-w-md font-light leading-relaxed" style={{ color: 'rgba(243,234,217,0.6)' }}>
                Pesan menu favoritmu langsung dari sini, kumpulkan poin, dan nikmati promo spesial
                untuk anggota RasaNusa.
              </p>
              <div className="flex flex-wrap items-center gap-3 mt-5">
                <a
                  href="#menu"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-500 hover:scale-105"
                  style={{ background: GRADIENT, color: BLACK, boxShadow: '0 8px 30px -8px rgba(217,163,95,0.45)' }}
                >
                  <Utensils size={15} /> Pesan Sekarang
                </a>

                <div
                  className="inline-flex items-center gap-3 rounded-full pl-2 pr-4 py-1.5"
                  style={{
                    backgroundColor: 'rgba(243,234,217,0.05)',
                    border: '1px solid rgba(217,163,95,0.25)',
                    backdropFilter: 'blur(10px)',
                  }}
                >
                  <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'rgba(217,163,95,0.16)' }}>
                    <Award size={15} style={{ color: GOLD }} />
                  </div>
                  <div>
                    <p style={{ fontFamily: SERIF, fontWeight: 600, fontSize: 13, color: CREAM, lineHeight: 1.1 }}>
                      {tier.label} · {points.toLocaleString('id-ID')} poin
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating food showcase card */}
            <div
              className="relative w-full max-w-[320px] mx-auto lg:mx-0 lg:flex-shrink-0 pr-0 sm:pr-8 pb-0 sm:pb-8"
              style={{ animation: 'cd-card-float 5s ease-in-out infinite' }}
            >
              <div
                className="relative rounded-3xl overflow-hidden aspect-[4/5]"
                style={{
                  border: '1px solid rgba(217,163,95,0.3)',
                  boxShadow: '0 20px 60px -15px rgba(0,0,0,0.6), 0 0 40px rgba(217,163,95,0.12)',
                }}
              >
                <img
                  src="https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=700&h=880&fit=crop&auto=format"
                  alt="Nasi Goreng Kampung — menu andalan RasaNusa"
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div
                  className="absolute inset-0"
                  style={{ background: 'linear-gradient(180deg, rgba(7,7,7,0) 40%, rgba(7,7,7,0.85) 100%)' }}
                />
                <div
                  className="absolute top-3 left-3 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide px-2.5 py-1.5 rounded-full"
                  style={{
                    backgroundColor: 'rgba(7,7,7,0.55)',
                    border: '1px solid rgba(217,163,95,0.35)',
                    backdropFilter: 'blur(8px)',
                    color: GOLD,
                  }}
                >
                  <Star size={10} /> Menu Andalan
                </div>
                <div className="absolute bottom-4 left-4 right-4">
                  <p
                    className="rounded-xl px-3.5 py-2.5"
                    style={{
                      backgroundColor: 'rgba(7,7,7,0.5)',
                      border: '1px solid rgba(243,234,217,0.15)',
                      backdropFilter: 'blur(10px)',
                    }}
                  >
                    <span className="block text-[10px] uppercase tracking-[0.15em] font-semibold" style={{ color: GOLD }}>
                      Pilihan Chef
                    </span>
                    <span className="block mt-1 text-sm font-medium" style={{ color: CREAM, fontFamily: SERIF }}>
                      Nasi Goreng Kampung Spesial
                    </span>
                  </p>
                </div>
              </div>

              {/* Small accent card — sits fully outside the main image, bottom-right, so it never covers the dish or its caption */}
              <div
                className="hidden sm:flex absolute -bottom-6 -right-2 items-center gap-3 rounded-2xl px-4 py-3 max-w-[200px] z-10"
                style={{
                  backgroundColor: 'rgba(7,7,7,0.9)',
                  border: '1px solid rgba(217,163,95,0.3)',
                  backdropFilter: 'blur(12px)',
                  boxShadow: '0 10px 30px -8px rgba(0,0,0,0.6)',
                }}
              >
                <div className="w-11 h-11 rounded-lg overflow-hidden flex-shrink-0">
                  <img
                    src="https://images.unsplash.com/photo-1529563021893-cc83c992d75d?w=120&h=120&fit=crop&auto=format"
                    alt="Sate Ayam Madura"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-light truncate" style={{ color: 'rgba(243,234,217,0.6)' }}>
                    Rasa autentik, siap disantap
                  </p>
                  <p className="text-xs font-semibold" style={{ color: GOLD }}>
                    Sate Ayam Madura
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Cards block — stats + sorotan menu, langsung setelah hero pertama */}
        <section className="flex flex-col gap-6 animate-fade-up delay-100">
          {/* Stats row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              icon={<Award size={18} style={{ color: GOLD }} />}
              iconBg="rgba(217,163,95,0.14)"
              label="Poin Loyalitas"
              value={`${points.toLocaleString('id-ID')} poin`}
            />
            <StatCard
              icon={<Receipt size={18} style={{ color: '#2FA3B3' }} />}
              iconBg="rgba(29,107,118,0.16)"
              label="Total Pesanan"
              value={`${myOrders.length} pesanan`}
            />
            <StatCard
              icon={<Star size={18} style={{ color: GOLD }} />}
              iconBg="rgba(217,163,95,0.14)"
              label="Status Member"
              value={tier.label}
              sub={tier.next ? `${tier.next - myOrders.length} pesanan lagi ke level berikutnya` : 'Level tertinggi'}
            />
            <StatCard
              icon={<Heart size={18} style={{ color: '#E8836C' }} />}
              iconBg="rgba(196,67,43,0.16)"
              label="Kategori Favorit"
              value={favoriteCategoryLabel}
            />
          </div>

          {/* Featured / Sorotan Menu — best sellers */}
          {bestSellers.length > 0 && (
            <div
              className="relative overflow-hidden rounded-3xl px-5 sm:px-8 py-8 sm:py-10"
              style={{ backgroundColor: 'rgba(243,234,217,0.03)', border: '1px solid rgba(243,234,217,0.08)' }}
            >
              <div
                className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full pointer-events-none"
                style={{ background: 'radial-gradient(circle, rgba(217,163,95,0.12), transparent 70%)' }}
              />
              <div className="relative flex items-end justify-between gap-4 mb-5 sm:mb-6">
                <div>
                  <p
                    className="text-xs font-semibold uppercase tracking-[0.2em] mb-2 flex items-center gap-1.5"
                    style={{ color: GOLD }}
                  >
                    <Star size={13} /> Sorotan Kami
                  </p>
                  <h3 style={{ fontFamily: SERIF, fontWeight: 600, fontSize: 'clamp(20px, 2.6vw, 28px)', color: CREAM, letterSpacing: '-0.01em' }}>
                    Menu Favorit Pelanggan RasaNusa
                  </h3>
                </div>
                <a
                  href="#menu"
                  className="hidden sm:inline-flex items-center gap-1 text-sm flex-shrink-0 font-light transition-colors hover:text-[#D9A35F]"
                  style={{ color: 'rgba(243,234,217,0.7)' }}
                >
                  Lihat Semua Menu <ArrowUpRight size={14} />
                </a>
              </div>

              <div className="relative grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                {bestSellers.map((product) => {
                  const quantity = cart[product.id]?.quantity ?? 0;
                  return (
                    <div key={product.id} className="group relative rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(243,234,217,0.1)' }}>
                      <div className="relative aspect-[4/3] overflow-hidden">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                        <span
                          className="absolute top-2 left-2 flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide px-2 py-1 rounded-full"
                          style={{ background: GRADIENT, color: BLACK }}
                        >
                          <Star size={9} /> Best Seller
                        </span>
                        <button
                          onClick={() => handleAdd(product)}
                          disabled={quantity >= product.stock}
                          className="absolute bottom-2 right-2 w-8 h-8 rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-110 disabled:opacity-40"
                          style={{ background: GRADIENT, color: BLACK }}
                          aria-label={`Tambah ${product.name}`}
                        >
                          <Plus size={15} strokeWidth={2.5} />
                        </button>
                      </div>
                      <div className="p-3" style={{ backgroundColor: 'rgba(243,234,217,0.04)' }}>
                        <p className="text-sm line-clamp-1 font-light" style={{ color: CREAM }}>
                          {product.name}
                        </p>
                        <p className="text-xs font-semibold mt-1" style={{ color: GOLD }}>
                          {formatIDR(product.price)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </section>

        {/* Hero kedua — banner cinematic ajakan menjelajah menu */}
        <section
          className="relative overflow-hidden rounded-3xl animate-fade-up delay-200"
          style={{ border: '1px solid rgba(217,163,95,0.14)' }}
        >
          <div className="relative h-[280px] sm:h-[340px]">
            <img
              src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1600&h=800&fit=crop&auto=format"
              alt="Suasana hangat RasaNusa"
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div
              className="absolute inset-0"
              style={{
                background:
                  'linear-gradient(90deg, rgba(7,7,7,0.92) 0%, rgba(7,7,7,0.55) 45%, rgba(7,7,7,0.25) 100%)',
              }}
            />
            <div
              className="absolute -top-16 -right-16 w-72 h-72 rounded-full pointer-events-none"
              style={{
                background: 'radial-gradient(circle, rgba(217,163,95,0.25), transparent 70%)',
                animation: 'cd-glow 6s ease-in-out infinite',
              }}
            />

            <div className="relative h-full flex flex-col justify-center px-6 sm:px-10 max-w-lg">
              <p
                className="text-xs font-semibold uppercase tracking-[0.2em] mb-2 flex items-center gap-1.5"
                style={{ color: GOLD }}
              >
                <ChefHat size={13} /> Racikan Chef Kami
              </p>
              <h2
                style={{
                  fontFamily: SERIF,
                  fontWeight: 600,
                  fontSize: 'clamp(24px, 3.6vw, 36px)',
                  color: CREAM,
                  letterSpacing: '-0.01em',
                  lineHeight: 1.15,
                }}
              >
                Setiap Hidangan, Cerita{' '}
                <span
                  style={{
                    background: GRADIENT,
                    WebkitBackgroundClip: 'text',
                    backgroundClip: 'text',
                    color: 'transparent',
                  }}
                >
                  Rasa Nusantara
                </span>
              </h2>
              <p className="text-sm mt-3 font-light leading-relaxed" style={{ color: 'rgba(243,234,217,0.65)' }}>
                Dari rempah pilihan hingga teknik memasak turun-temurun, jelajahi menu yang kami
                siapkan dengan penuh dedikasi untukmu.
              </p>
              <a
                href="#menu"
                className="inline-flex items-center gap-2 mt-5 px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-500 hover:scale-105 w-fit"
                style={{ background: GRADIENT, color: BLACK, boxShadow: '0 8px 30px -8px rgba(217,163,95,0.45)' }}
              >
                <Utensils size={15} /> Jelajahi Menu
              </a>
            </div>
          </div>
        </section>

        {/* Menu */}
        <section id="menu" className="scroll-mt-20 animate-fade-up delay-400">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
            <h3 style={{ fontFamily: SERIF, fontWeight: 600, fontSize: 16, color: CREAM }} className="sm:mr-2">
              Menu Kami
            </h3>
            <div className="flex gap-2 overflow-x-auto pb-1 sm:pb-0">
              {TABS.map((tabKey) => {
                const active = activeTab === tabKey;
                return (
                  <button
                    key={tabKey}
                    onClick={() => setActiveTab(tabKey)}
                    className="px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all duration-300"
                    style={
                      active
                        ? { background: GRADIENT, color: BLACK, boxShadow: '0 0 16px rgba(217,163,95,0.25)' }
                        : { backgroundColor: 'rgba(243,234,217,0.05)', color: 'rgba(243,234,217,0.6)', border: '1px solid rgba(243,234,217,0.12)' }
                    }
                  >
                    {CATEGORY_LABELS[tabKey]}
                  </button>
                );
              })}
            </div>
            <div className="relative sm:ml-auto sm:w-56">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'rgba(243,234,217,0.4)' }} />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Cari menu..."
                className="w-full pl-8 pr-3 py-2 rounded-full text-sm outline-none font-light transition-colors duration-300"
                style={{
                  backgroundColor: '#121212',
                  border: '1px solid rgba(217,163,95,0.2)',
                  color: CREAM,
                }}
                onFocus={(e) => (e.currentTarget.style.borderColor = GOLD)}
                onBlur={(e) => (e.currentTarget.style.borderColor = 'rgba(217,163,95,0.2)')}
              />
            </div>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16" style={{ color: 'rgba(243,234,217,0.4)' }}>
              <p className="text-sm font-light">Menu tidak ditemukan.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredProducts.map((product) => (
                <MenuCard
                  key={product.id}
                  product={product}
                  quantity={cart[product.id]?.quantity ?? 0}
                  onAdd={handleAdd}
                  onIncrement={handleIncrement}
                  onDecrement={handleDecrement}
                />
              ))}
            </div>
          )}
        </section>

        {/* Order history */}
        <section className="animate-fade-up delay-500">
          <div className="flex items-center justify-between mb-4">
            <h3 style={{ fontFamily: SERIF, fontWeight: 600, fontSize: 16, color: CREAM }}>Riwayat Pesanan</h3>
            {myOrders.length > 4 && (
              <button
                onClick={() => setShowAllOrders((v) => !v)}
                className="flex items-center gap-1 text-xs font-light transition-colors hover:text-[#D9A35F]"
                style={{ color: 'rgba(243,234,217,0.55)' }}
              >
                {showAllOrders ? 'Tampilkan lebih sedikit' : `Lihat semua (${myOrders.length})`}
                <ChevronDown
                  size={13}
                  style={{ transform: showAllOrders ? 'rotate(180deg)' : 'none', transition: 'transform 300ms' }}
                />
              </button>
            )}
          </div>
          {myOrders.length === 0 ? (
            <div
              className="rounded-2xl py-10 flex flex-col items-center justify-center"
              style={{ backgroundColor: 'rgba(243,234,217,0.03)', border: '1px solid rgba(243,234,217,0.1)', color: 'rgba(243,234,217,0.4)' }}
            >
              <Clock3 size={28} className="mb-2 opacity-40" />
              <p className="text-sm font-light">Belum ada riwayat pesanan.</p>
              <p className="text-xs mt-1 font-light">Pesanan yang kamu buat akan muncul di sini.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {(showAllOrders ? myOrders : myOrders.slice(0, 4)).map((order) => {
                const statusMeta = ORDER_STATUS_META[order.status];
                const StatusIcon = statusMeta.icon;
                const isActive = order.status !== 'selesai' && order.status !== 'dibatalkan';
                const stepIndex = ORDER_STATUS_FLOW.indexOf(order.status);
                const itemsWithNotes = order.items.filter((i) => i.note);
                return (
                  <div
                    key={order.id}
                    className="rounded-2xl px-4 py-3.5"
                    style={{ backgroundColor: 'rgba(243,234,217,0.03)', border: '1px solid rgba(243,234,217,0.1)' }}
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: 'rgba(29,107,118,0.16)' }}
                      >
                        <Receipt size={16} style={{ color: '#2FA3B3' }} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium truncate" style={{ color: CREAM }}>
                          {order.items.map((i) => `${i.name} x${i.quantity}`).join(', ')}
                        </p>
                        <p className="text-xs mt-0.5 font-light" style={{ color: 'rgba(243,234,217,0.45)' }}>
                          {new Date(order.timestamp).toLocaleString('id-ID', {
                            dateStyle: 'medium',
                            timeStyle: 'short',
                          })}{' '}
                          · {order.orderType === 'takeaway' ? 'Bawa Pulang' : order.tableNumber ? `Meja ${order.tableNumber}` : 'Dine-in'} ·{' '}
                          {PAYMENT_LABELS[order.paymentMethod]}
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-sm font-bold" style={{ color: CREAM }}>
                          {formatIDR(order.total)}
                        </p>
                        <span
                          className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full mt-0.5"
                          style={{ color: statusMeta.color, backgroundColor: statusMeta.bg }}
                        >
                          <StatusIcon size={10} /> {statusMeta.shortLabel}
                        </span>
                      </div>
                      <button
                        onClick={() => handleDeleteOrder(order.id)}
                        className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-colors duration-300 hover:bg-white/10"
                        style={{ color: 'rgba(243,234,217,0.35)' }}
                        onMouseEnter={(e) => (e.currentTarget.style.color = '#E8836C')}
                        onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(243,234,217,0.35)')}
                        aria-label="Hapus riwayat pesanan ini"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>

                    {/* Real-time status progress — only meaningful for orders still in flight. */}
                    {isActive && (
                      <div className="flex items-center gap-1.5 mt-3 pl-14 pr-1">
                        {ORDER_STATUS_FLOW.map((step, idx) => (
                          <div key={step} className="flex items-center flex-1 last:flex-none">
                            <span
                              className="w-2 h-2 rounded-full flex-shrink-0 transition-colors duration-500"
                              style={{
                                backgroundColor: idx <= stepIndex ? GOLD : 'rgba(243,234,217,0.15)',
                                boxShadow: idx === stepIndex ? '0 0 8px rgba(217,163,95,0.6)' : 'none',
                              }}
                            />
                            {idx < ORDER_STATUS_FLOW.length - 1 && (
                              <span
                                className="h-px flex-1 mx-1 transition-colors duration-500"
                                style={{ backgroundColor: idx < stepIndex ? GOLD : 'rgba(243,234,217,0.12)' }}
                              />
                            )}
                          </div>
                        ))}
                        <span className="text-[10px] font-light ml-2 flex-shrink-0" style={{ color: 'rgba(243,234,217,0.4)' }}>
                          {formatRelativeTime(order.statusUpdatedAt, nowTick)}
                        </span>
                      </div>
                    )}

                    {/* Special requests noted per item at checkout. */}
                    {itemsWithNotes.length > 0 && (
                      <div className="flex flex-col gap-1 mt-3 pl-14">
                        {itemsWithNotes.map((item) => (
                          <div key={item.productId} className="flex items-start gap-1.5">
                            <MessageSquareText size={11} className="flex-shrink-0 mt-0.5" style={{ color: GOLD, opacity: 0.75 }} />
                            <span className="text-[11px] font-light italic" style={{ color: 'rgba(243,234,217,0.5)' }}>
                              <span style={{ color: 'rgba(243,234,217,0.7)', fontStyle: 'normal' }}>{item.name}:</span> {item.note}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Promo carousel — ditutup di akhir halaman */}
        <section className="animate-fade-up delay-600">
          <div className="flex items-center justify-between mb-3">
            <h3 style={{ fontFamily: SERIF, fontWeight: 600, fontSize: 16, color: CREAM }}>
              Promo Untukmu
            </h3>
            <Link
              to="/promo"
              className="flex items-center gap-1 text-xs font-light transition-colors hover:text-[#D9A35F]"
              style={{ color: 'rgba(243,234,217,0.6)' }}
            >
              Lihat Semua Promo <ArrowUpRight size={12} />
            </Link>
          </div>
          <PromoCarousel
            activeCode={promoCode}
            error={promoError}
            onApply={handleApplyPromo}
            onRemove={handleRemovePromo}
          />
        </section>
      </main>

      {/* Floating cart bar (mobile-friendly) */}
      {cartCount > 0 && !isCartOpen && (
        <button
          onClick={() => setIsCartOpen(true)}
          className="fixed bottom-5 left-1/2 -translate-x-1/2 z-30 flex items-center gap-3 pl-4 pr-2 py-2 rounded-full shadow-2xl transition-all duration-500 hover:scale-[1.02]"
          style={{
            backgroundColor: 'rgba(7,7,7,0.85)',
            backdropFilter: 'blur(14px)',
            border: '1px solid rgba(217,163,95,0.3)',
            boxShadow: '0 10px 40px -10px rgba(0,0,0,0.6), 0 0 24px rgba(217,163,95,0.12)',
          }}
        >
          <ShoppingBag size={16} style={{ color: CREAM }} />
          <span className="text-sm font-semibold" style={{ color: CREAM }}>
            {cartCount} item
          </span>
          <span
            className="text-sm font-bold px-3 py-1.5 rounded-full"
            style={{ background: GRADIENT, color: BLACK }}
          >
            {formatIDR(total)}
          </span>
        </button>
      )}

      <CartDrawer
        open={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        lines={cartLines}
        onIncrement={handleIncrement}
        onDecrement={handleDecrement}
        onRemove={handleRemove}
        onNoteChange={handleNoteChange}
        subtotal={subtotal}
        tax={tax}
        discount={discount}
        promoCode={activePromo?.code}
        onRemovePromo={handleRemovePromo}
        total={total}
        onConfirm={handleConfirmOrder}
      />

      {justOrdered && (
        <OrderSuccessModal
          orderId={justOrdered.id}
          items={justOrdered.items}
          subtotal={justOrdered.subtotal}
          tax={justOrdered.tax}
          discount={justOrdered.discount}
          promoCode={justOrdered.promoCode}
          total={justOrdered.total}
          orderType={justOrdered.orderType}
          tableNumber={justOrdered.tableNumber}
          paymentMethod={justOrdered.paymentMethod}
          onClose={() => setJustOrdered(null)}
        />
      )}
    </div>
  );
}

function StatCard({
  icon,
  iconBg,
  label,
  value,
  sub,
}: {
  icon: React.ReactNode;
  iconBg: string;
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div
      className="rounded-2xl p-4 flex items-start gap-3"
      style={{ backgroundColor: 'rgba(243,234,217,0.03)', border: '1px solid rgba(243,234,217,0.1)' }}
    >
      <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: iconBg }}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs font-light" style={{ color: 'rgba(243,234,217,0.5)' }}>
          {label}
        </p>
        <p className="text-base sm:text-lg font-semibold leading-tight truncate" style={{ color: '#F3EAD9' }}>
          {value}
        </p>
        {sub && (
          <p className="text-[11px] mt-0.5 font-light" style={{ color: 'rgba(243,234,217,0.4)' }}>
            {sub}
          </p>
        )}
      </div>
    </div>
  );
}
