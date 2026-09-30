import type { Metadata } from "next";
import { Public_Sans } from "next/font/google";
import "./globals.css";

const publicSans = Public_Sans({
  variable: "--font-public-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: { template: "%s · Staff Time Records", default: "Staff Time Records" },
  description: "CCC employment system — employees and daily time records",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${publicSans.variable} h-full`}>
      <body className="h-full bg-canvas text-ink font-sans antialiased">{children}</body>
    </html>
  );
}
