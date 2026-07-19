import { useMemo, useState } from 'react';
import { AlertTriangle, Minus, PackagePlus, Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { formatIDR, CATEGORY_LABELS } from '../../data/products';
import type { Category, Product } from '../../types/pos';
import { useAppData } from '../../context/AppDataContext';
import { useAuth } from '../../context/AuthContext';
import ProductFormModal from './ProductFormModal';

const TABS: (Category | 'semua')[] = ['semua', 'makanan', 'camilan', 'minuman', 'dessert'];

// Basilico luxury design system — matches the rest of the admin & customer dashboards.
const BLACK = '#070707';
const CREAM = '#F3EAD9';
const GOLD = '#D9A35F';
const BURNT = '#C97A2B';
const GRADIENT = `linear-gradient(135deg, ${GOLD}, ${BURNT})`;
const MUTED = 'rgba(243,234,217,0.55)';

export default function StockTab({ products }: { products: Product[] }) {
  const { adjustStock, removeProduct } = useAppData();
  const { user } = useAuth();
  const [query, setQuery] = useState('');
  const [tab, setTab] = useState<Category | 'semua'>('semua');
  const [amounts, setAmounts] = useState<Record<string, number>>({});
  const [formState, setFormState] = useState<{ mode: 'add' | 'edit'; product?: Product } | null>(null);

  const filtered = useMemo(() => {
    // `products` is already ordered newest-first (new menu items are prepended
    // in AppDataContext), so we keep that order here instead of re-sorting
    // alphabetically — that way a newly added menu appears at the top, not
    // scattered wherever its name falls alphabetically.
    let list = tab === 'semua' ? products : products.filter((p) => p.category === tab);
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter((p) => p.name.toLowerCase().includes(q));
    }
    return list;
  }, [products, tab, query]);

  const getAmount = (id: string) => amounts[id] ?? 1;

  const handleAdjust = (product: Product, direction: 1 | -1) => {
    const amount = getAmount(product.id);
    if (!amount || amount <= 0) return;
    adjustStock(
      product.id,
      direction * amount,
      direction === 1 ? 'Restock manual oleh admin' : 'Pengurangan stok manual oleh admin',
      user?.name ?? 'Admin'
    );
  };

  const handleDelete = (product: Product) => {
    if (confirm(`Hapus menu "${product.name}" dari katalog?`)) {
      removeProduct(product.id);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex gap-2 overflow-x-auto pb-1 sm:pb-0">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className="px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-300"
              style={
                tab === t
                  ? { background: GRADIENT, color: BLACK, boxShadow: '0 0 14px rgba(217,163,95,0.22)' }
                  : { backgroundColor: 'rgba(243,234,217,0.05)', color: MUTED, border: '1px solid rgba(243,234,217,0.12)' }
              }
            >
              {CATEGORY_LABELS[t]}
            </button>
          ))}
        </div>
        <div className="relative sm:w-56">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'rgba(243,234,217,0.4)' }} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari menu..."
            className="w-full pl-8 pr-3 py-2 rounded-full text-sm outline-none font-light transition-colors duration-300"
            style={{ backgroundColor: '#121212', border: '1px solid rgba(217,163,95,0.2)', color: CREAM }}
            onFocus={(e) => (e.currentTarget.style.borderColor = GOLD)}
            onBlur={(e) => (e.currentTarget.style.borderColor = 'rgba(217,163,95,0.2)')}
          />
        </div>
        <button
          onClick={() => setFormState({ mode: 'add' })}
          className="sm:ml-auto flex items-center justify-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-full transition-all duration-300 hover:scale-105"
          style={{ background: GRADIENT, color: BLACK, boxShadow: '0 4px 20px -6px rgba(217,163,95,0.4)' }}
        >
          <PackagePlus size={15} /> Tambah Menu
        </button>
      </div>

      <div
        className="rounded-2xl overflow-hidden"
        style={{ backgroundColor: 'rgba(243,234,217,0.03)', border: '1px solid rgba(243,234,217,0.1)' }}
      >
        {filtered.length === 0 ? (
          <div className="py-14 text-center text-sm font-light" style={{ color: 'rgba(243,234,217,0.35)' }}>
            Tidak ada menu ditemukan.
          </div>
        ) : (
          <div className="divide-y divide-[rgba(243,234,217,0.08)]">
            {filtered.map((product) => {
              const isLow = product.stock > 0 && product.stock <= 5;
              const isOut = product.stock === 0;
              return (
                <div
                  key={product.id}
                  className="px-4 sm:px-5 py-3 flex flex-wrap items-center gap-3 transition-colors duration-300 hover:bg-white/[0.02]"
                >
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-11 h-11 rounded-lg object-cover flex-shrink-0"
                    style={{ backgroundColor: 'rgba(243,234,217,0.06)' }}
                  />
                  <div className="min-w-[140px] flex-1">
                    <p className="text-sm font-medium truncate" style={{ color: CREAM }}>{product.name}</p>
                    <p className="text-xs font-light" style={{ color: MUTED }}>
                      {CATEGORY_LABELS[product.category]} · {formatIDR(product.price)}
                    </p>
                  </div>

                  <div
                    className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full"
                    style={
                      isOut
                        ? { backgroundColor: 'rgba(196,67,43,0.16)', color: '#E8836C' }
                        : isLow
                          ? { backgroundColor: 'rgba(217,163,95,0.14)', color: GOLD }
                          : { backgroundColor: 'rgba(243,234,217,0.06)', color: MUTED }
                    }
                  >
                    {(isLow || isOut) && <AlertTriangle size={12} />}
                    Stok: {product.stock}
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleAdjust(product, -1)}
                      className="w-7 h-7 rounded-full flex items-center justify-center transition-colors duration-300 hover:bg-white/10"
                      style={{ border: '1px solid rgba(243,234,217,0.15)', color: CREAM }}
                      aria-label={`Kurangi stok ${product.name}`}
                    >
                      <Minus size={13} />
                    </button>
                    <input
                      type="number"
                      min={1}
                      value={getAmount(product.id)}
                      onChange={(e) =>
                        setAmounts((prev) => ({ ...prev, [product.id]: Math.max(1, Number(e.target.value) || 1) }))
                      }
                      className="w-12 text-center text-sm rounded-lg py-1 outline-none transition-colors duration-300"
                      style={{ backgroundColor: '#121212', border: '1px solid rgba(217,163,95,0.2)', color: CREAM }}
                      onFocus={(e) => (e.currentTarget.style.borderColor = GOLD)}
                      onBlur={(e) => (e.currentTarget.style.borderColor = 'rgba(217,163,95,0.2)')}
                    />
                    <button
                      onClick={() => handleAdjust(product, 1)}
                      className="w-7 h-7 rounded-full flex items-center justify-center transition-colors duration-300 hover:bg-white/10"
                      style={{ border: '1px solid rgba(243,234,217,0.15)', color: CREAM }}
                      aria-label={`Tambah stok ${product.name}`}
                    >
                      <Plus size={13} />
                    </button>
                  </div>

                  <div className="flex items-center gap-1 ml-auto">
                    <button
                      onClick={() => setFormState({ mode: 'edit', product })}
                      className="w-8 h-8 rounded-full flex items-center justify-center transition-colors duration-300 hover:bg-white/10"
                      style={{ color: MUTED }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = GOLD)}
                      onMouseLeave={(e) => (e.currentTarget.style.color = MUTED)}
                      aria-label={`Edit ${product.name}`}
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={() => handleDelete(product)}
                      className="w-8 h-8 rounded-full flex items-center justify-center transition-colors duration-300 hover:bg-white/10"
                      style={{ color: MUTED }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = '#E8836C')}
                      onMouseLeave={(e) => (e.currentTarget.style.color = MUTED)}
                      aria-label={`Hapus ${product.name}`}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {formState && (
        <ProductFormModal
          mode={formState.mode}
          product={formState.product}
          onClose={() => setFormState(null)}
        />
      )}
    </div>
  );
}
