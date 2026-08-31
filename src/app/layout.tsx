import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SessionProvider } from "@/components/providers/SessionProvider";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { Navbar } from "@/components/global/Navbar";
import { Footer } from "@/components/global/Footer";
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
  title: "CAPACITY CONNECT",
  description: "Digital Capacity Building and Learning Management Portal",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`} suppressHydrationWarning>
      <body className="antialiased min-h-screen bg-white dark:bg-[#050810] text-gray-900 dark:text-[#e8ecf4] flex flex-col pt-16 selection:bg-purple-500/30 transition-colors duration-300">
        <SessionProvider>
          <ThemeProvider defaultTheme="dark">
            <Navbar />
            <main className="flex-grow flex flex-col relative z-0">
              {children}
            </main>
            <Footer />
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
