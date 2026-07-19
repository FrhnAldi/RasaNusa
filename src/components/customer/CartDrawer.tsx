import { useState } from 'react';
import { CreditCard, MessageSquarePlus, Minus, Plus, QrCode, ShoppingBag, Tag, Trash2, Wallet, X } from 'lucide-react';
import type { OrderType, PaymentMethod, Product } from '../../types/pos';
import { formatIDR } from '../../data/products';

interface CartLine {
  product: Product;
  quantity: number;
  note: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  lines: CartLine[];
  onIncrement: (productId: string) => void;
  onDecrement: (productId: string) => void;
  onRemove: (productId: string) => void;
  onNoteChange: (productId: string, note: string) => void;
  subtotal: number;
  tax: number;
  discount: number;
  promoCode?: string | null;
  onRemovePromo: () => void;
  total: number;
  onConfirm: (details: { orderType: OrderType; tableNumber?: string; paymentMethod: PaymentMethod }) => void;
}

const PAYMENT_OPTIONS: { key: PaymentMethod; label: string; icon: typeof QrCode }[] = [
  { key: 'qris', label: 'QRIS', icon: QrCode },
  { key: 'ewallet', label: 'E-Wallet', icon: Wallet },
  { key: 'tunai', label: 'Tunai di Kasir', icon: CreditCard },
];

// Palette lifted from the Basilico luxury design system: near-black stage,
// dual gold / burnt-orange accent, warm cream & gray text.
const BLACK = '#070707';
const CREAM = '#F3EAD9';
const MUTED = 'rgba(243,234,217,0.55)';
const GOLD = '#D9A35F';
const BURNT = '#C97A2B';
const GRADIENT = `linear-gradient(135deg, ${GOLD}, ${BURNT})`;
const EASE = 'cubic-bezier(0.22, 1, 0.36, 1)';

