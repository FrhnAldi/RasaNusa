import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, ChefHat, Flame, Leaf, MessageCircleHeart, Quote, Soup, Star } from 'lucide-react';
import SiteNavbar from '../components/site/SiteNavbar';
import SiteFooter from '../components/site/SiteFooter';
import GlobalStyles from '../components/site/GlobalStyles';
import { useTheme } from '../context/ThemeContext';

/* ------------------------------------------------------------------ */
/* Data                                                                 */
/* ------------------------------------------------------------------ */

const HIGHLIGHT_CARDS = [
  {
    icon: ChefHat,
    bg: '#15100C',
    text: 'Resep leluhur Sunda dan Betawi, diracik turun-temurun dari dapur keluarga',
  },
  {
    icon: Leaf,
    bg: '#3F6B3A',
    text: 'Sayur dan lalapan segar pilihan pasar lokal, dipetik baru setiap hari',
  },
  {
    icon: Soup,
    bg: '#1D6B76',
    text: 'Kuah dan sambal khas tanah Pasundan diracik tanpa penyedap instan',
  },
  {
    icon: Flame,
    bg: '#A85C34',
    text: 'Level pedas bisa disesuaikan, dari sambal terasi sampai jengkol yang menggigit',
  },
];

const TESTIMONIALS = [
  {
    name: 'Dinda Ayu Lestari',
    role: 'Pelanggan sejak 2022',
    quote:
      'Nasi timbelnya bikin kangen masakan rumah. Sambal terasinya berasa banget, lalapannya selalu segar.',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&h=200&fit=crop&auto=format',
    rating: 5,
  },
  {
    name: 'Fajar Nugroho',
    role: 'Food vlogger',
    quote:
      'Sate maranggi di sini juara, bumbu kecapnya khas Purwakarta banget. Sudah jadi langganan tim kantor tiap Jumat.',
    avatar: 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=200&h=200&fit=crop&auto=format',
    rating: 5,
  },
  {
    name: 'Ratna Kusuma',
    role: 'Pelanggan setia',
    quote:
      'Soto Betawinya hangat pas hujan, kuah santannya gurih. Selalu jadi pilihan pertama keluarga kami.',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&h=200&fit=crop&auto=format',
    rating: 5,
  },
  {
    name: 'Bima Prasetyo',
    role: 'Pelanggan sejak 2023',
    quote:
      'Gado-gado Betawinya autentik, saus kacangnya kental persis racikan warung legendaris di kampung halaman saya.',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&auto=format',
    rating: 4,
  },
  {
    name: 'Sari Wulandari',
    role: 'Ibu rumah tangga',
    quote:
      'Anak-anak saya suka combronya, gorengannya selalu anget dan renyah. Tempat favorit keluarga untuk makan malam.',
    avatar: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=200&h=200&fit=crop&auto=format',
    rating: 5,
  },
];

/* ------------------------------------------------------------------ */
/* Component                                                            */
/* ------------------------------------------------------------------ */

