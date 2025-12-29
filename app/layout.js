'use client';

import { Geist } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { usePathname } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
});

export default function RootLayout({ children }) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith('/admin');

  return (
    <html lang="id">
      <head>
        <title>Kawan Hiking - Platform Hiking & Pendakian</title>
        <meta name="description" content="Platform terpercaya untuk petualangan hiking dan pendakian gunung di Indonesia" />
        <script 
          src="https://app.sandbox.midtrans.com/snap/snap.js" 
          data-client-key="Mid-client-TlE16KKcRNzr_QzM"
        ></script>
      </head>
      <body className={`${geist.variable} antialiased bg-slate-900 text-slate-100`}>
        <AuthProvider>
          {isAdminRoute ? (
            // Admin layout - no navbar/footer
            <>{children}</>
          ) : (
            // User layout - with navbar/footer
            <div className="min-h-screen flex flex-col">
              <Navbar />
              <main className="flex-1">{children}</main>
              <Footer />
            </div>
          )}
        </AuthProvider>
      </body>
    </html>
  );
}
