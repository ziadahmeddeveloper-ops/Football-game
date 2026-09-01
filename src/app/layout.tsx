import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Draftix Arena AI | Premium Football Draft",
  description: "The ultimate AI-powered football draft and auction arena.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark bg-[#050811] text-white">
      <head>
        <meta name="referrer" content="no-referrer" />
      </head>
      <body className={`${inter.className} bg-[#050811] text-white min-h-screen antialiased`}>
        <main className="min-h-screen flex flex-col bg-[#050811] text-white">
          {children}
        </main>
      </body>
    </html>
  );
}
