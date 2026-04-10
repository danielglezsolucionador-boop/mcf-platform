'use client';

interface DividerProps {
  text?: string;
}

export default function Divider({ text = 'o' }: DividerProps) {
  return (
    <div className="flex items-center gap-3 my-1">
      <div className="flex-1 h-px bg-gray-200" />
      <span className="text-xs text-gray-400 font-medium">{text}</span>
      <div className="flex-1 h-px bg-gray-200" />
    </div>
  );
}
