export type ApplicationStage =
  "Saved" | "Applied" | "In review" | "Interview" | "Offer" | "Closed";

export type ApplicationEvent = {
  title: string;
  detail: string;
  date: string;
  tone?: "neutral" | "positive" | "attention";
};

export type Application = {
  id: string;
  company: string;
  job: string;
  stage: ApplicationStage;
  appliedAt: string;
  updatedAt: string;
  nextStep?: { label: string; detail: string; date: string };
  events: ApplicationEvent[];
};

export const candidate = {
  name: "Amara Mensah",
  firstName: "Amara",
  role: "Senior Product Designer",
  headline: "Product designer shaping calm, useful software.",
  location: "Accra, Ghana",
  email: "amara.mensah@hey.com",
  phone: "+233 24 555 0142",
  avatar: "/images/avatar-amara.jpg",
  availability: "Open to work · Available from November",
  workPreference: "Remote or hybrid · UTC±3",
  salaryExpectation: "$95k – $130k",
  years: 7,
  completeness: 92,
  profileViews: 48,
  savedCount: 8,
  matchedRoles: 14,
  summary:
    "I design software that makes complex work feel simple. Seven years across fintech and creative tools, most recently leading design for a payments dashboard used by 40,000 merchants. I care about the small details that earn trust, and I prototype in code when it helps the team move faster.",
  skills: [
    "Product design",
    "Interaction design",
    "Design systems",
    "Prototyping",
    "User research",
    "Accessibility",
  ],
  tools: ["Figma", "Framer", "React", "Storybook", "Maze"],
  languages: ["English (native)", "Twi (fluent)", "French (conversational)"],
  experience: [
    {
      company: "Kestrel",
      role: "Senior Product Designer",
      period: "2022 — 2026",
      location: "Accra, Ghana",
      summary:
        "Led design for the merchant platform: onboarding, payouts, and reconciliation across 14 markets.",
      highlights: [
        "Redesigned merchant onboarding, cutting time-to-first-payment from 3 days to 40 minutes.",
        "Built and documented the component library adopted by four product teams.",
        "Mentored two mid-level designers and started the weekly craft critique.",
      ],
    },
    {
      company: "Zola Studio",
      role: "Product Designer",
      period: "2019 — 2022",
      location: "Remote",
      summary:
        "Designed client products across fintech, agriculture, and public-sector services.",
      highlights: [
        "Shipped a field-agent app used offline by 1,200 agents in rural Ghana.",
        "Introduced usability testing as a standard part of the studio process.",
      ],
    },
    {
      company: "Meridian",
      role: "UI Designer",
      period: "2017 — 2019",
      location: "Accra, Ghana",
      summary:
        "Worked on small-business banking tools and the design language that supported them.",
      highlights: [
        "Redesigned the payments approval flow used by 9,000 businesses.",
      ],
    },
  ],
  education: [
    {
      school: "Kwame Nkrumah University of Science and Technology",
      credential: "BSc, Computer Science",
      period: "2013 — 2017",
    },
  ],
  links: [
    { label: "Portfolio", value: "amaramensah.design", href: "#" },
    { label: "LinkedIn", value: "in/amaramensah", href: "#" },
    { label: "Read.cv", value: "read.cv/amara", href: "#" },
  ],
};

export const applications: Application[] = [
  {
    id: "app-lumen-spd",
    company: "lumen",
    job: "senior-product-designer",
    stage: "Interview",
    appliedAt: "2026-10-02",
    updatedAt: "2026-10-15",
    nextStep: {
      label: "Craft session",
      detail: "Live design exercise with Maya Chen and two engineers",
      date: "2026-10-21",
    },
    events: [
      {
        title: "Craft session scheduled",
        detail: "Maya sent a calendar invite for 21 October, 14:00 UTC.",
        date: "2026-10-15",
        tone: "positive",
      },
      {
        title: "Portfolio walkthrough",
        detail:
          "45 minutes with Maya Chen. Conversation notes were shared afterwards.",
        date: "2026-10-11",
      },
      {
        title: "Application viewed",
        detail: "Your profile was viewed by the Lumen design team.",
        date: "2026-10-04",
      },
      {
        title: "Application submitted",
        detail: "Portfolio and profile sent to Lumen.",
        date: "2026-10-02",
      },
    ],
  },
  {
    id: "app-basin-spd",
    company: "basin",
    job: "senior-product-designer-basin",
    stage: "Offer",
    appliedAt: "2026-09-18",
    updatedAt: "2026-10-15",
    nextStep: {
      label: "Respond to offer",
      detail: "Base salary $138,000 · hybrid in Toronto · start by 1 December",
      date: "2026-10-22",
    },
    events: [
      {
        title: "Offer sent",
        detail:
          "A written offer was shared. They've asked for a response by 22 October.",
        date: "2026-10-15",
        tone: "positive",
      },
      {
        title: "Team conversations",
        detail: "Met four clinicians and the engineering lead.",
        date: "2026-10-08",
      },
      {
        title: "Craft interview",
        detail: "Whiteboard session on scheduling constraints.",
        date: "2026-09-30",
      },
      {
        title: "Recruiter call",
        detail: "Intro conversation with Nadia, Talent Partner.",
        date: "2026-09-22",
      },
    ],
  },
  {
    id: "app-vela-de",
    company: "vela",
    job: "design-engineer",
    stage: "In review",
    appliedAt: "2026-10-09",
    updatedAt: "2026-10-13",
    nextStep: {
      label: "Review in progress",
      detail:
        "The team is reviewing portfolios. Expect an update by 20 October.",
      date: "2026-10-20",
    },
    events: [
      {
        title: "Portfolio opened",
        detail: "Your case study was opened by the hiring team.",
        date: "2026-10-13",
      },
      {
        title: "Application submitted",
        detail: "Sent to Vela with a short note.",
        date: "2026-10-09",
      },
    ],
  },
  {
    id: "app-pine-pd",
    company: "pine-and-co",
    job: "product-designer-pine",
    stage: "Applied",
    appliedAt: "2026-10-14",
    updatedAt: "2026-10-14",
    events: [
      {
        title: "Application submitted",
        detail: "Sent to Pine & Co.",
        date: "2026-10-14",
      },
    ],
  },
  {
    id: "app-kestrel-pd",
    company: "kestrel",
    job: "product-designer-kestrel",
    stage: "Closed",
    appliedAt: "2026-09-08",
    updatedAt: "2026-09-29",
    events: [
      {
        title: "Role closed",
        detail:
          "The team hired an internal candidate. Ada encouraged you to apply again in the new year.",
        date: "2026-09-29",
      },
      {
        title: "Team interview",
        detail: "Met the payments design squad.",
        date: "2026-09-19",
      },
      {
        title: "Application submitted",
        detail: "Sent to Kestrel.",
        date: "2026-09-08",
      },
    ],
  },
];

export const savedJobs = [
  { company: "terra", job: "product-manager", savedAt: "2026-10-16" },
  {
    company: "onward",
    job: "learning-experience-designer",
    savedAt: "2026-10-12",
  },
  { company: "northwind", job: "customer-success-lead", savedAt: "2026-10-09" },
];
