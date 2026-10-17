import type { Metadata } from "next";
import { HireRoles } from "@/components/hire/hire-roles";

export const metadata: Metadata = {
  title: "Roles",
  description:
    "Manage the roles Lumen is hiring for — live listings, candidate flow, and hiring standards.",
};

export default function HireRolesPage() {
  return <HireRoles />;
}
