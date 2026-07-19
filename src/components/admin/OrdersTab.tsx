import { useEffect, useMemo, useState } from 'react';
import { ArrowRight, MapPin, MessageSquareText, ShoppingBag, User, XCircle } from 'lucide-react';
import { formatIDR } from '../../data/products';
import {
  ORDER_STATUS_META,
  canCancelOrder,
  formatRelativeTime,
  nextOrderStatus,
} from '../../data/orderStatus';
import { useAppData } from '../../context/AppDataContext';
import { useAuth } from '../../context/AuthContext';
import type { OrderStatus, Transaction } from '../../types/pos';

interface Props {
  transactions: Transaction[];
}

// Basilico luxury design system — matches the rest of the admin dashboard.
const CREAM = '#F3EAD9';
const GOLD = '#D9A35F';
const BURNT = '#C97A2B';
const GRADIENT = `linear-gradient(135deg, ${GOLD}, ${BURNT})`;
const MUTED = 'rgba(243,234,217,0.55)';
const SERIF = "'Playfair Display', serif";

type FilterKey = 'aktif' | OrderStatus | 'semua';

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: 'aktif', label: 'Aktif' },
  { key: 'menunggu', label: 'Menunggu' },
  { key: 'diproses', label: 'Diproses' },
  { key: 'siap', label: 'Siap' },
  { key: 'selesai', label: 'Selesai' },
  { key: 'dibatalkan', label: 'Dibatalkan' },
  { key: 'semua', label: 'Semua' },
];

const ADVANCE_LABEL: Record<OrderStatus, string> = {
  menunggu: 'Konfirmasi & Proses',
  diproses: 'Tandai Siap',
  siap: 'Tandai Selesai',
  selesai: '',
  dibatalkan: '',
};

