import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SessionProvider } from "@/components/providers/SessionProvider";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { Navbar } from "@/components/global/Navbar";
import { Footer } from "@/components/global/Footer";
import { ToastProvider } from "@/components/global/useToast";
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
  metadataBase: new URL(process.env.NEXTAUTH_URL || "https://capacity-connect.vercel.app"),
  title: {
    default: "Capacity Connect | Digital Capacity Building & Learning Portal",
    template: "%s | Capacity Connect",
  },
  description:
    "Empower your workforce with enterprise digital capacity building, interactive learning modules, skill tracking, and verified certifications.",
  keywords: [
    "capacity building",
    "learning management system",
    "training portal",
    "employee development",
    "skill certification",
  ],
  authors: [{ name: "Capacity Connect Team" }],
  openGraph: {
    title: "Capacity Connect | Digital Capacity Building",
    description:
      "Enterprise digital capacity building and interactive learning management system.",
    url: "https://capacity-connect.vercel.app",
    siteName: "Capacity Connect",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Capacity Connect",
    description:
      "Enterprise digital capacity building and interactive learning management system.",
  },
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
            <ToastProvider>
              <Navbar />
              <main className="flex-grow flex flex-col">
                {children}
              </main>
              <Footer />
            </ToastProvider>
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
