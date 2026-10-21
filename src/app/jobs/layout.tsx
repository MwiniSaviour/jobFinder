import type { ReactNode } from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Jobs",
};

export default function JobsLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
