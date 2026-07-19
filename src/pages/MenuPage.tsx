import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag } from 'lucide-react';
import PageHero from '../components/site/PageHero';
import SiteFooter from '../components/site/SiteFooter';
import GlobalStyles from '../components/site/GlobalStyles';
import { CATEGORY_LABELS, formatIDR, INITIAL_PRODUCTS } from '../data/products';
import { BADGE_STYLE } from '../data/badges';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import type { Category } from '../types/pos';

const CATEGORIES: (Category | 'semua')[] = ['semua', 'makanan', 'camilan', 'minuman', 'dessert'];

export default function MenuPage() {
  const [activeCategory, setActiveCategory] = useState<Category | 'semua'>('semua');
  const { user } = useAuth();
  const { colors } = useTheme();
  const navigate = useNavigate();

  const handleOrderClick = () => {
    if (!user) {
      navigate('/login');
    } else {
      navigate(user.role === 'admin' ? '/admin' : '/dashboard');
    }
  };

  const filtered = useMemo(
    () =>
      activeCategory === 'semua'
        ? INITIAL_PRODUCTS
        : INITIAL_PRODUCTS.filter((p) => p.category === activeCategory),
    [activeCategory]
  );

  return (
    <div className="relative w-full overflow-hidden" style={{ fontFamily: 'Inter, sans-serif' }}>
      <GlobalStyles />

      <PageHero
        eyebrow="Menu Kami"
        words={['Ragam', 'Rasa', 'Sunda', 'dan', 'Betawi']}
        subtitle="Setiap hidangan dimasak segar setiap hari, dari makanan berat, camilan, minuman, hingga dessert penutup khas Pasundan dan Betawi."
        bgImage="https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=1600&q=80&fm=jpg&fit=crop"
      />

      {/* ================= FILTER + GRID ================= */}
      <section className="relative px-5 sm:px-8 lg:px-10 py-14 sm:py-16 lg:py-20" style={{ backgroundColor: colors.ink }}>
        {/* category filter */}
        <div className="flex flex-wrap gap-3 mb-10 sm:mb-12 animate-fade-up">
          {CATEGORIES.map((cat) => {
            const active = cat === activeCategory;
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className="px-5 py-2.5 rounded-full text-sm transition-all duration-300"
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 500,
                  backgroundColor: active ? colors.accent : colors.creamAlpha(0.06),
                  color: active ? colors.ink : colors.creamAlpha(0.75),
                  border: `1px solid ${active ? colors.accent : colors.creamAlpha(0.15)}`,
                }}
              >
                {CATEGORY_LABELS[cat]}
              </button>
            );
          })}
        </div>

        {/* product grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((product, i) => {
            const badgeStyle = product.badge ? BADGE_STYLE[product.badge] : null;
            const BadgeIcon = badgeStyle?.icon;

            return (
              <div
                key={product.id}
                className="group rounded-2xl overflow-hidden relative animate-fade-up transition-transform hover:-translate-y-1.5"
                style={{
                  backgroundColor: colors.creamAlpha(0.04),
                  border: `1px solid ${colors.creamAlpha(0.1)}`,
                  animationDelay: `${0.05 * (i % 6)}s`,
                }}
              >
                <div className="relative overflow-hidden" style={{ aspectRatio: '4 / 3' }}>
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  {badgeStyle && BadgeIcon && (
                    <span
                      className="absolute top-3 left-3 flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium"
                      style={{ backgroundColor: badgeStyle.bg, color: badgeStyle.color, backdropFilter: 'blur(4px)' }}
                    >
                      <BadgeIcon size={11} />
                      {product.badge}
                    </span>
                  )}
                </div>
                <div className="p-4 sm:p-5">
                  <p
                    style={{
                      fontFamily: 'DM Sans, sans-serif',
                      fontSize: 18,
                      color: colors.cream,
                      letterSpacing: '-0.02em',
                      lineHeight: 1.2,
                    }}
                  >
                    {product.name}
                  </p>
                  <p
                    className="mt-1.5 line-clamp-2"
                    style={{ fontSize: 13, color: colors.creamAlpha(0.55), lineHeight: 1.5 }}
                  >
                    {product.description}
                  </p>
                  <div className="flex items-center justify-between mt-4">
                    <span style={{ color: colors.accent, fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: 16 }}>
                      {formatIDR(product.price)}
                    </span>
                    <button
                      type="button"
                      onClick={handleOrderClick}
                      aria-label={`Pesan ${product.name}`}
                      className="w-9 h-9 rounded-full flex items-center justify-center transition-transform duration-300 hover:scale-110"
                      style={{ backgroundColor: 'rgba(217,164,65,0.14)', color: colors.accent }}
                    >
                      <ShoppingBag size={15} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <p className="text-center py-16" style={{ color: colors.creamAlpha(0.5) }}>
            Belum ada menu pada kategori ini.
          </p>
        )}
      </section>

      {/* ================= CTA STRIP ================= */}
      <section
        className="relative px-5 sm:px-8 lg:px-10 py-14 sm:py-16 flex flex-col sm:flex-row items-center justify-between gap-6"
        style={{ backgroundColor: '#D9A441' }}
      >
        <p
          className="max-w-md text-center sm:text-left animate-fade-up"
          style={{
            fontFamily: 'DM Sans, sans-serif',
            fontWeight: 400,
            fontSize: 'clamp(24px, 3.4vw, 34px)',
            lineHeight: 1.15,
            letterSpacing: '-0.03em',
            color: '#15100C',
          }}
        >
          Ingin menikmati hidangan ini langsung dari saung kami?
        </p>
        <a
          href="#kontak"
          className="px-7 py-3.5 rounded-md bg-black text-white animate-fade-up delay-200 flex-shrink-0"
          style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500 }}
        >
          Kunjungi Saung Kami
        </a>
      </section>

      <SiteFooter />
    </div>
  );
}
