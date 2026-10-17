import type { Metadata } from "next";
import { JobsExplorer } from "@/components/jobs/jobs-explorer";

export const metadata: Metadata = {
  title: "Find work",
  description:
    "Browse 24 open roles across design, engineering, product, marketing, and more. Every role shows a salary range and a real hiring timeline.",
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function list(value: string | string[] | undefined) {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

export default async function JobsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const min = Number(params.min);

  return (
    <JobsExplorer
      initial={{
        q: typeof params.q === "string" ? params.q : "",
        where: typeof params.where === "string" ? params.where : "",
        departments: list(params.department),
        modes: list(params.mode),
        levels: list(params.level),
        types: list(params.type),
        companies: list(params.company),
        minSalary: Number.isFinite(min) && min > 0 ? min : 0,
      }}
    />
  );
}
