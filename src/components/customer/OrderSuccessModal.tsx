import { useEffect, useState } from 'react';
import { ArrowLeft, CheckCircle2, Clock3, Download, MessageSquareText, QrCode, Tag } from 'lucide-react';
import { formatIDR } from '../../data/products';
import { useTheme } from '../../context/ThemeContext';

interface ReviewItem {
  name: string;
  quantity: number;
  price: number;
  note?: string;
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

// GOLD/BURNT stay constant across themes; CREAM/MUTED come from useTheme().
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

/**
 * Two-stage post-checkout modal:
 *  1. "review"  — order summary, itemized bill, and totals with a CTA to
 *                 either pay (QRIS) or finish (other methods).
 *  2. "payment" — QRIS code + countdown only. Kept intentionally sparse so
 *                 it never needs to compete for vertical space with the
 *                 order review, which was the root cause of the QR code
 *                 getting clipped on short viewports.
 */
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
  const { colors } = useTheme();
  const { ink: BLACK, cream: CREAM, creamAlpha, inkAlpha } = colors;
  const MUTED = creamAlpha(0.55);
  const isQris = paymentMethod === 'qris';

  const [stage, setStage] = useState<'review' | 'payment'>('review');
  const [secondsLeft, setSecondsLeft] = useState(QRIS_DURATION_SECONDS);
  const [isPrinting, setIsPrinting] = useState(false);

  useEffect(() => {
    if (stage !== 'payment' || !isQris) return;
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
  }, [stage, isQris]);

  const qrisExpired = isQris && stage === 'payment' && secondsLeft === 0;

