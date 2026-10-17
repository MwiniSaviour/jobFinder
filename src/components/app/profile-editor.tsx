"use client";

import { useState } from "react";
import {
  ArrowUpRight,
  Check,
  Eye,
  FileText,
  Globe2,
  Link2,
  MapPin,
  Pencil,
  Plus,
  Share2,
  X,
} from "lucide-react";
import { candidate } from "@/data/candidate";
import { Avatar } from "@/components/ui/avatar";
import {
  Label,
  Select,
  TextInput,
  Textarea,
  Toggle,
} from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";

const sections = [
  { id: "basics", label: "Basics" },
  { id: "about", label: "About" },
  { id: "skills", label: "Skills" },
  { id: "experience", label: "Experience" },
  { id: "education", label: "Education & links" },
  { id: "preferences", label: "Preferences" },
];

export function ProfileEditor() {
  const [dirty, setDirty] = useState(false);
  const [name, setName] = useState(candidate.name);
  const [headline, setHeadline] = useState(candidate.headline);
  const [location, setLocation] = useState(candidate.location);
  const [email, setEmail] = useState(candidate.email);
  const [phone, setPhone] = useState(candidate.phone);
  const [summary, setSummary] = useState(candidate.summary);
  const [skills, setSkills] = useState(candidate.skills);
  const [skillInput, setSkillInput] = useState("");
  const [openToWork, setOpenToWork] = useState(true);
  const [visible, setVisible] = useState(true);
  const [alerts, setAlerts] = useState(true);
  const { toast } = useToast();

  const touch = () => setDirty(true);

  const save = () => {
    setDirty(false);
    toast({
      title: "Profile saved",
      description: "Your changes are live for hiring teams.",
      tone: "success",
    });
  };

  const addSkill = () => {
    const value = skillInput.trim();
    if (!value || skills.includes(value)) return;
    setSkills([...skills, value]);
    setSkillInput("");
    touch();
  };

  return (
    <>
      <section className="border-b border-line bg-cream/30">
        <div className="container-x pb-7 pt-8 lg:pt-10">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <p className="eyebrow">
                <span className="h-1 w-1 rounded-full bg-clay" />
                Your profile
              </p>
              <h1 className="display mt-3 text-[clamp(2.1rem,3.6vw,2.8rem)] leading-[1.02] text-ink">
                The considered version of you.
              </h1>
              <p className="mt-2 text-[13px] text-stone">
                One strong profile, reused with care. Only what you choose is
                shared.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() =>
                  toast({
                    title: "Preview copied",
                    description:
                      "Your public profile link is on the clipboard.",
                  })
                }
                className="inline-flex h-9 items-center gap-1.5 rounded-[9px] border border-line-strong px-3.5 text-[12px] font-medium text-ink transition hover:bg-cream"
              >
                <Share2 className="h-3.5 w-3.5" />
                Share profile
              </button>
              {dirty ? (
                <Button onClick={save} size="sm" className="min-w-[7.5rem]">
                  Save changes
                </Button>
              ) : (
                <span className="inline-flex h-9 min-w-[7.5rem] items-center justify-center gap-1.5 rounded-[9px] border border-sage/25 bg-sage-soft/50 px-3.5 text-[13px] font-medium text-sage-deep">
                  <Check className="h-3.5 w-3.5" />
                  All saved
                </span>
              )}
            </div>
          </div>
        </div>
      </section>

      <div className="container-x grid gap-8 py-8 lg:grid-cols-[210px_minmax(0,1fr)_310px] lg:gap-10">
        <aside className="hidden lg:block">
          <nav
            className="sticky top-[88px] space-y-0.5"
            aria-label="Profile sections"
          >
            {sections.map((section, index) => (
              <a
                key={section.id}
                href={`#${section.id}`}
                className="group flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[12px] text-stone transition hover:bg-cream hover:text-ink"
              >
                <span className="font-mono text-[8.5px] text-stone-light">
                  0{index + 1}
                </span>
                {section.label}
              </a>
            ))}
            <div className="mt-6 border-t border-line pt-4">
              <div className="rounded-xl border border-line bg-paper-raised p-3.5">
                <p className="text-[11px] font-medium text-ink">Resume</p>
                <div className="mt-2 flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-clay-soft text-clay-deep">
                    <FileText className="h-4 w-4" />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-[10.5px] font-medium text-ink">
                      amara-mensah.pdf
                    </p>
                    <p className="text-[9.5px] text-stone-light">
                      Updated 2 Oct
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    toast({
                      title: "Upload a new resume",
                      description: "PDF or DOCX, up to 5 MB.",
                    })
                  }
                  className="mt-2.5 text-[10.5px] font-medium text-ink underline decoration-line-strong underline-offset-4"
                >
                  Replace file
                </button>
              </div>
            </div>
          </nav>
        </aside>

        <div className="min-w-0 space-y-4">
          <section
            id="basics"
            className="rounded-2xl border border-line bg-paper-raised p-5 sm:p-6"
          >
            <SectionTitle
              number="01"
              title="Basics"
              hint="The first thing a hiring team reads."
            />
            <div className="mt-5 flex items-center gap-4">
              <Avatar name={name} src={candidate.avatar} size="xl" />
              <div>
                <button
                  type="button"
                  onClick={() =>
                    toast({
                      title: "Photo upload",
                      description: "Use a plain background and natural light.",
                    })
                  }
                  className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-line-strong px-3 text-[11px] font-medium text-ink transition hover:bg-cream"
                >
                  <Pencil className="h-3 w-3" />
                  Change photo
                </button>
                <p className="mt-1.5 text-[10px] text-stone-light">
                  JPG or PNG, at least 400 × 400px
                </p>
              </div>
            </div>
            <div className="mt-5 grid gap-3.5 sm:grid-cols-2">
              <div>
                <Label htmlFor="p-name">Full name</Label>
                <TextInput
                  id="p-name"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    touch();
                  }}
                />
              </div>
              <div>
                <Label htmlFor="p-headline">Headline</Label>
                <TextInput
                  id="p-headline"
                  value={headline}
                  onChange={(e) => {
                    setHeadline(e.target.value);
                    touch();
                  }}
                />
              </div>
              <div>
                <Label htmlFor="p-location">Location</Label>
                <TextInput
                  id="p-location"
                  value={location}
                  onChange={(e) => {
                    setLocation(e.target.value);
                    touch();
                  }}
                />
              </div>
              <div>
                <Label htmlFor="p-phone" optional>
                  Phone
                </Label>
                <TextInput
                  id="p-phone"
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value);
                    touch();
                  }}
                />
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="p-email">Email</Label>
                <TextInput
                  id="p-email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    touch();
                  }}
                />
              </div>
            </div>
          </section>

          <section
            id="about"
            className="rounded-2xl border border-line bg-paper-raised p-5 sm:p-6"
          >
            <SectionTitle
              number="02"
              title="About"
              hint="In your own words — not a cover letter."
            />
            <div className="mt-5">
              <Textarea
                id="p-summary"
                rows={5}
                maxLength={900}
                value={summary}
                onChange={(e) => {
                  setSummary(e.target.value);
                  touch();
                }}
                aria-label="About you"
              />
              <p className="mt-1.5 text-right font-mono text-[9.5px] text-stone-light">
                {summary.length} / 900
              </p>
            </div>
          </section>

          <section
            id="skills"
            className="rounded-2xl border border-line bg-paper-raised p-5 sm:p-6"
          >
            <SectionTitle
              number="03"
              title="Skills"
              hint="Six to eight, specific beats broad."
            />
            <div className="mt-5 flex flex-wrap gap-2">
              {skills.map((skill) => (
                <span
                  key={skill}
                  className="inline-flex items-center gap-1.5 rounded-full border border-line bg-cream/50 py-1.5 pl-3 pr-1.5 text-[11.5px] text-ink-soft"
                >
                  {skill}
                  <button
                    type="button"
                    onClick={() => {
                      setSkills(skills.filter((item) => item !== skill));
                      touch();
                    }}
                    aria-label={`Remove ${skill}`}
                    className="rounded-full p-1 text-stone transition hover:bg-sand hover:text-ink"
                  >
                    <X className="h-2.5 w-2.5" />
                  </button>
                </span>
              ))}
            </div>
            <div className="mt-4 flex gap-2">
              <TextInput
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addSkill();
                  }
                }}
                placeholder="Add a skill, then press Enter"
                aria-label="Add a skill"
                className="h-10 min-h-0 text-[12.5px]"
              />
              <button
                type="button"
                onClick={addSkill}
                className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-line-strong text-ink transition hover:bg-cream"
                aria-label="Add skill"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </section>

          <section
            id="experience"
            className="rounded-2xl border border-line bg-paper-raised p-5 sm:p-6"
          >
            <SectionTitle
              number="04"
              title="Experience"
              hint="The work, and what changed because of it."
            />
            <div className="mt-5 space-y-2.5">
              {candidate.experience.map((role, index) => (
                <div
                  key={`${role.company}-${role.role}`}
                  className="group rounded-xl border border-line bg-paper p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex gap-3">
                      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-cream font-mono text-[10px] text-stone">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <div>
                        <p className="text-[13px] font-medium text-ink">
                          {role.role} · {role.company}
                        </p>
                        <p className="mt-0.5 text-[10.5px] text-stone">
                          {role.period} · {role.location}
                        </p>
                        <p className="mt-2 max-w-lg text-[11.5px] leading-relaxed text-stone">
                          {role.summary}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        toast({
                          title: "Edit experience",
                          description: "Inline editing would open here.",
                        })
                      }
                      aria-label={`Edit ${role.role}`}
                      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-stone opacity-0 transition hover:bg-cream hover:text-ink group-hover:opacity-100"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={() =>
                  toast({
                    title: "Add a role",
                    description: "Tell us the company, title, and dates.",
                  })
                }
                className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-line-strong py-3 text-[11.5px] font-medium text-stone transition hover:border-ink/30 hover:text-ink"
              >
                <Plus className="h-3.5 w-3.5" />
                Add a role
              </button>
            </div>
          </section>

          <section
            id="education"
            className="rounded-2xl border border-line bg-paper-raised p-5 sm:p-6"
          >
            <SectionTitle
              number="05"
              title="Education & links"
              hint="The proof, and where to find more."
            />
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-[10px] font-medium uppercase tracking-[0.1em] text-stone-light">
                  Education
                </p>
                {candidate.education.map((item) => (
                  <div
                    key={item.school}
                    className="mt-2 rounded-xl border border-line bg-paper p-3.5"
                  >
                    <p className="text-[12px] font-medium leading-snug text-ink">
                      {item.school}
                    </p>
                    <p className="mt-0.5 text-[10.5px] text-stone">
                      {item.credential}
                    </p>
                    <p className="mt-0.5 font-mono text-[9.5px] text-stone-light">
                      {item.period}
                    </p>
                  </div>
                ))}
              </div>
              <div>
                <p className="text-[10px] font-medium uppercase tracking-[0.1em] text-stone-light">
                  Links
                </p>
                <div className="mt-2 space-y-2">
                  {candidate.links.map((link) => (
                    <div
                      key={link.label}
                      className="flex items-center gap-2.5 rounded-xl border border-line bg-paper px-3 py-2.5"
                    >
                      <Link2 className="h-3.5 w-3.5 shrink-0 text-stone" />
                      <div className="min-w-0 flex-1">
                        <p className="text-[9.5px] uppercase tracking-[0.08em] text-stone-light">
                          {link.label}
                        </p>
                        <p className="truncate text-[11px] text-ink">
                          {link.value}
                        </p>
                      </div>
                      <ArrowUpRight className="h-3 w-3 shrink-0 text-stone-light" />
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() =>
                      toast({
                        title: "Add a link",
                        description:
                          "Portfolios, case studies, writing — all welcome.",
                      })
                    }
                    className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-line-strong py-2.5 text-[11px] font-medium text-stone transition hover:border-ink/30 hover:text-ink"
                  >
                    <Plus className="h-3 w-3" />
                    Add link
                  </button>
                </div>
              </div>
            </div>
          </section>

          <section
            id="preferences"
            className="rounded-2xl border border-line bg-paper-raised p-5 sm:p-6"
          >
            <SectionTitle
              number="06"
              title="Preferences"
              hint="What you want next, and who can see it."
            />
            <div className="mt-4 grid gap-3.5 sm:grid-cols-2">
              <div>
                <Label htmlFor="p-mode">Work style</Label>
                <Select id="p-mode" defaultValue="Remote or hybrid">
                  <option>Remote or hybrid</option>
                  <option>Remote only</option>
                  <option>Hybrid</option>
                  <option>On-site</option>
                </Select>
              </div>
              <div>
                <Label htmlFor="p-salary">Minimum base salary</Label>
                <Select id="p-salary" defaultValue="$110,000">
                  <option>$80,000</option>
                  <option>$95,000</option>
                  <option>$110,000</option>
                  <option>$130,000</option>
                </Select>
              </div>
              <div>
                <Label htmlFor="p-tz">Time zone</Label>
                <Select id="p-tz" defaultValue="GMT (Accra)">
                  <option>GMT (Accra)</option>
                  <option>GMT+1 (Lagos)</option>
                  <option>GMT+2 (Cape Town)</option>
                  <option>GMT+4 (Dubai)</option>
                </Select>
              </div>
              <div>
                <Label htmlFor="p-start">Available from</Label>
                <Select id="p-start" defaultValue="November 2026">
                  <option>Immediately</option>
                  <option>November 2026</option>
                  <option>January 2027</option>
                  <option>Flexible</option>
                </Select>
              </div>
            </div>
            <div className="mt-5 divide-y divide-line border-t border-line">
              <Toggle
                id="open-to-work"
                checked={openToWork}
                onChange={() => {
                  setOpenToWork(!openToWork);
                  touch();
                }}
                label="Open to work"
                description="Show a quiet availability badge on your profile."
              />
              <Toggle
                id="visible"
                checked={visible}
                onChange={() => {
                  setVisible(!visible);
                  touch();
                }}
                label="Discoverable by hiring teams"
                description="Verified teams can find you in candidate search."
              />
              <Toggle
                id="alerts"
                checked={alerts}
                onChange={() => {
                  setAlerts(!alerts);
                  touch();
                }}
                label="Weekly role note"
                description="Six roles, every Thursday. Unsubscribe any time."
              />
            </div>
          </section>
        </div>

        <aside className="hidden lg:block">
          <div className="sticky top-[88px] space-y-4">
            <div className="overflow-hidden rounded-2xl border border-line bg-paper-raised">
              <div className="h-16 bg-[radial-gradient(circle_at_30%_20%,#f0d6c9,transparent_60%),radial-gradient(circle_at_70%_80%,#e2eade,transparent_60%)] bg-cream" />
              <div className="-mt-8 px-4 pb-4">
                <Avatar
                  name={name}
                  src={candidate.avatar}
                  size="xl"
                  className="ring-4 ring-paper-raised"
                />
                <p className="mt-3 text-[14px] font-medium text-ink">
                  {name || "Your name"}
                </p>
                <p className="mt-0.5 text-[11px] leading-snug text-stone">
                  {headline}
                </p>
                <p className="mt-2 flex items-center gap-1 text-[10px] text-stone-light">
                  <MapPin className="h-3 w-3" />
                  {location}
                </p>
                {openToWork && (
                  <span className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-sage-soft px-2.5 py-1 text-[9.5px] font-medium text-sage-deep">
                    <span className="h-1.5 w-1.5 rounded-full bg-sage" />
                    Open to work
                  </span>
                )}
                <div className="mt-3 flex flex-wrap gap-1">
                  {skills.slice(0, 4).map((skill) => (
                    <span
                      key={skill}
                      className="rounded-full bg-cream px-2 py-0.5 text-[9px] text-stone"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
                <div className="mt-4 flex items-center justify-between border-t border-line pt-3">
                  <span className="flex items-center gap-1.5 text-[10px] text-stone">
                    <Eye className="h-3 w-3" />
                    {visible ? "Public" : "Private"}
                  </span>
                  <span className="flex items-center gap-1.5 text-[10px] text-stone">
                    <Globe2 className="h-3 w-3" />
                    morrow.work/amara
                  </span>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-line bg-cream/50 p-4">
              <p className="text-[11px] font-medium text-ink">
                Profile strength · 92%
              </p>
              <div className="mt-2.5 h-1 w-full overflow-hidden rounded-full bg-sand">
                <div className="h-full w-[92%] rounded-full bg-sage" />
              </div>
              <ul className="mt-3 space-y-2">
                {[
                  "Headline & summary",
                  "Three roles added",
                  "Skills & tools",
                  "Two portfolio links",
                ].map((item, index) => (
                  <li
                    key={item}
                    className="flex items-center gap-2 text-[10.5px] text-stone"
                  >
                    <span
                      className={cn(
                        "flex h-3.5 w-3.5 items-center justify-center rounded-full",
                        index === 3
                          ? "border border-line-strong text-transparent"
                          : "bg-sage-soft text-sage-deep",
                      )}
                    >
                      <Check className="h-2.5 w-2.5" strokeWidth={3} />
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </aside>
      </div>

      {dirty && (
        <div className="fixed inset-x-0 bottom-16 z-40 border-t border-line bg-paper-raised px-4 py-3 shadow-panel md:bottom-0">
          <div className="container-x flex items-center justify-between gap-4">
            <p className="text-[11.5px] text-stone">
              You have unsaved changes.
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setDirty(false)}
                className="inline-flex h-8 items-center rounded-lg px-3 text-[11px] font-medium text-stone transition hover:text-ink"
              >
                Discard
              </button>
              <Button onClick={save} size="sm">
                Save changes
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function SectionTitle({
  number,
  title,
  hint,
}: {
  number: string;
  title: string;
  hint: string;
}) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-line pb-3">
      <div className="flex items-baseline gap-2.5">
        <span className="font-mono text-[8.5px] tracking-[0.1em] text-stone-light">
          {number}
        </span>
        <h2 className="display text-[19px] text-ink">{title}</h2>
      </div>
      <p className="text-[10.5px] text-stone-light">{hint}</p>
    </div>
  );
}
