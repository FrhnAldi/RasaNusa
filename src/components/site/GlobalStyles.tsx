export default function GlobalStyles() {
  return (
    <style>{`
      @keyframes fadeUp {
        from { opacity: 0; transform: translateY(30px); }
        to { opacity: 1; transform: translateY(0); }
      }
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      @keyframes slideInLeft {
        from { opacity: 0; transform: translateX(-40px); }
        to { opacity: 1; transform: translateX(0); }
      }
      @keyframes slideInRight {
        from { opacity: 0; transform: translateX(40px); }
        to { opacity: 1; transform: translateX(0); }
      }
      @keyframes scaleIn {
        from { opacity: 0; transform: scale(0.9); }
        to { opacity: 1; transform: scale(1); }
      }
      @keyframes wordReveal {
        from { opacity: 0; transform: translateY(100%); filter: blur(4px); }
        to { opacity: 1; transform: translateY(0); filter: blur(0px); }
      }
      @keyframes marqueeLeft {
        from { transform: translateX(0); }
        to { transform: translateX(-50%); }
      }
      @keyframes marqueeRight {
        from { transform: translateX(-50%); }
        to { transform: translateX(0); }
      }
      @keyframes hp-rise {
        0% { transform: translateY(0) scale(1); opacity: 0; }
        12% { opacity: 0.8; }
        85% { opacity: 0.4; }
        100% { transform: translateY(-75vh) scale(1.5); opacity: 0; }
      }
      @keyframes hp-ember {
        0% { transform: translateY(0) translateX(0); opacity: 0; }
        10% { opacity: 1; }
        50% { transform: translateY(-40vh) translateX(14px); }
        90% { opacity: 0.6; }
        100% { transform: translateY(-80vh) translateX(-10px); opacity: 0; }
      }
      @keyframes hp-bob {
        0%, 100% { transform: translateY(0) rotate(-5deg); }
        50% { transform: translateY(-18px) rotate(5deg); }
      }
      @keyframes hp-twinkle {
        0%, 100% { opacity: 0.15; }
        50% { opacity: 0.4; }
      }
      @keyframes spin-slow {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }
      @keyframes pulseSoft {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.55; }
      }
      @keyframes highlightGlow {
        0% { background-color: rgba(217,163,95,0.22); box-shadow: inset 0 0 0 1px rgba(217,163,95,0.5); }
        100% { background-color: transparent; box-shadow: inset 0 0 0 1px transparent; }
      }

      .animate-highlight-glow { animation: highlightGlow 2.2s cubic-bezier(0.16,1,0.3,1) both; }

      .animate-fade-up { animation: fadeUp 0.8s cubic-bezier(0.16,1,0.3,1) both; }
      .animate-fade-in { animation: fadeIn 0.7s cubic-bezier(0.16,1,0.3,1) both; }
      .animate-slide-left { animation: slideInLeft 0.8s cubic-bezier(0.16,1,0.3,1) both; }
      .animate-slide-right { animation: slideInRight 0.8s cubic-bezier(0.16,1,0.3,1) both; }
      .animate-scale-in { animation: scaleIn 1s cubic-bezier(0.16,1,0.3,1) both; }
      .animate-spin-slow { animation: spin-slow 14s linear infinite; }
      .animate-pulse-soft { animation: pulseSoft 3s ease-in-out infinite; }

      .delay-100 { animation-delay: 0.1s; }
      .delay-200 { animation-delay: 0.2s; }
      .delay-300 { animation-delay: 0.3s; }
      .delay-400 { animation-delay: 0.4s; }
      .delay-500 { animation-delay: 0.5s; }
      .delay-600 { animation-delay: 0.6s; }
      .delay-700 { animation-delay: 0.7s; }
      .delay-800 { animation-delay: 0.8s; }
      .delay-900 { animation-delay: 0.9s; }
      .delay-1000 { animation-delay: 1s; }
      .delay-1100 { animation-delay: 1.1s; }
      .delay-1200 { animation-delay: 1.2s; }

      .animate-marquee-left {
        animation: marqueeLeft 42s linear infinite;
      }
      .animate-marquee-right {
        animation: marqueeRight 48s linear infinite;
      }
      .testimonial-fade:hover .animate-marquee-left,
      .testimonial-fade:hover .animate-marquee-right {
        animation-play-state: paused;
      }
      .testimonial-fade {
        mask-image: linear-gradient(to right, transparent, black 6%, black 94%, transparent);
        -webkit-mask-image: linear-gradient(to right, transparent, black 6%, black 94%, transparent);
      }

      @media (prefers-reduced-motion: reduce) {
        .animate-marquee-left, .animate-marquee-right, .animate-spin-slow, .animate-pulse-soft, .animate-highlight-glow { animation: none; }
      }
    `}</style>
  );
}
