'use client';

import { useEffect, useState } from 'react';
import LockedBlock from '../LockedBlock';
import { Plan } from '../types';

interface Block1Props {
  plan: Plan;
  onUpgrade: () => void;
}

const SCORE = 72;
const RADIUS = 52;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

function getScoreColor(score: number): string {
  if (score >= 70) return '#22C55E';
  if (score >= 50) return '#FBBF24';
  return '#E63946';
}

function getScoreLabel(score: number): { title: string; sub: string } {
  if (score >= 70) return { title: 'Tu empresa está en buen camino', sub: 'Sigue así y llegarás al nivel óptimo' };
  if (score >= 50) return { title: 'Tu empresa necesita atención', sub: 'Hay áreas de mejora importantes' };
  return { title: 'Tu empresa está en riesgo', sub: 'Actúa ahora para evitar problemas mayores' };
}

function CircularScore({ score, animated }: { score: number; animated: boolean }) {
  const color = getScoreColor(score);
  const offset = CIRCUMFERENCE - (score / 100) * CIRCUMFERENCE;
  const { title, sub } = getScoreLabel(score);

  return (
    <div className="flex flex-col sm:flex-row items-center gap-6 p-5">
      {/* Círculo SVG */}
      <div className="relative flex-shrink-0">
        <svg width="140" height="140" viewBox="0 0 140 140">
          {/* Track */}
          <circle cx="70" cy="70" r={RADIUS} fill="none" stroke="#F1F5F9" strokeWidth="12" />
          {/* Progress */}
          <circle
            cx="70"
            cy="70"
            r={RADIUS}
            fill="none"
            stroke={color}
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={animated ? offset : CIRCUMFERENCE}
            style={{
              transform: 'rotate(-90deg)',
              transformOrigin: '70px 70px',
              transition: 'stroke-dashoffset 1.2s cubic-bezier(0.4,0,0.2,1)',
            }}
          />
          {/* Puntos decorativos */}
          <circle cx="70" cy="18" r="4" fill={color} opacity="0.3" />
        </svg>
        {/* Número central */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-black" style={{ color }}>
            {score}
          </span>
          <span className="text-xs text-gray-400 font-semibold">/100</span>
        </div>
      </div>

      {/* Texto */}
      <div className="flex-1 text-center sm:text-left">
        <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
          <span className="text-xs font-bold uppercase tracking-widest" style={{ color }}>
            Índice IIE
          </span>
        </div>
        <h3 className="text-base font-bold" style={{ color: '#1B3A6B' }}>{title}</h3>
        <p className="text-xs text-gray-500 mt-1 leading-relaxed">{sub}</p>

        {/* Mini-desglose */}
        <div className="mt-3 flex flex-col gap-1.5">
          {[
            { label: 'Gestión financiera', val: 78, color: '#22C55E' },
            { label: 'Cumplimiento tributario', val: 65, color: '#FBBF24' },
            { label: 'Gestión operativa', val: 71, color: '#22C55E' },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-2">
              <span className="text-xs text-gray-400 w-36 flex-shrink-0">{item.label}</span>
              <div className="flex-1 h-1.5 rounded-full bg-gray-100 overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: animated ? `${item.val}%` : '0%',
                    background: item.color,
                    transition: 'width 1s ease-in-out 0.3s',
                  }}
                />
              </div>
              <span className="text-xs font-semibold w-6 text-right" style={{ color: item.color }}>
                {item.val}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Block1IIE({ plan, onUpgrade }: Block1Props) {
  const [animated, setAnimated] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), 100);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="bg-white rounded-2xl shadow-sm border-2" style={{ borderColor: '#F1F5F9' }}>
      <div className="px-5 pt-4 pb-1 flex items-center justify-between">
        <div>
          <h2 className="font-bold text-sm" style={{ color: '#1B3A6B' }}>
            📈 Índice de Inteligencia Empresarial
          </h2>
          <p className="text-xs text-gray-400">Actualizado hoy</p>
        </div>
        <span
          className="text-xs font-bold px-2.5 py-1 rounded-full"
          style={{ background: '#D1FAE5', color: '#065F46' }}
        >
          {SCORE}/100
        </span>
      </div>

      <LockedBlock requiredPlan="empresario" currentPlan={plan} onUpgrade={onUpgrade}>
        <CircularScore score={SCORE} animated={animated} />
      </LockedBlock>
    </div>
  );
}
