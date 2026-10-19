import type { Metadata } from "next";
import Link from "next/link";
import { UserIcon } from "../../components/Icons";

export const metadata: Metadata = {
  title: "Your profile — JobFinder",
};

export default function ProfilePage() {
  return (
    <main className="mx-auto flex w-full max-w-lg flex-col items-center px-5 pt-16 text-center">
      <span className="grid size-16 place-items-center rounded-full bg-brand-soft ring-1 ring-brand/15">
        <UserIcon className="size-7 text-brand" />
      </span>
      <h1 className="mt-4 text-[1.4rem] font-semibold tracking-tight">Your profile</h1>
      <p className="mt-2 max-w-xs text-[14px] text-muted">
        Sign-in, saved searches, and booking history arrive in a release right after this one.
      </p>
      <Link
        href="/"
        className="mt-6 rounded-pill border border-border bg-surface px-5 py-2.5 text-sm font-semibold shadow-card transition-shadow hover:border-brand/40 hover:shadow-hover"
      >
        Back to home
      </Link>
    </main>
  );
}
