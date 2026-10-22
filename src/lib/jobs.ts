import { JOB_CATEGORIES } from "./categories";
import { formatCedis } from "./geo";

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
  const pay = formatCedis(salary.amount) + "/mo";
  return `${salary.from ? "From " : ""}${pay}${salary.est ? " est." : ""}`;
}

export const CATEGORIES = JOB_CATEGORIES.map((category) => category.name);

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
    salary: { amount: 2200 },
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
    salary: { amount: 2000 },
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
    salary: { from: true, est: true, amount: 6500 },
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
    salary: { from: true, est: true, amount: 2600 },
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
    salary: { from: true, est: true, amount: 1800 },
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
    salary: { amount: 2400 },
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
  {
    id: 8,
    title: "Retail Associate",
    company: "Greenline Market",
    location: "Maplewood",
    type: "Part-time",
    posted: "1 week ago",
    blurb: "Stock shelves and help shoppers during evening and weekend shifts.",
    category: "Retail",
    salary: { amount: 1700 },
    rating: 4.4,
    reviews: 87,
  },
  {
    id: 9,
    title: "Office Cleaner",
    company: "SparkleWorks",
    location: "Downtown",
    type: "Part-time",
    posted: "4 days ago",
    blurb: "Light cleaning of offices after hours. Supplies and training provided.",
    category: "Cleaning",
    salary: { amount: 1600 },
    rating: 4.5,
    reviews: 56,
  },
  {
    id: 10,
    title: "Data Entry Clerk",
    company: "LedgerWorks",
    location: "Remote",
    type: "Remote",
    posted: "6 days ago",
    blurb: "Enter invoices and receipts into our ledger system with steady weekly hours.",
    category: "Office",
    salary: { est: true, amount: 2500 },
    rating: 4.6,
    reviews: 29,
  },
  {
    id: 11,
    title: "Security Guard",
    company: "Northline Security",
    location: "Convention Center",
    type: "Full-time",
    posted: "5 days ago",
    blurb: "Overnight patrols and visitor check-ins at the convention center.",
    category: "Security",
    salary: { from: true, amount: 2300 },
    rating: 4.3,
    reviews: 102,
  },
  {
    id: 12,
    title: "Caregiving Companion",
    company: "WarmHand Home Care",
    location: "Riverside",
    type: "Part-time",
    posted: "1 day ago",
    blurb: "Spend afternoons with seniors: conversation, walks, and light meal prep.",
    category: "Caregiving",
    salary: { amount: 2400 },
    rating: 4.8,
    reviews: 64,
  },
  {
    id: 13,
    title: "Event Setup Crew",
    company: "Fairline Events",
    location: "Fairgrounds",
    type: "Weekend",
    posted: "1 day ago",
    blurb: "Set up booths, chairs, and signage before weekend festivals and fairs.",
    category: "Events",
    salary: null,
    rating: 4.6,
    reviews: 21,
  },
];
