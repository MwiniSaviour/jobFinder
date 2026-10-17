export type WorkMode = "Remote" | "Hybrid" | "On-site";
export type Seniority = "Entry" | "Mid" | "Senior" | "Lead";
export type EmploymentType = "Full-time" | "Contract" | "Part-time";
export type Department =
  | "Design"
  | "Engineering"
  | "Product"
  | "Marketing"
  | "Data"
  | "Operations"
  | "Customer Success"
  | "Editorial";

export type HiringStep = { title: string; detail: string; duration: string };

export type Job = {
  slug: string;
  title: string;
  company: string;
  department: Department;
  location: string;
  workMode: WorkMode;
  employmentType: EmploymentType;
  seniority: Seniority;
  salaryMin: number;
  salaryMax: number;
  currency: string;
  salaryPeriod: "year" | "month";
  postedAt: string;
  applicants: number;
  featured?: boolean;
  summary: string;
  /** One sharp line for cards and search results. */
  tagline: string;
  responsibilities: string[];
  requirements: string[];
  niceToHave: string[];
  skills: string[];
  benefits: string[];
  process?: HiringStep[];
  teamNote?: string;
};

export const departments: Department[] = [
  "Design",
  "Engineering",
  "Product",
  "Marketing",
  "Data",
  "Operations",
  "Customer Success",
  "Editorial",
];

export const workModes: WorkMode[] = ["Remote", "Hybrid", "On-site"];
export const seniorities: Seniority[] = ["Entry", "Mid", "Senior", "Lead"];
export const employmentTypes: EmploymentType[] = [
  "Full-time",
  "Contract",
  "Part-time",
];

export const defaultProcess: HiringStep[] = [
  {
    title: "Intro conversation",
    detail:
      "A 30-minute call with the hiring manager. We'll talk about the role, your work, and what you want next.",
    duration: "30 min",
  },
  {
    title: "Craft conversation",
    detail:
      "Walk us through a project you're proud of. No unpaid take-homes, no trick questions.",
    duration: "60 min",
  },
  {
    title: "Meet the team",
    detail:
      "Two conversations with people you'd work with day to day. Ask them anything.",
    duration: "2 × 45 min",
  },
  {
    title: "Decision & offer",
    detail:
      "A written decision within three working days, with space to ask questions before you answer.",
    duration: "Within 3 days",
  },
];

