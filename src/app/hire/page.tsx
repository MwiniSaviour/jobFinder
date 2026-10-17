import type { Metadata } from "next";
import { HireOverview } from "@/components/hire/hire-overview";

export const metadata: Metadata = {
  title: "Overview",
  description:
    "Your hiring pipeline at a glance — roles, candidates, interviews, and what needs you today.",
};

export default function HireOverviewPage() {
  return <HireOverview />;
}
