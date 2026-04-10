'use client';

export default function SunatIcon({ size = 20 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Escudo simplificado estilo SUNAT */}
      <path
        d="M16 2L4 7v9c0 7.18 5.16 13.9 12 15.93C22.84 29.9 28 23.18 28 16V7L16 2z"
        fill="#E63946"
      />
      <path
        d="M16 2L4 7v9c0 7.18 5.16 13.9 12 15.93"
        fill="#CC2936"
      />
      {/* Letra S estilizada */}
      <text
        x="16"
        y="21"
        textAnchor="middle"
        fill="white"
        fontSize="13"
        fontWeight="bold"
        fontFamily="Arial"
      >
        S
      </text>
    </svg>
  );
}
