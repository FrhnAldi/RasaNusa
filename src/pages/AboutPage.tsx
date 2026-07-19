import { useEffect, useState } from 'react';
import { Award, ChefHat, Heart, Leaf, Quote, Sparkles, Users } from 'lucide-react';
import PageHero from '../components/site/PageHero';
import SiteFooter from '../components/site/SiteFooter';
import GlobalStyles from '../components/site/GlobalStyles';
import { useTheme } from '../context/ThemeContext';

const VALUES = [
  {
    icon: Leaf,
    bg: '#3F6B3A',
    title: 'Bahan Segar',
    text: 'Dipasok langsung dari pasar lokal setiap pagi, tanpa bahan pengawet.',
  },
  {
    icon: Heart,
    bg: '#A85C34',
    title: 'Resep Warisan',
    text: 'Diracik dari resep keluarga Sunda dan Betawi turun-temurun yang dijaga keasliannya.',
  },
  {
    icon: Sparkles,
    bg: '#1D6B76',
    title: 'Higienis',
    text: 'Standar kebersihan dapur yang ketat di setiap tahap penyajian.',
  },
  {
    icon: Users,
    bg: '#15100C',
    title: 'Ramah Keluarga',
    text: 'Suasana hangat yang nyaman untuk momen bersama orang tersayang.',
  },
];

const TIMELINE = [
  { year: '2014', title: 'Saung Kecil di Kampung', text: 'Saung Baraya berawal dari saung sederhana dengan resep Sunda rumahan.' },
  { year: '2018', title: 'Menambah Cita Rasa Betawi', text: 'Menu diperluas dengan hidangan khas Betawi, dari soto hingga kerak telor.' },
  { year: '2021', title: 'Membuka Cabang Pertama', text: 'Antusiasme pelanggan mendorong Saung Baraya membuka gerai kedua.' },
  { year: '2026', title: 'Rumah Rasa Sunda & Betawi', text: 'Kini dipercaya lebih dari 14.000 pelanggan di seluruh kota.' },
];

const TEAM = [
  {
    name: 'Chef Wibowo Santoso',
    role: 'Kepala Dapur',
    image: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=500&h=600&q=80&fm=jpg&fit=crop',
  },
  {
    name: 'Chef Ayu Kartika',
    role: 'Chef Sunda & Betawi',
    image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=500&h=600&q=80&fm=jpg&fit=crop',
  },
  {
    name: 'Rio Hidayat',
    role: 'Manajer Operasional',
    image: 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=500&h=600&q=80&fm=jpg&fit=crop',
  },
];

