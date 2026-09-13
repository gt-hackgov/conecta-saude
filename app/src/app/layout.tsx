import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AccessibilityInit } from "@/components/AccessibilityInit";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Conecta Saúde",
  description: "Plataforma para agendamento de consultas e exames via gov.br",
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AccessibilityInit />
        <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true">
          <defs>
            <filter id="filtro-protanopia">
              <feColorMatrix
                type="matrix"
                values="0.567,0.433,0,0,0  0.558,0.442,0,0,0  0,0.242,0.758,0,0  0,0,0,1,0"
              />
            </filter>
            <filter id="filtro-deuteranopia">
              <feColorMatrix
                type="matrix"
                values="0.625,0.375,0,0,0  0.7,0.3,0,0,0  0,0.3,0.7,0,0  0,0,0,1,0"
              />
            </filter>
            <filter id="filtro-tritanopia">
              <feColorMatrix
                type="matrix"
                values="0.95,0.05,0,0,0  0,0.433,0.567,0,0  0,0.475,0.525,0,0  0,0,0,1,0"
              />
            </filter>
          </defs>
        </svg>
        {children}
      </body>
    </html>
  );
}