export const jobs: Job[] = [
  {
    slug: "senior-product-designer",
    title: "Senior Product Designer",
    company: "lumen",
    department: "Design",
    location: "Remote (UTC±3)",
    workMode: "Remote",
    employmentType: "Full-time",
    seniority: "Senior",
    salaryMin: 120000,
    salaryMax: 150000,
    currency: "USD",
    salaryPeriod: "year",
    postedAt: "2026-10-15",
    applicants: 64,
    featured: true,
    summary:
      "Shape the canvas where 9,000 teams sketch, prototype, and present their best work. You'll own big, ambiguous problems with a small, senior design team.",
    tagline: "Own the canvas 9,000 teams think on.",
    responsibilities: [
      "Lead design for the core editor — selection, arrangement, comments, and the thousand small details that make it feel effortless.",
      "Pair with two engineers to ship weekly, from first sketch through production QA.",
      "Turn research and support signals into a considered, evidence-led roadmap.",
      "Raise the craft bar through critiques, writing, and a Figma library people actually use.",
    ],
    requirements: [
      "5+ years designing complex, professional-grade software.",
      "A portfolio showing depth in interaction and systems thinking, not only final screens.",
      "Comfortable balancing craft with speed inside a small team.",
      "Strong written communication — much of the work happens async.",
    ],
    niceToHave: [
      "Motion design or prototyping in code",
      "Experience with multiplayer or canvas-based products",
      "Design systems at scale across several product surfaces",
    ],
    skills: [
      "Product design",
      "Interaction design",
      "Design systems",
      "Prototyping",
      "Figma",
    ],
    benefits: [
      "Remote-first, with a four-day summer week",
      "$2,000 annual learning budget",
      "Equity from day one",
      "Annual team offsite",
    ],
    teamNote:
      "You'll join a design team of four, reporting to the Head of Design. The team writes more than it meets.",
    process: [
      {
        title: "Intro conversation",
        detail:
          "A 30-minute call with Maya, our Head of Design. We'll talk about the role, your work, and what you want next.",
        duration: "30 min",
      },
      {
        title: "Portfolio walkthrough",
        detail:
          "Bring one or two projects. We care about the decisions, the constraints, and what you'd do differently now.",
        duration: "60 min",
      },
      {
        title: "Craft session",
        detail:
          "A live, collaborative design exercise with two teammates. Paid if it takes more than an hour.",
        duration: "90 min",
      },
      {
        title: "Meet the team & decide",
        detail:
          "Two conversations with engineers and a founder. A written decision within three working days.",
        duration: "Within 3 days",
      },
    ],
  },
  {
    slug: "design-systems-lead",
    title: "Design Systems Lead",
    company: "lumen",
    department: "Design",
    location: "London, UK",
    workMode: "Hybrid",
    employmentType: "Full-time",
    seniority: "Lead",
    salaryMin: 145000,
    salaryMax: 170000,
    currency: "USD",
    salaryPeriod: "year",
    postedAt: "2026-10-12",
    applicants: 38,
    summary:
      "Own the language of the product — tokens, components, documentation, and the partnership that makes a design system stick.",
    tagline: "Give a product one clear language.",
    responsibilities: [
      "Define and evolve the Lumen design system across web, desktop, and mobile.",
      "Partner with engineering on tokens, accessibility, and release tooling.",
      "Write documentation that people read on purpose.",
      "Coach designers and engineers in contributing to the system.",
    ],
    requirements: [
      "6+ years in product design, with 2+ leading a design system.",
      "Fluency with tokens, component APIs, and accessible patterns.",
      "Experience shipping a system adopted by multiple teams.",
      "A clear point of view on how systems fail.",
    ],
    niceToHave: [
      "Front-end literacy (React, CSS)",
      "Experience with Figma variables and codegen",
      "Public writing on systems",
    ],
    skills: [
      "Design systems",
      "Accessibility",
      "Component design",
      "Documentation",
      "Figma",
    ],
    benefits: [
      "Hybrid with two days in the London studio",
      "Equity from day one",
      "$2,000 learning budget",
      "30 days leave",
    ],
  },
  {
    slug: "design-engineer",
    title: "Design Engineer",
    company: "lumen",
    department: "Engineering",
    location: "Remote (UTC±3)",
    workMode: "Remote",
    employmentType: "Full-time",
    seniority: "Senior",
    salaryMin: 135000,
    salaryMax: 160000,
    currency: "USD",
    salaryPeriod: "year",
    postedAt: "2026-10-09",
    applicants: 51,
    featured: true,
    summary:
      "Live on the seam between design and engineering — building the interactions and interface details that make Lumen feel inevitable.",
    tagline: "Build the details that make it feel inevitable.",
    responsibilities: [
      "Prototype and ship high-fidelity interface work directly in the product.",
      "Build and maintain the component layer alongside the design system team.",
      "Partner with designers on motion, gestures, and accessibility details.",
      "Improve the tooling that shortens the distance between idea and release.",
    ],
    requirements: [
      "Strong React, TypeScript, and CSS fundamentals.",
      "A portfolio of shipped, detail-rich product interfaces.",
      "Comfortable making design decisions in code.",
      "Care for performance and accessibility as design concerns.",
    ],
    niceToHave: [
      "Canvas or WebGL experience",
      "Motion design",
      "Contributing to open-source UI libraries",
    ],
    skills: [
      "React",
      "TypeScript",
      "CSS",
      "Interaction design",
      "Accessibility",
    ],
    benefits: [
      "Remote-first, four-day summer week",
      "Equity from day one",
      "Home office stipend",
      "Annual offsite",
    ],
  },
  {
    slug: "marketing-lead",
    title: "Marketing Lead",
    company: "kestrel",
    department: "Marketing",
    location: "Remote (Africa)",
    workMode: "Remote",
    employmentType: "Full-time",
    seniority: "Lead",
    salaryMin: 70000,
    salaryMax: 95000,
    currency: "USD",
    salaryPeriod: "year",
    postedAt: "2026-10-16",
    applicants: 87,
    featured: true,
    summary:
      "Tell the story of Africa's payment infrastructure to the founders and finance teams who need it — with clarity, not hype.",
    tagline: "Tell the story of Africa's payment rails.",
    responsibilities: [
      "Own positioning, messaging, and the Kestrel brand across every channel.",
      "Build a content engine around merchants, developers, and finance leaders.",
      "Run launches with product and sales, from narrative to enablement.",
      "Set the measurement framework and report honestly on what works.",
    ],
    requirements: [
      "5+ years in B2B marketing, ideally fintech or infrastructure.",
      "Excellent writing and editing instincts.",
      "Experience owning a budget and a pipeline target.",
      "Comfortable working across African markets and time zones.",
    ],
    niceToHave: [
      "Developer marketing experience",
      "Public speaking or community building",
      "Agency management",
    ],
    skills: [
      "Positioning",
      "Content strategy",
      "B2B marketing",
      "Brand",
      "Analytics",
    ],
    benefits: [
      "Remote across Africa",
      "Private health cover",
      "13th-month bonus",
      "Learning budget",
    ],
  },
  {
    slug: "senior-backend-engineer-payments",
    title: "Senior Backend Engineer, Payments",
    company: "kestrel",
    department: "Engineering",
    location: "Accra, Ghana",
    workMode: "Hybrid",
    employmentType: "Full-time",
    seniority: "Senior",
    salaryMin: 70000,
    salaryMax: 95000,
    currency: "USD",
    salaryPeriod: "year",
    postedAt: "2026-10-14",
    applicants: 42,
    summary:
      "Build the ledger, reconciliation, and payout systems that thousands of businesses rely on every day across 14 markets.",
    tagline: "Move money reliably across 14 markets.",
    responsibilities: [
      "Design and ship reliable services for payments, payouts, and reconciliation.",
      "Improve observability and incident response for money-movement systems.",
      "Work closely with product and compliance on new market launches.",
      "Mentor engineers and raise the bar on transaction correctness.",
    ],
    requirements: [
      "5+ years building backend systems in production.",
      "Strong Go, Java, or TypeScript, with relational databases.",
      "Experience with idempotency, ledgers, or financial reconciliation.",
      "Careful, test-driven approach to high-stakes code.",
    ],
    niceToHave: [
      "Mobile money integrations",
      "Event-driven architecture",
      "PCI or financial compliance exposure",
    ],
    skills: [
      "Go",
      "PostgreSQL",
      "Distributed systems",
      "Payments",
      "Observability",
    ],
    benefits: [
      "Hybrid in Accra",
      "Private health cover",
      "13th-month bonus",
      "Equity options",
    ],
  },
  {
    slug: "product-designer-kestrel",
    title: "Product Designer",
    company: "kestrel",
    department: "Design",
    location: "Accra, Ghana",
    workMode: "Hybrid",
    employmentType: "Full-time",
    seniority: "Mid",
    salaryMin: 48000,
    salaryMax: 65000,
    currency: "USD",
    salaryPeriod: "year",
    postedAt: "2026-10-07",
    applicants: 58,
    summary:
      "Design the merchant dashboard and developer experience for payment tools used in low-bandwidth, high-stakes environments.",
    tagline: "Design payments that work on a slow connection.",
    responsibilities: [
      "Design end-to-end flows for onboarding, payouts, and reconciliation.",
      "Run usability sessions with merchants and finance teams in Accra.",
      "Contribute to a shared component library used across products.",
      "Work with support to turn recurring issues into product fixes.",
    ],
    requirements: [
      "3+ years designing digital products.",
      "Strong interaction and information design fundamentals.",
      "Comfortable testing with real customers.",
      "A portfolio with shipped work and clear rationale.",
    ],
    niceToHave: [
      "Fintech experience",
      "Data visualisation",
      "Working in low-bandwidth contexts",
    ],
    skills: [
      "Product design",
      "User research",
      "Data visualisation",
      "Figma",
      "Design systems",
    ],
    benefits: [
      "Hybrid in Accra",
      "Private health cover",
      "13th-month bonus",
      "Learning budget",
    ],
  },
  {
    slug: "customer-success-lead",
    title: "Customer Success Lead",
    company: "northwind",
    department: "Customer Success",
    location: "Amsterdam, Netherlands",
    workMode: "Hybrid",
    employmentType: "Full-time",
    seniority: "Lead",
    salaryMin: 85000,
    salaryMax: 105000,
    currency: "USD",
    salaryPeriod: "year",
    postedAt: "2026-10-13",
    applicants: 36,
    featured: true,
    summary:
      "Own how Europe's most demanding shippers experience Northwind — from first pilot to measurable decarbonisation.",
    tagline: "Turn pilots into measurable climate impact.",
    responsibilities: [
      "Lead a team of four success managers across Amsterdam and Berlin.",
      "Own renewals, expansion, and the health signals behind them.",
      "Turn customer insight into a prioritised product feedback loop.",
      "Build onboarding that gets shippers to their first value fast.",
    ],
    requirements: [
      "5+ years in customer success or account management, 2+ leading people.",
      "Experience with technical or logistics products.",
      "Strong analytical habits and a calm approach to escalations.",
      "Fluent English; another European language is a plus.",
    ],
    niceToHave: [
      "Climate or sustainability reporting knowledge",
      "Supply chain experience",
      "SQL basics",
    ],
    skills: [
      "Customer success",
      "Team leadership",
      "Renewals",
      "Onboarding",
      "Analytics",
    ],
    benefits: [
      "Hybrid in Amsterdam",
      "32 days paid leave",
      "Public transport card",
      "Sabbatical after five years",
    ],
  },
  {
    slug: "operations-analyst",
    title: "Operations Analyst",
    company: "northwind",
    department: "Operations",
    location: "Berlin, Germany",
    workMode: "Hybrid",
    employmentType: "Full-time",
    seniority: "Mid",
    salaryMin: 55000,
    salaryMax: 70000,
    currency: "USD",
    salaryPeriod: "year",
    postedAt: "2026-10-06",
    applicants: 63,
    summary:
      "Find the kilometres that don't need to be driven. You'll turn messy logistics data into routing decisions partners trust.",
    tagline: "Cut the kilometres that don't need driving.",
    responsibilities: [
      "Analyse carrier performance and route utilisation across Europe.",
      "Build models and dashboards that support weekly operational decisions.",
      "Work with product on routing and emissions accuracy.",
      "Run experiments with carriers to reduce empty miles.",
    ],
    requirements: [
      "2–4 years in operations, analytics, or consulting.",
      "Strong SQL and spreadsheet modelling.",
      "Comfortable working with imperfect data.",
      "Clear written communication in English.",
    ],
    niceToHave: [
      "Python",
      "Logistics or freight experience",
      "Emissions accounting",
    ],
    skills: ["SQL", "Analytics", "Operations", "Data visualisation", "Excel"],
    benefits: [
      "Hybrid in Berlin",
      "32 days paid leave",
      "Public transport card",
      "Learning budget",
    ],
  },
  {
    slug: "senior-backend-engineer",
    title: "Senior Backend Engineer",
    company: "northwind",
    department: "Engineering",
    location: "Remote (Europe)",
    workMode: "Remote",
    employmentType: "Full-time",
    seniority: "Senior",
    salaryMin: 110000,
    salaryMax: 140000,
    currency: "USD",
    salaryPeriod: "year",
    postedAt: "2026-10-10",
    applicants: 47,
    summary:
      "Scale the routing and emissions engine behind cleaner European freight — the systems where data quality is the product.",
    tagline: "Scale the routing engine behind cleaner freight.",
    responsibilities: [
      "Build services for routing, carrier pricing, and emissions calculation.",
      "Improve data pipelines and the accuracy of upstream integrations.",
      "Design APIs used by partners and internal tooling.",
      "Document decisions and mentor the growing backend team.",
    ],
    requirements: [
      "5+ years building production backend systems.",
      "Strong Python or Kotlin, and PostgreSQL.",
      "Experience with data-heavy or geospatial systems.",
      "Comfortable owning services end to end.",
    ],
    niceToHave: ["Geospatial routing tools", "Event streaming", "Kubernetes"],
    skills: ["Python", "PostgreSQL", "APIs", "Geospatial", "Data pipelines"],
    benefits: [
      "Remote across Europe",
      "32 days paid leave",
      "Home office budget",
      "Annual team week",
    ],
  },
  {
    slug: "senior-product-designer-basin",
    title: "Senior Product Designer",
    company: "basin",
    department: "Design",
    location: "Toronto, Canada",
    workMode: "Hybrid",
    employmentType: "Full-time",
    seniority: "Senior",
    salaryMin: 120000,
    salaryMax: 145000,
    currency: "USD",
    salaryPeriod: "year",
    postedAt: "2026-10-16",
    applicants: 71,
    featured: true,
    summary:
      "Design clinical software that gives time back to caregivers — calm, fast, and trustworthy under pressure.",
    tagline: "Give caregivers their time back.",
    responsibilities: [
      "Own design for scheduling and patient intake across web and tablet.",
      "Spend time observing clinics and testing in context.",
      "Work within strict privacy and accessibility constraints.",
      "Improve the design system used by clinicians every day.",
    ],
    requirements: [
      "5+ years designing product interfaces, ideally for complex domains.",
      "Strong systems thinking and accessibility knowledge.",
      "Experience researching with frontline workers.",
      "Excellent collaboration with engineers and clinicians.",
    ],
    niceToHave: [
      "Healthcare or regulated products",
      "Service design",
      "Designing for tablet and touch",
    ],
    skills: [
      "Product design",
      "Accessibility",
      "User research",
      "Design systems",
      "Service design",
    ],
    benefits: [
      "Hybrid in Toronto",
      "Extended health and dental",
      "4-day summer weeks",
      "Wellness allowance",
    ],
  },
  {
    slug: "implementation-specialist",
    title: "Implementation Specialist",
    company: "basin",
    department: "Customer Success",
    location: "Remote (Canada)",
    workMode: "Remote",
    employmentType: "Full-time",
    seniority: "Mid",
    salaryMin: 60000,
    salaryMax: 75000,
    currency: "USD",
    salaryPeriod: "year",
    postedAt: "2026-10-02",
    applicants: 44,
    summary:
      "Guide clinics from signed agreement to confident first week — translating messy workflows into a clean setup.",
    tagline: "Take clinics from signed to confident.",
    responsibilities: [
      "Run onboarding projects for 8–12 clinics at a time.",
      "Configure scheduling, intake, and billing with each practice.",
      "Train administrators and clinicians in short, practical sessions.",
      "Document recurring friction for the product team.",
    ],
    requirements: [
      "2+ years in implementation, support, or practice management.",
      "Exceptional organisation and follow-through.",
      "Comfortable explaining software to non-technical users.",
      "Remote work discipline in a healthcare context.",
    ],
    niceToHave: [
      "Clinical practice experience",
      "Basic SQL",
      "Bilingual English/French",
    ],
    skills: [
      "Onboarding",
      "Project management",
      "Healthcare",
      "Training",
      "Communication",
    ],
    benefits: [
      "Remote across Canada",
      "Extended health and dental",
      "4-day summer weeks",
      "Wellness allowance",
    ],
  },
  {
    slug: "staff-writer",
    title: "Staff Writer, Systems",
    company: "aperture",
    department: "Editorial",
    location: "New York, USA",
    workMode: "On-site",
    employmentType: "Full-time",
    seniority: "Senior",
    salaryMin: 90000,
    salaryMax: 110000,
    currency: "USD",
    salaryPeriod: "year",
    postedAt: "2026-10-11",
    applicants: 29,
    summary:
      "Report on the systems behind everyday life — housing, water, food, work — with the patience the subjects deserve.",
    tagline: "Report the systems behind everyday life.",
    responsibilities: [
      "Pitch and deliver two substantial reported features per quarter.",
      "Build sources across institutions, agencies, and communities.",
      "Work with photography and data colleagues from the first draft.",
      "Contribute to audio and live formats when the story calls for it.",
    ],
    requirements: [
      "5+ years of reported journalism, with long-form clips.",
      "A clear, humane writing voice.",
      "Comfortable with public records and data sets.",
      "Based in or willing to relocate to New York.",
    ],
    niceToHave: [
      "Audio or documentary experience",
      "Data journalism",
      "Photography",
    ],
    skills: [
      "Reporting",
      "Long-form writing",
      "Research",
      "Interviews",
      "Editing",
    ],
    benefits: [
      "Four-day publishing week",
      "Full health cover",
      "Annual equipment budget",
      "Parental leave",
    ],
  },
  {
    slug: "motion-designer",
    title: "Motion Designer",
    company: "aperture",
    department: "Design",
    location: "New York, USA",
    workMode: "Hybrid",
    employmentType: "Contract",
    seniority: "Mid",
    salaryMin: 80000,
    salaryMax: 100000,
    currency: "USD",
    salaryPeriod: "year",
    postedAt: "2026-10-08",
    applicants: 33,
    summary:
      "Give Aperture's stories a visual rhythm — short-form motion, title systems, and documentary graphics with restraint.",
    tagline: "Give documentary stories a visual rhythm.",
    responsibilities: [
      "Design and animate graphics for video and social formats.",
      "Build reusable title and lower-third systems.",
      "Collaborate with editors and photographers on story treatment.",
      "Keep a small, documented motion language.",
    ],
    requirements: [
      "3+ years motion design for editorial or documentary work.",
      "Strong typography and pacing instincts.",
      "Proficiency in After Effects and Figma.",
      "A reel with clear editorial judgement.",
    ],
    niceToHave: [
      "3D or Cinema 4D",
      "Sound design",
      "Live production experience",
    ],
    skills: ["Motion design", "After Effects", "Typography", "Video", "Figma"],
    benefits: [
      "Four-day publishing week",
      "Full health cover",
      "Equipment budget",
      "Flexible hybrid",
    ],
  },
  {
    slug: "ecommerce-manager",
    title: "Ecommerce Manager",
    company: "pine-and-co",
    department: "Marketing",
    location: "Copenhagen, Denmark",
    workMode: "Hybrid",
    employmentType: "Full-time",
    seniority: "Mid",
    salaryMin: 55000,
    salaryMax: 70000,
    currency: "USD",
    salaryPeriod: "year",
    postedAt: "2026-10-05",
    applicants: 39,
    summary:
      "Grow a store that sells six new products a year and repairs everything it makes — thoughtfully, not aggressively.",
    tagline: "Sell fewer, better things — thoughtfully.",
    responsibilities: [
      "Own the ecommerce calendar, merchandising, and conversion.",
      "Run lifecycle email and CRM with a light touch.",
      "Work with the studio on product launches and photography.",
      "Report on what customers actually do, not just what they say.",
    ],
    requirements: [
      "3+ years in ecommerce or digital marketing.",
      "Hands-on with Shopify or a comparable platform.",
      "Comfortable with analytics and A/B testing.",
      "An eye for editorial merchandising.",
    ],
    niceToHave: ["Homeware or design retail", "Klaviyo", "Basic HTML/CSS"],
    skills: ["Ecommerce", "Shopify", "CRM", "Analytics", "Copywriting"],
    benefits: [
      "Hybrid studio schedule",
      "Staff discount",
      "Pension contribution",
      "Volunteer days",
    ],
  },
  {
    slug: "product-designer-pine",
    title: "Product Designer",
    company: "pine-and-co",
    department: "Design",
    location: "Remote (Europe)",
    workMode: "Remote",
    employmentType: "Full-time",
    seniority: "Mid",
    salaryMin: 60000,
    salaryMax: 80000,
    currency: "USD",
    salaryPeriod: "year",
    postedAt: "2026-09-30",
    applicants: 54,
    summary:
      "Design the digital side of a very physical business — product pages, repair guides, and a checkout that respects attention.",
    tagline: "Design a store that respects attention.",
    responsibilities: [
      "Design end-to-end shopping and post-purchase experiences.",
      "Improve repair documentation and self-service.",
      "Team up with marketing on editorial product storytelling.",
      "Evolve the digital design system alongside the brand studio.",
    ],
    requirements: [
      "3+ years designing consumer-facing digital products.",
      "Strong typographic and layout craft.",
      "Experience with ecommerce constraints and accessibility.",
      "Comfortable working with a small, opinionated team.",
    ],
    niceToHave: [
      "Sustainable retail",
      "Figma to Shopify workflows",
      "Photography direction",
    ],
    skills: [
      "Product design",
      "Ecommerce",
      "Typography",
      "Accessibility",
      "Figma",
    ],
    benefits: [
      "Remote across Europe",
      "Staff discount",
      "Pension contribution",
      "Two volunteer days",
    ],
  },
  {
    slug: "developer-advocate",
    title: "Developer Advocate",
    company: "vela",
    department: "Marketing",
    location: "Remote (Europe)",
    workMode: "Remote",
    employmentType: "Full-time",
    seniority: "Mid",
    salaryMin: 90000,
    salaryMax: 115000,
    currency: "USD",
    salaryPeriod: "year",
    postedAt: "2026-10-15",
    applicants: 61,
    featured: true,
    summary:
      "Help engineers understand observability without the sales pitch — through code, docs, talks, and honest examples.",
    tagline: "Teach observability without the sales pitch.",
    responsibilities: [
      "Write tutorials, examples, and integrations for the open-source SDK.",
      "Speak at meetups and conferences across Europe.",
      "Bring developer feedback into the product roadmap.",
      "Maintain starter projects and community channels.",
    ],
    requirements: [
      "3+ years as an engineer or developer advocate.",
      "Comfortable with TypeScript or Go and distributed systems basics.",
      "Excellent writing and public speaking.",
      "A genuine interest in observability and tooling.",
    ],
    niceToHave: [
      "Open-source maintainership",
      "Video production",
      "Prior startup experience",
    ],
    skills: [
      "Developer relations",
      "TypeScript",
      "Technical writing",
      "Public speaking",
      "Open source",
    ],
    benefits: [
      "Fully remote across Europe",
      "$3,000 learning budget",
      "Quarterly gathering",
      "New laptop",
    ],
  },
  {
    slug: "senior-frontend-engineer",
    title: "Senior Frontend Engineer",
    company: "vela",
    department: "Engineering",
    location: "Remote (Europe)",
    workMode: "Remote",
    employmentType: "Full-time",
    seniority: "Senior",
    salaryMin: 110000,
    salaryMax: 140000,
    currency: "USD",
    salaryPeriod: "year",
    postedAt: "2026-10-09",
    applicants: 56,
    summary:
      "Build the query and tracing interfaces engineers open when something is on fire — fast, dense, and calm.",
    tagline: "Build the UI engineers open at 3am.",
    responsibilities: [
      "Ship interface work across the tracing UI and query builder.",
      "Own frontend performance budgets for data-heavy views.",
      "Improve the open-source component library.",
      "Partner with design on interaction patterns for dense data.",
    ],
    requirements: [
      "5+ years building front-end applications in production.",
      "Expert-level React and TypeScript.",
      "Experience with large data sets and virtualised UI.",
      "Care for accessibility and performance.",
    ],
    niceToHave: [
      "Observability domain experience",
      "Open-source contributions",
      "Go or Rust familiarity",
    ],
    skills: [
      "React",
      "TypeScript",
      "Performance",
      "Data visualisation",
      "Accessibility",
    ],
    benefits: [
      "Remote across Europe",
      "$3,000 learning budget",
      "Quarterly gathering",
      "Home office budget",
    ],
  },
  {
    slug: "product-manager",
    title: "Product Manager",
    company: "terra",
    department: "Product",
    location: "Nairobi, Kenya",
    workMode: "Hybrid",
    employmentType: "Full-time",
    seniority: "Senior",
    salaryMin: 60000,
    salaryMax: 80000,
    currency: "USD",
    salaryPeriod: "year",
    postedAt: "2026-10-13",
    applicants: 68,
    featured: true,
    summary:
      "Own a product used by 40,000 smallholder farmers, where every extra tap costs a bag of maize. Field research isn't optional.",
    tagline: "Own a product where every tap has a cost.",
    responsibilities: [
      "Own the farmer and field-agent product areas end to end.",
      "Spend a week per quarter in the field with farmers and agents.",
      "Prioritise ruthlessly around income impact and simplicity.",
      "Work with design and engineering on weekly releases.",
    ],
    requirements: [
      "4+ years product management for consumer or fintech products.",
      "Comfortable with field research and low-connectivity contexts.",
      "Strong analytical and written skills.",
      "Experience bringing products from pilot to scale.",
    ],
    niceToHave: [
      "Agritech or financial inclusion",
      "Swahili",
      "Mobile money products",
    ],
    skills: [
      "Product management",
      "Field research",
      "Fintech",
      "Analytics",
      "Roadmapping",
    ],
    benefits: [
      "Hybrid in Nairobi",
      "Medical cover for family",
      "Field travel allowance",
      "Learning stipend",
    ],
  },
  {
    slug: "field-operations-coordinator",
    title: "Field Operations Coordinator",
    company: "terra",
    department: "Operations",
    location: "Nairobi, Kenya",
    workMode: "On-site",
    employmentType: "Full-time",
    seniority: "Entry",
    salaryMin: 26000,
    salaryMax: 34000,
    currency: "USD",
    salaryPeriod: "year",
    postedAt: "2026-10-01",
    applicants: 112,
    summary:
      "Keep the field engine running — schedules, supplies, and support for the agents who visit farmers every week.",
    tagline: "Keep the field engine running, week after week.",
    responsibilities: [
      "Coordinate field agent schedules and supply deliveries.",
      "Maintain accurate records across regions.",
      "Support training logistics and materials.",
      "Escalate farmer issues to the right team quickly.",
    ],
    requirements: [
      "1–2 years in coordination, logistics, or administration.",
      "Highly organised with strong attention to detail.",
      "Comfortable with spreadsheets and mobile tools.",
      "Based in Nairobi and happy to travel occasionally.",
    ],
    niceToHave: [
      "Agri supply chain exposure",
      "Swahili",
      "Experience managing field teams",
    ],
    skills: [
      "Coordination",
      "Logistics",
      "Spreadsheets",
      "Communication",
      "Scheduling",
    ],
    benefits: [
      "On-site in Nairobi",
      "Medical cover",
      "Field travel allowance",
      "Career development",
    ],
  },
  {
    slug: "learning-experience-designer",
    title: "Learning Experience Designer",
    company: "onward",
    department: "Design",
    location: "Remote (US/EU)",
    workMode: "Remote",
    employmentType: "Full-time",
    seniority: "Mid",
    salaryMin: 70000,
    salaryMax: 90000,
    currency: "USD",
    salaryPeriod: "year",
    postedAt: "2026-10-04",
    applicants: 46,
    summary:
      "Design 20-minute learning experiences for adults fitting study between jobs, shifts, and family — and make them worth finishing.",
    tagline: "Make 20 minutes of study worth finishing.",
    responsibilities: [
      "Design courses end to end, from outcomes to assessments.",
      "Work with subject experts and coaches to keep content practical.",
      "Test lessons with learners and iterate quickly.",
      "Improve templates and production workflows.",
    ],
    requirements: [
      "3+ years in instructional or learning experience design.",
      "Strong writing and structure instincts.",
      "Comfortable with learning platforms and accessibility.",
      "Evidence of learner outcomes you can talk through.",
    ],
    niceToHave: [
      "Adult learners in workforce programmes",
      "Multimedia production",
      "Data-driven curriculum",
    ],
    skills: [
      "Instructional design",
      "Curriculum",
      "Writing",
      "User research",
      "Accessibility",
    ],
    benefits: [
      "Fully remote",
      "Free course access",
      "Home office budget",
      "Annual retreat",
    ],
  },
  {
    slug: "product-analyst",
    title: "Product Analyst",
    company: "onward",
    department: "Data",
    location: "Remote (US/EU)",
    workMode: "Remote",
    employmentType: "Full-time",
    seniority: "Mid",
    salaryMin: 80000,
    salaryMax: 100000,
    currency: "USD",
    salaryPeriod: "year",
    postedAt: "2026-10-08",
    applicants: 57,
    summary:
      "Measure what helps working adults finish — completion, confidence, and outcomes, not vanity clicks.",
    tagline: "Measure what helps adults actually finish.",
    responsibilities: [
      "Own product analytics across onboarding and course delivery.",
      "Design experiments and interpret them honestly.",
      "Build dashboards learners' coaches and internal teams trust.",
      "Partner with product on learning-outcome measurement.",
    ],
    requirements: [
      "3+ years in product analytics.",
      "Strong SQL and fluency with a BI tool.",
      "Solid experiment design and statistics.",
      "Clear communication with non-analysts.",
    ],
    niceToHave: ["Python", "Education technology", "dbt"],
    skills: ["SQL", "Product analytics", "Experimentation", "BI", "Statistics"],
    benefits: [
      "Fully remote",
      "Free course access",
      "Home office budget",
      "Annual retreat",
    ],
  },
  {
    slug: "senior-product-designer-meridian",
    title: "Senior Product Designer",
    company: "meridian",
    department: "Design",
    location: "Singapore",
    workMode: "Hybrid",
    employmentType: "Full-time",
    seniority: "Senior",
    salaryMin: 110000,
    salaryMax: 135000,
    currency: "USD",
    salaryPeriod: "year",
    postedAt: "2026-10-14",
    applicants: 49,
    summary:
      "Make business banking feel like a good product — clear, fast, and honest, inside real regulatory constraints.",
    tagline: "Make business banking feel like a good product.",
    responsibilities: [
      "Lead design for credit and cash-flow tools.",
      "Untangle complex financial workflows into simple steps.",
      "Work with risk and compliance as design partners.",
      "Raise the bar on the shared product design system.",
    ],
    requirements: [
      "5+ years designing complex digital products.",
      "Experience with financial or regulated domains.",
      "Strong systems and interaction design.",
      "Comfortable facilitating across functions.",
    ],
    niceToHave: [
      "SME banking experience",
      "Data visualisation",
      "Designing for multiple markets",
    ],
    skills: [
      "Product design",
      "Fintech",
      "Design systems",
      "Interaction design",
      "Research",
    ],
    benefits: [
      "Hybrid in Singapore",
      "Comprehensive health cover",
      "Annual bonus scheme",
      "Learning support",
    ],
  },
  {
    slug: "payments-operations-analyst",
    title: "Payments Operations Analyst",
    company: "meridian",
    department: "Operations",
    location: "London, UK",
    workMode: "Hybrid",
    employmentType: "Full-time",
    seniority: "Mid",
    salaryMin: 65000,
    salaryMax: 85000,
    currency: "USD",
    salaryPeriod: "year",
    postedAt: "2026-09-29",
    applicants: 73,
    summary:
      "Keep payments moving and exceptions short — investigating, fixing, and designing the processes that prevent repeats.",
    tagline: "Keep payments moving and exceptions short.",
    responsibilities: [
      "Investigate payment exceptions and reconcile partner reports.",
      "Design controls and monitoring for new corridors.",
      "Work with engineering on tooling that reduces manual work.",
      "Document processes that regulators and auditors can follow.",
    ],
    requirements: [
      "2–4 years in payments, banking operations, or reconciliation.",
      "Excellent attention to detail and spreadsheet skills.",
      "Comfortable with high-stakes deadlines.",
      "Clear written communication.",
    ],
    niceToHave: ["SWIFT or local payment rails", "SQL", "Process automation"],
    skills: [
      "Payments",
      "Reconciliation",
      "Operations",
      "Process design",
      "Excel",
    ],
    benefits: [
      "Hybrid in London",
      "Comprehensive health cover",
      "Annual bonus scheme",
      "Pension",
    ],
  },
  {
    slug: "brand-designer",
    title: "Brand Designer",
    company: "studio-kern",
    department: "Design",
    location: "Cape Town, South Africa",
    workMode: "On-site",
    employmentType: "Full-time",
    seniority: "Mid",
    salaryMin: 30000,
    salaryMax: 45000,
    currency: "USD",
    salaryPeriod: "year",
    postedAt: "2026-10-12",
    applicants: 41,
    summary:
      "Make identities with a point of view for cultural institutions and founders who care about the difference between decoration and design.",
    tagline: "Make identities with a point of view.",
    responsibilities: [
      "Develop brand identities from concept to delivery.",
      "Art-direct photography, print, and digital applications.",
      "Present work clearly and defend decisions without ego.",
      "Contribute to studio writing and self-initiated projects.",
    ],
    requirements: [
      "3+ years in brand or graphic design, ideally in a studio.",
      "Exceptional typographic and layout craft.",
      "Strong Adobe and Figma skills.",
      "A portfolio with ideas, not just artefacts.",
    ],
    niceToHave: ["Editorial design", "Motion", "Afrikaans or isiXhosa"],
    skills: ["Brand identity", "Typography", "Art direction", "Print", "Figma"],
    benefits: [
      "Four-day work week",
      "Studio closes in December",
      "Materials budget",
      "Friyay lunches",
    ],
  },
];

export function getJob(company: string, slug: string) {
  return jobs.find((job) => job.company === company && job.slug === slug);
}

export function jobsByCompany(company: string) {
  return jobs.filter((job) => job.company === company);
}

export function featuredJobs() {
  return jobs.filter((job) => job.featured);
}

export function salaryLabel(job: Job) {
  const fmt = (value: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: job.currency,
      maximumFractionDigits: 0,
      notation: "compact",
    }).format(value);
  return `${fmt(job.salaryMin)} – ${fmt(job.salaryMax)}`;
}

export function timeAgo(iso: string) {
  const posted = new Date(`${iso}T09:00:00Z`).getTime();
  const now = new Date("2026-10-17T09:00:00Z").getTime();
  const days = Math.max(0, Math.round((now - posted) / 86_400_000));
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.round(days / 7)}w ago`;
  return `${Math.round(days / 30)}mo ago`;
}
