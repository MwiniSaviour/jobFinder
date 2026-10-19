import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Jobs",
};

type JobListing = {
  id: number;
  title: string;
  company: string;
  location: string;
  type: string;
  posted: string;
  blurb: string;
};

const jobs: JobListing[] = [
  {
    id: 1,
    title: "Delivery Driver",
    company: "FreshCart Market",
    location: "Riverside",
    type: "Hourly",
    posted: "2 days ago",
    blurb:
      "Evening and weekend grocery runs around the neighborhood. Own vehicle preferred.",
  },
  {
    id: 2,
    title: "Barista",
    company: "Harbor Coffee",
    location: "City Center",
    type: "Weekend",
    posted: "3 days ago",
    blurb:
      "Front-of-house service at a cozy neighborhood cafe. Premium espresso experience a plus.",
  },
  {
    id: 3,
    title: "Frontend Developer",
    company: "Moonrise Studio",
    location: "Remote",
    type: "Full-time",
    posted: "4 days ago",
    blurb:
      "Build clean client-facing interfaces with React and Tailwind for early-stage products.",
  },
  {
    id: 4,
    title: "Ride-Hail Driver",
    company: "Lantern Rides",
    location: "All districts",
    type: "Per-trip",
    posted: "5 days ago",
    blurb:
      "Drive flexible city routes with weekly payouts and no dress code requirements.",
  },
  {
    id: 5,
    title: "After-School Tutor",
    company: "BrightNote Learning",
    location: "Hillcrest",
    type: "Part-time",
    posted: "6 days ago",
    blurb:
      "One-on-one math and science tutoring for middle school students after dismissal.",
  },
  {
    id: 6,
    title: "Warehouse Packer",
    company: "Codex Depot",
    location: "Industrial Park",
    type: "Full-time",
    posted: "6 days ago",
    blurb:
      "Order picking and packing with paid overtime during seasonal peaks.",
  },
];

export default function JobsPage() {
  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-10">
      <h1 className="text-2xl font-bold">Find your next job</h1>
      <p className="mt-2 max-w-2xl text-sm text-muted">
        Fresh local listings collected from small businesses hiring nearby.
        Browse the board — new postings are added almost every day.
      </p>
      <ul className="mt-8 grid gap-4 sm:grid-cols-2">
        {jobs.map((job) => (
          <li key={job.id} className="card">
            <div className="flex items-start justify-between gap-4">
              <h2 className="text-base font-semibold">{job.title}</h2>
              <span className="rounded-pill bg-brand-soft px-2.5 py-0.5 text-xs text-brand">
                {job.type}
              </span>
            </div>
            <p className="mt-1 text-sm text-muted">
              {job.company} · {job.location}
            </p>
            <p className="mt-3 text-sm">{job.blurb}</p>
            <p className="mt-3 text-xs text-muted">Posted {job.posted}</p>
          </li>
        ))}
      </ul>
    </main>
  );
}
