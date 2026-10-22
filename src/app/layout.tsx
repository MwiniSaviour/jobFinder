import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { BottomNav } from "../components/BottomNav";
import { StorageBoot } from "../components/StorageBoot";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "JobFinder",
  description:
    "Find jobs, book vetted home services, and get rides with upfront pricing — one simple app.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={geistSans.variable}>
      <body className="min-h-dvh bg-background pb-[5.5rem] font-sans text-foreground antialiased">
        {children}
        <StorageBoot />
        <BottomNav />
      </body>
    </html>
  );
}
