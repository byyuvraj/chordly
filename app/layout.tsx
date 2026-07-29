import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Chordly - Ukulele Chord Book",
  description: "A high-performance, ad-free, personal Ukulele Chord Book Web App.",
  themeColor: "#0D0D0E",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Chordly",
  },
  icons: {
    icon: '/icon.png',
    apple: '/api/icon/192',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">{children}</body>
    </html>
  );
}
