import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CRO Ideas Board",
  description: "Research board for conversion rate optimization",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <head>
        <link rel="preconnect" href="https://api.fontshare.com" />
        <link href="https://api.fontshare.com/v2/css?f[]=outfit@400,500,600,700&f[]=satoshi@700&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-full flex flex-col bg-[var(--background)] text-[var(--foreground)]">
        {/* Premium Navigation */}
        <nav className="sticky top-0 z-50 border-b border-[var(--border)] bg-[var(--background)]/80 backdrop-blur-xl">
          <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
            {/* Logo */}
            <a href="/" className="flex items-center gap-3 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2v-4M9 21H5a2 2 0 0 1-2-2v-4m0 0h18"/>
                </svg>
              </div>
              <span className="font-semibold text-[var(--foreground)] tracking-tight">CRO Ideas</span>
            </a>

            {/* Navigation Links */}
            <div className="flex items-center gap-1">
              <a
                href="/"
                className="px-4 py-2 text-sm font-medium text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--surface)] rounded-lg transition-all"
              >
                <span className="flex items-center gap-2">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M19 12H5M12 19l-7-7 7-7"/>
                  </svg>
                  Swipe
                </span>
              </a>
              <a
                href="/liked"
                className="px-4 py-2 text-sm font-medium text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--surface)] rounded-lg transition-all"
              >
                <span className="flex items-center gap-2">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                  </svg>
                  Liked
                </span>
              </a>
              <a
                href="/dislike"
                className="px-4 py-2 text-sm font-medium text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--surface)] rounded-lg transition-all"
              >
                <span className="flex items-center gap-2">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="15" y1="9" x2="9" y2="15"/>
                    <line x1="9" y1="9" x2="15" y2="15"/>
                  </svg>
                  Disliked
                </span>
              </a>
            </div>
          </div>
        </nav>
        {children}
      </body>
    </html>
  );
}
