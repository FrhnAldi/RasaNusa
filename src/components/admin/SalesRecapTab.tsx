import { useMemo, useState } from 'react';
import { Banknote, CreditCard, FileSpreadsheet, FileText, MessageSquareText, QrCode, Receipt, Wallet } from 'lucide-react';
import { formatIDR } from '../../data/products';
import { ORDER_STATUS_META } from '../../data/orderStatus';
import type { OrderStatus, PaymentMethod, Transaction } from '../../types/pos';

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
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'semua'>('semua');
  const [exporting, setExporting] = useState<'excel' | 'pdf' | null>(null);

  const filtered = useMemo(() => {
    let list = methodFilter === 'semua' ? transactions : transactions.filter((t) => t.paymentMethod === methodFilter);
    if (statusFilter !== 'semua') list = list.filter((t) => t.status === statusFilter);
    return [...list].sort((a, b) => b.timestamp - a.timestamp);
  }, [transactions, methodFilter, statusFilter]);

  const totalsByMethod = useMemo(() => {
    const map: Record<string, number> = {};
    transactions.forEach((t) => (map[t.paymentMethod] = (map[t.paymentMethod] ?? 0) + t.total));
    return map;
  }, [transactions]);

  const totalRevenue = transactions.reduce((sum, t) => sum + t.total, 0);
  const totalItems = transactions.reduce((sum, t) => sum + t.items.reduce((s, i) => s + i.quantity, 0), 0);

  // Export libraries (xlsx / jspdf) are fairly heavy, so they're only loaded
  // on demand — when the admin actually clicks a button — instead of
  // bloating the initial dashboard bundle.
  const handleExportExcel = async () => {
    setExporting('excel');
    try {
      const { exportTransactionsToExcel } = await import('../../lib/exportReport');
      exportTransactionsToExcel(filtered);
    } finally {
      setExporting(null);
    }
  };

  const handleExportPDF = async () => {
    setExporting('pdf');
    try {
      const { exportTransactionsToPDF } = await import('../../lib/exportReport');
      exportTransactionsToPDF(filtered);
    } finally {
      setExporting(null);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="Total Pendapatan" value={formatIDR(totalRevenue)} accent={GOLD} />
        <StatCard label="Total Item Terjual" value={`${totalItems} item`} accent={CREAM} />
        <StatCard label="Jumlah Transaksi" value={`${transactions.length}`} accent={CREAM} />
        <StatCard label="Estimasi Keuntungan" value={formatIDR(totalRevenue * 0.4)} accent={GOLD} />
      </div>

      {/* Export laporan */}
      <div
        className="rounded-2xl px-4 py-3.5 flex flex-wrap items-center justify-between gap-3"
        style={{ backgroundColor: 'rgba(217,163,95,0.06)', border: '1px solid rgba(217,163,95,0.2)' }}
      >
        <div>
          <p className="text-sm font-semibold" style={{ color: CREAM, fontFamily: SERIF }}>
            Ekspor Laporan
          </p>
          <p className="text-[11px] font-light mt-0.5" style={{ color: MUTED }}>
            Mengekspor {filtered.length} transaksi sesuai filter yang aktif saat ini.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportExcel}
            disabled={filtered.length === 0 || exporting !== null}
            className="flex items-center gap-1.5 text-xs font-semibold px-3.5 py-2 rounded-xl transition-all duration-300 enabled:hover:scale-[1.03] disabled:opacity-30 disabled:cursor-not-allowed"
            style={{ backgroundColor: 'rgba(123,201,138,0.14)', color: '#7BC98A', border: '1px solid rgba(123,201,138,0.35)' }}
          >
            <FileSpreadsheet size={14} /> {exporting === 'excel' ? 'Menyiapkan…' : 'Excel'}
          </button>
          <button
            onClick={handleExportPDF}
            disabled={filtered.length === 0 || exporting !== null}
            className="flex items-center gap-1.5 text-xs font-semibold px-3.5 py-2 rounded-xl transition-all duration-300 enabled:hover:scale-[1.03] disabled:opacity-30 disabled:cursor-not-allowed"
            style={{ backgroundColor: 'rgba(196,67,43,0.14)', color: '#E8836C', border: '1px solid rgba(196,67,43,0.35)' }}
          >
            <FileText size={14} /> {exporting === 'pdf' ? 'Menyiapkan…' : 'PDF'}
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap gap-2">
          <FilterChip
            active={methodFilter === 'semua'}
            onClick={() => setMethodFilter('semua')}
            label={`Semua Metode (${transactions.length})`}
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
        <div className="flex flex-wrap gap-2">
          <FilterChip active={statusFilter === 'semua'} onClick={() => setStatusFilter('semua')} label="Semua Status" />
          {(Object.keys(ORDER_STATUS_META) as OrderStatus[]).map((s) => (
            <FilterChip
              key={s}
              active={statusFilter === s}
              onClick={() => setStatusFilter(s)}
              label={ORDER_STATUS_META[s].label}
            />
          ))}
        </div>
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
              const statusMeta = ORDER_STATUS_META[t.status];
              const StatusIcon = statusMeta.icon;
              const itemsWithNotes = t.items.filter((i) => i.note);
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
                      <span
                        className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full"
                        style={{ color: statusMeta.color, backgroundColor: statusMeta.bg }}
                      >
                        <StatusIcon size={9} /> {statusMeta.shortLabel}
                      </span>
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
                        {t.customerName ? `Pelanggan: ${t.customerName}` : `Kasir: ${t.cashierName}`}
                      </span>
                    </div>
                    {itemsWithNotes.length > 0 && (
                      <div className="flex flex-col gap-1 mt-1.5">
                        {itemsWithNotes.map((item) => (
                          <div key={item.productId} className="flex items-start gap-1.5">
                            <MessageSquareText size={11} className="flex-shrink-0 mt-0.5" style={{ color: GOLD, opacity: 0.75 }} />
                            <span className="text-[11px] font-light italic" style={{ color: 'rgba(243,234,217,0.5)' }}>
                              <span style={{ color: 'rgba(243,234,217,0.7)', fontStyle: 'normal' }}>{item.name}:</span>{' '}
                              {item.note}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
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
