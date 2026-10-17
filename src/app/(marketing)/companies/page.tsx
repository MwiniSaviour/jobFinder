import type { Metadata } from "next";
import { CompaniesDirectory } from "@/components/marketing/companies-directory";

export const metadata: Metadata = {
  title: "Companies",
  description:
    "Meet the considered teams hiring on Morrow — their work, their principles, and the roles they're opening.",
};

export default function CompaniesPage() {
  return <CompaniesDirectory />;
}
