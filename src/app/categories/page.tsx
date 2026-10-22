"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { CSSProperties } from "react";
import { ArrowRightIcon, ChevronLeftIcon } from "../../components/Icons";
import { JOB_CATEGORIES, SERVICE_CATEGORIES, type CategoryDef } from "../../lib/categories";

const heroDelay = (ms: number): CSSProperties =>
  ({ "--hero-delay": `${ms}ms` }) as CSSProperties;

function CategoryCard({
  name,
  icon: Icon,
  href,
  delay,
}: {
  name: string;
  icon: CategoryDef["icon"];
  href: string;
  delay: number;
}) {
  return (
    <Link
      href={href}
      className="hero-rise flex flex-col items-center justify-center gap-2 rounded-[16px] border border-border bg-surface p-3 shadow-card transition hover:-translate-y-0.5 hover:shadow-hover"
      style={heroDelay(delay)}
    >
      <Icon className="size-6 text-brand" />
      <span className="text-center text-[12px] font-semibold leading-tight">{name}</span>
    </Link>
  );
}

function CategorySection({
  title,
  items,
  basePath,
  delay,
}: {
  title: string;
  items: CategoryDef[];
  basePath: string;
  delay: number;
}) {
  return (
    <section className="hero-rise space-y-3" style={heroDelay(delay)}>
      <h2 className="text-[16px] font-semibold tracking-[-0.01em]">{title}</h2>
      <Link
        href={basePath}
        className="flex items-center gap-3 rounded-[16px] border border-border bg-surface p-3.5 shadow-card transition hover:-translate-y-0.5 hover:shadow-hover"
      >
        <span className="grid size-10 place-items-center rounded-[12px] bg-brand-soft text-brand">
          <ArrowRightIcon className="size-5" />
        </span>
        <span className="flex-1 text-[15px] font-semibold">
          All {basePath === "/jobs" ? "jobs" : "services"}
        </span>
        <ArrowRightIcon className="size-5 text-muted" />
      </Link>
      <div className="grid grid-cols-3 gap-3">
        {items.map((category, index) => (
          <CategoryCard
            key={category.name}
            name={category.name}
            icon={category.icon}
            href={`${basePath}?category=${encodeURIComponent(category.name)}`}
            delay={delay + (index + 1) * 40}
          />
        ))}
      </div>
    </section>
  );
}

export default function CategoriesPage() {
  const router = useRouter();
  return (
    <main className="mx-auto max-w-lg space-y-8 px-5 pb-10 pt-6">
      <div className="hero-rise" style={heroDelay(0)}>
        <button
          type="button"
          aria-label="Go back"
          onClick={() => router.back()}
          className="rounded-full border border-border bg-surface p-2.5 transition-colors hover:border-brand/40"
        >
          <ChevronLeftIcon className="size-4" />
        </button>
        <h1 className="mt-4 text-[24px] font-bold tracking-[-0.01em]">All categories</h1>
        <p className="mt-1 text-[14px] text-muted">Jump into any job or service category.</p>
      </div>
      <div className="h-px bg-border" />
      <CategorySection title="Jobs" items={JOB_CATEGORIES} basePath="/jobs" delay={80} />
      <CategorySection title="Services" items={SERVICE_CATEGORIES} basePath="/services" delay={140} />
    </main>
  );
}
