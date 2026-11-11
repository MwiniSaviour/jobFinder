import "dotenv/config";
import { getPrisma, closePrisma } from "./db.js";

type Prisma = ReturnType<typeof getPrisma>;

type EmployerSeed = {
  id: string;
  clerkUserId: string;
  email: string;
  name: string;
  role: "PROVIDER";
  createdAt: Date;
};

type JobSeed = {
  id: string;
  title: string;
  description: string;
  company: string;
  jobType: string;
  category: string;
  salaryAmount: number | null;
  salaryFrom: boolean | null;
  salaryEst: boolean | null;
  rating: number | null;
  reviews: number | null;
  createdAt: Date;
  employerId: string;
};

const EMPLOYER_SEEDS: EmployerSeed[] = [
  {
    id: "seed-employer-1",
    clerkUserId: "seed-employer-1",
    email: "seed-employer-1@jobfinder.dev",
    name: "Seed Employer 1",
    role: "PROVIDER",
    createdAt: new Date("2026-11-11T08:00:00.000Z"),
  },
  {
    id: "seed-employer-2",
    clerkUserId: "seed-employer-2",
    email: "seed-employer-2@jobfinder.dev",
    name: "Seed Employer 2",
    role: "PROVIDER",
    createdAt: new Date("2026-11-01T06:30:00.000Z"),
  },
  {
    id: "seed-employer-3",
    clerkUserId: "seed-employer-3",
    email: "seed-employer-3@jobfinder.dev",
    name: "Seed Employer 3",
    role: "PROVIDER",
    createdAt: new Date("2026-09-20T06:30:00.000Z"),
  },
];

