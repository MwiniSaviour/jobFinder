import { AppHeader } from "@/components/layout/app-header";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <AppHeader />
      <main id="main" className="min-h-[calc(100vh-64px)] pb-16 md:pb-0">
        {children}
      </main>
    </>
  );
}
