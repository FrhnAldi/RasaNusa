import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowLeft,
  ChefHat,
  Clock3,
  LayoutDashboard,
  LogOut,
  PackageSearch,
  Receipt,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import { useAppData } from '../context/AppDataContext';
import { useAuth } from '../context/AuthContext';
import { formatIDR } from '../data/products';
import GlobalStyles from '../components/site/GlobalStyles';
import OverviewTab from '../components/admin/OverviewTab';
import OrdersTab from '../components/admin/OrdersTab';
import SalesRecapTab from '../components/admin/SalesRecapTab';
import StockTab from '../components/admin/StockTab';

type TabKey = 'overview' | 'orders' | 'recap' | 'stock';

const TABS: { key: TabKey; label: string; icon: typeof LayoutDashboard; desc: string }[] = [
  { key: 'overview', label: 'Ringkasan', icon: LayoutDashboard, desc: 'Performa bisnis sekilas pandang.' },
  { key: 'orders', label: 'Pesanan', icon: Clock3, desc: 'Pantau & perbarui status pesanan secara real-time.' },
  { key: 'recap', label: 'Rekap Penjualan', icon: Receipt, desc: 'Riwayat, rincian, dan ekspor laporan setiap transaksi.' },
  { key: 'stock', label: 'Kelola Stok', icon: PackageSearch, desc: 'Atur menu dan ketersediaan stok.' },
];

// Basilico luxury design system — shared with the customer dashboard, cart
// drawer & order modal: near-black stage, dual gold / burnt-orange accent,
// warm cream & gray text, Playfair Display for headings, Inter for body copy.
const BLACK = '#070707';
const CREAM = '#F3EAD9';
const GOLD = '#D9A35F';
const BURNT = '#C97A2B';
const TEAL = '#2FA3B3';
const GRADIENT = `linear-gradient(135deg, ${GOLD}, ${BURNT})`;
const SERIF = "'Playfair Display', serif";
const SANS = 'Inter, sans-serif';
const MUTED = 'rgba(243,234,217,0.55)';