export default function OrdersTab({ transactions }: Props) {
  const { updateOrderStatus } = useAppData();
  const { user } = useAuth();
  const [filter, setFilter] = useState<FilterKey>('aktif');

  // Ticks every 30s so "x menit lalu" freshness labels stay live without a refresh.
  const [nowTick, setNowTick] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNowTick(Date.now()), 30000);
    return () => clearInterval(id);
  }, []);

  const counts = useMemo(() => {
    const map: Record<string, number> = { aktif: 0, semua: transactions.length };
    transactions.forEach((t) => {
      map[t.status] = (map[t.status] ?? 0) + 1;
      if (t.status === 'menunggu' || t.status === 'diproses' || t.status === 'siap') map.aktif += 1;
    });
    return map;
  }, [transactions]);

  const filtered = useMemo(() => {
    let list = transactions;
    if (filter === 'aktif') {
      list = transactions.filter((t) => t.status === 'menunggu' || t.status === 'diproses' || t.status === 'siap');
    } else if (filter !== 'semua') {
      list = transactions.filter((t) => t.status === filter);
    }
    const isActiveView = filter === 'aktif';
    return [...list].sort((a, b) => (isActiveView ? a.timestamp - b.timestamp : b.timestamp - a.timestamp));
  }, [transactions, filter]);

  const handleAdvance = (t: Transaction) => {
    const next = nextOrderStatus(t.status);
    if (!next) return;
    updateOrderStatus(t.id, next, user?.name ?? 'Admin');
  };

  const handleCancel = (t: Transaction) => {
    if (!confirm(`Batalkan pesanan ${t.id}? Tindakan ini tidak dapat dibatalkan.`)) return;
    updateOrderStatus(t.id, 'dibatalkan', user?.name ?? 'Admin');
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap gap-2">
        {FILTERS.map(({ key, label }) => {
          const active = filter === key;
          const count = counts[key] ?? 0;
          return (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className="text-xs font-medium px-3 py-1.5 rounded-full transition-all duration-300"
              style={
                active
                  ? { background: GRADIENT, color: '#070707' }
                  : { backgroundColor: 'rgba(243,234,217,0.05)', color: MUTED, border: '1px solid rgba(243,234,217,0.12)' }
              }
            >
              {label} ({count})
            </button>
          );
        })}
      </div>

      {filtered.length === 0 ? (
        <div
          className="rounded-2xl py-16 flex flex-col items-center justify-center gap-2"
          style={{ backgroundColor: 'rgba(243,234,217,0.03)', border: '1px solid rgba(243,234,217,0.1)', color: 'rgba(243,234,217,0.35)' }}
        >
          <ShoppingBag size={24} className="opacity-40" />
          <p className="text-sm font-light">Tidak ada pesanan pada status ini.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {filtered.map((t) => {
            const meta = ORDER_STATUS_META[t.status];
            const StatusIcon = meta.icon;
            const advanceLabel = ADVANCE_LABEL[t.status];
            const cancelable = canCancelOrder(t.status);

            return (
              <div
                key={t.id}
                className="rounded-2xl p-4 flex flex-col gap-3 transition-colors duration-300"
                style={{
                  backgroundColor: 'rgba(243,234,217,0.03)',
                  border: `1px solid ${t.status === 'menunggu' ? 'rgba(217,163,95,0.35)' : 'rgba(243,234,217,0.1)'}`,
                }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold" style={{ color: CREAM, fontFamily: SERIF }}>
                        {t.id}
                      </span>
                      <span
                        className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full"
                        style={{ color: meta.color, backgroundColor: meta.bg }}
                      >
                        <StatusIcon size={10} /> {meta.shortLabel}
                      </span>
                    </div>
                    <p className="text-[11px] font-light mt-1" style={{ color: MUTED }}>
                      {formatRelativeTime(t.statusUpdatedAt, nowTick)} · dibuat{' '}
                      {new Date(t.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <p className="text-sm font-bold flex-shrink-0" style={{ color: GOLD }}>
                    {formatIDR(t.total)}
                  </p>
                </div>

                <div className="flex items-center gap-3 flex-wrap text-[11px] font-light" style={{ color: MUTED }}>
                  <span className="flex items-center gap-1">
                    <User size={11} /> {t.customerName ?? t.cashierName}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin size={11} />
                    {t.orderType === 'takeaway' ? 'Bawa Pulang' : t.tableNumber ? `Meja ${t.tableNumber}` : 'Dine-in'}
                  </span>
                </div>

                <ul
                  className="flex flex-col gap-1.5 rounded-xl px-3 py-2.5"
                  style={{ backgroundColor: 'rgba(243,234,217,0.03)', border: '1px solid rgba(243,234,217,0.06)' }}
                >
                  {t.items.map((item) => (
                    <li key={item.productId} className="text-xs">
                      <div className="flex items-center justify-between gap-2">
                        <span style={{ color: CREAM }}>
                          <span className="font-semibold" style={{ color: GOLD }}>
                            {item.quantity}×
                          </span>{' '}
                          {item.name}
                        </span>
                      </div>
                      {item.note && (
                        <div className="flex items-start gap-1 mt-0.5 pl-4">
                          <MessageSquareText size={10} className="flex-shrink-0 mt-0.5" style={{ color: GOLD, opacity: 0.8 }} />
                          <span className="italic" style={{ color: 'rgba(243,234,217,0.55)' }}>
                            {item.note}
                          </span>
                        </div>
                      )}
                    </li>
                  ))}
                </ul>

                {(advanceLabel || cancelable) && (
                  <div className="flex items-center gap-2 pt-1">
                    {advanceLabel && (
                      <button
                        onClick={() => handleAdvance(t)}
                        className="flex-1 flex items-center justify-center gap-1.5 text-xs font-semibold py-2 rounded-xl transition-all duration-300 hover:scale-[1.02]"
                        style={{ background: GRADIENT, color: '#070707' }}
                      >
                        {advanceLabel} <ArrowRight size={13} />
                      </button>
                    )}
                    {cancelable && (
                      <button
                        onClick={() => handleCancel(t)}
                        className="flex items-center justify-center gap-1.5 text-xs font-medium px-3 py-2 rounded-xl transition-all duration-300"
                        style={{ color: '#E8836C', border: '1px solid rgba(196,67,43,0.35)', backgroundColor: 'transparent' }}
                      >
                        <XCircle size={13} /> Batalkan
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
