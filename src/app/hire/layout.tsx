import { HireShell } from "@/components/hire/hire-shell";

export const metadata = {
  title: {
    default: "Recruiter workspace",
    template: "%s · Lumen hiring · Morrow",
  },
  description:
    "Post roles, review candidates, and run a hiring pipeline that keeps candidates informed.",
};

export default function HireLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <HireShell>{children}</HireShell>;
}
