import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/toaster";
import SidebarKeys from "@/components/sidebar/SidebarKeys";
import { AppHeader } from "@/components/layout/AppHeader";
import { BackdropLayer } from "@/components/layers/BackdropLayer";
import { DepthLayer } from "@/components/layers/DepthLayer";
import { AuraGlowLayer } from "@/components/layers/AuraGlowLayer";
import { RoyalMotionWrapper } from "@/components/layout/RoyalMotionWrapper";
import { ThemeProvider } from "@/components/theme-provider";

const fontSans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Iqraa 12 - Velvet Dashboard",
  description: "The next generation of research.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="bg-slate-900">
      <body className="relative bg-slate-900 text-white overflow-hidden">
        <BackdropLayer />
        <DepthLayer />
        <AuraGlowLayer />
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <div className="flex h-screen">
            {/* 1. Persistent Sidebar */}
            <aside className="fixed left-0 top-0 h-full w-72 bg-black/20 border-r border-white/10 p-6">
              <div className="text-2xl font-bold text-white mb-10">
                إقرأ ١٢ | IQRAA 12
              </div>
              {/* Core Keys Navigation */}
              <SidebarKeys />
            </aside>

            {/* Main Content Area */}
            <div className="flex flex-1 flex-col ml-72 bg-gray-950">
              {/* Header: Utility Zone and Controls */}
              <AppHeader />

              {/* 3. Main Workspace */}
              <main className="flex-1 overflow-y-auto">
                <RoyalMotionWrapper>
                  {children}
                </RoyalMotionWrapper>
              </main>
            </div>
          </div>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}