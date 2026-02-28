import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Iqraa Velvet Dashboard",
  description: "A cognitive map of capabilities",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl">
      <body className={`${inter.className} bg-gray-900 text-gray-100`}>
        <div className="flex min-h-screen">
          <aside className="w-64 bg-gray-800 p-4">
            <h1 className="text-2xl font-bold text-white mb-8">منصة إقرأ</h1>
            <nav>
              <ul>
                <li className="mb-4"><a href="/%D8%A7%D9%84%D9%85%D8%B9%D8%A7%D9%84%D8%AC%D8%A9-%D8%A7%D9%84%D8%A3%D9%88%D9%84%D9%8A%D8%A9" className="text-gray-300 hover:text-white">المعالجة الأولية</a></li>
                <li className="mb-4"><a href="/%D8%A7%D9%84%D9%86%D9%85%D8%B0%D8%AC%D8%A9-%D8%A7%D9%84%D9%85%D9%81%D9%87%D9%88%D9%85%D9%8A%D8%A9" className="text-gray-300 hover:text-white">النمذجة المفهومية</a></li>
                <li className="mb-4"><a href="/%D8%AA%D8%B4%D8%BA%D9%8A%D9%84-%D8%A7%D9%84%D9%82%D8%B1%D8%A7%D8%B1" className="text-gray-300 hover:text-white">تشغيل القرار</a></li>
                <li className="mb-4"><a href="/%D8%AA%D9%88%D8%B3%D9%8A%D8%B9-%D8%A7%D9%84%D8%AA%D9%81%D8%A7%D8%B9%D9%84" className="text-gray-300 hover:text-white">توسيع التفاعل</a></li>
              </ul>
            </nav>
          </aside>
          <main className="flex-1 p-8">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
