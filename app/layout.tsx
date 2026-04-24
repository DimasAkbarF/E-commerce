import type { Metadata } from "next";
import "./globals.css";
import AuthProvider from "@/components/providers/AuthProvider";

export const metadata: Metadata = {
  title: "FoodStore - Marketplace Makanan",
  description: "Platform e-commerce makanan terpercaya dengan produk berkualitas",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className="font-sans antialiased bg-[#F5F5F5]">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
