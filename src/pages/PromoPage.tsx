import { useEffect, useMemo, useState } from 'react';
import { CalendarClock, Tag, Zap } from 'lucide-react';
import PageHero from '../components/site/PageHero';
import SiteFooter from '../components/site/SiteFooter';
import GlobalStyles from '../components/site/GlobalStyles';
import { PROMOS } from '../data/promos';
import { useTheme } from '../context/ThemeContext';

function getNextFriday22() {
  const now = new Date();
  const target = new Date(now);
  const day = now.getDay();
  const daysUntilFriday = (5 - day + 7) % 7;
  target.setDate(now.getDate() + (daysUntilFriday === 0 && now.getHours() >= 22 ? 7 : daysUntilFriday));
  target.setHours(22, 0, 0, 0);
  return target;
}

function useCountdown() {
  const target = useMemo(() => getNextFriday22(), []);
  const [remaining, setRemaining] = useState(() => Math.max(0, target.getTime() - Date.now()));

  useEffect(() => {
    const id = setInterval(() => setRemaining(Math.max(0, target.getTime() - Date.now())), 1000);
    return () => clearInterval(id);
  }, [target]);

  const days = Math.floor(remaining / (1000 * 60 * 60 * 24));
  const hours = Math.floor((remaining / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((remaining / (1000 * 60)) % 60);
  const seconds = Math.floor((remaining / 1000) % 60);

  return { days, hours, minutes, seconds };
}

export default function PromoPage() {
  const { days, hours, minutes, seconds } = useCountdown();
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const { colors } = useTheme();

  const handleCopy = (code: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(code).catch(() => {});
    }
    setCopiedCode(code);
    setTimeout(() => setCopiedCode((c) => (c === code ? null : c)), 1800);
  };

  return (
    <div className="relative w-full overflow-hidden" style={{ fontFamily: 'Inter, sans-serif' }}>
      <GlobalStyles />

      <PageHero
        eyebrow="Promo &amp; Penawaran"
        words={['Nikmati', 'Lebih', 'Hemat', 'Setiap', 'Hari']}
        subtitle="Dari diskon harian sampai paket keluarga, ada banyak cara untuk menikmati cita rasa Sunda dan Betawi dengan lebih hemat."
        bgImage="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=1600&q=80&fm=jpg&fit=crop"
      />

      {/* ================= FLASH SALE COUNTDOWN ================= */}
      <section
        className="relative px-5 sm:px-8 lg:px-10 py-12 sm:py-14 overflow-hidden"
        style={{ backgroundColor: '#C4432B' }}
      >
        <div
          className="absolute inset-0 pointer-events-none opacity-20"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.06'/%3E%3C/svg%3E\")",
            backgroundSize: '200px 200px',
          }}
        />
        <div className="relative flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="text-center lg:text-left animate-fade-up">
            <div className="flex items-center justify-center lg:justify-start gap-2 mb-2">
              <Zap size={18} color="#F3EAD9" className="animate-pulse-soft" />
              <span
                className="uppercase text-xs sm:text-sm"
                style={{ color: 'rgba(243,234,217,0.85)', letterSpacing: '0.2em' }}
              >
                Jumat Pedas — Beli 1 Gratis 1
              </span>
            </div>
            <h2
              style={{
                fontFamily: 'DM Sans, sans-serif',
                fontWeight: 400,
                fontSize: 'clamp(26px, 3.6vw, 40px)',
                letterSpacing: '-0.03em',
                color: '#F3EAD9',
              }}
            >
              Promo berakhir dalam
            </h2>
          </div>

          <div className="flex items-center gap-3 sm:gap-4 animate-fade-up delay-200">
            <CountUnit value={days} label="Hari" />
            <Colon />
            <CountUnit value={hours} label="Jam" />
            <Colon />
            <CountUnit value={minutes} label="Menit" />
            <Colon />
            <CountUnit value={seconds} label="Detik" />
          </div>
        </div>
      </section>

      {/* ================= PROMO GRID ================= */}
      <section className="relative px-5 sm:px-8 lg:px-10 py-16 sm:py-20" style={{ backgroundColor: colors.ink }}>
        <div className="flex items-center gap-2 mb-3 animate-fade-up">
          <Tag size={18} color={colors.accent} />
          <span className="uppercase text-xs sm:text-sm" style={{ color: colors.accent, letterSpacing: '0.2em' }}>
            Semua Promo
          </span>
        </div>
        <h2
          className="max-w-xl mb-10 sm:mb-12 animate-fade-up delay-200"
          style={{
            fontFamily: 'DM Sans, sans-serif',
            fontWeight: 400,
            fontSize: 'clamp(28px, 4vw, 42px)',
            lineHeight: 1.1,
            letterSpacing: '-0.04em',
            color: colors.cream,
          }}
        >
          Pilih promo favoritmu dan tunjukkan kode ke kasir kami
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {PROMOS.map((promo, i) => {
            const Icon = promo.icon;
            const copied = copiedCode === promo.code;
            return (
              <div
                key={promo.id}
                className="group rounded-2xl overflow-hidden flex flex-col sm:flex-row animate-fade-up transition-transform hover:-translate-y-1"
                style={{
                  backgroundColor: colors.creamAlpha(0.04),
                  border: `1px solid ${colors.creamAlpha(0.1)}`,
                  animationDelay: `${0.1 * i}s`,
                }}
              >
                <div className="relative sm:w-2/5 flex-shrink-0 overflow-hidden" style={{ minHeight: 180 }}>
                  <img
                    src={promo.image}
                    alt={promo.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div
                    className="absolute inset-0"
                    style={{ background: `linear-gradient(to top, ${promo.accent}55, transparent)` }}
                  />
                </div>
                <div className="p-5 sm:p-6 flex flex-col justify-between flex-1">
                  <div>
                    <span
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium mb-3"
                      style={{ backgroundColor: `${promo.accent}22`, color: promo.accent }}
                    >
                      <Icon size={11} />
                      {promo.tag}
                    </span>
                    <p
                      style={{
                        fontFamily: 'DM Sans, sans-serif',
                        fontSize: 20,
                        color: colors.cream,
                        letterSpacing: '-0.02em',
                        lineHeight: 1.2,
                      }}
                    >
                      {promo.title}
                    </p>
                    <p className="mt-2" style={{ fontSize: 13.5, color: colors.creamAlpha(0.6), lineHeight: 1.55 }}>
                      {promo.description}
                    </p>
                  </div>
                  <button
                    onClick={() => handleCopy(promo.code)}
                    className="mt-5 flex items-center justify-between px-4 py-2.5 rounded-lg text-sm transition-colors"
                    style={{
                      border: `1px dashed ${promo.accent}88`,
                      color: promo.accent,
                      backgroundColor: copied ? `${promo.accent}18` : 'transparent',
                    }}
                  >
                    <span style={{ fontFamily: 'monospace', letterSpacing: '0.05em' }}>{promo.code}</span>
                    <span>{copied ? 'Tersalin!' : 'Salin kode'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ================= LOYALTY BANNER ================= */}
      <section
        className="relative px-5 sm:px-8 lg:px-10 py-14 sm:py-16 flex flex-col sm:flex-row items-center justify-between gap-6"
        style={{ backgroundColor: '#F3EAD9' }}
      >
        <div className="flex items-center gap-4 text-center sm:text-left flex-col sm:flex-row animate-fade-up">
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: '#15100C' }}
          >
            <CalendarClock size={24} color="#D9A441" />
          </div>
          <div>
            <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 22, letterSpacing: '-0.02em', color: '#15100C' }}>
              Kumpulkan poin, tukar hidangan gratis
            </p>
            <p style={{ fontSize: 13.5, color: 'rgba(21,16,12,0.6)', marginTop: 4 }}>
              Setiap transaksi Rp 50.000 = 1 poin. Kumpulkan 10 poin untuk 1 menu gratis.
            </p>
          </div>
        </div>
        <a
          href="/login"
          className="px-7 py-3.5 rounded-md bg-black text-white animate-fade-up delay-200 flex-shrink-0"
          style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500 }}
        >
          Gabung Member Saung Baraya
        </a>
      </section>

      <SiteFooter />
    </div>
  );
}

function CountUnit({ value, label }: { value: number; label: string }) {
  return (
    <div
      className="flex flex-col items-center justify-center rounded-xl px-3 py-2.5 sm:px-4 sm:py-3"
      style={{ backgroundColor: 'rgba(21,16,12,0.25)', minWidth: 62 }}
    >
      <span
        style={{
          fontFamily: 'DM Sans, sans-serif',
          fontSize: 'clamp(22px, 3vw, 30px)',
          color: '#F3EAD9',
          letterSpacing: '-0.03em',
          lineHeight: 1,
        }}
      >
        {String(value).padStart(2, '0')}
      </span>
      <span style={{ fontSize: 10, color: 'rgba(243,234,217,0.7)', marginTop: 4 }}>{label}</span>
    </div>
  );
}

function Colon() {
  return (
    <span style={{ color: 'rgba(243,234,217,0.5)', fontSize: 20, fontFamily: 'DM Sans, sans-serif' }}>:</span>
  );
}
