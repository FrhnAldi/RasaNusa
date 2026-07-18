import { useMemo, useState } from 'react';
import { Banknote, CreditCard, QrCode, Receipt, Wallet } from 'lucide-react';
import { formatIDR } from '../../data/products';
import type { PaymentMethod, Transaction } from '../../types/pos';

interface Props {
  transactions: Transaction[];
}

// Basilico luxury design system — matches the rest of the admin & customer dashboards.
const BLACK = '#070707';
const CREAM = '#F3EAD9';
const GOLD = '#D9A35F';
const BURNT = '#C97A2B';
const GRADIENT = `linear-gradient(135deg, ${GOLD}, ${BURNT})`;
const MUTED = 'rgba(243,234,217,0.55)';
const SERIF = "'Playfair Display', serif";

const METHOD_META: Record<PaymentMethod, { label: string; icon: typeof Banknote; color: string; bg: string }> = {
  tunai: { label: 'Tunai', icon: Banknote, color: GOLD, bg: 'rgba(217,163,95,0.14)' },
  qris: { label: 'QRIS', icon: QrCode, color: '#2FA3B3', bg: 'rgba(29,107,118,0.16)' },
  kartu: { label: 'Kartu', icon: CreditCard, color: '#B98BDE', bg: 'rgba(155,135,222,0.14)' },
  ewallet: { label: 'E-Wallet', icon: Wallet, color: '#E8836C', bg: 'rgba(196,67,43,0.16)' },
};

export default function SalesRecapTab({ transactions }: Props) {
  const [methodFilter, setMethodFilter] = useState<PaymentMethod | 'semua'>('semua');

  const filtered = useMemo(() => {
    const list =
      methodFilter === 'semua' ? transactions : transactions.filter((t) => t.paymentMethod === methodFilter);
    return [...list].sort((a, b) => b.timestamp - a.timestamp);
  }, [transactions, methodFilter]);

  const totalsByMethod = useMemo(() => {
    const map: Record<string, number> = {};
    transactions.forEach((t) => (map[t.paymentMethod] = (map[t.paymentMethod] ?? 0) + t.total));
    return map;
  }, [transactions]);

  const totalRevenue = transactions.reduce((sum, t) => sum + t.total, 0);
  const totalItems = transactions.reduce((sum, t) => sum + t.items.reduce((s, i) => s + i.quantity, 0), 0);

  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="Total Pendapatan" value={formatIDR(totalRevenue)} accent={GOLD} />
        <StatCard label="Total Item Terjual" value={`${totalItems} item`} accent={CREAM} />
        <StatCard label="Jumlah Transaksi" value={`${transactions.length}`} accent={CREAM} />
        <StatCard label="Estimasi Keuntungan" value={formatIDR(totalRevenue * 0.4)} accent={GOLD} />
      </div>

      <div className="flex flex-wrap gap-2">
        <FilterChip
          active={methodFilter === 'semua'}
          onClick={() => setMethodFilter('semua')}
          label={`Semua (${transactions.length})`}
        />
        {(Object.keys(METHOD_META) as PaymentMethod[]).map((m) => (
          <FilterChip
            key={m}
            active={methodFilter === m}
            onClick={() => setMethodFilter(m)}
            label={`${METHOD_META[m].label} · ${formatIDR(totalsByMethod[m] ?? 0)}`}
          />
        ))}
      </div>

      <div
        className="rounded-2xl overflow-hidden"
        style={{ backgroundColor: 'rgba(243,234,217,0.03)', border: '1px solid rgba(243,234,217,0.1)' }}
      >
        <div
          className="px-5 py-3 flex items-center gap-2"
          style={{ borderBottom: '1px solid rgba(243,234,217,0.08)' }}
        >
          <Receipt size={15} style={{ color: GOLD }} />
          <h3 className="text-sm font-semibold" style={{ color: CREAM, fontFamily: SERIF }}>
            Riwayat Transaksi
          </h3>
        </div>
        {filtered.length === 0 ? (
          <div className="py-14 text-center text-sm font-light" style={{ color: 'rgba(243,234,217,0.35)' }}>
            Belum ada transaksi.
          </div>
        ) : (
          <div className="divide-y divide-[rgba(243,234,217,0.08)] max-h-[420px] overflow-y-auto">
            {filtered.map((t) => {
              const meta = METHOD_META[t.paymentMethod];
              const Icon = meta.icon;
              return (
                <div
                  key={t.id}
                  className="px-5 py-3 flex items-start gap-3 transition-colors duration-300 hover:bg-white/[0.02]"
                >
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: meta.bg }}
                  >
                    <Icon size={14} style={{ color: meta.color }} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex justify-between items-baseline gap-2">
                      <p className="text-sm font-medium truncate" style={{ color: CREAM }}>
                        {t.items.map((i) => `${i.name} x${i.quantity}`).join(', ')}
                      </p>
                      <p className="text-sm font-bold flex-shrink-0" style={{ color: GOLD }}>
                        {formatIDR(t.total)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                      <span className="text-[11px] font-light" style={{ color: MUTED }}>
                        {new Date(t.timestamp).toLocaleString('id-ID', {
                          day: '2-digit',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                      <span className="text-[11px]" style={{ color: 'rgba(243,234,217,0.25)' }}>·</span>
                      <span className="text-[11px] font-light" style={{ color: MUTED }}>{meta.label}</span>
                      <span className="text-[11px]" style={{ color: 'rgba(243,234,217,0.25)' }}>·</span>
                      <span className="text-[11px] font-light" style={{ color: MUTED }}>
                        Kasir: {t.cashierName}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, accent }: { label: string; value: string; accent: string }) {
  return (
    <div
      className="rounded-2xl p-4 transition-all duration-300 hover:-translate-y-0.5"
      style={{ backgroundColor: 'rgba(243,234,217,0.03)', border: '1px solid rgba(243,234,217,0.1)' }}
    >
      <p className="text-xs font-light" style={{ color: MUTED }}>
        {label}
      </p>
      <p className="text-lg font-bold" style={{ color: accent, fontFamily: SERIF }}>
        {value}
      </p>
    </div>
  );
}

function FilterChip({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      className="text-xs font-medium px-3 py-1.5 rounded-full transition-all duration-300"
      style={
        active
          ? { background: GRADIENT, color: BLACK }
          : { backgroundColor: 'rgba(243,234,217,0.05)', color: MUTED, border: '1px solid rgba(243,234,217,0.12)' }
      }
    >
      {label}
    </button>
  );
}
