import { Link } from 'react-router-dom';
import { Clock, Mail, MapPin, Phone, Share2 } from 'lucide-react';
import { NAV_LINKS } from './SiteNavbar';
import { useTheme } from '../../context/ThemeContext';

export default function SiteFooter() {
  const { colors } = useTheme();

  return (
    <footer id="kontak" className="relative" style={{ backgroundColor: colors.ink }}>
      <div className="px-5 sm:px-8 lg:px-10 py-14 sm:py-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">
        <div>
          <Link
            to="/"
            style={{
              fontFamily: "'Anton', sans-serif",
              color: colors.cream,
              fontSize: 24,
              letterSpacing: '-0.02em',
            }}
          >
            Saung Baraya
          </Link>
          <p
            className="mt-3 max-w-[240px]"
            style={{ color: colors.creamAlpha(0.55), fontSize: 14, lineHeight: 1.6, fontFamily: 'Inter, sans-serif' }}
          >
            Rumah makan Sunda & Betawi, menghadirkan cita rasa leluhur dengan resep turun-temurun.
          </p>
        </div>

        <div>
          <p
            className="uppercase text-xs mb-4"
            style={{ color: colors.accent, letterSpacing: '0.18em', fontFamily: 'Inter, sans-serif' }}
          >
            Navigasi
          </p>
          <div className="flex flex-col gap-2.5">
            {NAV_LINKS.map((link) => (
              <Link key={link.label} to={link.to} className="text-sm" style={{ color: colors.creamAlpha(0.75) }}>
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        <div>
          <p
            className="uppercase text-xs mb-4"
            style={{ color: colors.accent, letterSpacing: '0.18em', fontFamily: 'Inter, sans-serif' }}
          >
            Kontak
          </p>
          <div className="flex flex-col gap-2.5 text-sm" style={{ color: colors.creamAlpha(0.75) }}>
            <span className="flex items-start gap-2">
              <MapPin size={15} className="mt-0.5 flex-shrink-0" color={colors.accent} />
              Jl. Kebon Kacang No. 12, Jakarta Selatan
            </span>
            <span className="flex items-center gap-2">
              <Phone size={15} color={colors.accent} />
              (021) 555-0182
            </span>
            <span className="flex items-center gap-2">
              <Mail size={15} color={colors.accent} />
              halo@saungbaraya.id
            </span>
          </div>
        </div>

        <div>
          <p
            className="uppercase text-xs mb-4"
            style={{ color: colors.accent, letterSpacing: '0.18em', fontFamily: 'Inter, sans-serif' }}
          >
            Jam Buka
          </p>
          <div className="flex items-start gap-2 text-sm mb-4" style={{ color: colors.creamAlpha(0.75) }}>
            <Clock size={15} className="mt-0.5 flex-shrink-0" color={colors.accent} />
            Setiap hari, 10.00 – 22.00 WIB
          </div>
          <a
            href="#"
            aria-label="Media sosial Saung Baraya"
            className="w-9 h-9 rounded-full flex items-center justify-center"
            style={{ background: colors.creamAlpha(0.08), border: `1px solid ${colors.creamAlpha(0.2)}` }}
          >
            <Share2 size={16} color={colors.cream} />
          </a>
        </div>
      </div>

      <div
        className="px-5 sm:px-8 lg:px-10 py-5 flex flex-col sm:flex-row items-center justify-between gap-2"
        style={{ borderTop: `1px solid ${colors.creamAlpha(0.08)}` }}
      >
        <p style={{ color: colors.creamAlpha(0.4), fontSize: 12, fontFamily: 'Inter, sans-serif' }}>
          © {new Date().getFullYear()} Saung Baraya. Seluruh hak cipta dilindungi.
        </p>
        <p style={{ color: colors.creamAlpha(0.4), fontSize: 12, fontFamily: 'Inter, sans-serif' }}>
          Dibuat dengan cinta untuk cita rasa Sunda & Betawi
        </p>
      </div>
    </footer>
  );
}
