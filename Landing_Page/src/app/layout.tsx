import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { ToastContainer } from "@/components/ui/ToastContainer";
import { ThemeProvider } from "@/components/layout/ThemeProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "UMKM Store - Belanja Mudah & Terpercaya",
  description: "Pusat belanja produk UMKM terbaik dengan harga terjangkau.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body suppressHydrationWarning className={cn(inter.className, "bg-gray-50 text-gray-900 antialiased dark:bg-gray-950 dark:text-gray-100 transition-colors duration-300")}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          {children}
          <ToastContainer />
        </ThemeProvider>
      </body>
    </html>
  );
}
