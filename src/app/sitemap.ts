import type { MetadataRoute } from "next";
import { jobs } from "@/data/jobs";
import { companies } from "@/data/companies";

const base = "https://morrow.work";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = [
    "",
    "/jobs",
    "/companies",
    "/salaries",
    "/login",
    "/hire",
  ].map((route) => ({
    url: `${base}${route}`,
    lastModified: new Date("2026-10-17"),
    changeFrequency: "daily" as const,
    priority: route === "" ? 1 : 0.8,
  }));

  const jobRoutes = jobs.map((job) => ({
    url: `${base}/jobs/${job.company}/${job.slug}`,
    lastModified: new Date(`${job.postedAt}T09:00:00Z`),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  const companyRoutes = companies.map((company) => ({
    url: `${base}/companies/${company.slug}`,
    lastModified: new Date("2026-10-17"),
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  return [...staticRoutes, ...companyRoutes, ...jobRoutes];
}
