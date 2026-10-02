import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Nexora Learn — Modern Academic Intelligence LMS",
  description:
    "Learn smarter. Practice better. Know what to do next. Production-style modern LMS featuring Learning Pulse™, NextStep™ recommendations, ReviewLoop™, and server-authoritative assessments.",
};

import { LanguageProvider } from "@/lib/i18n/context";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`dark ${inter.variable} ${spaceGrotesk.variable}`}>
      <body className="min-h-screen bg-background font-sans text-text-primary antialiased selection:bg-primary/30 selection:text-white">
        <LanguageProvider>
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
}
