'use client';

import { useState } from 'react';
import Link from 'next/link';
import LogoMCF from '@/components/auth/LogoMCF';
import AuthCard from '@/components/auth/AuthCard';
import InputField from '@/components/auth/InputField';
import Divider from '@/components/auth/Divider';
import SunatIcon from '@/components/auth/SunatIcon';

interface FormState {
  email: string;
  password: string;
}

interface FormErrors {
  email?: string;
  password?: string;
}

export default function LoginPage() {
  const [form, setForm] = useState<FormState>({ email: '', password: '' });
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [loadingProvider, setLoadingProvider] = useState<string | null>(null);

  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    if (!form.email) {
      newErrors.email = 'El correo es obligatorio';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = 'Ingresa un correo válido';
    }
    if (!form.password) {
      newErrors.password = 'La contraseña es obligatoria';
    } else if (form.password.length < 6) {
      newErrors.password = 'Mínimo 6 caracteres';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    // Simular login
    await new Promise((r) => setTimeout(r, 1500));
    setLoading(false);
    alert('¡Bienvenido a MCF! (Demo)');
  };

  const handleGoogle = async () => {
    setLoadingProvider('google');
    await new Promise((r) => setTimeout(r, 1200));
    setLoadingProvider(null);
    alert('Login con Google (Demo)');
  };

  const handleSol = () => {
    window.location.href = '/registro/clave-sol';
  };

  return (
    <main
      className="min-h-screen flex flex-col items-center justify-center px-4 py-10"
      style={{ background: 'linear-gradient(160deg, #F4F6F9 0%, #E8EEF8 100%)' }}
    >
      {/* Decoración de fondo */}
      <div
        className="fixed top-0 right-0 w-96 h-96 rounded-full opacity-10 pointer-events-none"
        style={{ background: '#1B3A6B', transform: 'translate(30%, -30%)' }}
      />
      <div
        className="fixed bottom-0 left-0 w-64 h-64 rounded-full opacity-10 pointer-events-none"
        style={{ background: '#4A90D9', transform: 'translate(-30%, 30%)' }}
      />

      <div className="w-full max-w-md flex flex-col gap-6">
        {/* Logo */}
        <div className="flex justify-center mb-2">
          <LogoMCF size="lg" showSlogan />
        </div>

        <AuthCard>
          <div className="flex flex-col gap-5">
            <div className="text-center">
              <h2 className="text-xl font-bold" style={{ color: '#1B3A6B' }}>
                Bienvenido de vuelta
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Ingresa a tu cuenta MCF
              </p>
            </div>

            {/* Botón Clave SOL */}
            <button
              onClick={handleSol}
              className="w-full flex items-center justify-center gap-3 py-3.5 px-4 rounded-2xl font-semibold text-white transition-all duration-200 hover:opacity-90 active:scale-95 shadow-md"
              style={{ background: 'linear-gradient(135deg, #1B3A6B 0%, #2E5CA8 100%)' }}
            >
              <SunatIcon size={22} />
              <span>Entrar con Clave SOL</span>
              <span className="ml-auto text-xs opacity-60 bg-white/20 px-2 py-0.5 rounded-full">
                SUNAT
              </span>
            </button>

            {/* Botón Google */}
            <button
              onClick={handleGoogle}
              disabled={loadingProvider === 'google'}
              className="w-full flex items-center justify-center gap-3 py-3.5 px-4 rounded-2xl font-semibold transition-all duration-200 hover:bg-gray-50 active:scale-95 border-2 disabled:opacity-60"
              style={{ color: '#1B3A6B', borderColor: '#E0E5EF', background: 'white' }}
            >
              {loadingProvider === 'google' ? (
                <LoadingSpinner />
              ) : (
                <>
                  <GoogleIcon />
                  <span>Entrar con Google</span>
                </>
              )}
            </button>

            <Divider text="o ingresa con tu correo" />

            {/* Formulario email/password */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <InputField
                label="Correo electrónico"
                type="email"
                placeholder="tucorreo@empresa.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                error={errors.email}
                icon={<EmailIcon />}
              />

              <InputField
                label="Contraseña"
                type="password"
                placeholder="Tu contraseña"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                error={errors.password}
              />

              <div className="flex justify-end -mt-2">
                <Link
                  href="/recuperar-password"
                  className="text-xs font-medium hover:underline"
                  style={{ color: '#4A90D9' }}
                >
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-4 rounded-2xl font-bold text-white transition-all duration-200 hover:opacity-90 active:scale-95 shadow-md disabled:opacity-60 flex items-center justify-center gap-2"
                style={{ background: 'linear-gradient(135deg, #E63946 0%, #C1121F 100%)' }}
              >
                {loading ? (
                  <>
                    <LoadingSpinner color="white" />
                    <span>Ingresando...</span>
                  </>
                ) : (
                  'Ingresar a MCF'
                )}
              </button>
            </form>

            {/* Divider y registro */}
            <div className="pt-2 border-t border-gray-100 text-center">
              <p className="text-sm text-gray-500">
                ¿No tienes cuenta?{' '}
                <Link
                  href="/registro"
                  className="font-bold hover:underline"
                  style={{ color: '#1B3A6B' }}
                >
                  Regístrate gratis
                </Link>
              </p>
            </div>
          </div>
        </AuthCard>

        <p className="text-center text-xs text-gray-400">
          Al ingresar aceptas nuestros{' '}
          <a href="#" className="underline" style={{ color: '#4A90D9' }}>
            Términos y Condiciones
          </a>{' '}
          y{' '}
          <a href="#" className="underline" style={{ color: '#4A90D9' }}>
            Política de Privacidad
          </a>
        </p>
      </div>
    </main>
  );
}

/* ---- Íconos inline pequeños ---- */
function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
}

function EmailIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  );
}

function LoadingSpinner({ color = '#1B3A6B' }: { color?: string }) {
  return (
    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke={color} strokeWidth="4" />
      <path className="opacity-75" fill={color} d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}
