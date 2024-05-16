import type { Metadata } from "next";
import { Varela_Round } from "next/font/google";

import "./globals.css";

const font = Varela_Round({ subsets: ["latin"], weight: "400" });

export const metadata: Metadata = {
  title: "Tapnee App",
  description: "Tapnee App",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={font.className} suppressHydrationWarning={true}>
        {children}
      </body>
    </html>
  );
}
