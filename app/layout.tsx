import type { Metadata } from "next";
import { Imbue, Victor_Mono } from "next/font/google";
import "./globals.css";

const imbue = Imbue({
  subsets: ["latin"],
  variable: "--font-imbue",
  display: "swap",
});

const victorMono = Victor_Mono({
  subsets: ["latin"],
  variable: "--font-victor-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "HH Goa 2026 | Builder ID Generator",
  description: "Create your HH Goa 2026 photo frame and Builder ID card.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${imbue.variable} ${victorMono.variable}`}>
      <body className="antialiased min-h-screen font-mono text-brand-black bg-brand-primary">
        {children}
      </body>
    </html>
  );
}
