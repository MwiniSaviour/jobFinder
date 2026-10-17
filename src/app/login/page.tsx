import type { Metadata } from "next";
import { LoginView } from "@/components/app/login-view";

export const metadata: Metadata = {
  title: "Sign in",
  description:
    "Sign in to Morrow to track applications, save roles, and keep your profile current.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ mode?: string }>;
}) {
  const { mode } = await searchParams;
  return <LoginView initialMode={mode === "create" ? "create" : "signin"} />;
}
