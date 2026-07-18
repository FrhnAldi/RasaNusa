import { useMemo } from 'react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Flame, Package, Sparkles, TrendingUp, Utensils, Wallet } from 'lucide-react';
import { formatIDR, CATEGORY_LABELS } from '../../data/products';
import type { Product, Transaction } from '../../types/pos';

interface Props {
  products: Product[];
  transactions: Transaction[];
}

// Basilico luxury design system — matches the rest of the admin & customer dashboards.
const CREAM = '#F3EAD9';
const GOLD = '#D9A35F';
const BURNT = '#C97A2B';
const TEAL = '#2FA3B3';
const MUTED = 'rgba(243,234,217,0.55)';
const SERIF = "'Playfair Display', serif";

export default function OverviewTab({ products, transactions }: Props) {
  const totalItems = transactions.reduce(
    (sum, t) => sum + t.items.reduce((s, i) => s + i.quantity, 0),
    0
  );
  const totalRevenue = transactions.reduce((sum, t) => sum + t.total, 0);
  const estimatedProfit = totalRevenue * 0.4;
  const lowStockCount = products.filter((p) => p.stock > 0 && p.stock <= 5).length;
  const outOfStockCount = products.filter((p) => p.stock === 0).length;

  const revenueByCategory = useMemo(() => {
    const map: Record<string, number> = {};
    const productMap: Record<string, Product> = {};
    products.forEach((p) => (productMap[p.id] = p));
    transactions.forEach((t) => {
      t.items.forEach((item) => {
        const cat = productMap[item.productId]?.category ?? 'lainnya';
        map[cat] = (map[cat] ?? 0) + item.price * item.quantity;
      });
    });
    return Object.entries(map).map(([category, revenue]) => ({
      category: CATEGORY_LABELS[category] ?? category,
      revenue,
    }));
  }, [products, transactions]);

  const topItems = useMemo(() => {
    const map: Record<string, { name: string; qty: number }> = {};
    transactions.forEach((t) => {
      t.items.forEach((item) => {
        if (!map[item.productId]) map[item.productId] = { name: item.name, qty: 0 };
        map[item.productId].qty += item.quantity;
      });
    });
    return Object.values(map)
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 5)
      .map((i) => ({ name: i.name.length > 16 ? i.name.slice(0, 16) + '…' : i.name, qty: i.qty }));
  }, [transactions]);

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<Wallet size={18} style={{ color: GOLD }} />}
          iconBg="rgba(217,163,95,0.14)"
          label="Total Pendapatan"
          value={formatIDR(totalRevenue)}
        />
        <StatCard
          icon={<TrendingUp size={18} style={{ color: GOLD }} />}
          iconBg="rgba(217,163,95,0.14)"
          label="Estimasi Keuntungan"
          value={formatIDR(estimatedProfit)}
          sub="40% dari pendapatan"
        />
        <StatCard
          icon={<Package size={18} style={{ color: TEAL }} />}
          iconBg="rgba(29,107,118,0.16)"
          label="Item Terjual"
          value={`${totalItems} item`}
        />
        <StatCard
          icon={<Utensils size={18} style={{ color: '#E8836C' }} />}
          iconBg="rgba(196,67,43,0.16)"
          label="Stok Perlu Perhatian"
          value={`${lowStockCount + outOfStockCount} menu`}
          sub={`${outOfStockCount} habis · ${lowStockCount} menipis`}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 animate-fade-up delay-100">
        <ChartCard title="Pendapatan per Kategori" icon={<Sparkles size={13} style={{ color: GOLD }} />}>
          {revenueByCategory.length === 0 ? (
            <EmptyChartState />
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={revenueByCategory}>
                <defs>
                  <linearGradient id="adminGoldBar" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={GOLD} />
                    <stop offset="100%" stopColor={BURNT} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(243,234,217,0.08)" vertical={false} />
                <XAxis dataKey="category" tick={{ fontSize: 11, fill: MUTED }} stroke="rgba(243,234,217,0.15)" />
                <YAxis
                  tick={{ fontSize: 10, fill: MUTED }}
                  stroke="rgba(243,234,217,0.15)"
                  tickFormatter={(v) => `${Math.round(v / 1000)}rb`}
                />
                <Tooltip
                  content={<ChartTooltip formatter={(v) => formatIDR(v)} />}
                  cursor={{ fill: 'rgba(217,163,95,0.06)' }}
                />
                <Bar dataKey="revenue" fill="url(#adminGoldBar)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        <ChartCard title="5 Menu Terlaris" icon={<Flame size={13} style={{ color: TEAL }} />}>
          {topItems.length === 0 ? (
            <EmptyChartState />
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={topItems} layout="vertical" margin={{ left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(243,234,217,0.08)" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 10, fill: MUTED }} stroke="rgba(243,234,217,0.15)" />
                <YAxis
                  dataKey="name"
                  type="category"
                  tick={{ fontSize: 11, fill: MUTED }}
                  width={100}
                  stroke="rgba(243,234,217,0.15)"
                />
                <Tooltip
                  content={<ChartTooltip formatter={(v) => `${v} terjual`} />}
                  cursor={{ fill: 'rgba(47,163,179,0.06)' }}
                />
                <Bar dataKey="qty" fill={TEAL} radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>
      </div>
    </div>
  );
}

function ChartTooltip({
  active,
  payload,
  label,
  formatter,
}: {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
  formatter: (value: number) => string;
}) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div
      className="rounded-xl px-3 py-2 text-xs"
      style={{
        backgroundColor: 'rgba(7,7,7,0.92)',
        border: '1px solid rgba(217,163,95,0.3)',
        backdropFilter: 'blur(8px)',
        color: CREAM,
        fontFamily: 'Inter, sans-serif',
      }}
    >
      {label && (
        <p className="font-semibold mb-0.5" style={{ color: GOLD }}>
          {label}
        </p>
      )}
      <p className="font-light">{formatter(payload[0].value)}</p>
    </div>
  );
}

function ChartCard({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div
      className="rounded-2xl p-5 transition-colors duration-300"
      style={{ backgroundColor: 'rgba(243,234,217,0.03)', border: '1px solid rgba(243,234,217,0.08)' }}
    >
      <h3
        className="text-sm font-semibold mb-4 flex items-center gap-1.5"
        style={{ color: CREAM, fontFamily: SERIF }}
      >
        {icon} {title}
      </h3>
      {children}
    </div>
  );
}

function EmptyChartState() {
  return (
    <div
      className="h-[220px] flex flex-col items-center justify-center gap-2 text-sm font-light"
      style={{ color: 'rgba(243,234,217,0.35)' }}
    >
      <Sparkles size={20} style={{ opacity: 0.4 }} />
      Belum ada data transaksi.
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
      className="group rounded-2xl p-4 flex items-start gap-3 transition-all duration-300 hover:-translate-y-1"
      style={{ backgroundColor: 'rgba(243,234,217,0.03)', border: '1px solid rgba(243,234,217,0.1)' }}
    >
      <div
        className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 transition-transform duration-300 group-hover:scale-110"
        style={{ backgroundColor: iconBg }}
      >
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs font-light" style={{ color: MUTED }}>
          {label}
        </p>
        <p
          className="text-base sm:text-lg font-semibold leading-tight truncate"
          style={{ color: CREAM, fontFamily: SERIF }}
        >
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
