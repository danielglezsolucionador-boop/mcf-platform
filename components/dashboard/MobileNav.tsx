'use client';

import Link from 'next/link';
import { NAV_ITEMS } from './types';

interface MobileNavProps {
  activeItem: string;
}

export default function MobileNav({ activeItem }: MobileNavProps) {
  // Mostrar solo las primeras 5 opciones en móvil
  const mobileItems = NAV_ITEMS.slice(0, 5);

  return (
    <nav
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 flex"
      style={{
        background: '#1B3A6B',
        boxShadow: '0 -4px 24px rgba(27,58,107,0.25)',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
    >
      {mobileItems.map((item) => {
        const isActive = activeItem === item.id;
        return (
          <Link
            key={item.id}
            href={item.href}
            className="flex-1 flex flex-col items-center justify-center py-2.5 gap-0.5 transition-all"
            style={{ background: isActive ? 'rgba(255,255,255,0.12)' : 'transparent' }}
          >
            <span className="text-xl leading-none">{item.emoji}</span>
            <span
              className="text-xs font-medium leading-none mt-0.5"
              style={{ color: isActive ? 'white' : 'rgba(255,255,255,0.5)', fontSize: '0.6rem' }}
            >
              {item.label}
            </span>
            {isActive && (
              <div
                className="absolute bottom-0 h-0.5 w-8 rounded-full"
                style={{ background: '#4A90D9' }}
              />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
