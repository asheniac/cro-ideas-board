import type { Metadata } from "next";
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
  title: "CRO Ideas Board",
  description: "Tinder-like CRO research board for samsung.com/au",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-zinc-50 dark:bg-black">
        {/* Navigation */}
        <nav className="sticky top-0 z-50 border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/80 backdrop-blur">
          <div className="max-w-4xl mx-auto flex items-center justify-between px-6 h-14">
            <a href="/" className="font-semibold text-zinc-900 dark:text-zinc-50">
              🧪 CRO Ideas
            </a>
            <div className="flex items-center gap-4 text-sm">
              <a
                href="/"
                className="text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50"
              >
                Swipe
              </a>
              <a
                href="/liked"
                className="text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50"
              >
                ❤️ Liked
              </a>
              <a
                href="/dislike"
                className="text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50"
              >
                ❌ Disliked
              </a>
            </div>
          </div>
        </nav>
        {children}
      </body>
    </html>
  );
}
