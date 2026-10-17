import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Banknote,
  CalendarDays,
  Check,
  Clock3,
  MapPin,
  Search,
  ShieldCheck,
  Sparkles,
  UserRound,
} from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { CompanyMark } from "@/components/ui/company-mark";
import { Avatar } from "@/components/ui/avatar";
import { Reveal } from "@/components/ui/reveal";
import { JobCard } from "@/components/jobs/job-card";
import { CompanyTicker } from "@/components/jobs/company-ticker";
import { SectionHeading } from "@/components/marketing/section-heading";
import { featuredJobs, jobs } from "@/data/jobs";
import { companies } from "@/data/companies";

const crafts = [
  {
    label: "Design",
    count: jobs.filter((job) => job.department === "Design").length,
  },
  {
    label: "Engineering",
    count: jobs.filter((job) => job.department === "Engineering").length,
  },
  {
    label: "Product",
    count: jobs.filter((job) => job.department === "Product").length,
  },
  {
    label: "Marketing",
    count: jobs.filter((job) => job.department === "Marketing").length,
  },
  {
    label: "Operations",
    count: jobs.filter((job) => job.department === "Operations").length,
  },
  {
    label: "Customer Success",
    count: jobs.filter((job) => job.department === "Customer Success").length,
  },
];

const stories = [
  {
    quote:
      "I applied on a Tuesday and had a first conversation on Thursday. Nobody asked me to retype my CV into a form. It felt like the company actually wanted to meet me.",
    name: "Daniel Osei",
    role: "Frontend Engineer at Terra",
    avatar: "/images/avatar-daniel.jpg",
  },
  {
    quote:
      "The salary was in the listing. That one detail changed the whole conversation — we talked about the work instead of dancing around money.",
    name: "Priya Raman",
    role: "Staff Product Designer at Northwind",
    avatar: "/images/avatar-priya.jpg",
  },
  {
    quote:
      "As a small studio, we can't afford to look like everyone else. Morrow let us show the people and the principles behind the work.",
    name: "Tobias Meyer",
    role: "Founder, Studio Kern",
    avatar: "/images/avatar-noah.jpg",
  },
];