  const handlePrintReceipt = async () => {
    setIsPrinting(true);
    try {
      const { exportReceiptToPDF } = await import('../../lib/exportReport');
      exportReceiptToPDF({
        orderId,
        items,
        subtotal,
        tax,
        discount,
        promoCode,
        total,
        orderType,
        tableNumber,
        paymentMethod: paymentMethod ?? 'tunai',
        timestamp: Date.now(),
      });
    } finally {
      setIsPrinting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center px-4 py-4 sm:py-6 overflow-y-auto">
      <style>{`
        @keyframes os-pop {
          0% { transform: scale(0.92); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes os-ring {
          0% { transform: scale(0.6); opacity: 0.6; }
          100% { transform: scale(1.9); opacity: 0; }
        }
        @keyframes os-slide-in {
          0% { transform: translateX(24px); opacity: 0; }
          100% { transform: translateX(0); opacity: 1; }
        }
      `}</style>
      <div
        className="absolute inset-0"
        style={{ backgroundColor: inkAlpha(0.75), backdropFilter: 'blur(6px)' }}
        onClick={onClose}
      />
      <div
        className="relative overflow-hidden rounded-3xl w-full max-w-md flex flex-col my-auto"
        style={{
          animation: 'os-pop 450ms cubic-bezier(0.22, 1, 0.36, 1)',
          backgroundColor: inkAlpha(0.92),
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(217,163,95,0.28)',
          boxShadow: '0 30px 70px -20px rgba(0,0,0,0.65), 0 0 40px rgba(217,163,95,0.1)',
          maxHeight: 'min(calc(100vh - 32px), 720px)',
        }}
      >
        <div
          className="absolute -top-20 -right-16 w-56 h-56 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(217,163,95,0.16), transparent 70%)' }}
        />

        {stage === 'review' ? (
          <>
            {/* Header */}
            <div className="relative flex flex-col items-center text-center px-6 pt-6 sm:pt-8 pb-3 sm:pb-4 flex-shrink-0">
              <div className="relative mb-3 sm:mb-4 w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center">
                <span
                  className="absolute inset-0 rounded-full"
                  style={{ border: `2px solid ${GOLD}`, animation: 'os-ring 1.6s ease-out infinite' }}
                />
                <div
                  className="w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center"
                  style={{ background: 'rgba(217,163,95,0.14)', border: '1px solid rgba(217,163,95,0.3)' }}
                >
                  <CheckCircle2 size={24} className="sm:hidden" style={{ color: GOLD }} />
                  <CheckCircle2 size={28} className="hidden sm:block" style={{ color: GOLD }} />
                </div>
              </div>

              <h3 style={{ fontFamily: "'Playfair Display', serif", fontWeight: 600, fontSize: 20, color: CREAM }}>
                Pesanan Berhasil
              </h3>
              <p className="text-xs mt-1.5 font-light leading-relaxed" style={{ color: MUTED, fontFamily: 'Inter, sans-serif' }}>
                Pesanan <span style={{ color: GOLD, fontWeight: 600 }}>{orderId}</span> sudah kami terima dan sedang
                disiapkan dengan penuh perhatian.
              </p>
              <span
                className="mt-3 inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide px-3 py-1 rounded-full"
                style={{ color: GOLD, backgroundColor: 'rgba(217,163,95,0.14)' }}
              >
                <Clock3 size={11} /> Menunggu Konfirmasi
              </span>
            </div>

            {/* Scrollable review body */}
            <div className="relative flex-1 min-h-0 overflow-y-auto px-6 pt-1">
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
                    className="rounded-xl px-3.5 py-2.5"
                    style={{ backgroundColor: creamAlpha(0.04), border: `1px solid ${creamAlpha(0.08)}` }}
                  >
                    <div className="flex items-center justify-between gap-3">
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
                    </div>
                    {item.note && (
                      <div className="flex items-start gap-1.5 mt-1.5 pl-7">
                        <MessageSquareText size={11} className="flex-shrink-0 mt-0.5" style={{ color: GOLD, opacity: 0.8 }} />
                        <span className="text-[11px] font-light italic" style={{ color: creamAlpha(0.55), fontFamily: 'Inter, sans-serif' }}>
                          {item.note}
                        </span>
                      </div>
                    )}
                  </li>
                ))}
              </ul>

              {(orderType || tableNumber || paymentMethod) && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {orderType && (
                    <span
                      className="text-[11px] font-medium px-2.5 py-1 rounded-full"
                      style={{ backgroundColor: creamAlpha(0.06), color: MUTED }}
                    >
                      {orderType === 'dine-in' ? 'Makan di Tempat' : 'Bawa Pulang'}
                    </span>
                  )}
                  {tableNumber && (
                    <span
                      className="text-[11px] font-medium px-2.5 py-1 rounded-full"
                      style={{ backgroundColor: creamAlpha(0.06), color: MUTED }}
                    >
                      Meja {tableNumber}
                    </span>
                  )}
                  {paymentMethod && (
                    <span
                      className="text-[11px] font-medium px-2.5 py-1 rounded-full"
                      style={{ backgroundColor: creamAlpha(0.06), color: MUTED }}
                    >
                      {PAYMENT_LABELS[paymentMethod] ?? paymentMethod}
                    </span>
                  )}
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
            <div className="relative px-6 pt-3 sm:pt-4 pb-4 sm:pb-6 flex-shrink-0" style={{ borderTop: `1px solid ${creamAlpha(0.08)}` }}>
              <div
                className="w-full rounded-2xl px-4 py-3 sm:py-3.5 flex items-center justify-between mb-3 sm:mb-4"
                style={{ backgroundColor: creamAlpha(0.04), border: `1px solid ${creamAlpha(0.1)}`, backdropFilter: 'blur(6px)' }}
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

              <p className="text-[11px] mb-3 sm:mb-4 font-light text-center hidden sm:block" style={{ color: creamAlpha(0.4), fontFamily: 'Inter, sans-serif' }}>
                {isQris
                  ? 'Lanjutkan untuk menampilkan kode QRIS dan menyelesaikan pembayaran.'
                  : 'Tunjukkan halaman ini ke kasir untuk konfirmasi pembayaran.'}
              </p>

              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrintReceipt}
                  disabled={isPrinting}
                  className="flex-shrink-0 flex items-center justify-center gap-1.5 px-4 font-semibold text-xs py-3 sm:py-3.5 rounded-xl transition-all duration-300 hover:bg-white/5 disabled:opacity-60"
                  style={{ border: `1px solid ${creamAlpha(0.18)}`, color: CREAM }}
                  aria-label="Cetak struk sebagai PDF"
                >
                  <Download size={14} />
                  <span className="hidden sm:inline">{isPrinting ? 'Menyiapkan...' : 'Cetak Struk'}</span>
                </button>
                {isQris ? (
                  <button
                    onClick={() => setStage('payment')}
                    className="flex-1 flex items-center justify-center gap-1.5 font-semibold py-3 sm:py-3.5 rounded-xl transition-all duration-500 hover:scale-[1.015]"
                    style={{ background: GRADIENT, color: BLACK, boxShadow: '0 8px 30px -8px rgba(217,163,95,0.45)' }}
                  >
                    <QrCode size={16} />
                    Lanjutkan Pembayaran
                  </button>
                ) : (
                  <button
                    onClick={onClose}
                    className="flex-1 font-semibold py-3 sm:py-3.5 rounded-xl transition-all duration-500 hover:scale-[1.015]"
                    style={{ background: GRADIENT, color: BLACK, boxShadow: '0 8px 30px -8px rgba(217,163,95,0.45)' }}
                  >
                    Selesai
                  </button>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="relative flex flex-col" style={{ animation: 'os-slide-in 350ms cubic-bezier(0.22, 1, 0.36, 1)' }}>
            {/* Header */}
            <div className="relative flex items-center gap-3 px-6 pt-6 sm:pt-7 pb-2 flex-shrink-0">
              <button
                onClick={() => setStage('review')}
                className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-colors hover:bg-white/10"
                style={{ color: MUTED }}
                aria-label="Kembali ke ringkasan pesanan"
              >
                <ArrowLeft size={16} />
              </button>
              <div className="min-w-0">
                <h3 style={{ fontFamily: "'Playfair Display', serif", fontWeight: 600, fontSize: 17, color: CREAM }}>
                  Pembayaran QRIS
                </h3>
                <p className="text-[11px] font-light" style={{ color: MUTED, fontFamily: 'Inter, sans-serif' }}>
                  Pesanan <span style={{ color: GOLD, fontWeight: 600 }}>{orderId}</span>
                </p>
              </div>
            </div>

            {/* QR block — the only focus of this stage, so it always has room to breathe */}
            <div className="relative flex flex-col items-center px-6 pt-4 pb-2">
              <div
                className="rounded-xl p-3 sm:p-4 transition-opacity duration-500"
                style={{
                  backgroundColor: '#FFFFFF',
                  boxShadow: '0 0 24px rgba(217,163,95,0.15)',
                  opacity: qrisExpired ? 0.35 : 1,
                }}
              >
                <img
                  src={`${import.meta.env.BASE_URL}qris.png`}
                  alt="Kode QRIS"
                  className="w-40 h-40 sm:w-52 sm:h-52 object-contain block"
                />
              </div>

              <div className="flex items-center gap-1.5 mt-4">
                <Clock3 size={14} style={{ color: qrisExpired ? '#E8836C' : GOLD }} />
                <span
                  className="text-sm font-semibold"
                  style={{ color: qrisExpired ? '#E8836C' : GOLD, fontFamily: 'Inter, sans-serif' }}
                >
                  {qrisExpired ? 'Waktu pembayaran habis' : `Selesaikan dalam ${formatCountdown(secondsLeft)}`}
                </span>
              </div>
              <div
                className="w-full max-w-[208px] h-1 rounded-full mt-3 overflow-hidden"
                style={{ backgroundColor: creamAlpha(0.1) }}
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
                className="text-xs mt-4 font-light text-center leading-relaxed max-w-[300px]"
                style={{ color: MUTED, fontFamily: 'Inter, sans-serif' }}
              >
                {qrisExpired
                  ? 'Kode QRIS sudah kedaluwarsa. Silakan hubungi kasir untuk membuat ulang kode pembayaran.'
                  : 'Buka aplikasi e-wallet atau m-banking Anda, lalu scan kode di atas untuk menyelesaikan pembayaran.'}
              </p>
            </div>

            {/* Footer total + CTA */}
            <div className="relative px-6 pt-4 pb-4 sm:pb-6 flex-shrink-0" style={{ borderTop: `1px solid ${creamAlpha(0.08)}`, marginTop: 16 }}>
              <div
                className="w-full rounded-2xl px-4 py-3 sm:py-3.5 flex items-center justify-between mb-3 sm:mb-4"
                style={{ backgroundColor: creamAlpha(0.04), border: `1px solid ${creamAlpha(0.1)}`, backdropFilter: 'blur(6px)' }}
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

              <p className="text-[11px] mb-3 sm:mb-4 font-light text-center hidden sm:block" style={{ color: creamAlpha(0.4), fontFamily: 'Inter, sans-serif' }}>
                {qrisExpired
                  ? 'Kode QRIS kedaluwarsa — tunjukkan halaman ini ke kasir untuk membuat ulang pembayaran.'
                  : 'Setelah pembayaran QRIS berhasil, tunjukkan halaman ini ke kasir sebagai bukti.'}
              </p>

              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrintReceipt}
                  disabled={isPrinting}
                  className="flex-shrink-0 flex items-center justify-center gap-1.5 px-4 font-semibold text-xs py-3 sm:py-3.5 rounded-xl transition-all duration-300 hover:bg-white/5 disabled:opacity-60"
                  style={{ border: `1px solid ${creamAlpha(0.18)}`, color: CREAM }}
                  aria-label="Cetak struk sebagai PDF"
                >
                  <Download size={14} />
                  <span className="hidden sm:inline">{isPrinting ? 'Menyiapkan...' : 'Cetak Struk'}</span>
                </button>
                <button
                  onClick={onClose}
                  className="flex-1 font-semibold py-3 sm:py-3.5 rounded-xl transition-all duration-500 hover:scale-[1.015]"
                  style={{ background: GRADIENT, color: BLACK, boxShadow: '0 8px 30px -8px rgba(217,163,95,0.45)' }}
                >
                  Selesai
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
