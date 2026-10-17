export type CompanyTone = "clay" | "sage" | "ochre" | "ink" | "stone" | "plum";

export type Company = {
  slug: string;
  name: string;
  monogram: string;
  tone: CompanyTone;
  tagline: string;
  industry: string;
  headcount: string;
  founded: string;
  hq: string;
  locations: string[];
  website: string;
  about: string;
  principles: { title: string; detail: string }[];
  perks: string[];
  photo?: string;
  responseTime: string;
  verified: boolean;
};

export const companies: Company[] = [
  {
    slug: "lumen",
    name: "Lumen",
    monogram: "L",
    tone: "ink",
    tagline: "A calmer canvas for visual thinkers.",
    industry: "Design software",
    headcount: "120–180",
    founded: "2019",
    hq: "London, UK",
    locations: ["London", "Remote"],
    website: "lumen.tools",
    about:
      "Lumen makes the canvas where product teams sketch, prototype, and present their work. Nine thousand teams use it daily — from two-person studios to research groups inside much larger companies. The team is deliberately small, remote-first, and allergic to busywork.",
    principles: [
      {
        title: "Craft is a habit",
        detail:
          "Small details, shipped weekly, compound into software people trust.",
      },
      {
        title: "Fewer, better meetings",
        detail:
          "Most decisions happen in writing. Cameras are optional, calendars are protected.",
      },
      {
        title: "Design with the people who build it",
        detail:
          "Designers and engineers share problems from the first sketch, not the final review.",
      },
    ],
    perks: [
      "Remote-first, with a four-day summer week",
      "$2,000 annual learning budget",
      "Equity from day one",
      "Annual team offsite",
      "Home office stipend",
    ],
    photo: "/images/team-meeting.jpg",
    responseTime: "Usually replies within 3 days",
    verified: true,
  },
  {
    slug: "kestrel",
    name: "Kestrel",
    monogram: "K",
    tone: "clay",
    tagline: "Payments that move at the speed of business.",
    industry: "Fintech infrastructure",
    headcount: "60–90",
    founded: "2021",
    hq: "Accra, Ghana",
    locations: ["Accra", "Remote"],
    website: "kestrel.africa",
    about:
      "Kestrel builds the payment rails behind some of Africa's fastest-growing businesses. One integration covers cards, mobile money, and bank transfers across 14 markets — with reconciliation that actually adds up. The team is based in Accra, with people across six countries.",
    principles: [
      {
        title: "Build for the last mile",
        detail:
          "The best infrastructure works when connectivity, trust, and time are all in short supply.",
      },
      {
        title: "Write it down",
        detail: "Clear decisions make a distributed team feel small.",
      },
      {
        title: "Ship, learn, repeat",
        detail: "Small releases, honest metrics, and a fast path back.",
      },
    ],
    perks: [
      "Hybrid in Accra, remote across Africa",
      "Private health cover for you and family",
      "13th-month bonus",
      "Learning budget for certifications",
    ],
    responseTime: "Usually replies within 4 days",
    verified: true,
  },
  {
    slug: "northwind",
    name: "Northwind",
    monogram: "N",
    tone: "sage",
    tagline: "Cleaner freight, one route at a time.",
    industry: "Climate logistics",
    headcount: "200–300",
    founded: "2017",
    hq: "Amsterdam, Netherlands",
    locations: ["Amsterdam", "Berlin", "Remote"],
    website: "northwind.eco",
    about:
      "Northwind is a logistics platform for companies that need to move things without moving backwards on climate. Their routing engine cuts empty kilometres for freight partners across Europe, and their reporting is trusted by some of the continent's most demanding procurement teams.",
    principles: [
      {
        title: "Measure what matters",
        detail: "Every environmental claim starts with an auditable number.",
      },
      {
        title: "Work with the system",
        detail: "We change freight by partnering with the people who move it.",
      },
      {
        title: "Long horizons",
        detail:
          "Climate work rewards patience. We plan in decades, not quarters.",
      },
    ],
    perks: [
      "Hybrid with two days in the studio",
      "32 days paid leave",
      "Public transport card",
      "Sabbatical after five years",
    ],
    responseTime: "Usually replies within 2 days",
    verified: true,
  },
  {
    slug: "basin",
    name: "Basin",
    monogram: "B",
    tone: "ochre",
    tagline: "Software for calmer clinics.",
    industry: "Healthcare operations",
    headcount: "80–120",
    founded: "2018",
    hq: "Toronto, Canada",
    locations: ["Toronto", "Remote"],
    website: "basin.health",
    about:
      "Basin helps clinics spend less time on administration and more time with patients. Scheduling, intake, and billing live in one place that clinicians actually enjoy opening. The team works closely with a council of nurses and practice managers who shape every release.",
    principles: [
      {
        title: "Caregivers first",
        detail: "If it doesn't save a clinician time, it doesn't ship.",
      },
      {
        title: "Privacy by design",
        detail: "Health data deserves more than a checkbox.",
      },
      {
        title: "Quiet software",
        detail: "The best tools disappear into the working day.",
      },
    ],
    perks: [
      "Remote-friendly across Canada",
      "Extended health and dental",
      "4-day summer weeks",
      "Wellness allowance",
    ],
    responseTime: "Usually replies within 5 days",
    verified: true,
  },
  {
    slug: "aperture",
    name: "Aperture",
    monogram: "A",
    tone: "plum",
    tagline: "Stories that look closer.",
    industry: "Independent media",
    headcount: "30–50",
    founded: "2016",
    hq: "New York, USA",
    locations: ["New York"],
    website: "aperture.studio",
    about:
      "Aperture is an independent studio making documentary work about the systems that shape everyday life — housing, food, water, work. Editorial independence is written into the company charter, and slow journalism is a feature, not an apology.",
    principles: [
      {
        title: "Look closer",
        detail: "Every story earns its angle through reporting, not takes.",
      },
      {
        title: "Pay people properly",
        detail: "Freelance budgets are set before the pitch is approved.",
      },
      {
        title: "Make it last",
        detail: "We archive our work so it can be read in ten years.",
      },
    ],
    perks: [
      "Four-day publishing week",
      "Full health cover",
      "Annual equipment budget",
      "Generous parental leave",
    ],
    responseTime: "Usually replies within 6 days",
    verified: true,
  },
  {
    slug: "pine-and-co",
    name: "Pine & Co",
    monogram: "P",
    tone: "sage",
    tagline: "Objects for a slower home.",
    industry: "Home and lifestyle",
    headcount: "40–70",
    founded: "2015",
    hq: "Copenhagen, Denmark",
    locations: ["Copenhagen", "Remote"],
    website: "pineandco.dk",
    about:
      "Pine & Co designs and sells homeware made to be repaired rather than replaced. Their supply chain is small, documented, and mostly within 800 kilometres of the Copenhagen studio. The team is a mix of designers, makers, and people who answer customer email themselves.",
    principles: [
      {
        title: "Make it repairable",
        detail: "Spare parts and honest manuals, for every product we sell.",
      },
      {
        title: "Know your makers",
        detail:
          "Long relationships with small workshops beat lowest-cost sourcing.",
      },
      {
        title: "Less, better",
        detail: "We launch six products a year, not sixty.",
      },
    ],
    perks: [
      "Hybrid studio schedule",
      "Staff discount and sample sales",
      "Pension contribution",
      "Two volunteer days a year",
    ],
    responseTime: "Usually replies within 5 days",
    verified: true,
  },
  {
    slug: "vela",
    name: "Vela",
    monogram: "V",
    tone: "ink",
    tagline: "Observability without the noise.",
    industry: "Developer tools",
    headcount: "25–40",
    founded: "2022",
    hq: "Berlin, Germany",
    locations: ["Berlin", "Remote"],
    website: "vela.dev",
    about:
      "Vela makes tracing and performance tooling for teams who are tired of dashboards nobody reads. Their SDK is open source, their docs are written by engineers, and their support channel is staffed by the people who built the product.",
    principles: [
      {
        title: "Docs are product",
        detail: "If it needs a sales call to explain, we haven't finished it.",
      },
      {
        title: "Open by default",
        detail: "The SDK is open source and the roadmap is public.",
      },
      { title: "Deep work first", detail: "No meetings before 11am. Ever." },
    ],
    perks: [
      "Fully remote across Europe",
      "$3,000 conference and learning budget",
      "Quarterly team gathering",
      "New laptop every three years",
    ],
    responseTime: "Usually replies within 2 days",
    verified: true,
  },
  {
    slug: "terra",
    name: "Terra",
    monogram: "T",
    tone: "clay",
    tagline: "Better harvests, shared fairly.",
    industry: "Agritech",
    headcount: "70–110",
    founded: "2020",
    hq: "Nairobi, Kenya",
    locations: ["Nairobi", "Remote"],
    website: "terra.farm",
    about:
      "Terra works with 40,000 smallholder farmers across East Africa, connecting agronomy advice, input financing, and buyers in one simple mobile service. The field team is the heart of the company — product decisions start in a farmer's field, not a boardroom.",
    principles: [
      {
        title: "Start in the field",
        detail:
          "Every product person spends a week each quarter with farmers and field agents.",
      },
      {
        title: "Simple on purpose",
        detail:
          "Features must work on a small phone, a slow connection, and a busy day.",
      },
      {
        title: "Share the upside",
        detail:
          "Better yields should mean better incomes, not just more volume.",
      },
    ],
    perks: [
      "Hybrid in Nairobi",
      "Medical cover for family",
      "Field travel allowance",
      "Annual learning stipend",
    ],
    responseTime: "Usually replies within 3 days",
    verified: true,
  },
  {
    slug: "onward",
    name: "Onward",
    monogram: "O",
    tone: "ochre",
    tagline: "Learning that fits between shifts.",
    industry: "Education",
    headcount: "50–80",
    founded: "2019",
    hq: "Remote, US & EU",
    locations: ["Remote"],
    website: "onward.school",
    about:
      "Onward helps working adults finish the credentials they started — or start the ones they were told they couldn't. Courses are built around 20-minute sessions, and coaching is included, not sold separately. The team is fully distributed across nine countries.",
    principles: [
      {
        title: "Respect the learner's time",
        detail: "Every lesson earns the 20 minutes it asks for.",
      },
      {
        title: "Progress over perfection",
        detail: "Completion beats prestige.",
      },
      {
        title: "Coach the person",
        detail: "Support is a product feature, not an upsell.",
      },
    ],
    perks: [
      "Fully remote, async-first",
      "Free access to every Onward course",
      "Home office budget",
      "Annual in-person retreat",
    ],
    responseTime: "Usually replies within 4 days",
    verified: true,
  },
  {
    slug: "meridian",
    name: "Meridian",
    monogram: "M",
    tone: "stone",
    tagline: "Banking built for growing businesses.",
    industry: "Business banking",
    headcount: "300–500",
    founded: "2014",
    hq: "Singapore",
    locations: ["Singapore", "London"],
    website: "meridian.bank",
    about:
      "Meridian gives small and mid-sized businesses a financial home: multi-currency accounts, sensible credit, and people who answer the phone. The company operates in six markets and is known for a product team that ships like a startup, inside a bank's regulatory reality.",
    principles: [
      {
        title: "Trust is the product",
        detail: "Every interaction either builds it or spends it.",
      },
      {
        title: "Small businesses first",
        detail: "If it works for a 12-person importer, it can work for anyone.",
      },
      {
        title: "Clarity beats jargon",
        detail: "Plain language is a compliance requirement we set ourselves.",
      },
    ],
    perks: [
      "Hybrid with flexible core hours",
      "Comprehensive health cover",
      "Annual bonus scheme",
      "Learning and certification support",
    ],
    responseTime: "Usually replies within 7 days",
    verified: true,
  },
  {
    slug: "studio-kern",
    name: "Studio Kern",
    monogram: "SK",
    tone: "plum",
    tagline: "Brands with something to say.",
    industry: "Brand and design studio",
    headcount: "12–20",
    founded: "2013",
    hq: "Cape Town, South Africa",
    locations: ["Cape Town"],
    website: "studiokern.co.za",
    about:
      "Studio Kern is an independent brand studio working with cultural institutions, ambitious founders, and a few companies that should know better. The work is deliberate, the deadlines are real, and the studio closes for two weeks every December.",
    principles: [
      {
        title: "Ideas before decoration",
        detail: "A beautiful thing without a point is just wallpaper.",
      },
      {
        title: "Small team, full attention",
        detail: "We take on six projects a year, and we finish them.",
      },
      {
        title: "Leave the ego at the door",
        detail: "The best idea wins, regardless of who brought it.",
      },
    ],
    perks: [
      "Four-day work week",
      "Studio closes in December",
      "Materials and print budget",
      "Friyay lunches",
    ],
    photo: "/images/hero-workspace.jpg",
    responseTime: "Usually replies within 3 days",
    verified: false,
  },
];

export function getCompany(slug: string) {
  return companies.find((company) => company.slug === slug);
}