export default function HomePage() {
  const featured = featuredJobs().slice(0, 6);

  return (
    <>
      {/* ---------------- Hero ---------------- */}
      <section className="relative overflow-hidden pt-[72px]">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
        >
          <div className="absolute -right-40 -top-40 h-[600px] w-[600px] rounded-full bg-[radial-gradient(circle,rgba(191,91,58,0.10),transparent_62%)]" />
          <div className="absolute -left-52 top-64 h-[460px] w-[460px] rounded-full bg-[radial-gradient(circle,rgba(71,107,88,0.08),transparent_65%)]" />
          <div className="absolute inset-x-0 top-0 h-[560px] bg-grid opacity-50 [mask-image:linear-gradient(to_bottom,black,transparent_85%)]" />
        </div>

        <div className="container-x relative grid gap-16 pb-20 pt-12 lg:grid-cols-[1.04fr_0.96fr] lg:items-center lg:gap-12 lg:pb-28 lg:pt-20">
          <div className="max-w-[36rem]">
            <Reveal>
              <p className="inline-flex items-center gap-2 rounded-full border border-line bg-paper-raised/80 py-1 pl-1 pr-3 text-[11.5px] text-stone shadow-[0_1px_0_rgba(26,27,23,0.03)] backdrop-blur">
                <span className="rounded-full bg-clay-soft px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.1em] text-clay-deep">
                  New
                </span>
                Every role now shows a salary range
                <ArrowUpRight className="h-3 w-3 text-stone-light" />
              </p>
            </Reveal>

            <Reveal delay={60}>
              <h1 className="display mt-7 text-[clamp(3.05rem,5.8vw,4.85rem)] leading-[0.93] tracking-[-0.03em] text-ink">
                Find work that fits the{" "}
                <span className="relative inline-block italic">
                  rest of your life
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 320 14"
                    fill="none"
                    preserveAspectRatio="none"
                    className="absolute -bottom-1 left-0 h-2.5 w-full text-clay/70"
                  >
                    <path
                      d="M2 10.5C52 4.5 132 2 194 4.2c41 1.4 82 3.6 124 6.3"
                      stroke="currentColor"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                    />
                  </svg>
                </span>
                .
              </h1>
            </Reveal>

            <Reveal delay={120}>
              <p className="mt-6 max-w-[29rem] text-[15.5px] leading-relaxed text-stone">
                A job board for people who would rather do fewer things well.
                Real salary ranges, honest hiring timelines, and teams that
                write back.
              </p>
            </Reveal>

            <Reveal delay={180}>
              <form
                action="/jobs"
                className="mt-8 rounded-2xl border border-line-strong/70 bg-paper-raised p-2 shadow-[0_1px_0_rgba(255,255,255,0.9)_inset,0_10px_30px_-12px_rgba(26,27,23,0.18)] transition-shadow focus-within:border-ink/40 focus-within:shadow-lift sm:grid sm:grid-cols-2 sm:items-center xl:flex"
              >
                <div className="flex flex-1 items-center gap-2.5 px-3">
                  <Search
                    className="h-[17px] w-[17px] shrink-0 text-stone"
                    strokeWidth={1.9}
                  />
                  <label htmlFor="hero-q" className="sr-only">
                    Role, skill, or company
                  </label>
                  <input
                    id="hero-q"
                    name="q"
                    placeholder="Role, skill, or company"
                    className="h-11 w-full min-w-0 bg-transparent text-[14.5px] text-ink placeholder:font-medium placeholder:text-ink/55 focus:outline-none"
                  />
                </div>
                <span
                  className="mx-1 hidden h-6 w-px bg-line xl:block"
                  aria-hidden="true"
                />
                <div className="flex flex-1 items-center gap-2.5 border-t border-line px-3 pt-1 sm:mt-0 sm:border-l sm:border-t-0 sm:pt-0 xl:border-l-0">
                  <MapPin
                    className="h-[17px] w-[17px] shrink-0 text-stone"
                    strokeWidth={1.9}
                  />
                  <label htmlFor="hero-where" className="sr-only">
                    Location or remote
                  </label>
                  <input
                    id="hero-where"
                    name="where"
                    placeholder="City or remote"
                    className="h-11 w-full min-w-0 bg-transparent text-[14.5px] text-ink placeholder:font-medium placeholder:text-ink/55 focus:outline-none"
                  />
                </div>
                <button
                  type="submit"
                  className="mt-2 inline-flex h-11 w-full shrink-0 items-center justify-center gap-2 rounded-[10px] bg-ink px-5 text-[13.5px] font-medium text-paper transition hover:bg-ink-soft sm:col-span-2 sm:mt-1.5 xl:col-span-1 xl:mt-0 xl:w-auto"
                >
                  Find roles
                  <ArrowRight className="h-4 w-4" />
                </button>
              </form>
            </Reveal>

            <Reveal delay={240}>
              <div className="mt-4 flex flex-wrap items-center gap-x-1.5 gap-y-2 text-[11.5px] text-stone">
                <span className="mr-1 text-stone-light">Popular</span>
                {["Product design", "Engineering", "Remote", "Fintech"].map(
                  (term) => (
                    <Link
                      key={term}
                      href={`/jobs?q=${encodeURIComponent(term)}`}
                      className="rounded-full border border-line bg-paper/60 px-2.5 py-1 transition hover:border-line-strong hover:bg-cream hover:text-ink"
                    >
                      {term}
                    </Link>
                  ),
                )}
              </div>
            </Reveal>

            <Reveal delay={300}>
              <div className="mt-10 flex flex-wrap items-center gap-x-5 gap-y-3 border-t border-line pt-6">
                <div className="flex items-center -space-x-2.5">
                  {[
                    "avatar-amara",
                    "avatar-daniel",
                    "avatar-priya",
                    "avatar-marcus",
                  ].map((name) => (
                    <Avatar
                      key={name}
                      name={name}
                      src={`/images/${name}.jpg`}
                      size="sm"
                      className="ring-2 ring-paper"
                    />
                  ))}
                </div>
                <div>
                  <p className="text-[12.5px] font-medium text-ink-soft">
                    1,284 people found work here this year
                  </p>
                  <p className="mt-0.5 flex items-center gap-1.5 text-[11px] text-stone">
                    <ShieldCheck
                      className="h-3.5 w-3.5 text-sage"
                      strokeWidth={1.9}
                    />
                    Every company is reviewed before it can post
                  </p>
                </div>
              </div>
            </Reveal>
          </div>

          {/* Hero visual */}
          <Reveal delay={160} className="relative lg:pl-4">
            <div className="relative mx-auto max-w-[430px] lg:max-w-[450px]">
              <div
                aria-hidden="true"
                className="absolute -inset-3 -z-10 rounded-[2.4rem] border border-line/70 bg-cream/40"
              />
              <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] border border-line bg-cream">
                <Image
                  src="/images/hero-workspace.jpg"
                  alt="A designer working at a sunlit wooden desk in a calm studio"
                  fill
                  priority
                  sizes="(max-width: 1024px) 90vw, 450px"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/35 via-transparent to-transparent" />
                <Link
                  href="/jobs/lumen/senior-product-designer"
                  className="group absolute inset-x-4 bottom-20 rounded-2xl border border-white/40 bg-paper/92 p-4 backdrop-blur-md transition hover:bg-paper sm:inset-x-5"
                >
                  <div className="flex items-center justify-between">
                    <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-stone">
                      Role of the week
                    </p>
                    <ArrowUpRight className="h-3.5 w-3.5 text-stone transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                  </div>
                  <div className="mt-2.5 flex items-center gap-2.5">
                    <CompanyMark monogram="L" tone="ink" size="sm" />
                    <div className="min-w-0">
                      <p className="text-[13px] font-medium leading-snug text-ink">
                        Senior Product Designer
                      </p>
                      <p className="mt-0.5 text-[11px] text-stone">
                        Lumen · Remote · $120k – $150k
                      </p>
                    </div>
                  </div>
                </Link>
              </div>

              <div className="absolute -left-4 top-14 hidden w-[196px] -rotate-[2deg] rounded-2xl border border-line bg-paper-raised p-3.5 shadow-lift sm:block lg:-left-10">
                <div className="flex items-center justify-between">
                  <p className="font-mono text-[8.5px] uppercase tracking-[0.16em] text-stone">
                    Your match
                  </p>
                  <span className="rounded-full bg-sage-soft px-1.5 py-0.5 font-mono text-[9px] font-medium text-sage-deep">
                    92%
                  </span>
                </div>
                <p className="mt-2 text-[12px] font-medium leading-snug text-ink">
                  Senior Product Designer
                </p>
                <p className="mt-0.5 text-[10.5px] text-stone">
                  Lumen · Remote
                </p>
                <div className="mt-2.5 h-1 w-full overflow-hidden rounded-full bg-cream">
                  <div className="h-full w-[92%] rounded-full bg-sage" />
                </div>
                <p className="mt-2 text-[9.5px] leading-snug text-stone-light">
                  Based on your skills and 7 years of experience
                </p>
              </div>

              <div className="absolute -bottom-8 right-0 hidden w-[214px] rotate-[1.5deg] rounded-2xl border border-line bg-paper-raised p-3.5 shadow-lift sm:block lg:-right-7">
                <div className="flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-sage-soft text-sage-deep">
                    <Check className="h-3 w-3" strokeWidth={2.6} />
                  </span>
                  <p className="text-[11px] font-medium text-ink">
                    Application viewed
                  </p>
                  <span className="ml-auto font-mono text-[9px] text-stone-light">
                    2m
                  </span>
                </div>
                <p className="mt-1.5 text-[10px] leading-snug text-stone">
                  Lumen opened your portfolio. Next up: a craft session on 21
                  October.
                </p>
              </div>

              <div className="absolute right-3 top-3 hidden sm:block">
                <div className="relative flex h-[84px] w-[84px] items-center justify-center">
                  <svg
                    viewBox="0 0 100 100"
                    className="absolute inset-0 h-full w-full animate-[spin_26s_linear_infinite] text-stone/70"
                    aria-hidden="true"
                  >
                    <defs>
                      <path
                        id="badge-arc"
                        d="M50,50 m-38,0 a38,38 0 1,1 76,0 a38,38 0 1,1 -76,0"
                      />
                    </defs>
                    <text
                      fontSize="9.4"
                      letterSpacing="2.4"
                      fill="currentColor"
                      fontFamily="var(--font-mono)"
                    >
                      <textPath href="#badge-arc">
                        24 OPEN ROLES · UPDATED DAILY ·
                      </textPath>
                    </text>
                  </svg>
                  <div className="flex h-[52px] w-[52px] flex-col items-center justify-center rounded-full border border-line-strong bg-paper text-center shadow-soft">
                    <span className="display text-[22px] leading-none text-ink">
                      24
                    </span>
                    <span className="mt-0.5 font-mono text-[6.5px] uppercase tracking-[0.14em] text-stone">
                      roles
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <CompanyTicker />

      {/* ---------------- Featured roles ---------------- */}
      <section className="container-x py-20 lg:py-28">
        <Reveal>
          <SectionHeading
            eyebrow="Hand-picked this week"
            title={
              <>
                Roles worth <em className="italic text-clay-deep">opening</em>.
              </>
            }
            description="A small, deliberate list. Every role is verified, priced, and posted by the team doing the hiring."
            action={{ label: "Browse all roles", href: "/jobs" }}
          />
        </Reveal>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((job, index) => (
            <Reveal key={`${job.company}-${job.slug}`} delay={index * 60}>
              <JobCard job={job} className="h-full" />
            </Reveal>
          ))}
        </div>
        <div className="mt-12 flex flex-col gap-4 border-t border-line pt-6 sm:flex-row sm:items-center">
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-stone-light">
            Start from a craft
          </p>
          <div className="flex flex-wrap gap-2">
            {crafts.map((craft) => (
              <Link
                key={craft.label}
                href={`/jobs?department=${encodeURIComponent(craft.label)}`}
                className="group inline-flex items-center gap-1.5 rounded-full border border-line bg-paper-raised px-3 py-1.5 text-[11.5px] text-ink-soft transition hover:border-ink/30 hover:text-ink"
              >
                {craft.label}
                <span className="font-mono text-[9.5px] text-stone-light group-hover:text-stone">
                  {craft.count}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- Why Morrow ---------------- */}
      <section className="border-y border-line bg-cream/60">
        <div className="container-x grid gap-16 py-20 lg:grid-cols-[0.92fr_1.08fr] lg:items-center lg:py-28">
          <Reveal>
            <p className="eyebrow mb-4">
              <span className="h-1 w-1 rounded-full bg-clay" />
              Why Morrow
            </p>
            <h2 className="display max-w-md text-[clamp(2rem,3.6vw,2.9rem)] leading-[1.02] text-ink">
              Less searching.
              <br />
              More <em className="italic">deciding</em>.
            </h2>
            <p className="mt-4 max-w-md text-[14.5px] leading-relaxed text-stone">
              Most job boards optimise for volume. We optimised for the moment
              you decide — with the information you actually need.
            </p>

            <div className="mt-10 divide-y divide-line border-t border-line">
              {[
                {
                  icon: Banknote,
                  title: "Salary, not “competitive”",
                  detail:
                    "Every listing carries a real range and currency. No guessing, no awkward first call.",
                },
                {
                  icon: Clock3,
                  title: "Timelines you can plan around",
                  detail:
                    "Teams publish their process and their reply time before you apply. Four steps, no mystery panel.",
                },
                {
                  icon: UserRound,
                  title: "A profile that does the work",
                  detail:
                    "Apply with your Morrow profile in under a minute. One strong profile, reused with care.",
                },
              ].map((feature) => (
                <div key={feature.title} className="flex gap-4 py-5">
                  <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] border border-line bg-paper text-clay-deep">
                    <feature.icon className="h-4 w-4" strokeWidth={1.8} />
                  </span>
                  <div>
                    <h3 className="text-[14px] font-medium tracking-[-0.01em] text-ink">
                      {feature.title}
                    </h3>
                    <p className="mt-1 max-w-sm text-[12.5px] leading-relaxed text-stone">
                      {feature.detail}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Reveal>

          <Reveal delay={120} className="relative">
            <div className="relative mx-auto max-w-[450px]">
              <div className="rounded-[1.75rem] border border-line bg-paper-raised p-2 shadow-lift">
                <div className="rounded-[1.35rem] border border-line/70 bg-paper p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-stone-light">
                        Your applications
                      </p>
                      <p className="mt-1 text-[15px] font-medium tracking-[-0.01em] text-ink">
                        Five in motion
                      </p>
                    </div>
                    <span className="rounded-full bg-cream px-2 py-1 text-[10px] text-stone">
                      Updated today
                    </span>
                  </div>

                  <div className="mt-4 space-y-1.5">
                    {[
                      {
                        company: "Lumen",
                        mark: "L",
                        tone: "ink" as const,
                        role: "Senior Product Designer",
                        stage: "Interview",
                        stageClass: "bg-sage-soft text-sage-deep",
                        time: "2h",
                      },
                      {
                        company: "Basin",
                        mark: "B",
                        tone: "ochre" as const,
                        role: "Senior Product Designer",
                        stage: "Offer",
                        stageClass: "bg-clay-soft text-clay-deep",
                        time: "1d",
                      },
                      {
                        company: "Vela",
                        mark: "V",
                        tone: "ink" as const,
                        role: "Design Engineer",
                        stage: "In review",
                        stageClass: "bg-ochre-soft text-[#8a641f]",
                        time: "3d",
                      },
                    ].map((app) => (
                      <div
                        key={app.company}
                        className="flex items-center gap-3 rounded-xl border border-transparent px-2 py-2.5 transition hover:border-line hover:bg-paper-raised"
                      >
                        <CompanyMark
                          monogram={app.mark}
                          tone={app.tone}
                          size="sm"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-[12px] font-medium text-ink">
                            {app.role}
                          </p>
                          <p className="text-[10.5px] text-stone">
                            {app.company}
                          </p>
                        </div>
                        <span
                          className={`rounded-full px-2 py-0.5 text-[9.5px] font-medium ${app.stageClass}`}
                        >
                          {app.stage}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 rounded-xl border border-line bg-cream/50 p-3.5">
                    <div className="flex items-center gap-2">
                      <CalendarDays
                        className="h-3.5 w-3.5 text-clay-deep"
                        strokeWidth={1.8}
                      />
                      <p className="text-[10px] font-medium uppercase tracking-[0.1em] text-stone">
                        Next step
                      </p>
                    </div>
                    <div className="mt-2 flex items-center justify-between gap-3">
                      <p className="text-[12px] font-medium text-ink">
                        Craft session · Lumen
                      </p>
                      <span className="font-mono text-[10px] text-stone">
                        21 OCT · 14:00
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="absolute right-2 -top-5 flex items-center gap-2 rounded-full border border-line bg-paper-raised px-3 py-1.5 shadow-soft sm:-right-6">
                <Sparkles className="h-3.5 w-3.5 text-ochre" />
                <span className="text-[10.5px] font-medium text-ink">
                  92% profile complete
                </span>
              </div>

              <div className="absolute -bottom-6 -left-3 w-[228px] -rotate-[2deg] rounded-2xl border border-line bg-ink p-4 text-paper shadow-panel sm:-left-8">
                <p className="font-mono text-[8.5px] uppercase tracking-[0.16em] text-paper/50">
                  Offer received
                </p>
                <p className="mt-1.5 display text-[19px] leading-tight">
                  $138,000 base
                </p>
                <p className="mt-1 text-[10.5px] text-paper/60">
                  Basin · Senior Product Designer
                </p>
                <div className="mt-3 flex items-center gap-1.5 text-[10px] text-[#bcd8c4]">
                  <Check className="h-3 w-3" />
                  Respond by 22 October
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ---------------- How it works ---------------- */}
      <section id="how-it-works" className="container-x py-20 lg:py-28">
        <Reveal>
          <SectionHeading
            eyebrow="How Morrow works"
            title={
              <>
                Three steps.
                <br />
                <em className="italic">No black holes.</em>
              </>
            }
            description="From first look to final answer, you always know where you stand and what happens next."
          />
        </Reveal>
        <div className="mt-12 grid gap-x-8 gap-y-10 sm:grid-cols-3">
          {[
            {
              n: "01",
              title: "Set your signal",
              copy: "Tell us what you're good at and what you want next. One considered profile — not a form you fill out forever.",
              detail: "About 4 minutes",
            },
            {
              n: "02",
              title: "Shortlist with intent",
              copy: "Filter by salary, craft, and the way you want to work. Save the ones worth a second look, not the ones that merely exist.",
              detail: "Salary and timeline up front",
            },
            {
              n: "03",
              title: "Apply, then know",
              copy: "Apply with your profile in under a minute. Every team commits to a reply time, and your tracker keeps the receipts.",
              detail: "Average reply: 3 days",
            },
          ].map((step, index) => (
            <Reveal key={step.n} delay={index * 80}>
              <div className="relative border-t border-line-strong pt-5">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10.5px] tracking-[0.18em] text-stone-light">
                    {step.n}
                  </span>
                  <span className="rounded-full border border-line px-2.5 py-1 text-[10px] text-stone">
                    {step.detail}
                  </span>
                </div>
                <h3 className="display mt-7 text-[24px] tracking-[-0.02em] text-ink">
                  {step.title}
                </h3>
                <p className="mt-2.5 max-w-xs text-[13px] leading-relaxed text-stone">
                  {step.copy}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
        <Reveal delay={160}>
          <div className="mt-12 flex flex-wrap items-center gap-4 rounded-2xl border border-line bg-paper-raised px-5 py-4">
            <div className="flex -space-x-2">
              {[
                "avatar-sofia",
                "avatar-leila",
                "avatar-mei",
                "avatar-noah",
              ].map((name) => (
                <Avatar
                  key={name}
                  name={name}
                  src={`/images/${name}.jpg`}
                  size="xs"
                  className="ring-2 ring-paper"
                />
              ))}
            </div>
            <p className="text-[12.5px] text-stone">
              <span className="font-medium text-ink">68% of applications</span>{" "}
              get a first response within three days.
            </p>
            <Link
              href="/jobs"
              className="ml-auto inline-flex items-center gap-1.5 text-[12.5px] font-medium text-ink transition hover:text-clay-deep"
            >
              See for yourself
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </Reveal>
      </section>

      {/* ---------------- Spotlight ---------------- */}
      <section className="container-x pb-20 lg:pb-28">
        <Reveal>
          <div className="overflow-hidden rounded-[2rem] border border-line bg-paper-raised">
            <div className="grid lg:grid-cols-2">
              <div className="relative min-h-[300px] lg:min-h-[460px]">
                <Image
                  src="/images/team-meeting.jpg"
                  alt="The Lumen team working together around a table in a sunlit studio"
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/30 to-transparent lg:bg-gradient-to-r" />
                <div className="absolute left-5 top-5 inline-flex items-center gap-2 rounded-full border border-white/30 bg-paper/85 px-3 py-1.5 text-[10.5px] font-medium text-ink backdrop-blur">
                  <span className="h-1.5 w-1.5 rounded-full bg-sage" />
                  Company of the month · Lumen
                </div>
              </div>
              <div className="flex flex-col justify-center p-8 sm:p-12 lg:p-14">
                <p className="eyebrow">
                  <span className="h-1 w-1 rounded-full bg-clay" />
                  Why they&apos;re here
                </p>
                <blockquote className="display mt-6 text-[clamp(1.5rem,2.4vw,2rem)] leading-[1.18] tracking-[-0.02em] text-ink">
                  “We stopped writing job ads like legal documents. Candidates
                  arrive already knowing the salary and the process — so the
                  conversation starts{" "}
                  <em className="italic text-clay-deep">much further along</em>
                  .”
                </blockquote>
                <div className="mt-7 flex items-center gap-3">
                  <Avatar
                    name="Maya Chen"
                    src="/images/avatar-mei.jpg"
                    size="lg"
                  />
                  <div>
                    <p className="text-[13px] font-medium text-ink">
                      Maya Chen
                    </p>
                    <p className="text-[11.5px] text-stone">
                      Head of Design, Lumen
                    </p>
                  </div>
                </div>
                <div className="mt-9 grid grid-cols-3 gap-4 border-t border-line pt-6">
                  {[
                    { value: "3", label: "open roles" },
                    { value: "3 days", label: "average reply" },
                    { value: "92%", label: "candidate NPS" },
                  ].map((stat) => (
                    <div key={stat.label}>
                      <p className="display text-[22px] leading-none text-ink">
                        {stat.value}
                      </p>
                      <p className="mt-1.5 text-[10.5px] text-stone">
                        {stat.label}
                      </p>
                    </div>
                  ))}
                </div>
                <div className="mt-8 flex flex-wrap items-center gap-4">
                  <ButtonLink
                    href="/companies/lumen"
                    variant="outline"
                    size="sm"
                  >
                    Inside Lumen
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </ButtonLink>
                  <Link
                    href="/jobs?company=lumen"
                    className="link-underline text-[12.5px] font-medium text-ink transition hover:text-clay-deep"
                  >
                    See their open roles
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ---------------- Stories ---------------- */}
      <section className="border-t border-line bg-cream/40">
        <div className="container-x py-20 lg:py-28">
          <Reveal>
            <SectionHeading
              eyebrow="Notes from the other side"
              title={
                <>
                  People, not <em className="italic">pipelines</em>.
                </>
              }
              description="A few words from people who found their next chapter — and from the teams who found them."
            />
          </Reveal>
          <div className="mt-12 grid gap-4 md:grid-cols-3">
            {stories.map((story, index) => (
              <Reveal key={story.name} delay={index * 70}>
                <figure className="flex h-full flex-col rounded-2xl border border-line bg-paper-raised p-6">
                  <span
                    className="font-display text-[38px] leading-none text-clay/30"
                    aria-hidden="true"
                  >
                    “
                  </span>
                  <blockquote className="-mt-2 text-[13.5px] leading-relaxed text-ink-soft">
                    {story.quote}
                  </blockquote>
                  <figcaption className="mt-6 flex items-center gap-2.5 border-t border-line pt-4">
                    <Avatar name={story.name} src={story.avatar} size="sm" />
                    <div>
                      <p className="text-[12px] font-medium text-ink">
                        {story.name}
                      </p>
                      <p className="text-[10.5px] text-stone">{story.role}</p>
                    </div>
                  </figcaption>
                </figure>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- For teams ---------------- */}
      <section className="container-x py-20 lg:py-28">
        <Reveal>
          <div className="grain relative overflow-hidden rounded-[2rem] bg-ink px-6 py-16 text-paper sm:px-10 lg:px-16 lg:py-24">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -right-24 -top-32 h-[420px] w-[420px] rounded-full border border-paper/10"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -right-10 -top-20 h-[300px] w-[300px] rounded-full border border-paper/[0.07]"
            />
            <div className="relative grid gap-12 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
              <div>
                <p className="eyebrow text-paper/50">
                  <span className="h-1 w-1 rounded-full bg-ochre" />
                  For hiring teams
                </p>
                <h2 className="display mt-5 max-w-xl text-[clamp(2.1rem,4vw,3.2rem)] leading-[1.02] text-paper">
                  Hiring? <em className="italic text-ochre">Show your work.</em>
                </h2>
                <p className="mt-5 max-w-md text-[14px] leading-relaxed text-paper/60">
                  Post a role in minutes, see every candidate in one calm
                  pipeline, and give people an answer. The details you share are
                  the difference between a maybe and a yes.
                </p>
                <div className="mt-8 flex flex-wrap gap-3">
                  <ButtonLink href="/hire/jobs/new" variant="paper" size="md">
                    Post a role
                    <ArrowRight className="h-4 w-4" />
                  </ButtonLink>
                  <ButtonLink
                    href="/hire"
                    variant="outline"
                    size="md"
                    className="border-paper/25 text-paper hover:border-paper/60 hover:bg-paper/10"
                  >
                    Explore the workspace
                  </ButtonLink>
                </div>
              </div>
              <div className="space-y-3">
                {[
                  "Salary ranges shown on every listing",
                  "A hiring pipeline that updates in one click",
                  "Structured feedback, shared with candidates",
                  "Roles go live after a 12-hour review",
                ].map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-3 border-b border-paper/10 pb-3 text-[12.5px] text-paper/80"
                  >
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-paper/25">
                      <Check className="h-3 w-3" strokeWidth={2.4} />
                    </span>
                    {item}
                  </div>
                ))}
                <p className="pt-2 text-[11px] leading-relaxed text-paper/60">
                  Free for your first role. No card, no “growth” call.
                </p>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ---------------- Closing note ---------------- */}
      <section className="container-x pb-24">
        <Reveal>
          <div className="flex flex-col items-center gap-6 border-t border-line pt-14 text-center">
            <div className="flex items-center gap-1.5">
              {companies.slice(0, 5).map((company) => (
                <CompanyMark
                  key={company.slug}
                  monogram={company.monogram}
                  tone={company.tone}
                  size="sm"
                  className="ring-2 ring-paper"
                />
              ))}
              <span className="ml-2 text-[11.5px] text-stone">
                and 7 more considered teams
              </span>
            </div>
            <h2 className="display max-w-xl text-[clamp(1.8rem,3.2vw,2.6rem)] leading-[1.1] text-ink">
              Your next chapter is probably{" "}
              <em className="italic text-clay-deep">already open</em>.
            </h2>
            <p className="max-w-md text-[13.5px] leading-relaxed text-stone">
              Twenty-four roles. Real pay. Teams that reply. Take a look around
              — and take your time.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <ButtonLink href="/jobs" size="md">
                Browse open roles
                <ArrowRight className="h-4 w-4" />
              </ButtonLink>
              <ButtonLink href="/login?mode=create" variant="outline" size="md">
                Create your profile
              </ButtonLink>
            </div>
            <div className="mt-2 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[10.5px] text-stone-light">
              <span className="inline-flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-sage" /> Verified
                companies
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Banknote className="h-3.5 w-3.5 text-sage" /> Salary
                transparency
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Clock3 className="h-3.5 w-3.5 text-sage" /> Reply-time
                commitment
              </span>
            </div>
          </div>
        </Reveal>
      </section>
    </>
  );
}