const JOB_SEEDS: JobSeed[] = [
  {
    id: "seed-job-1",
    title: "Delivery Driver",
    description:
      "Deliver orders across Accra using our own motorbike with a provided fuel allowance. Free rider jacket, weekly fuel stipend and daily payouts for riders based in Madina, Tema and Spintex.",
    company: "AccraFleet",
    jobType: "Full-time",
    category: "Delivery",
    salaryAmount: 2200,
    salaryFrom: true,
    salaryEst: false,
    rating: 4.6,
    reviews: 128,
    createdAt: new Date("2026-11-11T08:30:00.000Z"),
    employerId: "seed-employer-1",
  },
  {
    id: "seed-job-2",
    title: "Delivery Rider",
    description:
      "Part-time rider needed for food deliveries around Osu and Airport Residential. Flexible evening shifts, use your own phone and earn per completed trip with weekly bonus incentives.",
    company: "FreshCart Market",
    jobType: "Part-time",
    category: "Delivery",
    salaryAmount: 1400,
    salaryFrom: false,
    salaryEst: true,
    rating: 4.2,
    reviews: 64,
    createdAt: new Date("2026-11-11T07:05:00.000Z"),
    employerId: "seed-employer-2",
  },
  {
    id: "seed-job-3",
    title: "Barista",
    description:
      "Prepare espresso drinks and pastries for our busy Harbour Coffee branch on Oxford Street. Full training on the machine, staff meals and a free drink on every shift.",
    company: "Harbor Coffee",
    jobType: "Full-time",
    category: "Food & drink",
    salaryAmount: 1800,
    salaryFrom: true,
    salaryEst: true,
    rating: 4.8,
    reviews: 212,
    createdAt: new Date("2026-11-10T16:40:00.000Z"),
    employerId: "seed-employer-1",
  },
  {
    id: "seed-job-4",
    title: "Frontend Developer Intern",
    description:
      "Six-month internship building accessible React interfaces for our client products. Mentorship from senior engineers, weekly code reviews and a possible conversion to a full-time role.",
    company: "Moonrise Studio",
    jobType: "Internship",
    category: "Tech",
    salaryAmount: null,
    salaryFrom: false,
    salaryEst: false,
    rating: null,
    reviews: null,
    createdAt: new Date("2026-11-10T09:15:00.000Z"),
    employerId: "seed-employer-3",
  },
  {
    id: "seed-job-5",
    title: "IT Support Technician",
    description:
      "Contract role supporting small business clients with hardware, networking and printer maintenance. On-site visits across Accra with a company van, fuel allowance and a toolkit provided.",
    company: "BlueWave Logistics",
    jobType: "Contract",
    category: "Tech",
    salaryAmount: 3600,
    salaryFrom: true,
    salaryEst: false,
    rating: 4.3,
    reviews: 37,
    createdAt: new Date("2026-11-08T13:20:00.000Z"),
    employerId: "seed-employer-2",
  },
  {
    id: "seed-job-6",
    title: "Commercial Driver",
    description:
      "Deliver cargo to retail customers around Greater Accra with our 3.5 tonne trucks. Valid Ghanaian licence class B, medicals and defensive driving training provided on joining.",
    company: "AccraFleet",
    jobType: "Full-time",
    category: "Driving",
    salaryAmount: 2600,
    salaryFrom: false,
    salaryEst: true,
    rating: 4.1,
    reviews: 89,
    createdAt: new Date("2026-11-06T10:00:00.000Z"),
    employerId: "seed-employer-3",
  },
  {
    id: "seed-job-7",
    title: "Teaching Assistant",
    description:
      "Support the Year 5 and 6 classroom at Greenfield Academy with lesson preparation and pupil supervision. Teacher training provided, Monday to Friday morning shifts during term.",
    company: "Greenfield Academy",
    jobType: "Part-time",
    category: "Education",
    salaryAmount: 1500,
    salaryFrom: true,
    salaryEst: true,
    rating: 4.5,
    reviews: 51,
    createdAt: new Date("2026-11-03T14:30:00.000Z"),
    employerId: "seed-employer-2",
  },
  {
    id: "seed-job-8",
    title: "Warehouse Operative",
    description:
      "Pick, pack and load orders at our Tema distribution centre for a six-week temporary contract. Day and night shifts available with a transport allowance for early starts.",
    company: "BlueWave Logistics",
    jobType: "Temporary",
    category: "Warehouse",
    salaryAmount: 1650,
    salaryFrom: false,
    salaryEst: false,
    rating: 3.9,
    reviews: 24,
    createdAt: new Date("2026-10-29T08:00:00.000Z"),
    employerId: "seed-employer-1",
  },
  {
    id: "seed-job-9",
    title: "Retail Sales Assistant",
    description:
      "Serve customers on the shop floor at FreshCart Market and support the checkout counter. Product training provided, weekly restock bonus and a staff discount on groceries.",
    company: "FreshCart Market",
    jobType: "Part-time",
    category: "Retail",
    salaryAmount: null,
    salaryFrom: false,
    salaryEst: false,
    rating: 4.4,
    reviews: 143,
    createdAt: new Date("2026-10-24T15:45:00.000Z"),
    employerId: "seed-employer-1",
  },
  {
    id: "seed-job-10",
    title: "Office Cleaner",
    description:
      "Contract cleaning for our head office and guest areas, three evenings a week. Cleaning supplies and uniform provided, own transport is an advantage.",
    company: "Sparkle Home Services",
    jobType: "Contract",
    category: "Cleaning",
    salaryAmount: null,
    salaryFrom: false,
    salaryEst: false,
    rating: null,
    reviews: null,
    createdAt: new Date("2026-10-18T11:10:00.000Z"),
    employerId: "seed-employer-2",
  },
  {
    id: "seed-job-11",
    title: "Administrative Assistant",
    description:
      "Handle invoices, vendor records and front-desk queries at our head office in Accra. Strong spreadsheet skills required, full training on our finance and CRM system.",
    company: "Moonrise Studio",
    jobType: "Full-time",
    category: "Office",
    salaryAmount: 2400,
    salaryFrom: true,
    salaryEst: false,
    rating: 4.7,
    reviews: 96,
    createdAt: new Date("2026-10-12T09:25:00.000Z"),
    employerId: "seed-employer-3",
  },
  {
    id: "seed-job-12",
    title: "Security Guard",
    description:
      "Night shift guard for a residential estate in Tema, monitoring CCTV and controlling visitor entry. Uniform and equipment provided, accommodation available on site.",
    company: "Sentinel Security",
    jobType: "Full-time",
    category: "Security",
    salaryAmount: 1900,
    salaryFrom: false,
    salaryEst: true,
    rating: 4.0,
    reviews: 58,
    createdAt: new Date("2026-10-05T12:00:00.000Z"),
    employerId: "seed-employer-3",
  },
  {
    id: "seed-job-13",
    title: "Caregiver",
    description:
      "Support elderly clients with daily living, medication reminders and companionship. Experience with dementia care is an advantage, we cover training and certification.",
    company: "Haven Home Care",
    jobType: "Part-time",
    category: "Caregiving",
    salaryAmount: 1300,
    salaryFrom: true,
    salaryEst: true,
    rating: 4.9,
    reviews: 175,
    createdAt: new Date("2026-09-28T14:15:00.000Z"),
    employerId: "seed-employer-1",
  },
  {
    id: "seed-job-14",
    title: "Events Coordinator",
    description:
      "Coordinate vendors, stage setup and guest lists for weddings and corporate events. Fast-paced role with weekend work, transport allowance and training on our booking system.",
    company: "Accra Events Hub",
    jobType: "Full-time",
    category: "Events",
    salaryAmount: 2100,
    salaryFrom: false,
    salaryEst: false,
    rating: null,
    reviews: 19,
    createdAt: new Date("2026-09-18T10:35:00.000Z"),
    employerId: "seed-employer-2",
  },
];

