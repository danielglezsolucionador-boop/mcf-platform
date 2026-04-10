'use client';

interface AuthCardProps {
  children: React.ReactNode;
  className?: string;
}

export default function AuthCard({ children, className = '' }: AuthCardProps) {
  return (
    <div
      className={`w-full max-w-md mx-auto bg-white rounded-3xl shadow-2xl p-8 ${className}`}
      style={{ boxShadow: '0 20px 60px rgba(27, 58, 107, 0.12)' }}
    >
      {children}
    </div>
  );
}
