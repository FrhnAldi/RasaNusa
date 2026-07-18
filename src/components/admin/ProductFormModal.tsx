import { useState } from 'react';
import type { FormEvent } from 'react';
import { ChevronDown, Utensils, X } from 'lucide-react';
import type { Category, Product } from '../../types/pos';
import { useAppData } from '../../context/AppDataContext';

interface Props {
  mode: 'add' | 'edit';
  product?: Product;
  onClose: () => void;
}

const CATEGORY_OPTIONS: { value: Category; label: string }[] = [
  { value: 'makanan', label: 'Makanan' },
  { value: 'camilan', label: 'Camilan' },
  { value: 'minuman', label: 'Minuman' },
  { value: 'dessert', label: 'Dessert' },
];

// Basilico luxury design system — matches the cart drawer & order success modal.
const BLACK = '#070707';
const CREAM = '#F3EAD9';
const GOLD = '#D9A35F';
const BURNT = '#C97A2B';
const GRADIENT = `linear-gradient(135deg, ${GOLD}, ${BURNT})`;
const MUTED = 'rgba(243,234,217,0.55)';
const SERIF = "'Playfair Display', serif";

const fieldStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 14px',
  borderRadius: 12,
  fontSize: 14,
  outline: 'none',
  fontFamily: 'Inter, sans-serif',
  fontWeight: 300,
  backgroundColor: '#121212',
  border: '1px solid rgba(217,163,95,0.2)',
  color: CREAM,
  transition: 'border-color 300ms',
};

function focusGold(e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
  e.currentTarget.style.borderColor = GOLD;
}
function blurGold(e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
  e.currentTarget.style.borderColor = 'rgba(217,163,95,0.2)';
}

export default function ProductFormModal({ mode, product, onClose }: Props) {
  const { addProduct, updateProduct } = useAppData();
  const [name, setName] = useState(product?.name ?? '');
  const [category, setCategory] = useState<Category>(product?.category ?? 'makanan');
  const [price, setPrice] = useState(String(product?.price ?? ''));
  const [stock, setStock] = useState(String(product?.stock ?? ''));
  const [image, setImage] = useState(product?.image ?? '');
  const [description, setDescription] = useState(product?.description ?? '');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const priceNum = Number(price);
    const stockNum = Number(stock);
    if (!name.trim() || !priceNum || priceNum <= 0 || stockNum < 0 || !image.trim()) return;

    if (mode === 'add') {
      addProduct({
        name: name.trim(),
        category,
        price: priceNum,
        stock: stockNum,
        image: image.trim(),
        description: description.trim() || 'Menu spesial RasaNusa.',
      });
    } else if (product) {
      updateProduct(product.id, {
        name: name.trim(),
        category,
        price: priceNum,
        stock: stockNum,
        image: image.trim(),
        description: description.trim(),
      });
    }
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center px-4 animate-fade-in"
      style={{ backgroundColor: 'rgba(4,4,4,0.72)', backdropFilter: 'blur(6px)' }}
      onClick={onClose}
    >
      <form
        onSubmit={handleSubmit}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md rounded-3xl overflow-hidden max-h-[90vh] flex flex-col animate-scale-in"
        style={{
          backgroundColor: `${BLACK}f5`,
          border: '1px solid rgba(217,163,95,0.22)',
          boxShadow: '0 30px 80px -20px rgba(0,0,0,0.7), 0 0 50px rgba(217,163,95,0.1)',
          backdropFilter: 'blur(20px)',
        }}
      >
        <div
          className="absolute -top-20 -right-20 w-56 h-56 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(217,163,95,0.14), transparent 70%)' }}
        />

        <div
          className="relative flex items-center gap-3 px-5 py-4 flex-shrink-0"
          style={{ borderBottom: '1px solid rgba(243,234,217,0.08)' }}
        >
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: 'rgba(217,163,95,0.12)', border: '1px solid rgba(217,163,95,0.3)' }}
          >
            <Utensils size={16} style={{ color: GOLD }} />
          </div>
          <h3 style={{ fontFamily: SERIF, fontWeight: 600, color: CREAM, fontSize: 17 }}>
            {mode === 'add' ? 'Tambah Menu Baru' : 'Edit Menu'}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="ml-auto w-8 h-8 rounded-full flex items-center justify-center transition-colors duration-300 hover:bg-white/10"
            style={{ color: MUTED }}
            aria-label="Tutup"
          >
            <X size={17} />
          </button>
        </div>

        <div className="relative px-5 py-4 flex flex-col gap-3.5 overflow-y-auto">
          <Field label="Nama Menu">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Contoh: Es Teh Manis"
              style={fieldStyle}
              onFocus={focusGold}
              onBlur={blurGold}
            />
          </Field>

          <Field label="Kategori">
            <div className="relative">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as Category)}
                className="w-full appearance-none"
                style={fieldStyle}
                onFocus={focusGold}
                onBlur={blurGold}
              >
                {CATEGORY_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value} style={{ backgroundColor: BLACK, color: CREAM }}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={14}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                style={{ color: MUTED }}
              />
            </div>
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Harga (Rp)">
              <input
                type="number"
                min={0}
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
                placeholder="15000"
                style={fieldStyle}
                onFocus={focusGold}
                onBlur={blurGold}
              />
            </Field>
            <Field label="Stok Awal">
              <input
                type="number"
                min={0}
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                required
                placeholder="10"
                style={fieldStyle}
                onFocus={focusGold}
                onBlur={blurGold}
              />
            </Field>
          </div>

          <Field label="URL Gambar">
            <input
              value={image}
              onChange={(e) => setImage(e.target.value)}
              required
              placeholder="https://..."
              style={fieldStyle}
              onFocus={focusGold}
              onBlur={blurGold}
            />
          </Field>

          <Field label="Deskripsi">
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder="Deskripsi singkat menu..."
              className="resize-none"
              style={fieldStyle}
              onFocus={focusGold}
              onBlur={blurGold}
            />
          </Field>
        </div>

        <div className="relative px-5 py-4 flex-shrink-0" style={{ borderTop: '1px solid rgba(243,234,217,0.08)' }}>
          <button
            type="submit"
            className="w-full font-semibold py-3.5 rounded-xl transition-all duration-500 hover:scale-[1.015]"
            style={{ background: GRADIENT, color: BLACK, boxShadow: '0 8px 30px -8px rgba(217,163,95,0.45)' }}
          >
            {mode === 'add' ? 'Simpan Menu' : 'Simpan Perubahan'}
          </button>
        </div>
      </form>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[11px] font-medium uppercase tracking-[0.14em]" style={{ color: MUTED }}>
        {label}
      </span>
      {children}
    </label>
  );
}
