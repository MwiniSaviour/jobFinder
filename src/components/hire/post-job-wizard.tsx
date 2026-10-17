"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Banknote,
  Briefcase,
  Building2,
  Check,
  Clock3,
  Eye,
  Globe2,
  MapPin,
  Save,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CompanyMark } from "@/components/ui/company-mark";
import { Label, Select, TextInput, Textarea } from "@/components/ui/field";
import { useToast } from "@/components/ui/toast";
import { salaryShort } from "@/lib/utils";
import { cn } from "@/lib/utils";

const steps = [
  { number: 1, label: "Role basics", hint: "What and where" },
  { number: 2, label: "The details", hint: "Pay and expectations" },
  { number: 3, label: "Review", hint: "Publish with confidence" },
];

const workModeOptions = [
  { value: "Remote", detail: "Work from anywhere in the region", icon: Globe2 },
  {
    value: "Hybrid",
    detail: "Two or three days in the studio",
    icon: Building2,
  },
  { value: "On-site", detail: "Together, in person, every week", icon: Users },
];

export function PostJobWizard() {
  const [step, setStep] = useState(1);
  const [published, setPublished] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [title, setTitle] = useState("");
  const [department, setDepartment] = useState("Design");
  const [employmentType, setEmploymentType] = useState("Full-time");
  const [seniority, setSeniority] = useState("Senior");
  const [location, setLocation] = useState("Remote (UTC±3)");
  const [workMode, setWorkMode] = useState("Remote");
  const [salaryMin, setSalaryMin] = useState("100000");
  const [salaryMax, setSalaryMax] = useState("130000");
  const [summary, setSummary] = useState("");
  const [responsibilities, setResponsibilities] = useState("");
  const [skills, setSkills] = useState("");
  const [agreed, setAgreed] = useState(false);
  const { toast } = useToast();

  const min = Number(salaryMin) || 0;
  const max = Number(salaryMax) || 0;

  const stepOneValid = title.trim().length >= 4 && location.trim().length >= 2;
  const stepTwoValid = min >= 1000 && max >= min && summary.trim().length >= 40;
  const canPublish = stepOneValid && stepTwoValid && agreed;

  const publish = () => {
    setPublishing(true);
    setTimeout(() => {
      setPublishing(false);
      setPublished(true);
      toast({
        title: "Your role is live",
        description: "It's now visible to candidates across Morrow.",
        tone: "success",
      });
    }, 1000);
  };

  const restart = () => {
    setPublished(false);
    setStep(1);
    setTitle("");
    setSummary("");
    setResponsibilities("");
    setSkills("");
    setAgreed(false);
    setSalaryMin("100000");
    setSalaryMax("130000");
  };

  if (published) {
    return (
      <div className="mx-auto max-w-2xl py-10 text-center">
        <div className="relative mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-sage-soft">
          <span className="absolute inset-0 animate-ping rounded-full bg-sage/10" />
          <Check className="h-7 w-7 text-sage-deep" strokeWidth={2.2} />
        </div>
        <p className="eyebrow mt-6 justify-center">
          <span className="h-1 w-1 rounded-full bg-clay" />
          Published to Morrow
        </p>
        <h1 className="display mt-3 text-[clamp(2rem,4vw,2.8rem)] leading-tight text-ink">
          Your role is live.
        </h1>
        <p className="mx-auto mt-3 max-w-md text-[12.5px] leading-relaxed text-stone">
          <span className="font-medium text-ink">{title}</span> is now visible
          to candidates. It&apos;s been added to your pipeline, and applications
          will appear there in real time.
        </p>

        <div className="mx-auto mt-7 max-w-md rounded-xl border border-line bg-paper p-4 text-left">
          <div className="flex items-center gap-2.5">
            <CompanyMark monogram="L" tone="ink" size="sm" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-[12px] font-medium text-ink">
                {title}
              </p>
              <p className="truncate text-[10px] text-stone">
                {location} · {workMode} · ${salaryShort(min)} – $
                {salaryShort(max)}
              </p>
            </div>
            <span className="rounded-full bg-sage-soft px-2 py-0.5 text-[8.5px] font-medium text-sage-deep">
              Live
            </span>
          </div>
          <div className="mt-3 grid grid-cols-3 gap-2 border-t border-line pt-3">
            {[
              { label: "Visibility", value: "Public" },
              { label: "Reviewed", value: "Instant" },
              { label: "Reply by", value: "3 days" },
            ].map((item) => (
              <div key={item.label}>
                <p className="text-[8.5px] uppercase tracking-[0.08em] text-stone-light">
                  {item.label}
                </p>
                <p className="mt-0.5 text-[10px] font-medium text-ink">
                  {item.value}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-7 flex flex-col justify-center gap-2 sm:flex-row">
          <Link
            href="/hire/pipeline"
            className="inline-flex h-10 items-center justify-center gap-1.5 rounded-lg bg-ink px-4 text-[12px] font-medium text-paper transition hover:bg-ink-soft"
          >
            Open the pipeline
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
          <Link
            href="/jobs/lumen/senior-product-designer"
            className="inline-flex h-10 items-center justify-center gap-1.5 rounded-lg border border-line bg-paper px-4 text-[12px] font-medium text-ink transition hover:bg-cream"
          >
            <Eye className="h-3.5 w-3.5" />
            See how it looks
          </Link>
          <button
            type="button"
            onClick={restart}
            className="inline-flex h-10 items-center justify-center rounded-lg px-3 text-[12px] font-medium text-stone transition hover:text-ink"
          >
            Post another
          </button>
        </div>

        <div className="mt-8 flex items-center justify-center gap-2 text-[10px] text-stone-light">
          <ShieldCheck className="h-3.5 w-3.5 text-sage" />
          Meets the Morrow hiring standard — pay, process, and a reply either
          way.
        </div>
      </div>
    );
  }

  return (
    <>
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="eyebrow">
            <span className="h-1 w-1 rounded-full bg-clay" />
            Lumen · new role
          </p>
          <h1 className="display mt-2.5 text-[clamp(1.9rem,3vw,2.4rem)] leading-none text-ink">
            Post a role
          </h1>
          <p className="mt-2 max-w-lg text-[12px] text-stone">
            Clear, specific, and honest. The details you share now are the
            difference between a maybe and a yes.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() =>
              toast({
                title: "Draft saved",
                description: "Pick up where you left off any time.",
              })
            }
            className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-line bg-paper px-3.5 text-[11.5px] font-medium text-ink transition hover:bg-cream"
          >
            <Save className="h-3.5 w-3.5" />
            Save draft
          </button>
          <Link
            href="/hire/roles"
            className="inline-flex h-9 items-center rounded-lg px-3 text-[11.5px] font-medium text-stone transition hover:text-ink"
          >
            Cancel
          </Link>
        </div>
      </header>

      <div className="mt-6 grid gap-4 lg:grid-cols-[minmax(0,1fr)_300px] xl:grid-cols-[minmax(0,1fr)_316px]">
        <div className="overflow-hidden rounded-xl border border-line bg-paper">
          <div className="border-b border-line bg-cream/25 px-5 py-4">
            <ol className="flex items-center gap-2">
              {steps.map((item, index) => {
                const active = step === item.number;
                const done = step > item.number;
                return (
                  <li
                    key={item.number}
                    className="flex flex-1 items-center gap-2"
                  >
                    <button
                      type="button"
                      onClick={() => item.number < step && setStep(item.number)}
                      disabled={item.number > step}
                      className={cn(
                        "flex items-center gap-2 rounded-lg px-1.5 py-1 text-left transition",
                        item.number <= step
                          ? "cursor-pointer"
                          : "cursor-default",
                      )}
                    >
                      <span
                        className={cn(
                          "flex h-6 w-6 shrink-0 items-center justify-center rounded-full font-mono text-[9px]",
                          done && "bg-sage text-white",
                          active && "bg-ink text-paper",
                          !done &&
                            !active &&
                            "border border-line-strong bg-paper text-stone",
                        )}
                      >
                        {done ? (
                          <Check className="h-3 w-3" strokeWidth={3} />
                        ) : (
                          item.number
                        )}
                      </span>
                      <span className="hidden sm:block">
                        <span
                          className={cn(
                            "block text-[10.5px] font-medium",
                            active ? "text-ink" : "text-stone",
                          )}
                        >
                          {item.label}
                        </span>
                        <span className="block text-[8.5px] text-stone-light">
                          {item.hint}
                        </span>
                      </span>
                    </button>
                    {index < steps.length - 1 && (
                      <span
                        className={cn(
                          "h-px flex-1",
                          done ? "bg-sage/50" : "bg-line",
                        )}
                        aria-hidden="true"
                      />
                    )}
                  </li>
                );
              })}
            </ol>
          </div>

          <div className="p-5 sm:p-6">
            {step === 1 && (
              <div className="space-y-5">
                <div>
                  <Label htmlFor="job-title">Role title</Label>
                  <TextInput
                    id="job-title"
                    value={title}
                    onChange={(event) => setTitle(event.target.value)}
                    placeholder="Senior Product Designer"
                    autoFocus
                  />
                  <p className="mt-1.5 text-[10.5px] text-stone">
                    Use the title people search for. Save the poetry for the
                    description.
                  </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="job-department">Craft</Label>
                    <Select
                      id="job-department"
                      value={department}
                      onChange={(event) => setDepartment(event.target.value)}
                    >
                      {[
                        "Design",
                        "Engineering",
                        "Product",
                        "Marketing",
                        "Data",
                        "Operations",
                        "Customer Success",
                        "Editorial",
                      ].map((item) => (
                        <option key={item}>{item}</option>
                      ))}
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="job-type">Employment</Label>
                    <Select
                      id="job-type"
                      value={employmentType}
                      onChange={(event) =>
                        setEmploymentType(event.target.value)
                      }
                    >
                      <option>Full-time</option>
                      <option>Contract</option>
                      <option>Part-time</option>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="job-level">Level</Label>
                    <Select
                      id="job-level"
                      value={seniority}
                      onChange={(event) => setSeniority(event.target.value)}
                    >
                      <option>Entry</option>
                      <option>Mid</option>
                      <option>Senior</option>
                      <option>Lead</option>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="job-location">Location</Label>
                    <div className="relative">
                      <MapPin className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-stone" />
                      <TextInput
                        id="job-location"
                        value={location}
                        onChange={(event) => setLocation(event.target.value)}
                        className="pl-10"
                        placeholder="London, UK"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <div className="mb-2 flex items-baseline justify-between">
                    <Label className="mb-0">How you work</Label>
                    <span className="text-[9.5px] text-stone-light">
                      Shown prominently on the listing
                    </span>
                  </div>
                  <div className="grid gap-2 sm:grid-cols-3">
                    {workModeOptions.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setWorkMode(option.value)}
                        aria-pressed={workMode === option.value}
                        className={cn(
                          "rounded-xl border p-3 text-left transition",
                          workMode === option.value
                            ? "border-ink bg-cream/50 shadow-[inset_0_0_0_1px_#1a1b17]"
                            : "border-line bg-paper hover:border-line-strong",
                        )}
                      >
                        <option.icon className="h-4 w-4 text-stone" />
                        <p className="mt-2 text-[11.5px] font-medium text-ink">
                          {option.value}
                        </p>
                        <p className="mt-0.5 text-[9px] leading-snug text-stone">
                          {option.detail}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-5">
                <div>
                  <div className="mb-2 flex items-baseline justify-between">
                    <Label className="mb-0">Base salary range</Label>
                    <span className="text-[9.5px] text-stone-light">
                      USD · gross annual
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2.5">
                    <div className="relative">
                      <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[12px] text-stone">
                        $
                      </span>
                      <input
                        value={salaryMin}
                        onChange={(event) =>
                          setSalaryMin(event.target.value.replace(/\D/g, ""))
                        }
                        inputMode="numeric"
                        aria-label="Minimum salary"
                        className="input-base pl-7 text-[12.5px]"
                      />
                    </div>
                    <div className="relative">
                      <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[12px] text-stone">
                        $
                      </span>
                      <input
                        value={salaryMax}
                        onChange={(event) =>
                          setSalaryMax(event.target.value.replace(/\D/g, ""))
                        }
                        inputMode="numeric"
                        aria-label="Maximum salary"
                        className="input-base pl-7 text-[12.5px]"
                      />
                    </div>
                  </div>
                  <p className="mt-1.5 flex items-center gap-1 text-[10.5px] text-stone">
                    <ShieldCheck className="h-3 w-3 text-sage" />
                    Required. Roles without a range can&apos;t be published on
                    Morrow.
                  </p>
                </div>

                <div>
                  <div className="flex items-baseline justify-between">
                    <Label htmlFor="job-summary">The role in a paragraph</Label>
                    <span className="font-mono text-[9px] text-stone-light">
                      {summary.length} / 600
                    </span>
                  </div>
                  <Textarea
                    id="job-summary"
                    rows={4}
                    maxLength={600}
                    value={summary}
                    onChange={(event) => setSummary(event.target.value)}
                    placeholder="What is this role for, and what will change because someone does it well?"
                  />
                  <p className="mt-1.5 text-[10.5px] text-stone">
                    Lead with the outcome. Candidates should know why the role
                    exists after two sentences.
                  </p>
                </div>

                <div>
                  <Label htmlFor="job-responsibilities">
                    What they&apos;ll do
                  </Label>
                  <Textarea
                    id="job-responsibilities"
                    rows={5}
                    value={responsibilities}
                    onChange={(event) =>
                      setResponsibilities(event.target.value)
                    }
                    placeholder={
                      "Lead design for the core editor.\nPair with engineers to ship weekly.\nRaise the craft bar through critiques."
                    }
                  />
                  <p className="mt-1.5 text-[10.5px] text-stone">
                    One per line. Three to five is plenty.
                  </p>
                </div>

                <div>
                  <Label htmlFor="job-skills">Skills</Label>
                  <TextInput
                    id="job-skills"
                    value={skills}
                    onChange={(event) => setSkills(event.target.value)}
                    placeholder="Product design, Interaction design, Design systems"
                  />
                  <p className="mt-1.5 text-[10.5px] text-stone">
                    Comma separated. These power search and matching.
                  </p>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-5">
                <div className="rounded-xl border border-line bg-paper">
                  <div className="flex items-center justify-between border-b border-line px-4 py-3">
                    <p className="text-[11px] font-medium text-ink">
                      Role summary
                    </p>
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="text-[10px] font-medium text-stone underline decoration-line-strong underline-offset-4 transition hover:text-ink"
                    >
                      Edit details
                    </button>
                  </div>
                  <dl className="divide-y divide-line/70">
                    {[
                      { label: "Title", value: title || "—" },
                      { label: "Craft", value: department },
                      {
                        label: "Level & type",
                        value: `${seniority} · ${employmentType}`,
                      },
                      { label: "Location", value: `${location} · ${workMode}` },
                      {
                        label: "Salary",
                        value:
                          min && max
                            ? `$${salaryShort(min)} – $${salaryShort(max)} · USD annual`
                            : "—",
                      },
                      { label: "Skills", value: skills || "None added yet" },
                    ].map((item) => (
                      <div
                        key={item.label}
                        className="flex items-start justify-between gap-6 px-4 py-2.5"
                      >
                        <dt className="text-[10.5px] text-stone">
                          {item.label}
                        </dt>
                        <dd className="max-w-[62%] text-right text-[10.5px] font-medium text-ink">
                          {item.value}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </div>

                <div className="rounded-xl border border-line bg-cream/40 p-4">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-ochre" />
                    <p className="text-[11px] font-medium text-ink">
                      Your listing, by the number
                    </p>
                  </div>
                  <div className="mt-3 grid grid-cols-3 gap-2">
                    {[
                      { label: "Salary", value: "Visible" },
                      { label: "Process", value: `${4} steps` },
                      { label: "Reply", value: "3 days" },
                    ].map((item) => (
                      <div
                        key={item.label}
                        className="rounded-lg border border-line bg-paper px-2.5 py-2"
                      >
                        <p className="text-[8px] uppercase tracking-[0.08em] text-stone-light">
                          {item.label}
                        </p>
                        <p className="mt-0.5 text-[10px] font-medium text-ink">
                          {item.value}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <label className="flex cursor-pointer items-start gap-2.5 rounded-xl border border-line bg-paper p-4 text-[10.5px] leading-relaxed text-stone">
                  <input
                    type="checkbox"
                    checked={agreed}
                    onChange={(event) => setAgreed(event.target.checked)}
                    className="mt-0.5 h-4 w-4 shrink-0 appearance-none rounded-[4px] border border-line-strong bg-paper checked:border-ink checked:bg-ink"
                  />
                  <span>
                    I confirm this role meets the{" "}
                    <Link
                      href="/hire"
                      className="text-ink underline decoration-line-strong underline-offset-2"
                    >
                      Morrow hiring standard
                    </Link>
                    : a published salary range, a four-step process, and a reply
                    to every candidate.
                  </span>
                </label>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between gap-3 border-t border-line bg-cream/20 px-5 py-4">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="inline-flex h-9 items-center gap-1.5 text-[11.5px] font-medium text-stone transition hover:text-ink"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Back
              </button>
            ) : (
              <Link
                href="/hire/roles"
                className="inline-flex h-9 items-center gap-1.5 text-[11.5px] font-medium text-stone transition hover:text-ink"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Roles
              </Link>
            )}

            {step < 3 ? (
              <Button
                onClick={() => setStep(step + 1)}
                disabled={step === 1 ? !stepOneValid : !stepTwoValid}
                size="sm"
              >
                Continue
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            ) : (
              <Button
                onClick={publish}
                disabled={!canPublish || publishing}
                size="sm"
                className="min-w-[9rem]"
              >
                {publishing ? (
                  <>
                    <span className="h-3.5 w-3.5 animate-spin rounded-full border-[1.5px] border-paper/40 border-t-paper" />
                    Publishing
                  </>
                ) : (
                  <>
                    Publish role
                    <ArrowRight className="h-3.5 w-3.5" />
                  </>
                )}
              </Button>
            )}
          </div>
        </div>

        <aside className="space-y-4 xl:sticky xl:top-6 xl:self-start">
          <div className="rounded-xl border border-line bg-paper p-4">
            <div className="flex items-center justify-between">
              <p className="font-mono text-[8.5px] uppercase tracking-[0.14em] text-stone">
                Live preview
              </p>
              <span className="flex items-center gap-1 text-[8.5px] text-sage-deep">
                <span className="h-1.5 w-1.5 rounded-full bg-sage" />
                Updating
              </span>
            </div>
            <div className="mt-3 rounded-xl border border-line bg-paper p-4">
              <div className="flex items-center gap-2.5">
                <CompanyMark monogram="L" tone="ink" size="sm" />
                <div>
                  <p className="text-[10.5px] font-medium text-ink">Lumen</p>
                  <p className="text-[8.5px] text-stone-light">{department}</p>
                </div>
              </div>
              <h2 className="mt-3 text-[15px] font-medium leading-snug tracking-[-0.01em] text-ink">
                {title || "Your role title"}
              </h2>
              <p className="mt-1.5 line-clamp-2 text-[10px] leading-relaxed text-stone">
                {summary ||
                  "A short, specific summary of what this role is for — and what will change because of it."}
              </p>
              <div className="mt-2.5 flex flex-wrap gap-1">
                <Badge tone="sage">{workMode}</Badge>
                <Badge tone="outline">{seniority}</Badge>
              </div>
              <div className="mt-3 flex items-end justify-between border-t border-line pt-3">
                <div>
                  <p className="text-[7.5px] uppercase tracking-[0.1em] text-stone-light">
                    Base salary
                  </p>
                  <p className="mt-0.5 text-[10.5px] font-medium text-ink">
                    {min && max
                      ? `$${salaryShort(min)} – $${salaryShort(max)}`
                      : "$—"}
                    <span className="font-normal text-stone-light"> / yr</span>
                  </p>
                </div>
                <p className="flex items-center gap-1 text-[8.5px] text-stone">
                  <MapPin className="h-2.5 w-2.5" />
                  {location || "Location"}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-line bg-paper p-4">
            <p className="flex items-center gap-1.5 text-[10.5px] font-medium text-ink">
              <ShieldCheck className="h-3.5 w-3.5 text-sage" />
              What candidates will see
            </p>
            <ul className="mt-2.5 space-y-2">
              {[
                { label: "A real salary range", icon: Banknote },
                { label: "A four-step process", icon: Briefcase },
                { label: "A reply within 3 days", icon: Clock3 },
                { label: "Your values, not just perks", icon: Sparkles },
              ].map((item) => (
                <li
                  key={item.label}
                  className="flex items-center gap-2 text-[10px] text-stone"
                >
                  <item.icon className="h-3 w-3 text-stone-light" />
                  {item.label}
                  <Check className="ml-auto h-3 w-3 text-sage" />
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-xl bg-ink p-4 text-paper">
            <p className="flex items-center gap-1.5 text-[10.5px] font-medium">
              <Sparkles className="h-3 w-3 text-ochre" strokeWidth={2} />A note
              on good listings
            </p>
            <p className="mt-1.5 text-[10px] leading-relaxed text-paper/70">
              Roles that name the outcome get 2.4× more qualified applicants
              than roles that list requirements. Start with the change, then the
              tasks.
            </p>
          </div>
        </aside>
      </div>
    </>
  );
}