async function seedEmployers(prisma: Prisma): Promise<number> {
  for (const seed of EMPLOYER_SEEDS) {
    await prisma.user.upsert({
      where: { id: seed.id },
      update: {
        clerkUserId: seed.clerkUserId,
        email: seed.email,
        name: seed.name,
        role: seed.role,
        createdAt: seed.createdAt,
      },
      create: {
        id: seed.id,
        clerkUserId: seed.clerkUserId,
        email: seed.email,
        name: seed.name,
        role: seed.role,
        createdAt: seed.createdAt,
      },
    });
  }
  return EMPLOYER_SEEDS.length;
}

async function seedJobs(prisma: Prisma): Promise<number> {
  for (const seed of JOB_SEEDS) {
    await prisma.jobPost.upsert({
      where: { id: seed.id },
      update: {
        title: seed.title,
        description: seed.description,
        company: seed.company,
        jobType: seed.jobType,
        category: seed.category,
        salaryAmount: seed.salaryAmount,
        salaryFrom: seed.salaryFrom,
        salaryEst: seed.salaryEst,
        rating: seed.rating,
        reviews: seed.reviews,
        createdAt: seed.createdAt,
        author: { connect: { id: seed.employerId } },
      },
      create: {
        id: seed.id,
        title: seed.title,
        description: seed.description,
        company: seed.company,
        jobType: seed.jobType,
        category: seed.category,
        salaryAmount: seed.salaryAmount,
        salaryFrom: seed.salaryFrom,
        salaryEst: seed.salaryEst,
        rating: seed.rating,
        reviews: seed.reviews,
        createdAt: seed.createdAt,
        author: { connect: { id: seed.employerId } },
      },
    });
  }
  return JOB_SEEDS.length;
}

async function main(): Promise<void> {
  const prisma = getPrisma();
  try {
    const employerCount = await seedEmployers(prisma);
    const jobCount = await seedJobs(prisma);
    console.log(`Upserted ${employerCount} employers.`);
    console.log(`Upserted ${jobCount} jobs.`);
    console.log("Seed complete.");
  } finally {
    await closePrisma();
  }
}

main().catch((error) => {
  console.error("Seed failed:", error);
  process.exitCode = 1;
});
