'use client';

interface LogoMCFProps {
  size?: 'sm' | 'md' | 'lg';
  showSlogan?: boolean;
}

export default function LogoMCF({ size = 'md', showSlogan = true }: LogoMCFProps) {
  const sizeMap = {
    sm: { logo: 48, title: 'text-2xl', slogan: 'text-xs' },
    md: { logo: 64, title: 'text-3xl', slogan: 'text-sm' },
    lg: { logo: 80, title: 'text-4xl', slogan: 'text-base' },
  };

  const s = sizeMap[size];

  return (
    <div className="flex flex-col items-center gap-2">
      {/* Ícono del logo */}
      <div
        className="rounded-2xl flex items-center justify-center shadow-lg"
        style={{
          width: s.logo,
          height: s.logo,
          background: 'linear-gradient(135deg, #1B3A6B 0%, #4A90D9 100%)',
        }}
      >
        <svg
          width={s.logo * 0.6}
          height={s.logo * 0.6}
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Cruz médica estilizada */}
          <rect x="20" y="6" width="8" height="36" rx="3" fill="white" />
          <rect x="6" y="20" width="36" height="8" rx="3" fill="white" />
          {/* Punto de acento rojo */}
          <circle cx="38" cy="10" r="4" fill="#E63946" />
        </svg>
      </div>

      {/* Nombre */}
      <div className="text-center">
        <h1
          className={`font-black tracking-tight leading-none ${s.title}`}
          style={{ color: '#1B3A6B' }}
        >
          MCF
        </h1>
        <p
          className="font-semibold tracking-widest uppercase"
          style={{ color: '#4A90D9', fontSize: '0.6rem', letterSpacing: '0.2em' }}
        >
          Médico Contable Financiero
        </p>
      </div>

      {/* Slogan */}
      {showSlogan && (
        <p
          className={`italic font-medium ${s.slogan}`}
          style={{ color: '#E63946' }}
        >
          "El médico de tu empresa"
        </p>
      )}
    </div>
  );
}
