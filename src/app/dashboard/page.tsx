import type { Metadata } from "next";
import { DashboardView } from "@/components/app/dashboard-view";

export const metadata: Metadata = {
  title: "Your dashboard",
  description:
    "Track applications, offers, interviews, and saved roles in one calm place.",
};

export default function DashboardPage() {
  return <DashboardView />;
}