export default function AboutPage() {
  const [activeTimeline, setActiveTimeline] = useState(0);
  const { colors } = useTheme();

  useEffect(() => {
    const id = setInterval(() => setActiveTimeline((p) => (p + 1) % TIMELINE.length), 3200);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="relative w-full overflow-hidden" style={{ fontFamily: 'Inter, sans-serif' }}>
      <GlobalStyles />

      <PageHero
        eyebrow="Tentang Kami"
        words={['Saung', 'yang', 'Merawat', 'Cita', 'Rasa', 'Baraya']}
        subtitle="Saung Baraya lahir dari kerinduan akan masakan Sunda dan Betawi otentik, disajikan dengan bahan segar dan resep warisan leluhur."
        bgImage="https://images.unsplash.com/photo-1555126634-323283e090fa?w=1600&q=80&fm=jpg&fit=crop"
      />

      {/* ================= STORY ================= */}
      <section className="relative px-5 sm:px-8 lg:px-10 py-16 sm:py-20 lg:py-24" style={{ backgroundColor: colors.ink }}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          <div className="animate-slide-left">
            <p
              className="uppercase text-xs sm:text-sm mb-4"
              style={{ color: colors.accent, letterSpacing: '0.2em', fontFamily: 'Inter, sans-serif' }}
            >
              Cerita Kami
            </p>
            <h2
              style={{
                fontFamily: 'DM Sans, sans-serif',
                fontWeight: 400,
                fontSize: 'clamp(28px, 4vw, 44px)',
                lineHeight: 1.1,
                letterSpacing: '-0.04em',
                color: colors.cream,
              }}
            >
              Dari saung kampung ke meja makan ribuan baraya
            </h2>
            <p
              className="mt-5"
              style={{
                color: colors.creamAlpha(0.7),
                fontSize: 16,
                lineHeight: 1.7,
                letterSpacing: '-0.01em',
              }}
            >
              Berawal dari kecintaan pada masakan Sunda dan Betawi, Saung Baraya didirikan dengan satu
              tujuan sederhana: menghadirkan kembali kehangatan meja makan ala kampung halaman. Setiap
              hidangan diracik dengan bumbu pilihan dan dimasak dengan kesabaran, persis seperti masakan
              emak di rumah.
            </p>
            <div
              className="mt-8 flex items-start gap-4 rounded-2xl p-5"
              style={{ backgroundColor: 'rgba(217,164,65,0.08)', border: '1px solid rgba(217,164,65,0.2)' }}
            >
              <Quote size={28} color={colors.accent} className="flex-shrink-0" />
              <p style={{ color: colors.creamAlpha(0.85), fontSize: 15, lineHeight: 1.6, fontStyle: 'italic' }}>
                "Kami percaya masakan terbaik adalah yang mengingatkan kita pada kampung halaman."
              </p>
            </div>
          </div>

          <div className="relative animate-scale-in delay-200">
            <img
              src="https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=900&h=1100&q=80&fm=jpg&fit=crop"
              alt="Dapur Saung Baraya"
              className="w-full rounded-3xl object-cover"
              style={{ height: 'clamp(320px, 42vw, 520px)', border: `1px solid ${colors.creamAlpha(0.12)}` }}
            />
            <div
              className="absolute -bottom-6 -left-6 sm:-bottom-8 sm:-left-8 rounded-2xl px-5 py-4 sm:px-6 sm:py-5"
              style={{ backgroundColor: colors.cream, boxShadow: '0 20px 50px -15px rgba(0,0,0,0.5)' }}
            >
              <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 32, letterSpacing: '-0.04em', color: colors.ink }}>
                12+
              </p>
              <p style={{ fontSize: 12, color: colors.inkAlpha(0.6) }}>Tahun melayani Sunda & Betawi</p>
            </div>
          </div>
        </div>
      </section>

      {/* ================= VALUES ================= */}
      <section className="relative px-5 sm:px-8 lg:px-10 py-16 sm:py-20" style={{ backgroundColor: '#ECEDEC' }}>
        <p
          className="uppercase text-xs sm:text-sm mb-3 animate-fade-up"
          style={{ color: '#A85C34', letterSpacing: '0.2em', fontFamily: 'Inter, sans-serif' }}
        >
          Nilai Kami
        </p>
        <h2
          className="max-w-xl mb-10 sm:mb-12 animate-fade-up delay-200"
          style={{
            fontFamily: 'DM Sans, sans-serif',
            fontWeight: 400,
            fontSize: 'clamp(28px, 4vw, 42px)',
            lineHeight: 1.1,
            letterSpacing: '-0.04em',
            color: '#15100C',
          }}
        >
          Apa yang membuat setiap hidangan kami istimewa
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {VALUES.map((v, i) => {
            const Icon = v.icon;
            return (
              <div
                key={v.title}
                className="rounded-2xl p-6 bg-white animate-fade-up transition-transform hover:-translate-y-1"
                style={{ animationDelay: `${0.2 + i * 0.1}s`, boxShadow: '0 10px 30px -15px rgba(0,0,0,0.15)' }}
              >
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center mb-4"
                  style={{ backgroundColor: v.bg }}
                >
                  <Icon size={22} color="#F3EAD9" strokeWidth={1.5} />
                </div>
                <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 19, color: '#15100C', letterSpacing: '-0.02em' }}>
                  {v.title}
                </p>
                <p style={{ fontSize: 14, color: 'rgba(21,16,12,0.6)', lineHeight: 1.5, marginTop: 6 }}>{v.text}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ================= TIMELINE ================= */}
      <section className="relative px-5 sm:px-8 lg:px-10 py-16 sm:py-20 lg:py-24" style={{ backgroundColor: colors.ink }}>
        <p
          className="uppercase text-xs sm:text-sm mb-3 animate-fade-up"
          style={{ color: colors.accent, letterSpacing: '0.2em', fontFamily: 'Inter, sans-serif' }}
        >
          Perjalanan Kami
        </p>
        <h2
          className="max-w-xl mb-10 sm:mb-14 animate-fade-up delay-200"
          style={{
            fontFamily: 'DM Sans, sans-serif',
            fontWeight: 400,
            fontSize: 'clamp(28px, 4vw, 42px)',
            lineHeight: 1.1,
            letterSpacing: '-0.04em',
            color: colors.cream,
          }}
        >
          Dari saung kecil menjadi rumah rasa Sunda & Betawi
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-10">
          {TIMELINE.map((t, i) => (
            <button
              key={t.year}
              onClick={() => setActiveTimeline(i)}
              className="text-left rounded-xl p-4 transition-all duration-300"
              style={{
                backgroundColor: i === activeTimeline ? 'rgba(217,164,65,0.14)' : colors.creamAlpha(0.04),
                border: `1px solid ${i === activeTimeline ? colors.accent : colors.creamAlpha(0.1)}`,
              }}
            >
              <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 22, color: i === activeTimeline ? colors.accent : colors.cream, letterSpacing: '-0.03em' }}>
                {t.year}
              </p>
            </button>
          ))}
        </div>

        <div
          className="relative rounded-2xl p-6 sm:p-8 min-h-[140px] flex flex-col justify-center animate-fade-up"
          style={{ backgroundColor: colors.creamAlpha(0.04), border: `1px solid ${colors.creamAlpha(0.1)}` }}
        >
          <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 24, color: colors.cream, letterSpacing: '-0.03em', marginBottom: 8 }}>
            {TIMELINE[activeTimeline].title}
          </p>
          <p style={{ color: colors.creamAlpha(0.65), fontSize: 15, lineHeight: 1.6, maxWidth: 520 }}>
            {TIMELINE[activeTimeline].text}
          </p>
        </div>
      </section>

      {/* ================= TEAM ================= */}
      <section className="relative px-5 sm:px-8 lg:px-10 py-16 sm:py-20 lg:py-24" style={{ backgroundColor: '#FEFDF9' }}>
        <div className="flex items-center gap-2 mb-3 animate-fade-up">
          <ChefHat size={18} color="#A85C34" />
          <span className="uppercase text-xs sm:text-sm" style={{ color: '#A85C34', letterSpacing: '0.2em' }}>
            Tim Dapur
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
            color: '#15100C',
          }}
        >
          Orang-orang di balik setiap hidangan
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {TEAM.map((m, i) => (
            <div key={m.name} className="animate-fade-up" style={{ animationDelay: `${0.2 + i * 0.15}s` }}>
              <div className="relative overflow-hidden rounded-2xl mb-4 group">
                <img
                  src={m.image}
                  alt={m.name}
                  className="w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  style={{ height: 340 }}
                />
              </div>
              <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 20, color: '#15100C', letterSpacing: '-0.02em' }}>
                {m.name}
              </p>
              <p style={{ fontSize: 13, color: 'rgba(21,16,12,0.55)' }}>{m.role}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ================= AWARD STRIP ================= */}
      <section className="relative px-5 sm:px-8 lg:px-10 py-10 sm:py-12" style={{ backgroundColor: colors.ink }}>
        <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-14 animate-fade-up">
          <div className="flex items-center gap-2" style={{ color: colors.creamAlpha(0.6) }}>
            <Award size={18} color={colors.accent} />
            <span className="text-sm">Best Local Eatery 2024</span>
          </div>
          <div className="flex items-center gap-2" style={{ color: colors.creamAlpha(0.6) }}>
            <Award size={18} color={colors.accent} />
            <span className="text-sm">Top Rated Sunda & Betawi Food 2025</span>
          </div>
          <div className="flex items-center gap-2" style={{ color: colors.creamAlpha(0.6) }}>
            <Award size={18} color={colors.accent} />
            <span className="text-sm">Halal &amp; Higienis Bersertifikat</span>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
