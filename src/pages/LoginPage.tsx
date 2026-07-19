import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ChefHat,
  Citrus,
  Eye,
  EyeOff,
  Flame,
  LockKeyhole,
  ShieldCheck,
  Soup,
  UserRound,
  UtensilsCrossed,
  Wheat,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      const target = user.role === 'admin' ? '/admin' : '/dashboard';
      navigate(target, { replace: true });
    }
  }, [user, navigate]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    setTimeout(() => {
      const result = login(username, password);
      if (!result.ok) {
        setError(result.error ?? 'Gagal masuk.');
      }
      setSubmitting(false);
    }, 350);
  };

  const fillDemo = (role: 'admin' | 'pelanggan') => {
    if (role === 'admin') {
      setUsername('admin');
      setPassword('admin123');
    } else {
      setUsername('pelanggan');
      setPassword('pelanggan123');
    }
    setError(null);
  };

  const embers = [
    { left: '8%', delay: '0s', duration: '7s', size: 5, color: '#D9A441' },
    { left: '18%', delay: '1.4s', duration: '9s', size: 3, color: '#E8836C' },
    { left: '27%', delay: '3.1s', duration: '6.5s', size: 4, color: '#D9A441' },
    { left: '73%', delay: '0.6s', duration: '8s', size: 4, color: '#C4432B' },
    { left: '84%', delay: '2.3s', duration: '7.5s', size: 3, color: '#D9A441' },
    { left: '92%', delay: '4s', duration: '6s', size: 5, color: '#E8836C' },
    { left: '50%', delay: '2s', duration: '8.5s', size: 3, color: '#D9A441' },
    { left: '62%', delay: '3.6s', duration: '7s', size: 4, color: '#C4432B' },
  ];

  const foodIcons: { Icon: typeof Flame; left: string; top: string; delay: string; size: number }[] = [
    { Icon: ChefHat, left: '9%', top: '18%', delay: '0s', size: 30 },
    { Icon: Soup, left: '88%', top: '22%', delay: '1.2s', size: 26 },
    { Icon: Flame, left: '14%', top: '72%', delay: '0.6s', size: 24 },
    { Icon: Wheat, left: '85%', top: '68%', delay: '1.8s', size: 28 },
    { Icon: Citrus, left: '6%', top: '46%', delay: '2.4s', size: 22 },
  ];

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center px-4 py-10 relative overflow-hidden"
      style={{ backgroundColor: '#1B1310', fontFamily: 'Inter, sans-serif' }}
    >
      <style>{`
        @keyframes ln-breathe {
          0%, 100% { transform: scale(1); opacity: 0.9; }
          50% { transform: scale(1.15); opacity: 1; }
        }
        @keyframes ln-rise {
          0% { transform: translateY(0) scale(1); opacity: 0; }
          12% { opacity: 0.9; }
          85% { opacity: 0.5; }
          100% { transform: translateY(-70vh) scale(1.4); opacity: 0; }
        }
        @keyframes ln-ember {
          0% { transform: translateY(0) translateX(0); opacity: 0; }
          10% { opacity: 1; }
          50% { transform: translateY(-45vh) translateX(12px); }
          90% { opacity: 0.7; }
          100% { transform: translateY(-85vh) translateX(-8px); opacity: 0; }
        }
        @keyframes ln-bob {
          0%, 100% { transform: translateY(0) rotate(-4deg); }
          50% { transform: translateY(-16px) rotate(4deg); }
        }
      `}</style>

      {/* ambient glow, breathing like embers in a grill */}
      <div
        className="absolute -top-40 -left-40 w-[420px] h-[420px] rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(217,164,65,0.16), transparent 70%)',
          animation: 'ln-breathe 6s ease-in-out infinite',
        }}
      />
      <div
        className="absolute -bottom-40 -right-40 w-[420px] h-[420px] rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(196,67,43,0.14), transparent 70%)',
          animation: 'ln-breathe 7s ease-in-out infinite 1s',
        }}
      />

      {/* rising steam wisps, as if from a hot dish just served */}
      <div className="absolute inset-x-0 bottom-0 h-full pointer-events-none overflow-hidden" style={{ zIndex: 1 }}>
        {[18, 38, 62, 82].map((left, i) => (
          <div
            key={left}
            className="absolute bottom-0 rounded-full"
            style={{
              left: `${left}%`,
              width: 70,
              height: 220,
              background:
                'linear-gradient(to top, rgba(243,234,217,0.10), rgba(243,234,217,0.03) 55%, transparent)',
              filter: 'blur(14px)',
              animation: `ln-rise ${9 + i}s ease-in infinite ${i * 2.1}s`,
            }}
          />
        ))}
      </div>

      {/* drifting embers/spice sparks */}
      <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 1 }}>
        {embers.map((e, i) => (
          <div
            key={i}
            className="absolute bottom-0 rounded-full"
            style={{
              left: e.left,
              width: e.size,
              height: e.size,
              backgroundColor: e.color,
              boxShadow: `0 0 6px 1px ${e.color}`,
              animation: `ln-ember ${e.duration} ease-in-out infinite ${e.delay}`,
            }}
          />
        ))}
      </div>

      {/* floating culinary icons, gently bobbing */}
      <div className="absolute inset-0 pointer-events-none hidden sm:block" style={{ zIndex: 1 }}>
        {foodIcons.map(({ Icon, left, top, delay, size }, i) => (
          <div
            key={i}
            className="absolute"
            style={{
              left,
              top,
              opacity: 0.14,
              color: '#F3EAD9',
              animation: `ln-bob ${6 + i}s ease-in-out infinite ${delay}`,
            }}
          >
            <Icon size={size} strokeWidth={1.5} />
          </div>
        ))}
      </div>

      <Link
        to="/"
        className="absolute top-6 left-4 sm:left-8 flex items-center gap-1.5 text-sm font-medium z-10"
        style={{ color: 'rgba(243,234,217,0.7)' }}
      >
        <ArrowLeft size={16} />
        Kembali
      </Link>

      <div className="relative z-10 w-full max-w-sm">
        <div className="text-center mb-8">
          <p
            className="text-xs font-semibold uppercase tracking-[0.2em] mb-2"
            style={{ color: '#D9A441' }}
          >
            Saung Baraya
          </p>
          <h1
            className="uppercase"
            style={{
              fontFamily: 'Anton, sans-serif',
              fontSize: 'clamp(28px, 6vw, 40px)',
              color: '#F3EAD9',
              letterSpacing: '-0.01em',
              lineHeight: 1.05,
            }}
          >
            Masuk ke Sistem
          </h1>
          <p className="text-sm mt-2" style={{ color: 'rgba(243,234,217,0.6)' }}>
            Untuk admin dan pelanggan setia Saung Baraya.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-3xl p-6 sm:p-7 flex flex-col gap-4"
          style={{ backgroundColor: '#241A14', border: '1px solid rgba(217,164,65,0.18)' }}
        >
          <div>
            <label className="text-xs font-medium mb-1.5 block" style={{ color: 'rgba(243,234,217,0.75)' }}>
              Username
            </label>
            <div className="relative">
              <UserRound
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2"
                style={{ color: 'rgba(243,234,217,0.4)' }}
              />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin atau pelanggan"
                required
                autoComplete="username"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl text-sm outline-none"
                style={{
                  backgroundColor: '#1B1310',
                  border: '1px solid rgba(243,234,217,0.12)',
                  color: '#F3EAD9',
                }}
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium mb-1.5 block" style={{ color: 'rgba(243,234,217,0.75)' }}>
              Password
            </label>
            <div className="relative">
              <LockKeyhole
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2"
                style={{ color: 'rgba(243,234,217,0.4)' }}
              />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete="current-password"
                className="w-full pl-10 pr-10 py-2.5 rounded-xl text-sm outline-none"
                style={{
                  backgroundColor: '#1B1310',
                  border: '1px solid rgba(243,234,217,0.12)',
                  color: '#F3EAD9',
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2"
                style={{ color: 'rgba(243,234,217,0.4)' }}
                aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {error && (
            <p
              className="text-xs rounded-lg px-3 py-2"
              style={{ backgroundColor: 'rgba(196,67,43,0.15)', color: '#E8836C' }}
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="mt-1 w-full py-3 rounded-xl font-semibold text-sm transition-opacity disabled:opacity-60"
            style={{ backgroundColor: '#D9A441', color: '#1B1310' }}
          >
            {submitting ? 'Memeriksa...' : 'Masuk'}
          </button>

          <div className="flex items-center gap-2 mt-1">
            <div className="h-px flex-1" style={{ backgroundColor: 'rgba(243,234,217,0.1)' }} />
            <span className="text-[11px]" style={{ color: 'rgba(243,234,217,0.4)' }}>
              akun demo
            </span>
            <div className="h-px flex-1" style={{ backgroundColor: 'rgba(243,234,217,0.1)' }} />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => fillDemo('admin')}
              className="flex flex-col items-center justify-center gap-1 py-2 rounded-xl text-xs font-medium"
              style={{
                border: '1px solid rgba(217,164,65,0.3)',
                color: '#D9A441',
                backgroundColor: 'rgba(217,164,65,0.06)',
              }}
            >
              <ShieldCheck size={14} /> Admin
            </button>
            <button
              type="button"
              onClick={() => fillDemo('pelanggan')}
              className="flex flex-col items-center justify-center gap-1 py-2 rounded-xl text-xs font-medium"
              style={{
                border: '1px solid rgba(196,67,43,0.28)',
                color: '#E8836C',
                backgroundColor: 'rgba(196,67,43,0.08)',
              }}
            >
              <UtensilsCrossed size={14} /> Pelanggan
            </button>
          </div>
        </form>

        <p className="text-center text-xs mt-6" style={{ color: 'rgba(243,234,217,0.4)' }}>
          admin / admin123 &nbsp;·&nbsp; pelanggan / pelanggan123
        </p>
      </div>
    </div>
  );
}
