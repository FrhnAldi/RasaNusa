import { Minus, Plus } from 'lucide-react';
import type { Product } from '../../types/pos';
import { formatIDR } from '../../data/products';
import { BADGE_STYLE } from '../../data/badges';

// Shared Basilico luxury palette (see CartDrawer / OrderSuccessModal / CustomerDashboard).
const CREAM = '#F3EAD9';
const GOLD = '#D9A35F';
const BURNT = '#C97A2B';
const BLACK = '#070707';
const GRADIENT = `linear-gradient(135deg, ${GOLD}, ${BURNT})`;

interface Props {
  product: Product;
  quantity: number;
  onAdd: (product: Product) => void;
  onIncrement: (productId: string) => void;
  onDecrement: (productId: string) => void;
}

export default function MenuCard({ product, quantity, onAdd, onIncrement, onDecrement }: Props) {
  const remaining = product.stock - quantity;
  const badgeStyle = product.badge ? BADGE_STYLE[product.badge] : null;
  const BadgeIcon = badgeStyle?.icon;

  return (
    <div
      className="group relative flex flex-col rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1"
      style={{
        backgroundColor: 'rgba(243,234,217,0.04)',
        border: '1px solid rgba(243,234,217,0.1)',
      }}
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        {badgeStyle && BadgeIcon && (
          <span
            className="absolute top-2 left-2 flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide px-2 py-1 rounded-full"
            style={{ backgroundColor: badgeStyle.bg, color: badgeStyle.color, backdropFilter: 'blur(4px)' }}
          >
            <BadgeIcon size={10} />
            {product.badge}
          </span>
        )}
      </div>

      <div className="p-3 sm:p-3.5 flex flex-col gap-1 flex-1">
        <p
          className="text-sm leading-snug line-clamp-2 font-light"
          style={{ fontFamily: 'Inter, sans-serif', color: CREAM, letterSpacing: '-0.01em' }}
        >
          {product.name}
        </p>
        <p className="text-xs line-clamp-2 leading-snug font-light" style={{ color: 'rgba(243,234,217,0.5)' }}>
          {product.description}
        </p>
        <div className="mt-auto flex items-center justify-between pt-2.5">
          <p className="text-sm font-semibold" style={{ color: GOLD, fontFamily: 'Inter, sans-serif' }}>
            {formatIDR(product.price)}
          </p>

          {product.stock > 0 &&
            (quantity === 0 ? (
              <button
                onClick={() => onAdd(product)}
                className="w-8 h-8 rounded-full flex items-center justify-center shadow-sm transition-transform hover:scale-110"
                style={{ background: GRADIENT, color: BLACK }}
                aria-label={`Tambah ${product.name}`}
              >
                <Plus size={15} strokeWidth={2.5} />
              </button>
            ) : (
              <div
                className="flex items-center gap-1.5 rounded-full px-1 py-1"
                style={{ backgroundColor: 'rgba(243,234,217,0.1)', border: '1px solid rgba(243,234,217,0.15)' }}
              >
                <button
                  onClick={() => onDecrement(product.id)}
                  className="w-6 h-6 rounded-full flex items-center justify-center transition-colors hover:bg-white/10"
                  style={{ color: '#F3EAD9' }}
                  aria-label={`Kurangi ${product.name}`}
                >
                  <Minus size={12} />
                </button>
                <span className="text-xs font-bold w-4 text-center" style={{ color: '#F3EAD9' }}>
                  {quantity}
                </span>
                <button
                  onClick={() => onIncrement(product.id)}
                  disabled={remaining <= 0}
                  className="w-6 h-6 rounded-full flex items-center justify-center transition-colors hover:bg-white/10 disabled:opacity-30"
                  style={{ color: '#F3EAD9' }}
                  aria-label={`Tambah ${product.name}`}
                >
                  <Plus size={12} />
                </button>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
