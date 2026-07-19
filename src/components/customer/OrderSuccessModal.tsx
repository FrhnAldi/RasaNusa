import { useEffect, useState } from 'react';
import { CheckCircle2, Clock3, Tag } from 'lucide-react';
import { formatIDR } from '../../data/products';

interface ReviewItem {
  name: string;
  quantity: number;
  price: number;
}

interface Props {
  orderId: string;
  items: ReviewItem[];
  subtotal: number;
  tax: number;
  discount?: number;
  promoCode?: string | null;
  total: number;
  orderType?: 'dine-in' | 'takeaway';
  tableNumber?: string;
  paymentMethod?: string;
  onClose: () => void;
}

const CREAM = '#F3EAD9';
const MUTED = 'rgba(243,234,217,0.55)';
const GOLD = '#D9A35F';
const BURNT = '#C97A2B';
const GRADIENT = `linear-gradient(135deg, ${GOLD}, ${BURNT})`;

const PAYMENT_LABELS: Record<string, string> = {
  qris: 'QRIS',
  ewallet: 'E-Wallet',
  tunai: 'Tunai di Kasir',
  kartu: 'Kartu',
};

const QRIS_DURATION_SECONDS = 5 * 60;

function formatCountdown(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

export default function OrderSuccessModal({
  orderId,
  items,
  subtotal,
  tax,
  discount = 0,
  promoCode,
  total,
  orderType,
  tableNumber,
  paymentMethod,
  onClose,
}: Props) {
  const [secondsLeft, setSecondsLeft] = useState(QRIS_DURATION_SECONDS);

  useEffect(() => {
    if (paymentMethod !== 'qris') return;
    const id = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(id);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [paymentMethod]);

  const qrisExpired = paymentMethod === 'qris' && secondsLeft === 0;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center px-4 py-6">
      <style>{`
        @keyframes os-pop {
          0% { transform: scale(0.92); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes os-ring {
          0% { transform: scale(0.6); opacity: 0.6; }
          100% { transform: scale(1.9); opacity: 0; }
        }
      `}</style>
      <div
        className="absolute inset-0"
        style={{ backgroundColor: 'rgba(4,4,4,0.75)', backdropFilter: 'blur(6px)' }}
        onClick={onClose}
      />
      <div
        className="relative overflow-hidden rounded-3xl w-full max-w-md flex flex-col"
        style={{
          animation: 'os-pop 450ms cubic-bezier(0.22, 1, 0.36, 1)',
          backgroundColor: 'rgba(7,7,7,0.92)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(217,163,95,0.28)',
          boxShadow: '0 30px 70px -20px rgba(0,0,0,0.65), 0 0 40px rgba(217,163,95,0.1)',
          maxHeight: '90vh',
        }}
      >
        <div
          className="absolute -top-20 -right-16 w-56 h-56 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(217,163,95,0.16), transparent 70%)' }}
        />

        {/* Header */}
        <div className="relative flex flex-col items-center text-center px-6 pt-8 pb-4 flex-shrink-0">
          <div className="relative mb-4 w-14 h-14 flex items-center justify-center">
            <span
              className="absolute inset-0 rounded-full"
              style={{ border: `2px solid ${GOLD}`, animation: 'os-ring 1.6s ease-out infinite' }}
            />
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center"
              style={{ background: 'rgba(217,163,95,0.14)', border: '1px solid rgba(217,163,95,0.3)' }}
            >
              <CheckCircle2 size={28} style={{ color: GOLD }} />
            </div>
          </div>

          <h3 style={{ fontFamily: "'Playfair Display', serif", fontWeight: 600, fontSize: 20, color: CREAM }}>
            Pesanan Berhasil
          </h3>
          <p className="text-xs mt-1.5 font-light leading-relaxed" style={{ color: MUTED, fontFamily: 'Inter, sans-serif' }}>
            Pesanan <span style={{ color: GOLD, fontWeight: 600 }}>{orderId}</span> sudah kami terima dan sedang
            disiapkan dengan penuh perhatian.
          </p>
        </div>

        {/* Scrollable review body */}
        <div className="relative flex-1 min-h-0 overflow-y-auto px-6">
          <div className="flex items-center justify-between mb-2.5">
            <p
              className="text-[11px] font-medium uppercase tracking-[0.16em]"
              style={{ color: MUTED, fontFamily: 'Inter, sans-serif' }}
            >
              Tinjau Pesanan
            </p>
            <span className="text-[11px] font-light" style={{ color: MUTED, fontFamily: 'Inter, sans-serif' }}>
              {items.reduce((sum, i) => sum + i.quantity, 0)} item
            </span>
          </div>

          <ul className="flex flex-col gap-2 mb-4">
            {items.map((item, idx) => (
              <li
                key={`${item.name}-${idx}`}
                className="flex items-center justify-between gap-3 rounded-xl px-3.5 py-2.5"
                style={{ backgroundColor: 'rgba(243,234,217,0.04)', border: '1px solid rgba(243,234,217,0.08)' }}
              >
                <div className="min-w-0 flex items-center gap-2">
                  <span
                    className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-semibold"
                    style={{ backgroundColor: 'rgba(217,163,95,0.16)', color: GOLD }}
                  >
                    {item.quantity}
                  </span>
                  <span className="text-sm truncate" style={{ color: CREAM, fontFamily: 'Inter, sans-serif' }}>
                    {item.name}
                  </span>
                </div>
                <span className="text-xs font-light flex-shrink-0" style={{ color: MUTED, fontFamily: 'Inter, sans-serif' }}>
                  {formatIDR(item.price * item.quantity)}
                </span>
              </li>
            ))}
          </ul>

          {(orderType || tableNumber || paymentMethod) && (
            <div className="flex flex-wrap gap-2 mb-4">
              {orderType && (
                <span
                  className="text-[11px] font-medium px-2.5 py-1 rounded-full"
                  style={{ backgroundColor: 'rgba(243,234,217,0.06)', color: MUTED }}
                >
                  {orderType === 'dine-in' ? 'Makan di Tempat' : 'Bawa Pulang'}
                </span>
              )}
              {tableNumber && (
                <span
                  className="text-[11px] font-medium px-2.5 py-1 rounded-full"
                  style={{ backgroundColor: 'rgba(243,234,217,0.06)', color: MUTED }}
                >
                  Meja {tableNumber}
                </span>
              )}
              {paymentMethod && (
                <span
                  className="text-[11px] font-medium px-2.5 py-1 rounded-full"
                  style={{ backgroundColor: 'rgba(243,234,217,0.06)', color: MUTED }}
                >
                  {PAYMENT_LABELS[paymentMethod] ?? paymentMethod}
                </span>
              )}
            </div>
          )}

          {paymentMethod === 'qris' && (
            <div
              className="flex flex-col items-center rounded-2xl px-4 py-5 mb-4"
              style={{
                backgroundColor: 'rgba(243,234,217,0.04)',
                border: `1px solid ${qrisExpired ? 'rgba(196,67,43,0.35)' : 'rgba(217,163,95,0.25)'}`,
              }}
            >
              <p
                className="text-[11px] font-medium uppercase tracking-[0.16em] mb-3"
                style={{ color: MUTED, fontFamily: 'Inter, sans-serif' }}
              >
                Scan untuk Bayar
              </p>
              <div
                className="rounded-xl p-2.5 transition-opacity duration-500"
                style={{
                  backgroundColor: '#FFFFFF',
                  boxShadow: '0 0 24px rgba(217,163,95,0.15)',
                  opacity: qrisExpired ? 0.35 : 1,
                }}
              >
                <img
                  src={`${import.meta.env.BASE_URL}qris.png`}
                  alt="Kode QRIS"
                  className="w-44 h-44 object-contain block"
                />
              </div>

              <div className="flex items-center gap-1.5 mt-3.5">
                <Clock3 size={13} style={{ color: qrisExpired ? '#E8836C' : GOLD }} />
                <span
                  className="text-xs font-semibold"
                  style={{ color: qrisExpired ? '#E8836C' : GOLD, fontFamily: 'Inter, sans-serif' }}
                >
                  {qrisExpired ? 'Waktu pembayaran habis' : `Selesaikan dalam ${formatCountdown(secondsLeft)}`}
                </span>
              </div>
              <div
                className="w-full max-w-[176px] h-1 rounded-full mt-2.5 overflow-hidden"
                style={{ backgroundColor: 'rgba(243,234,217,0.1)' }}
              >
                <div
                  className="h-full rounded-full transition-all duration-1000 ease-linear"
                  style={{
                    width: `${(secondsLeft / QRIS_DURATION_SECONDS) * 100}%`,
                    background: qrisExpired ? '#E8836C' : GRADIENT,
                  }}
                />
              </div>

              <p
                className="text-[11px] mt-3 font-light text-center leading-relaxed"
                style={{ color: MUTED, fontFamily: 'Inter, sans-serif' }}
              >
                {qrisExpired
                  ? 'Kode QRIS sudah kedaluwarsa. Silakan hubungi kasir untuk membuat ulang kode pembayaran.'
                  : 'Buka aplikasi e-wallet atau m-banking Anda, lalu scan kode di atas untuk menyelesaikan pembayaran.'}
              </p>
            </div>
          )}

          {promoCode && discount > 0 && (
            <div
              className="flex items-center gap-1.5 rounded-lg px-3 py-2 mb-3"
              style={{ backgroundColor: 'rgba(217,163,95,0.1)', border: '1px solid rgba(217,163,95,0.3)' }}
            >
              <Tag size={12} style={{ color: GOLD }} />
              <span className="text-xs font-medium" style={{ color: CREAM, fontFamily: 'Inter, sans-serif' }}>
                Promo <span style={{ color: GOLD, fontFamily: 'monospace' }}>{promoCode}</span> diterapkan
              </span>
            </div>
          )}

          <div className="flex flex-col gap-1.5 pb-2">
            <div className="flex justify-between text-xs font-light" style={{ color: MUTED, fontFamily: 'Inter, sans-serif' }}>
              <span>Subtotal</span>
              <span>{formatIDR(subtotal)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-xs font-light" style={{ color: '#7BC98A', fontFamily: 'Inter, sans-serif' }}>
                <span>Diskon Promo</span>
                <span>-{formatIDR(discount)}</span>
              </div>
            )}
            <div className="flex justify-between text-xs font-light" style={{ color: MUTED, fontFamily: 'Inter, sans-serif' }}>
              <span>Pajak (10%)</span>
              <span>{formatIDR(tax)}</span>
            </div>
          </div>
        </div>

        {/* Footer total + CTA */}
        <div className="relative px-6 pt-4 pb-6 flex-shrink-0" style={{ borderTop: '1px solid rgba(243,234,217,0.08)' }}>
          <div
            className="w-full rounded-2xl px-4 py-3.5 flex items-center justify-between mb-4"
            style={{ backgroundColor: 'rgba(243,234,217,0.04)', border: '1px solid rgba(243,234,217,0.1)', backdropFilter: 'blur(6px)' }}
          >
            <span className="text-xs font-light" style={{ color: MUTED, fontFamily: 'Inter, sans-serif' }}>
              Total Pembayaran
            </span>
            <span
              className="text-base font-semibold"
              style={{
                background: GRADIENT,
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                color: 'transparent',
              }}
            >
              {formatIDR(total)}
            </span>
          </div>

          <p className="text-[11px] mb-4 font-light text-center" style={{ color: 'rgba(243,234,217,0.4)', fontFamily: 'Inter, sans-serif' }}>
            {qrisExpired
              ? 'Kode QRIS kedaluwarsa — tunjukkan halaman ini ke kasir untuk membuat ulang pembayaran.'
              : paymentMethod === 'qris'
                ? 'Setelah pembayaran QRIS berhasil, tunjukkan halaman ini ke kasir sebagai bukti.'
                : 'Tunjukkan halaman ini ke kasir untuk konfirmasi pembayaran.'}
          </p>

          <button
            onClick={onClose}
            className="w-full font-semibold py-3.5 rounded-xl transition-all duration-500 hover:scale-[1.015]"
            style={{ background: GRADIENT, color: '#070707', boxShadow: '0 8px 30px -8px rgba(217,163,95,0.45)' }}
          >
            Selesai
          </button>
        </div>
      </div>
    </div>
  );
}
