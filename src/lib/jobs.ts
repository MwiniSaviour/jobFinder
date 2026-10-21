export type SortKey = "new" | "pay";

export type Salary = {
  from?: boolean;
  est?: boolean;
  amount: number;
} | null;

export type JobListing = {
  id: number;
  title: string;
  company: string;
  location: string;
  type: string;
  posted: string;
  blurb: string;
  category: string;
  salary: Salary;
  rating: number;
  reviews: number;
};

export function salaryLabel(salary: Salary): string {
  if (!salary) return "";
  const hourly = `$${salary.amount.toFixed(2).replace(/\.00$/, "")}/hr`;
  return `${salary.from ? "From " : ""}${hourly}${salary.est ? " est." : ""}`;
}

export const CATEGORIES = ["Delivery", "Food & drink", "Tech", "Driving", "Education", "Warehouse"];

export const DEFAULT_FILTERS = {
  categories: [] as string[],
  includeUnlisted: false,
  sort: "new" as SortKey,
};

export const SORT_LABELS: Record<SortKey, string> = {
  new: "Newest",
  pay: "Highest pay",
};

export const jobs: JobListing[] = [
  {
    id: 1,
    title: "Delivery Driver",
    company: "FreshCart Market",
    location: "Riverside",
    type: "Hourly",
    posted: "2 days ago",
    blurb: "Evening and weekend grocery runs around the neighborhood. Own vehicle preferred.",
    category: "Delivery",
    salary: { amount: 19 },
    rating: 4.7,
    reviews: 128,
  },
  {
    id: 2,
    title: "Barista",
    company: "Harbor Coffee",
    location: "City Center",
    type: "Weekend",
    posted: "3 days ago",
    blurb: "Front-of-house service at a cozy neighborhood cafe. Premium espresso experience a plus.",
    category: "Food & drink",
    salary: { amount: 18.5 },
    rating: 4.6,
    reviews: 94,
  },
  {
    id: 3,
    title: "Frontend Developer",
    company: "Moonrise Studio",
    location: "Remote",
    type: "Full-time",
    posted: "4 days ago",
    blurb: "Build clean client-facing interfaces with React and Tailwind for early-stage products.",
    category: "Tech",
    salary: { from: true, est: true, amount: 55 },
    rating: 4.9,
    reviews: 61,
  },
  {
    id: 4,
    title: "Ride-Hail Driver",
    company: "Lantern Rides",
    location: "All districts",
    type: "Per-trip",
    posted: "5 days ago",
    blurb: "Drive flexible city routes with weekly payouts and no dress code requirements.",
    category: "Driving",
    salary: { from: true, est: true, amount: 16 },
    rating: 4.4,
    reviews: 210,
  },
  {
    id: 5,
    title: "After-School Tutor",
    company: "BrightNote Learning",
    location: "Hillcrest",
    type: "Part-time",
    posted: "6 days ago",
    blurb: "One-on-one math and science tutoring for middle school students after dismissal.",
    category: "Education",
    salary: { from: true, est: true, amount: 15 },
    rating: 4.8,
    reviews: 42,
  },
  {
    id: 6,
    title: "Warehouse Packer",
    company: "Codex Depot",
    location: "Industrial Park",
    type: "Full-time",
    posted: "1 week ago",
    blurb: "Order picking and packing with paid overtime during seasonal peaks.",
    category: "Warehouse",
    salary: { amount: 17.5 },
    rating: 4.2,
    reviews: 75,
  },
  {
    id: 7,
    title: "Restaurant Shift Lead",
    company: "Harbor Coffee",
    location: "City Center",
    type: "Full-time",
    posted: "3 days ago",
    blurb: "Own the closing shift at our busiest cafe. Coordinate the team and keep service moving through the weekend rush.",
    category: "Food & drink",
    salary: null,
    rating: 4.5,
    reviews: 33,
  },
];
