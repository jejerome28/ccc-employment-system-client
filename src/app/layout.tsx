import type { Metadata } from "next";
import { Public_Sans, Ubuntu, Cinzel } from "next/font/google";
import "./globals.css";

const publicSans = Public_Sans({
  variable: "--font-public-sans",
  subsets: ["latin"],
});

const ubuntu = Ubuntu({
  weight: ["500", "700"],
  variable: "--font-ubuntu",
  subsets: ["latin"],
});

const cinzel = Cinzel({
  weight: "700",
  variable: "--font-cinzel",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: { template: "%s · Staff Time Records", default: "Staff Time Records" },
  description: "City College of Calamba HRDU — employees and daily time records",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${publicSans.variable} ${ubuntu.variable} ${cinzel.variable} h-full`}>
      <body className="h-full bg-canvas text-ink font-sans antialiased">{children}</body>
    </html>
  );
}
