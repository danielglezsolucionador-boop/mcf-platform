import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MCF - Médico Contable Financiero",
  description: "El médico de tu empresa. Plataforma contable y financiera para empresarios peruanos.",
  keywords: "contabilidad, finanzas, SUNAT, RUC, Peru, empresas",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
