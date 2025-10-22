import type { Metadata } from "next";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
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
        <header className="border-b-4 border-white bg-red-600 shadow-lg">
          <nav className="max-w-6xl mx-auto p-4 flex gap-6 text-sm items-center">
            <Link href="/" className="text-white font-bold text-lg hover:text-red-100 transition-colors">🌟 Точка Роста GUESSER</Link>
            <div className="flex gap-4 ml-auto font-semibold">
              <Link href="/play" className="text-white hover:text-red-100 transition-colors">Играть</Link>
              <Link href="/leaderboard" className="text-white hover:text-red-100 transition-colors">Лидерборд</Link>
              <Link href="/achievements" className="text-white hover:text-red-100 transition-colors">Достижения</Link>
            </div>
          </nav>
        </header>
        <main className="min-h-screen">{children}</main>
      </body>
    </html>
  );
}
