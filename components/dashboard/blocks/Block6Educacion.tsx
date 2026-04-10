'use client';

const CURSOS = [
  {
    id: 1,
    titulo: 'Cómo reducir tus impuestos legalmente',
    descripcion: 'Aprende los gastos deducibles que puedes usar para pagar menos impuesto a la renta.',
    duracion: '18 min',
    nivel: 'Básico',
    categoria: 'Tributario',
    gradientFrom: '#1B3A6B',
    gradientTo: '#4A90D9',
    emoji: '🧾',
    visitas: '4.2k',
  },
  {
    id: 2,
    titulo: 'Flujo de caja para principiantes',
    descripcion: 'Controla el dinero que entra y sale de tu empresa con este método sencillo de 3 pasos.',
    duracion: '24 min',
    nivel: 'Básico',
    categoria: 'Finanzas',
    gradientFrom: '#065F46',
    gradientTo: '#22C55E',
    emoji: '💵',
    visitas: '6.8k',
  },
  {
    id: 3,
    titulo: 'Errores contables más comunes',
    descripcion: 'Conoce los 7 errores que cometen el 80% de empresas peruanas y cómo evitarlos.',
    duracion: '31 min',
    nivel: 'Intermedio',
    categoria: 'Contabilidad',
    gradientFrom: '#92400E',
    gradientTo: '#F59E0B',
    emoji: '⚠️',
    visitas: '3.1k',
  },
];

const NIVEL_COLORS: Record<string, { backgroundColor: string; color: string }> = {
  Básico: { backgroundColor: '#D1FAE5', color: '#065F46' },
  Intermedio: { backgroundColor: '#FEF3C7', color: '#92400E' },
  Avanzado: { backgroundColor: '#DBEAFE', color: '#1E40AF' },
};

export default function Block6Educacion() {
  return (
    <div className="bg-white rounded-2xl shadow-sm border-2" style={{ borderColor: '#F1F5F9' }}>
      <div className="px-5 pt-4 pb-1 flex items-center justify-between">
        <div>
          <h2 className="font-bold text-sm" style={{ color: '#1B3A6B' }}>
            📚 Educación para empresarios
          </h2>
          <p className="text-xs text-gray-400">Gratis para todos los planes</p>
        </div>
        <button
          className="text-xs font-semibold underline transition-opacity hover:opacity-70"
          style={{ color: '#4A90D9' }}
        >
          Ver todo →
        </button>
      </div>

      <div className="p-5 grid grid-cols-1 sm:grid-cols-3 gap-4">
        {CURSOS.map((curso) => {
          const nivelStyle = NIVEL_COLORS[curso.nivel] ?? { backgroundColor: '#F3F4F6', color: '#6B7280' };

          return (
            <div
              key={curso.id}
              className="rounded-xl overflow-hidden border-2 cursor-pointer group transition-all hover:shadow-md"
              style={{ borderColor: '#F1F5F9' }}
            >
              {/* Thumbnail degradado */}
              <div
                className="relative h-28 flex flex-col items-center justify-center gap-2"
                style={{
                  background: `linear-gradient(135deg, ${curso.gradientFrom} 0%, ${curso.gradientTo} 100%)`,
                }}
              >
                <span className="text-4xl">{curso.emoji}</span>
                <span className="text-white text-xs opacity-70">{curso.categoria}</span>
                {/* Play button overlay */}
                <div
                  className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ background: 'rgba(0,0,0,0.3)' }}
                >
                  <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-lg">
                    <svg className="w-5 h-5 ml-0.5" fill="#1B3A6B" viewBox="0 0 20 20">
                      <path d="M6.3 2.841A1.5 1.5 0 004 4.11v11.78a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                    </svg>
                  </div>
                </div>
                {/* Duración */}
                <div
                  className="absolute top-2 right-2 px-2 py-0.5 rounded-lg text-xs font-bold text-white"
                  style={{ background: 'rgba(0,0,0,0.4)' }}
                >
                  ▶ {curso.duracion}
                </div>
              </div>

              {/* Info */}
              <div className="p-3 flex flex-col gap-1.5">
                <div className="flex items-center gap-1.5">
                  <span
                    className="text-xs font-semibold px-2 py-0.5 rounded-full"
                    style={nivelStyle}
                  >
                    {curso.nivel}
                  </span>
                  <span className="text-xs text-gray-400">{curso.visitas} vistas</span>
                </div>
                <h4
                  className="font-bold text-sm leading-tight line-clamp-2"
                  style={{ color: '#1B3A6B' }}
                >
                  {curso.titulo}
                </h4>
                <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">
                  {curso.descripcion}
                </p>
                <button
                  className="mt-1 text-xs font-bold py-2 px-3 rounded-lg text-white transition-all hover:opacity-90 active:scale-95"
                  style={{ background: '#1B3A6B' }}
                >
                  Ver video gratis
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
