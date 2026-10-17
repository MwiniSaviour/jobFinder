import type { Metadata } from "next";
import { SalariesExplorer } from "@/components/marketing/salaries-explorer";

export const metadata: Metadata = {
  title: "Salary explorer",
  description:
    "Know what the work is worth. Explore salary ranges by role and level, drawn from every published range on Morrow.",
};

export default function SalariesPage() {
  return <SalariesExplorer />;
}
