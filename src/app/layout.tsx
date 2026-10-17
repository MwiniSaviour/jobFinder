import type { Metadata, Viewport } from "next";
import "@fontsource-variable/instrument-sans";
import "@fontsource-variable/fraunces/full.css";
import "@fontsource-variable/fraunces/full-italic.css";
import "@fontsource-variable/jetbrains-mono";
import "./globals.css";
import { ToastProvider } from "@/components/ui/toast";
import { SavedProvider } from "@/components/ui/saved-context";
import { CommandPalette } from "@/components/layout/command-palette";

export const metadata: Metadata = {
  metadataBase: new URL("https://morrow.work"),
  title: {
    default: "Morrow — work worth wanting",
    template: "%s · Morrow",
  },
  description:
    "A quieter way to find work that fits. Salary ranges on every role, honest hiring timelines, and teams that reply. Discover 24 open roles across design, engineering, product, and more.",
  keywords: [
    "jobs",
    "job board",
    "design jobs",
    "engineering jobs",
    "remote jobs",
    "hiring",
    "careers",
  ],
  openGraph: {
    title: "Morrow — work worth wanting",
    description:
      "A quieter way to find work that fits. Salary ranges on every role, honest timelines, and teams that reply.",
    type: "website",
    locale: "en_GB",
    siteName: "Morrow",
  },
  twitter: {
    card: "summary_large_image",
    title: "Morrow — work worth wanting",
    description: "A quieter way to find work that fits.",
  },
  icons: {
    icon: "/icon.svg",
  },
};

export const viewport: Viewport = {
  themeColor: "#fbfaf6",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <noscript>
          <style>{`[data-reveal]{opacity:1 !important;transform:none !important}`}</style>
        </noscript>
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[200] focus:rounded-lg focus:bg-ink focus:px-4 focus:py-2.5 focus:text-[13px] focus:font-medium focus:text-paper"
        >
          Skip to content
        </a>
        <SavedProvider>
          <ToastProvider>
            {children}
            <CommandPalette />
          </ToastProvider>
        </SavedProvider>
      </body>
    </html>
  );
}