export default function HeroPage() {
  const [activeCard, setActiveCard] = useState(0);
  const { colors } = useTheme();

  useEffect(() => {
    const id = setInterval(() => setActiveCard((prev) => (prev + 1) % HIGHLIGHT_CARDS.length), 3500);
    return () => clearInterval(id);
  }, []);

  return (
    <div
      className="relative w-full overflow-hidden"
      style={{ fontFamily: 'Inter, sans-serif', backgroundColor: colors.ink }}
    >
      <GlobalStyles />

      {/* ================= HERO ================= */}
      <div className="relative min-h-screen flex flex-col overflow-hidden">
        {/* background image */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1512058564366-18510be2db19?w=1600&q=80&fm=jpg&fit=crop')",
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(180deg, ${colors.inkAlpha(0.88)} 0%, ${colors.inkAlpha(0.72)} 35%, ${colors.inkAlpha(0.85)} 75%, ${colors.ink} 100%)`,
          }}
        />
        {/* grain texture */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            opacity: 0.3,
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.06'/%3E%3C/svg%3E\")",
            backgroundSize: '200px 200px',
            backgroundRepeat: 'repeat',
          }}
        />

        <SiteNavbar variant="dark" />

        {/* ---- Hero headline ---- */}
        <section className="relative z-20 flex-1 flex flex-col justify-center px-5 sm:px-8 lg:px-10 py-10">
          <h1
            className="animate-word-reveal"
            style={{
              fontFamily: 'DM Sans, sans-serif',
              fontWeight: 400,
              letterSpacing: '-0.05em',
              color: colors.cream,
            }}
          >
            <span
              className="block overflow-hidden"
              style={{ fontSize: 'clamp(48px, 12vw, 130px)', lineHeight: 1.02 }}
            >
              <Word delay="0.3s">Rasa</Word> <Word delay="0.4s">Asli</Word>
            </span>
            <span
              className="block overflow-hidden"
              style={{ fontSize: 'clamp(48px, 12vw, 130px)', lineHeight: 1.02 }}
            >
              <Word delay="0.5s" dim>
                Sunda
              </Word>{' '}
              <Word delay="0.6s" dim>
                &amp;
              </Word>
            </span>
            <span
              className="flex items-center overflow-hidden"
              style={{ fontSize: 'clamp(48px, 12vw, 130px)', lineHeight: 1.02 }}
            >
              <Word delay="0.7s">Betawi</Word>
            </span>
          </h1>

          {/* rating badge */}
          <div
            className="flex items-center gap-1.5 mt-4 sm:mt-6 animate-fade-up delay-500"
            style={{ color: colors.accent }}
          >
            <Star size={14} fill={colors.accent} />
            <span className="text-sm" style={{ fontFamily: 'Inter, sans-serif' }}>
              4.8 dari 1.240 ulasan pelanggan
            </span>
          </div>

          {/* CTA row */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 sm:gap-8 lg:gap-[50px] mt-8 sm:mt-12 lg:mt-[60px] animate-fade-up delay-600">
            <Link
              to="/menu"
              className="group flex items-center justify-center gap-2 rounded-md w-full sm:w-[240px] md:w-[260px] lg:w-[280px] h-14 sm:h-16 lg:h-[68px] transition-transform hover:scale-[1.02]"
              style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500, letterSpacing: '-0.03em', backgroundColor: colors.cream, color: colors.ink }}
            >
              <span className="text-base sm:text-lg lg:text-xl">Lihat Menu</span>
              <ArrowUpRight
                size={20}
                className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              />
            </Link>
            <p
              className="max-w-[320px]"
              style={{
                fontFamily: 'Inter, sans-serif',
                fontWeight: 400,
                letterSpacing: '-0.03em',
                lineHeight: 1.45,
                fontSize: 'clamp(14px, 1.6vw, 18px)',
                color: colors.creamAlpha(0.75),
              }}
            >
              Racikan resep leluhur Sunda dan Betawi, dimasak segar setiap hari dari dapur kami untuk Anda.
            </p>
          </div>
        </section>

        {/* floating dish image, desktop only */}
        <div
          className="hidden lg:block absolute z-10 animate-scale-in delay-700"
          style={{
            width: 'clamp(320px, 30vw, 460px)',
            height: 'clamp(380px, 36vw, 560px)',
            bottom: '6%',
            right: 'clamp(2%, 4vw, 6%)',
          }}
        >
          <img
            src="https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=1200&q=80&fm=jpg&fit=crop"
            alt="Nasi Timbel Komplit Sunda"
            className="w-full h-full rounded-3xl object-cover"
            style={{
              boxShadow: '0 40px 80px -20px rgba(0,0,0,0.6)',
              border: `1px solid ${colors.creamAlpha(0.15)}`,
            }}
          />

          {/* stacked photo, bottom-left corner */}
          <img
            src="https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=400&q=80&fm=jpg&fit=crop"
            alt="Sambal dan lalapan segar"
            className="absolute rounded-2xl object-cover"
            style={{
              width: 'clamp(110px, 11vw, 160px)',
              height: 'clamp(110px, 11vw, 160px)',
              bottom: 'clamp(-24px, -3vw, -18px)',
              left: 'clamp(-24px, -3vw, -18px)',
              boxShadow: '0 20px 40px -10px rgba(0,0,0,0.5)',
              border: `3px solid ${colors.ink}`,
            }}
          />
        </div>
      </div>

      {/* ================= 3-PANEL STRIP ================= */}
      <div className="relative z-10 grid grid-cols-1 md:grid-cols-[2fr_1fr_2fr]" id="sekilas-menu">
        {/* Panel 1 */}
        <div className="relative overflow-hidden px-6 sm:px-10 py-12 sm:py-14 flex flex-col justify-center animate-fade-up delay-900" style={{ backgroundColor: '#ECEDEC' }}>
          <p
            className="max-w-[380px]"
            style={{
              fontFamily: 'DM Sans, sans-serif',
              fontWeight: 400,
              fontSize: 'clamp(26px, 3.2vw, 35px)',
              lineHeight: 1.1,
              letterSpacing: '-0.05em',
              color: '#15100C',
            }}
          >
            Temukan menu favoritmu, dari yang gurih sampai yang pedas menggigit
          </p>
          <Link
            to="/menu"
            className="inline-block mt-5 underline"
            style={{ fontFamily: 'Inter, sans-serif', fontSize: 17, letterSpacing: '-0.03em', color: '#15100C' }}
          >
            Jelajahi Semua Menu
          </Link>
          <ChefHat
            size={160}
            className="absolute -right-6 -bottom-6 opacity-[0.06]"
            style={{ color: '#15100C' }}
          />
        </div>

        {/* Panel 2 — rotating highlight cards */}
        <div
          className="relative px-6 sm:px-8 py-10 flex flex-col justify-between min-h-[220px] animate-fade-up delay-1000"
          style={{ backgroundColor: '#FEFDF9' }}
        >
          <div className="relative flex-1">
            {HIGHLIGHT_CARDS.map((card, i) => {
              const Icon = card.icon;
              const active = i === activeCard;
              return (
                <div
                  key={i}
                  className="flex items-center gap-4 transition-all duration-500"
                  style={{
                    position: active ? 'relative' : 'absolute',
                    inset: active ? undefined : 0,
                    opacity: active ? 1 : 0,
                    transform: active ? 'translateY(0)' : 'translateY(16px)',
                  }}
                >
                  <div
                    className="flex-shrink-0 rounded-full flex items-center justify-center"
                    style={{ width: 44, height: 44, backgroundColor: card.bg }}
                  >
                    <Icon size={20} color="#F3EAD9" strokeWidth={1.5} />
                  </div>
                  <p
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      fontSize: 'clamp(14px, 1.6vw, 17px)',
                      lineHeight: 1.25,
                      letterSpacing: '-0.03em',
                      color: 'rgba(21,16,12,0.85)',
                    }}
                  >
                    {card.text}
                  </p>
                </div>
              );
            })}
          </div>
          <div className="flex gap-1.5 mt-6">
            {HIGHLIGHT_CARDS.map((_, i) => (
              <span
                key={i}
                className="h-0.5 flex-1 rounded-full transition-colors duration-300"
                style={{ backgroundColor: i === activeCard ? '#15100C' : 'rgba(21,16,12,0.15)' }}
              />
            ))}
          </div>
        </div>

        {/* Panel 3 */}
        <div className="relative flex items-center gap-5 sm:gap-8 px-6 sm:px-10 py-10 animate-fade-up delay-1100" style={{ backgroundColor: colors.ink }}>
          <img
            src="https://images.unsplash.com/photo-1529563021893-cc83c992d75d?w=500&h=340&fit=crop&auto=format"
            alt="Sate Maranggi"
            className="rounded-2xl object-cover flex-shrink-0"
            style={{ width: 'clamp(110px, 15vw, 190px)', height: 'clamp(76px, 10vw, 130px)' }}
          />
          <div>
            <p
              style={{
                fontFamily: 'Inter, sans-serif',
                fontWeight: 400,
                fontSize: 'clamp(26px, 3vw, 35px)',
                letterSpacing: '-0.05em',
                color: colors.cream,
              }}
            >
              +14K
            </p>
            <p
              style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: 'clamp(13px, 1.4vw, 17px)',
                lineHeight: 1.2,
                color: colors.creamAlpha(0.6),
              }}
            >
              Pelanggan sudah menikmati sajian Sunda & Betawi kami
            </p>
          </div>
        </div>
      </div>

      {/* ================= TESTIMONIALS ================= */}
      <TestimonialSection />

      <SiteFooter />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Word reveal helper                                                   */
/* ------------------------------------------------------------------ */

function Word({
  children,
  delay,
  dim,
}: {
  children: React.ReactNode;
  delay: string;
  dim?: boolean;
}) {
  const { colors } = useTheme();
  return (
    <span className="inline-block overflow-hidden align-bottom">
      <span
        className="inline-block"
        style={{
          animation: `wordReveal 0.7s cubic-bezier(0.16,1,0.3,1) both`,
          animationDelay: delay,
          color: dim ? colors.creamAlpha(0.4) : colors.cream,
        }}
      >
        {children}
      </span>
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Testimonials section                                                 */
/* ------------------------------------------------------------------ */

function TestimonialSection() {
  const loop = [...TESTIMONIALS, ...TESTIMONIALS];
  const { colors } = useTheme();

  return (
    <section
      id="testimoni"
      className="relative py-16 sm:py-20 lg:py-24 overflow-hidden"
      style={{ backgroundColor: colors.ink }}
    >
      {/* ambient glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 60% 50% at 50% 0%, rgba(217,164,65,0.10), transparent 70%)',
        }}
      />

      <div className="relative px-5 sm:px-8 lg:px-10 mb-10 sm:mb-14">
        <div className="flex items-center gap-2 mb-3 animate-fade-up">
          <MessageCircleHeart size={18} color={colors.accent} />
          <span
            className="uppercase text-xs sm:text-sm"
            style={{ color: colors.accent, letterSpacing: '0.18em', fontFamily: 'Inter, sans-serif' }}
          >
            Kata Pelanggan
          </span>
        </div>
        <h2
          className="max-w-xl animate-fade-up delay-200"
          style={{
            fontFamily: 'DM Sans, sans-serif',
            fontWeight: 400,
            fontSize: 'clamp(30px, 5vw, 52px)',
            lineHeight: 1.05,
            letterSpacing: '-0.04em',
            color: colors.cream,
          }}
        >
          Cerita hangat dari meja makan pelanggan kami
        </h2>
      </div>

      {/* marquee row 1 (left to right) */}
      <div className="relative mb-5 sm:mb-6 testimonial-fade">
        <div className="flex gap-5 w-max animate-marquee-left">
          {loop.map((t, i) => (
            <TestimonialCard key={`row1-${i}`} testimonial={t} />
          ))}
        </div>
      </div>

      {/* marquee row 2 (right to left, offset data) */}
      <div className="relative testimonial-fade">
        <div className="flex gap-5 w-max animate-marquee-right">
          {[...loop].reverse().map((t, i) => (
            <TestimonialCard key={`row2-${i}`} testimonial={t} compact />
          ))}
        </div>
      </div>

      {/* stat strip */}
      <div className="relative mt-14 sm:mt-16 px-5 sm:px-8 lg:px-10 grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 animate-fade-up delay-400">
        <Stat value="4.8/5" label="Rating rata-rata" />
        <Stat value="14K+" label="Pelanggan puas" />
        <Stat value="120+" label="Menu tersedia" />
        <Stat value="98%" label="Pesan ulang" />
      </div>
    </section>
  );
}

function TestimonialCard({
  testimonial,
  compact,
}: {
  testimonial: (typeof TESTIMONIALS)[number];
  compact?: boolean;
}) {
  const { colors } = useTheme();
  return (
    <div
      className="flex-shrink-0 rounded-2xl p-5 sm:p-6 flex flex-col gap-4"
      style={{
        width: compact ? 300 : 340,
        backgroundColor: colors.creamAlpha(0.05),
        border: `1px solid ${colors.creamAlpha(0.1)}`,
        backdropFilter: 'blur(4px)',
      }}
    >
      <Quote size={22} color={colors.accent} style={{ opacity: 0.7 }} />
      <p
        style={{
          fontFamily: 'Inter, sans-serif',
          fontSize: 15,
          lineHeight: 1.5,
          letterSpacing: '-0.02em',
          color: colors.creamAlpha(0.85),
        }}
      >
        {testimonial.quote}
      </p>
      <div className="flex items-center gap-3 mt-auto pt-2">
        <img
          src={testimonial.avatar}
          alt={testimonial.name}
          className="w-10 h-10 rounded-full object-cover"
          style={{ border: `1px solid ${colors.creamAlpha(0.2)}` }}
        />
        <div>
          <p style={{ color: colors.cream, fontSize: 14, fontFamily: 'Inter, sans-serif', fontWeight: 500 }}>
            {testimonial.name}
          </p>
          <p style={{ color: colors.creamAlpha(0.5), fontSize: 12, fontFamily: 'Inter, sans-serif' }}>
            {testimonial.role}
          </p>
        </div>
        <div className="flex items-center gap-0.5 ml-auto">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              size={12}
              fill={i < testimonial.rating ? colors.accent : 'none'}
              color={i < testimonial.rating ? colors.accent : colors.creamAlpha(0.25)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  const { colors } = useTheme();
  return (
    <div className="text-center sm:text-left">
      <p
        style={{
          fontFamily: 'DM Sans, sans-serif',
          fontWeight: 400,
          fontSize: 'clamp(28px, 4vw, 40px)',
          letterSpacing: '-0.04em',
          color: colors.cream,
        }}
      >
        {value}
      </p>
      <p
        style={{
          fontFamily: 'Inter, sans-serif',
          fontSize: 13,
          color: colors.creamAlpha(0.55),
          marginTop: 4,
        }}
      >
        {label}
      </p>
    </div>
  );
}