export default function AdminDashboard() {
  const { products, transactions } = useAppData();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<TabKey>('overview');

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const todaysRevenue = useMemo(() => {
    const today = new Date().toDateString();
    return transactions
      .filter((t) => new Date(t.timestamp).toDateString() === today)
      .reduce((sum, t) => sum + t.total, 0);
  }, [transactions]);

  const todaysOrders = useMemo(() => {
    const today = new Date().toDateString();
    return transactions.filter((t) => new Date(t.timestamp).toDateString() === today).length;
  }, [transactions]);

  const attentionCount = useMemo(() => products.filter((p) => p.stock <= 5).length, [products]);

  const activeTabMeta = TABS.find((t) => t.key === tab) ?? TABS[0];

  return (
    <div
      className="min-h-screen w-full"
      style={{
        fontFamily: SANS,
        backgroundColor: BLACK,
        backgroundImage:
          'radial-gradient(60% 40% at 88% 0%, rgba(217,163,95,0.07), transparent 60%), radial-gradient(50% 35% at 0% 30%, rgba(201,122,43,0.06), transparent 65%), radial-gradient(45% 30% at 30% 100%, rgba(47,163,179,0.05), transparent 60%)',
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
            className="hidden sm:flex items-center justify-center w-9 h-9 rounded-full flex-shrink-0 transition-colors duration-300 hover:bg-white/5"
            style={{ color: MUTED, border: '1px solid rgba(243,234,217,0.12)' }}
            aria-label="Kembali ke beranda"
          >
            <ArrowLeft size={15} />
          </Link>
          <div className="h-5 w-px hidden sm:block" style={{ backgroundColor: 'rgba(243,234,217,0.15)' }} />

          <div
            className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: 'rgba(217,163,95,0.12)', border: '1px solid rgba(217,163,95,0.3)' }}
          >
            <ChefHat size={16} style={{ color: GOLD }} />
          </div>
          <div className="min-w-0">
            <h1
              style={{ fontFamily: "'Anton', sans-serif", color: CREAM, fontSize: 17, letterSpacing: '-0.01em', lineHeight: 1 }}
            >
              RasaNusa <span style={{ color: GOLD }}>Admin</span>
            </h1>
            <p className="text-[11px] font-light hidden sm:block mt-0.5" style={{ color: MUTED }}>
              Halo, <span style={{ color: CREAM, fontWeight: 500 }}>{user?.name ?? 'Admin'}</span>
            </p>
          </div>

          <div className="ml-auto flex items-center gap-2 sm:gap-3">
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

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 flex flex-col gap-6">
        {/* Welcome / quick-glance strip */}
        <section
          className="relative overflow-hidden rounded-3xl px-5 sm:px-8 py-6 sm:py-7 animate-fade-up"
          style={{ backgroundColor: 'rgba(243,234,217,0.03)', border: '1px solid rgba(217,163,95,0.14)' }}
        >
          <div
            className="absolute -top-20 -right-20 w-64 h-64 rounded-full pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(217,163,95,0.16), transparent 70%)' }}
          />
          <div
            className="absolute -bottom-24 -left-16 w-56 h-56 rounded-full pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(47,163,179,0.10), transparent 70%)' }}
          />

          <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <p
                className="text-xs font-semibold uppercase tracking-[0.2em] mb-2 flex items-center gap-1.5"
                style={{ color: GOLD }}
              >
                <Sparkles size={13} /> Dashboard Admin
              </p>
              <h2
                style={{
                  fontFamily: SERIF,
                  fontWeight: 600,
                  fontSize: 'clamp(22px, 3vw, 30px)',
                  color: CREAM,
                  letterSpacing: '-0.01em',
                  lineHeight: 1.15,
                }}
              >
                Kelola Dapur{' '}
                <span
                  style={{
                    background: GRADIENT,
                    WebkitBackgroundClip: 'text',
                    backgroundClip: 'text',
                    color: 'transparent',
                  }}
                >
                  RasaNusa
                </span>
              </h2>
              <p className="text-sm mt-2 max-w-md font-light leading-relaxed" style={{ color: MUTED }}>
                Pantau penjualan, rekap transaksi, dan kelola stok menu — semua dalam satu tempat.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2.5 sm:gap-3 flex-shrink-0">
              <QuickStat
                icon={<TrendingUp size={14} style={{ color: GOLD }} />}
                label="Pendapatan Hari Ini"
                value={formatIDR(todaysRevenue)}
              />
              <QuickStat
                icon={<Receipt size={14} style={{ color: TEAL }} />}
                label="Pesanan Hari Ini"
                value={`${todaysOrders}`}
              />
              <QuickStat
                icon={<AlertTriangle size={14} style={{ color: '#E8836C' }} />}
                label="Stok Perlu Perhatian"
                value={`${attentionCount}`}
              />
            </div>
          </div>
        </section>

        {/* Tab navigation */}
        <div className="flex flex-col gap-2 animate-fade-up delay-100">
          <div className="flex gap-2 overflow-x-auto pb-1">
            {TABS.map((t) => {
              const Icon = t.icon;
              const active = tab === t.key;
              return (
                <button
                  key={t.key}
                  onClick={() => setTab(t.key)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-semibold whitespace-nowrap transition-all duration-300"
                  style={
                    active
                      ? { background: GRADIENT, color: BLACK, boxShadow: '0 0 16px rgba(217,163,95,0.25)' }
                      : { backgroundColor: 'rgba(243,234,217,0.05)', color: MUTED, border: '1px solid rgba(243,234,217,0.12)' }
                  }
                >
                  <Icon size={15} />
                  {t.label}
                </button>
              );
            })}
          </div>
          <p className="text-xs font-light pl-1" style={{ color: MUTED }}>
            {activeTabMeta.desc}
          </p>
        </div>

        {/* Tab content — re-keys on tab change to replay the entrance animation */}
        <div key={tab} className="animate-fade-up">
          {tab === 'overview' && <OverviewTab products={products} transactions={transactions} />}
          {tab === 'orders' && <OrdersTab transactions={transactions} />}
          {tab === 'recap' && <SalesRecapTab transactions={transactions} />}
          {tab === 'stock' && <StockTab products={products} />}
        </div>
      </main>
    </div>
  );
}

function QuickStat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div
      className="rounded-2xl px-3 py-2.5 flex flex-col gap-1.5 transition-all duration-300 hover:-translate-y-0.5"
      style={{ backgroundColor: 'rgba(243,234,217,0.04)', border: '1px solid rgba(243,234,217,0.1)' }}
    >
      <div className="flex items-center gap-1.5">
        {icon}
        <span className="text-[9px] sm:text-[10px] font-medium uppercase tracking-wide" style={{ color: MUTED }}>
          {label}
        </span>
      </div>
      <span className="text-xs sm:text-sm font-semibold truncate" style={{ color: CREAM, fontFamily: SERIF }}>
        {value}
      </span>
    </div>
  );
}
