import Link from "next/link";
import { Logo } from "@/components/ui/logo";
import { NewsletterForm } from "./newsletter";

const columns = [
  {
    title: "Find work",
    links: [
      { label: "Browse all roles", href: "/jobs" },
      { label: "Companies", href: "/companies" },
      { label: "Salary explorer", href: "/salaries" },
      { label: "Your applications", href: "/dashboard" },
      { label: "Saved jobs", href: "/dashboard/saved" },
    ],
  },
  {
    title: "For teams",
    links: [
      { label: "Recruiter workspace", href: "/hire" },
      { label: "Post a role", href: "/hire/jobs/new" },
      { label: "Hiring pipeline", href: "/hire/pipeline" },
      { label: "Our hiring standard", href: "/hire" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "Our story", href: "/" },
      { label: "How it works", href: "/#how-it-works" },
      { label: "Trust & privacy", href: "/" },
      { label: "Contact", href: "/" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-line bg-cream/50">
      <div className="container-x pb-8 pt-16 lg:pt-20">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-[1.6fr_1fr_1fr_1fr] lg:gap-8">
          <div className="max-w-sm">
            <Logo />
            <p className="mt-4 text-[14px] leading-relaxed text-stone">
              A quieter way to find work that fits — and to hire people who
              care. Built for the long term, one honest listing at a time.
            </p>
            <p className="mt-8 font-mono text-[10px] uppercase tracking-[0.16em] text-stone-light">
              The weekly letter
            </p>
            <p className="mt-2 text-[13.5px] leading-relaxed text-ink-soft">
              Six roles worth opening. Every Thursday, never more.
            </p>
            <NewsletterForm />
          </div>
          {columns.map((column) => (
            <nav key={column.title} aria-label={column.title}>
              <h3 className="font-mono text-[10px] uppercase tracking-[0.16em] text-stone-light">
                {column.title}
              </h3>
              <ul className="mt-4 space-y-2.5">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="link-underline text-[13.5px] text-ink-soft transition hover:text-ink"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-16 flex flex-col gap-4 border-t border-line pt-6 text-[12px] text-stone sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 Morrow Labs. Made with care in Accra.</p>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <Link href="/" className="transition hover:text-ink">
              Privacy
            </Link>
            <Link href="/" className="transition hover:text-ink">
              Terms
            </Link>
            <Link href="/" className="transition hover:text-ink">
              Accessibility
            </Link>
            <span
              className="hidden h-3 w-px bg-line-strong sm:block"
              aria-hidden="true"
            />
            <span className="inline-flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-sage" />
              All systems normal
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
