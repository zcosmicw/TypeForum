import type { Metadata } from "next";
import { Space_Grotesk, Space_Mono, Geist_Mono } from "next/font/google";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { SupabaseSetupBanner } from "@/components/SupabaseSetupBanner";
import AmbientBackground from "@/components/AmbientBackground";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  display: "swap",
});

const spaceMono = Space_Mono({
  variable: "--font-space-mono",
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "TypeForum",
  description:
    "Community discussion boards — threads, categories, real-time chat, and more.",
};

export const dynamic = "force-dynamic";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${spaceGrotesk.variable} ${spaceMono.variable} ${geistMono.variable} h-full`}
    >
      <body className="relative flex min-h-full flex-col bg-transparent">
        <div className="fixed inset-0 -z-50 overflow-hidden pointer-events-none">
          <AmbientBackground />
        </div>
        <SupabaseSetupBanner />
        <Header />
        <main className="flex-1 relative z-10">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
