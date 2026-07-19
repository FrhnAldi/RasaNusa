import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, Search, ShoppingBag, User, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import ThemeToggle from './ThemeToggle';

export const NAV_LINKS = [
  { label: 'Beranda', to: '/' },
  { label: 'Tentang', to: '/tentang' },
  { label: 'Menu', to: '/menu' },
  { label: 'Promo', to: '/promo' },
];

export default function SiteNavbar({ variant = 'dark' }: { variant?: 'dark' | 'light' }) {
  const { user } = useAuth();
  const { mode } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  const ctaLabel = user ? 'Ke Dashboard' : 'Pesan? Silahkan Login';
  const ctaTarget = user ? (user.role === 'admin' ? '/admin' : '/dashboard') : '/login';

  // The navbar sits on top of dark hero sections normally; in light mode we flip
  // its own text colors so it stays readable against the now-light background.
  const effectiveVariant: 'dark' | 'light' = mode === 'light' ? 'light' : variant;

  const textColor = effectiveVariant === 'dark' ? '#F3EAD9' : '#15100C';
  const textMuted = effectiveVariant === 'dark' ? 'text-white/90 hover:text-white' : 'text-black/80 hover:text-black';
  const pillBg = effectiveVariant === 'dark' ? 'rgba(243,234,217,0.12)' : 'rgba(21,16,12,0.08)';
  const pillBorder = effectiveVariant === 'dark' ? 'rgba(243,234,217,0.3)' : 'rgba(21,16,12,0.2)';

  return (
    <>
      <nav className="relative z-30 animate-fade-in">
        <div className="flex items-center justify-between px-5 sm:px-8 lg:px-10 py-4 lg:py-5">
          <Link
            to="/"
            className="animate-slide-left delay-200"
            style={{
              fontFamily: "'Anton', sans-serif",
              color: textColor,
              fontSize: 26,
              letterSpacing: '-0.02em',
              lineHeight: 1,
            }}
          >
            Saung Baraya
          </Link>

          <div className="hidden md:flex items-center gap-10 animate-fade-in delay-400">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.label}
                to={link.to}
                className={`transition-colors ${textMuted}`}
                style={{ fontFamily: 'DM Sans, sans-serif', fontWeight: 500, fontSize: 16 }}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-3 sm:gap-4 animate-slide-right delay-300">
            <ThemeToggle />
            <button
              aria-label="Cari menu"
              className={`transition-colors hidden sm:inline-flex ${textMuted}`}
            >
              <Search size={20} strokeWidth={1.5} />
            </button>
            <Link
              to={ctaTarget}
              aria-label={user ? 'Lihat pesanan' : 'Masuk untuk memesan'}
              className={`transition-colors hidden sm:inline-flex ${textMuted}`}
            >
              <ShoppingBag size={20} strokeWidth={1.5} />
            </Link>
            <Link
              to={ctaTarget}
              aria-label={ctaLabel}
              className="hidden sm:inline-flex items-center gap-1.5 whitespace-nowrap px-3.5 py-2 lg:px-5 lg:py-2.5 rounded-full text-[11px] lg:text-sm font-medium transition-transform duration-300 hover:scale-105"
              style={{ background: pillBg, border: `1px solid ${pillBorder}`, color: textColor, fontFamily: 'Inter, sans-serif' }}
            >
              <User size={15} color={textColor} strokeWidth={1.5} />
              {ctaLabel}
            </Link>
            <Link
              to={ctaTarget}
              aria-label={ctaLabel}
              className="w-8 h-8 rounded-full flex items-center justify-center sm:hidden"
              style={{ background: pillBg, border: `1px solid ${pillBorder}` }}
            >
              <User size={16} color={textColor} strokeWidth={1.5} />
            </Link>
            <button
              aria-label="Menu"
              className="md:hidden"
              style={{ color: textColor }}
              onClick={() => setMenuOpen((v) => !v)}
            >
              {menuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </nav>

      {menuOpen && (
        <div
          className="fixed inset-0 z-40 flex flex-col items-center justify-center gap-8 animate-fade-in"
          style={{ background: 'rgba(21,16,12,0.97)' }}
        >
          <div className="absolute top-5 right-5">
            <ThemeToggle />
          </div>
          {NAV_LINKS.map((link) => (
            <Link
              key={link.label}
              to={link.to}
              onClick={() => setMenuOpen(false)}
              className="text-2xl text-white"
              style={{ fontFamily: 'DM Sans, sans-serif', fontWeight: 500 }}
            >
              {link.label}
            </Link>
          ))}
          <Link
            to={ctaTarget}
            onClick={() => setMenuOpen(false)}
            className="mt-4 px-6 py-3 rounded-md text-black"
            style={{ background: '#F3EAD9', fontFamily: 'Inter, sans-serif', fontWeight: 500 }}
          >
            {ctaLabel}
          </Link>
        </div>
      )}
    </>
  );
}