export default function CartDrawer({
  open,
  onClose,
  lines,
  onIncrement,
  onDecrement,
  onRemove,
  onNoteChange,
  subtotal,
  tax,
  discount,
  promoCode,
  onRemovePromo,
  total,
  onConfirm,
}: Props) {
  const [orderType, setOrderType] = useState<OrderType>('dine-in');
  const [tableNumber, setTableNumber] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('qris');

  const canConfirm = lines.length > 0 && (orderType === 'takeaway' || tableNumber.trim().length > 0);

  const handleConfirm = () => {
    if (!canConfirm) return;
    onConfirm({
      orderType,
      tableNumber: orderType === 'dine-in' ? tableNumber.trim() : undefined,
      paymentMethod,
    });
    setTableNumber('');
  };

  return (
    <>
      {/* backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 z-40"
        style={{
          backgroundColor: 'rgba(4,4,4,0.72)',
          backdropFilter: 'blur(3px)',
          opacity: open ? 1 : 0,
          pointerEvents: open ? 'auto' : 'none',
          transition: `opacity 500ms ${EASE}`,
        }}
      />

      {/* panel */}
      <div
        className="fixed top-0 right-0 h-full w-full sm:w-[420px] z-50 flex flex-col overflow-hidden"
        style={{
          backgroundColor: `${BLACK}f2`,
          backdropFilter: 'blur(20px)',
          borderLeft: '1px solid rgba(217,163,95,0.18)',
          boxShadow: open ? '-40px 0 80px -30px rgba(0,0,0,0.7), 0 0 60px rgba(217,163,95,0.06)' : 'none',
          transform: open ? 'translateX(0)' : 'translateX(100%)',
          transition: `transform 600ms ${EASE}`,
        }}
      >
        {/* ambient gold glow, echoing the reservation panel's radial glow treatment */}
        <div
          className="absolute -top-24 -right-24 w-72 h-72 rounded-full pointer-events-none"
          style={{ background: `radial-gradient(circle, rgba(217,163,95,0.16), transparent 70%)` }}
        />
        <div
          className="absolute bottom-0 -left-16 w-56 h-56 rounded-full pointer-events-none"
          style={{ background: `radial-gradient(circle, rgba(201,122,43,0.10), transparent 70%)` }}
        />

        <div
          className="relative px-5 sm:px-6 py-5 flex items-center gap-3 flex-shrink-0"
          style={{ borderBottom: '1px solid rgba(243,234,217,0.08)' }}
        >
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ background: 'rgba(217,163,95,0.12)', border: '1px solid rgba(217,163,95,0.3)' }}
          >
            <ShoppingBag size={16} style={{ color: GOLD }} />
          </div>
          <div className="min-w-0">
            <h2
              style={{
                fontFamily: "'Playfair Display', serif",
                fontWeight: 600,
                color: CREAM,
                fontSize: 19,
                letterSpacing: '-0.01em',
              }}
            >
              Pesanan Anda
            </h2>
            {lines.length > 0 && (
              <p className="text-[11px] font-light mt-0.5" style={{ color: MUTED, fontFamily: 'Inter, sans-serif' }}>
                {lines.reduce((sum, l) => sum + l.quantity, 0)} item dipilih
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="ml-auto w-8 h-8 rounded-full flex items-center justify-center transition-colors duration-300 hover:bg-white/10"
            style={{ color: MUTED }}
            aria-label="Tutup pesanan"
          >
            <X size={17} />
          </button>
        </div>

        <div className="relative flex-1 min-h-0 overflow-y-auto px-5 sm:px-6 py-4">
          {lines.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-10" style={{ color: MUTED }}>
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center mb-4"
                style={{ background: 'rgba(217,163,95,0.08)', border: '1px solid rgba(217,163,95,0.2)' }}
              >
                <ShoppingBag size={22} style={{ color: GOLD, opacity: 0.7 }} />
              </div>
              <p className="text-sm font-light" style={{ fontFamily: 'Inter, sans-serif', color: CREAM }}>
                Pesanan Anda masih kosong.
              </p>
              <p className="text-xs mt-1.5 font-light" style={{ fontFamily: 'Inter, sans-serif' }}>
                Pilih hidangan favorit Anda dari menu untuk memulai.
              </p>
            </div>
          ) : (
            <ul className="flex flex-col gap-2.5">
              {lines.map(({ product, quantity, note }) => (
                <li
                  key={product.id}
                  className="rounded-2xl px-3 py-2.5"
                  style={{
                    backgroundColor: 'rgba(243,234,217,0.03)',
                    border: '1px solid rgba(243,234,217,0.08)',
                    backdropFilter: 'blur(6px)',
                  }}
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-12 h-12 rounded-xl object-cover flex-shrink-0"
                      style={{ backgroundColor: 'rgba(243,234,217,0.06)' }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm truncate" style={{ color: CREAM, fontFamily: 'Inter, sans-serif' }}>
                        {product.name}
                      </p>
                      <p className="text-xs font-light mt-0.5" style={{ color: GOLD, fontFamily: 'Inter, sans-serif' }}>
                        {formatIDR(product.price)}
                      </p>
                    </div>
                    <div
                      className="flex items-center gap-1.5 rounded-full px-1 py-1"
                      style={{ border: '1px solid rgba(217,163,95,0.25)' }}
                    >
                      <button
                        onClick={() => onDecrement(product.id)}
                        className="w-6 h-6 rounded-full flex items-center justify-center transition-colors duration-300 hover:bg-white/10"
                        style={{ color: CREAM }}
                        aria-label={`Kurangi ${product.name}`}
                      >
                        <Minus size={12} />
                      </button>
                      <span className="text-sm font-semibold w-5 text-center" style={{ color: CREAM }}>
                        {quantity}
                      </span>
                      <button
                        onClick={() => onIncrement(product.id)}
                        disabled={quantity >= product.stock}
                        className="w-6 h-6 rounded-full flex items-center justify-center transition-colors duration-300 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed"
                        style={{ color: CREAM }}
                        aria-label={`Tambah ${product.name}`}
                      >
                        <Plus size={12} />
                      </button>
                    </div>
                    <button
                      onClick={() => onRemove(product.id)}
                      className="flex-shrink-0 transition-colors duration-300"
                      style={{ color: 'rgba(243,234,217,0.3)' }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = '#E8836C')}
                      onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(243,234,217,0.3)')}
                      aria-label={`Hapus ${product.name}`}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>

                  {/* Special request for this specific item — e.g. "tidak pedas", "tanpa es". */}
                  <div className="flex items-center gap-2 mt-2 pl-1">
                    <MessageSquarePlus size={13} className="flex-shrink-0" style={{ color: 'rgba(243,234,217,0.35)' }} />
                    <input
                      value={note}
                      onChange={(e) => onNoteChange(product.id, e.target.value)}
                      placeholder="Catatan untuk item ini (opsional)"
                      maxLength={120}
                      className="w-full bg-transparent text-xs outline-none font-light py-1"
                      style={{ color: CREAM, fontFamily: 'Inter, sans-serif' }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          )}

          {lines.length > 0 && (
            <div className="mt-6 flex flex-col gap-5">
              <div>
                <p
                  className="text-[11px] font-medium uppercase tracking-[0.16em] mb-2.5"
                  style={{ color: MUTED, fontFamily: 'Inter, sans-serif' }}
                >
                  Jenis Pesanan
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {(
                    [
                      { key: 'dine-in' as OrderType, label: 'Makan di Tempat' },
                      { key: 'takeaway' as OrderType, label: 'Bawa Pulang' },
                    ]
                  ).map(({ key, label }) => {
                    const active = orderType === key;
                    return (
                      <button
                        key={key}
                        onClick={() => setOrderType(key)}
                        className="py-2.5 rounded-xl text-xs font-semibold transition-all duration-300"
                        style={
                          active
                            ? { background: GRADIENT, color: BLACK, boxShadow: '0 0 20px rgba(217,163,95,0.25)' }
                            : {
                                backgroundColor: 'transparent',
                                color: MUTED,
                                border: '1px solid rgba(243,234,217,0.16)',
                              }
                        }
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {orderType === 'dine-in' && (
                <div>
                  <label
                    className="text-[11px] font-medium uppercase tracking-[0.16em] mb-2.5 block"
                    style={{ color: MUTED, fontFamily: 'Inter, sans-serif' }}
                  >
                    Nomor Meja
                  </label>
                  <input
                    value={tableNumber}
                    onChange={(e) => setTableNumber(e.target.value)}
                    placeholder="Contoh: 12"
                    className="w-full px-3.5 py-2.5 rounded-xl text-sm outline-none transition-colors duration-300 font-light"
                    style={{
                      backgroundColor: '#121212',
                      border: '1px solid rgba(217,163,95,0.2)',
                      color: CREAM,
                      fontFamily: 'Inter, sans-serif',
                    }}
                    onFocus={(e) => (e.currentTarget.style.borderColor = GOLD)}
                    onBlur={(e) => (e.currentTarget.style.borderColor = 'rgba(217,163,95,0.2)')}
                  />
                </div>
              )}

              <div>
                <p
                  className="text-[11px] font-medium uppercase tracking-[0.16em] mb-2.5"
                  style={{ color: MUTED, fontFamily: 'Inter, sans-serif' }}
                >
                  Metode Pembayaran
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {PAYMENT_OPTIONS.map(({ key, label, icon: Icon }) => {
                    const active = paymentMethod === key;
                    return (
                      <button
                        key={key}
                        onClick={() => setPaymentMethod(key)}
                        className="flex flex-col items-center gap-1.5 py-3 rounded-xl text-[11px] font-semibold transition-all duration-300"
                        style={
                          active
                            ? {
                                backgroundColor: 'rgba(217,163,95,0.12)',
                                border: `1px solid ${GOLD}`,
                                color: GOLD,
                                boxShadow: '0 0 16px rgba(217,163,95,0.12)',
                              }
                            : { backgroundColor: 'transparent', border: '1px solid rgba(243,234,217,0.14)', color: MUTED }
                        }
                      >
                        <Icon size={16} />
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        <div
          className="relative px-5 sm:px-6 py-5 flex flex-col gap-2 flex-shrink-0"
          style={{
            borderTop: '1px solid rgba(243,234,217,0.08)',
            backgroundColor: 'rgba(7,7,7,0.6)',
            backdropFilter: 'blur(10px)',
          }}
        >
          {promoCode && (
            <div
              className="flex items-center justify-between gap-2 rounded-lg px-3 py-2 mb-1"
              style={{ backgroundColor: 'rgba(217,163,95,0.1)', border: '1px solid rgba(217,163,95,0.3)' }}
            >
              <div className="flex items-center gap-1.5 min-w-0">
                <Tag size={12} style={{ color: GOLD }} />
                <span className="text-xs font-medium truncate" style={{ color: CREAM, fontFamily: 'Inter, sans-serif' }}>
                  Promo <span style={{ color: GOLD, fontFamily: 'monospace' }}>{promoCode}</span> diterapkan
                </span>
              </div>
              <button
                onClick={onRemovePromo}
                className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center transition-colors hover:bg-white/10"
                style={{ color: MUTED }}
                aria-label="Hapus promo"
              >
                <X size={11} />
              </button>
            </div>
          )}
          <div className="flex justify-between text-sm font-light" style={{ color: MUTED, fontFamily: 'Inter, sans-serif' }}>
            <span>Subtotal</span>
            <span>{formatIDR(subtotal)}</span>
          </div>
          {discount > 0 && (
            <div className="flex justify-between text-sm font-light" style={{ color: '#7BC98A', fontFamily: 'Inter, sans-serif' }}>
              <span>Diskon Promo</span>
              <span>-{formatIDR(discount)}</span>
            </div>
          )}
          <div className="flex justify-between text-sm font-light" style={{ color: MUTED, fontFamily: 'Inter, sans-serif' }}>
            <span>Pajak (10%)</span>
            <span>{formatIDR(tax)}</span>
          </div>
          <div className="flex justify-between items-baseline pt-1.5">
            <span style={{ color: CREAM, fontFamily: "'Playfair Display', serif", fontSize: 16 }}>Total</span>
            <span
              style={{
                fontSize: 19,
                fontWeight: 600,
                fontFamily: 'Inter, sans-serif',
                background: GRADIENT,
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                color: 'transparent',
              }}
            >
              {formatIDR(total)}
            </span>
          </div>
          <button
            onClick={handleConfirm}
            disabled={!canConfirm}
            className="mt-3 w-full font-semibold py-3.5 rounded-xl transition-all duration-500 enabled:hover:scale-[1.015]"
            style={
              canConfirm
                ? { background: GRADIENT, color: BLACK, boxShadow: '0 8px 30px -8px rgba(217,163,95,0.45)' }
                : { backgroundColor: 'rgba(243,234,217,0.06)', color: 'rgba(243,234,217,0.3)', cursor: 'not-allowed' }
            }
          >
            Pesan Sekarang
          </button>
        </div>
      </div>
    </>
  );
}
