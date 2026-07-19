import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import type { ChangeEvent, FormEvent } from 'react';
import { ChevronDown, ImagePlus, Utensils, X } from 'lucide-react';
import type { Category, Product } from '../../types/pos';
import { useAppData } from '../../context/AppDataContext';

interface Props {
  mode: 'add' | 'edit';
  product?: Product;
  onClose: () => void;
  onSaved?: (id: string) => void;
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

export default function ProductFormModal({ mode, product, onClose, onSaved }: Props) {
  const { addProduct, updateProduct } = useAppData();
  const [name, setName] = useState(product?.name ?? '');
  const [category, setCategory] = useState<Category>(product?.category ?? 'makanan');
  const [price, setPrice] = useState(String(product?.price ?? ''));
  const [stock, setStock] = useState(String(product?.stock ?? ''));
  const [image, setImage] = useState(product?.image ?? '');
  const [description, setDescription] = useState(product?.description ?? '');
  const [imageError, setImageError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setImageError('File harus berupa gambar (PNG, JPG, atau WEBP).');
      return;
    }
    if (file.size > 3 * 1024 * 1024) {
      setImageError('Ukuran gambar maksimal 3MB.');
      return;
    }

    setImageError('');
    const reader = new FileReader();
    reader.onload = () => setImage(reader.result as string);
    reader.onerror = () => setImageError('Gagal membaca gambar, coba lagi.');
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    const original = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = original;
    };
  }, []);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const priceNum = Number(price);
    const stockNum = Number(stock);
    if (!name.trim() || !priceNum || priceNum <= 0 || stockNum < 0 || !image.trim()) return;

    if (mode === 'add') {
      const newId = addProduct({
        name: name.trim(),
        category,
        price: priceNum,
        stock: stockNum,
        image: image.trim(),
        description: description.trim() || 'Menu spesial Saung Baraya.',
      });
      onSaved?.(newId);
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

  return createPortal(
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
              placeholder="Contoh: Sayur Asem Sunda"
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

          <Field label="Gambar Menu">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
            {image ? (
              <div className="flex flex-col gap-2">
                <div className="rounded-xl overflow-hidden" style={{ border: '1px solid rgba(217,163,95,0.2)' }}>
                  <img src={image} alt="Preview gambar menu" className="w-full h-36 object-cover" />
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex-1 text-xs font-semibold py-2 rounded-lg transition-colors duration-300"
                    style={{
                      backgroundColor: 'rgba(217,163,95,0.12)',
                      color: GOLD,
                      border: '1px solid rgba(217,163,95,0.3)',
                    }}
                  >
                    Ganti Gambar
                  </button>
                  <button
                    type="button"
                    onClick={() => setImage('')}
                    className="text-xs font-semibold px-3 py-2 rounded-lg transition-colors duration-300"
                    style={{
                      backgroundColor: 'rgba(196,67,43,0.12)',
                      color: '#E8836C',
                      border: '1px solid rgba(196,67,43,0.25)',
                    }}
                  >
                    Hapus
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full flex flex-col items-center justify-center gap-1.5 py-7 rounded-xl transition-colors duration-300"
                style={{ border: '1px dashed rgba(217,163,95,0.35)', backgroundColor: '#121212', color: MUTED }}
              >
                <ImagePlus size={20} style={{ color: GOLD }} />
                <span className="text-xs font-medium">Klik untuk upload gambar</span>
                <span className="text-[10px]" style={{ color: 'rgba(243,234,217,0.35)' }}>
                  PNG, JPG, atau WEBP · maks 3MB
                </span>
              </button>
            )}
            {imageError && (
              <span className="text-[11px] font-medium" style={{ color: '#E8836C' }}>
                {imageError}
              </span>
            )}
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
    </div>,
    document.body
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
