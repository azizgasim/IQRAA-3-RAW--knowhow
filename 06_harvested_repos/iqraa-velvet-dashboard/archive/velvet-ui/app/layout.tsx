import "./globals.css";
import { ReactNode } from "react";

export const metadata = {
  title: "Iqraa 12 – Velvet Dashboard",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <body className="bg-[#0A0F1F] text-white antialiased">
        {children}
      </body>
    </html>
  );
}
