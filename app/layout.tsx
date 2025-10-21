import type { Metadata } from "next";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Providers from "@/app/providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Точка Роста GUESSER",
  description: "Угадай дату фотографии! Игра для учеников Точки Роста",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
          <header className="border-b border-white/10 bg-gradient-to-r from-blue-600 to-indigo-600">
            <nav className="max-w-6xl mx-auto p-4 flex gap-6 text-sm items-center">
              <Link href="/" className="text-white font-bold text-lg">🌟 Точка Роста GUESSER</Link>
              <div className="flex gap-4 ml-auto">
                <Link href="/play" className="text-white hover:underline">Играть</Link>
                <Link href="/leaderboard" className="text-white hover:underline">Лидерборд</Link>
                <Link href="/achievements" className="text-white hover:underline">Достижения</Link>
              </div>
            </nav>
          </header>
          <main className="min-h-screen">{children}</main>
        </Providers>
      </body>
    </html>
  );
}
