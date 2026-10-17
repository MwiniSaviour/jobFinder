"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  CalendarCheck,
  Check,
  FileText,
  Lock,
  Send,
  ShieldCheck,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { CompanyMark } from "@/components/ui/company-mark";
import { candidate } from "@/data/candidate";
import { salaryLabel, type Job } from "@/data/jobs";
import type { Company } from "@/data/companies";
import { cn } from "@/lib/utils";

export function ApplyQuiz({
  job,
  company,
  variant = "sidebar",
}: {
  job: Job;
  company: Company;
  variant?: "sidebar" | "mobile";
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [note, setNote] = useState("");
  const [shareProfile, setShareProfile] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const open = () => {
    setStep(1);
    dialogRef.current?.showModal();
  };
  const close = () => {
    dialogRef.current?.close();
  };

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const handleClose = () => setSubmitting(false);
    dialog.addEventListener("close", handleClose);
    return () => dialog.removeEventListener("close", handleClose);
  }, []);

  const submit = () => {
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setStep(3);
    }, 900);
  };

  return (
    <>
      {variant === "sidebar" ? (
        <Button onClick={open} size="lg" className="w-full">
          Apply for this role
          <ArrowRight className="h-4 w-4" />
        </Button>
      ) : (
        <Button onClick={open} className="h-11 flex-1 rounded-xl text-[13.5px]">
          Apply now
          <ArrowRight className="h-4 w-4" />
        </Button>
      )}

      <dialog
        ref={dialogRef}
        aria-labelledby={`apply-title-${variant}`}
        className="fixed inset-0 z-[100] m-auto w-[calc(100%-1.5rem)] max-w-[540px] bg-transparent p-0 backdrop:bg-ink/50 backdrop:backdrop-blur-[3px] open:animate-scale-in"
        onClick={(event) => {
          if (event.target === dialogRef.current) close();
        }}
      >
        <div className="max-h-[92vh] overflow-y-auto rounded-[1.5rem] border border-line bg-paper shadow-panel">
          {/* Header */}
          <div className="flex items-start justify-between gap-4 border-b border-line px-5 py-4 sm:px-6">
            <div className="flex items-center gap-3">
              <CompanyMark
                monogram={company.monogram}
                tone={company.tone}
                size="md"
              />
              <div>
                <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-stone">
                  Applying to
                </p>
                <p
                  id={`apply-title-${variant}`}
                  className="text-[13.5px] font-medium leading-snug text-ink"
                >
                  {job.title} · {company.name}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={close}
              aria-label="Close application"
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-line text-stone transition hover:bg-cream hover:text-ink"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {step < 3 && (
            <div className="flex items-center gap-2 border-b border-line bg-cream/40 px-5 py-3 sm:px-6">
              {["Your profile", "Review", "Sent"].map((label, index) => {
                const number = index + 1;
                const current = step === number;
                const done = step > number;
                return (
                  <div key={label} className="flex flex-1 items-center gap-2">
                    <span
                      className={cn(
                        "flex h-5 w-5 shrink-0 items-center justify-center rounded-full font-mono text-[9px]",
                        done && "bg-sage text-white",
                        current && "bg-ink text-paper",
                        !done &&
                          !current &&
                          "border border-line-strong bg-paper text-stone",
                      )}
                    >
                      {done ? (
                        <Check className="h-3 w-3" strokeWidth={3} />
                      ) : (
                        number
                      )}
                    </span>
                    <span
                      className={cn(
                        "whitespace-nowrap text-[10.5px] font-medium",
                        current ? "text-ink" : "text-stone",
                      )}
                    >
                      {label}
                    </span>
                    {index < 2 && (
                      <span
                        className="h-px flex-1 bg-line"
                        aria-hidden="true"
                      />
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {step === 1 && (
            <div className="px-5 py-5 sm:px-6">
              <h2 className="display text-[22px] tracking-[-0.02em] text-ink">
                One minute. That&apos;s it.
              </h2>
              <p className="mt-1.5 text-[12.5px] leading-relaxed text-stone">
                Your Morrow profile is ready to send. Add a note if you&apos;d
                like — it&apos;s optional, and it&apos;s read by a person.
              </p>

              <div className="mt-5 flex items-center gap-3 rounded-xl border border-line bg-paper-raised p-3.5">
                <Avatar
                  name={candidate.name}
                  src={candidate.avatar}
                  size="lg"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-[13.5px] font-medium text-ink">
                    {candidate.name}
                  </p>
                  <p className="text-[11.5px] text-stone">
                    {candidate.role} · {candidate.location}
                  </p>
                  <div className="mt-1.5 flex flex-wrap gap-1">
                    {candidate.skills.slice(0, 3).map((skill) => (
                      <span
                        key={skill}
                        className="rounded-full bg-cream px-2 py-0.5 text-[9.5px] text-stone"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
                <Link
                  href="/dashboard/profile"
                  className="shrink-0 text-[11px] font-medium text-ink underline decoration-line-strong underline-offset-4"
                >
                  Edit
                </Link>
              </div>

              <div className="mt-3 grid gap-2">
                <label className="sr-only" htmlFor="apply-email">
                  Email
                </label>
                <input
                  id="apply-email"
                  defaultValue={candidate.email}
                  className="input-base h-10 min-h-0 text-[12.5px]"
                  aria-label="Contact email"
                />
                <input
                  defaultValue={candidate.phone}
                  className="input-base h-10 min-h-0 text-[12.5px]"
                  aria-label="Contact phone"
                />
              </div>

              <div className="mt-4">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="apply-note"
                    className="text-[12px] font-medium text-ink-soft"
                  >
                    A note to the team
                  </label>
                  <span className="text-[10px] text-stone-light">Optional</span>
                </div>
                <textarea
                  id="apply-note"
                  value={note}
                  onChange={(event) => setNote(event.target.value)}
                  rows={3}
                  maxLength={600}
                  placeholder={`Why this role, in your own words. Keep it short — they'll read the rest of your profile anyway.`}
                  className="input-base mt-1.5 resize-none text-[12.5px] leading-relaxed"
                />
              </div>

              <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-line bg-cream/40 p-3.5">
                <div className="relative mt-0.5 flex">
                  <input
                    id="share-profile"
                    type="checkbox"
                    checked={shareProfile}
                    onChange={(event) => setShareProfile(event.target.checked)}
                    className="peer h-4 w-4 appearance-none rounded-[4px] border border-line-strong bg-paper checked:border-ink checked:bg-ink"
                  />
                  <Check className="pointer-events-none absolute left-0.5 top-0.5 h-3 w-3 text-paper opacity-0 peer-checked:opacity-100" />
                </div>
                <label
                  htmlFor="share-profile"
                  className="text-[11.5px] leading-relaxed text-stone"
                >
                  Share my full Morrow profile — experience, skills, and
                  portfolio links — with {company.name}.
                </label>
              </div>

              <div className="mt-5 flex items-center justify-between gap-4">
                <p className="flex items-center gap-1.5 text-[10px] text-stone-light">
                  <Lock className="h-3 w-3" />
                  Never shared with third parties
                </p>
                <Button
                  onClick={() => setStep(2)}
                  size="md"
                  className="shrink-0"
                >
                  Continue
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="px-5 py-5 sm:px-6">
              <h2 className="display text-[22px] tracking-[-0.02em] text-ink">
                A last look.
              </h2>
              <p className="mt-1.5 text-[12.5px] leading-relaxed text-stone">
                This is exactly what {company.name} will receive. You can
                withdraw at any time.
              </p>

              <div className="mt-5 space-y-2.5 rounded-xl border border-line bg-paper-raised p-4">
                <ReviewRow label="Name" value={candidate.name} />
                <ReviewRow label="Email" value={candidate.email} />
                <ReviewRow label="Location" value={candidate.location} />
                <ReviewRow
                  label="Profile"
                  value={`${candidate.years} years · ${candidate.skills.length} skills`}
                />
                <div className="border-t border-line pt-2.5">
                  <p className="text-[10.5px] text-stone">Attached</p>
                  <div className="mt-1.5 flex items-center gap-2">
                    <span className="flex h-7 w-7 items-center justify-center rounded-md bg-clay-soft text-clay-deep">
                      <FileText className="h-3.5 w-3.5" />
                    </span>
                    <span className="text-[11.5px] font-medium text-ink">
                      amara-mensah.pdf
                    </span>
                    <span className="text-[10px] text-stone-light">214 KB</span>
                  </div>
                </div>
                {note.trim() && (
                  <div className="border-t border-line pt-2.5">
                    <p className="text-[10.5px] text-stone">Your note</p>
                    <p className="mt-1 text-[11.5px] leading-relaxed text-ink-soft">
                      {note}
                    </p>
                  </div>
                )}
              </div>

              <div className="mt-3 flex items-start gap-2.5 rounded-xl bg-sage-soft/60 p-3.5">
                <CalendarCheck className="mt-0.5 h-4 w-4 shrink-0 text-sage-deep" />
                <p className="text-[11.5px] leading-relaxed text-sage-deep">
                  {company.name} commits to replying within{" "}
                  {company.responseTime.replace("Usually replies within ", "")}.
                  Your tracker will keep the dates.
                </p>
              </div>

              <div className="mt-5 flex items-center justify-between gap-4">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="inline-flex items-center gap-1.5 text-[12px] font-medium text-stone transition hover:text-ink"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  Back
                </button>
                <Button
                  onClick={submit}
                  disabled={submitting}
                  size="md"
                  className="min-w-[10.5rem] shrink-0"
                >
                  {submitting ? (
                    <>
                      <span className="h-3.5 w-3.5 animate-spin rounded-full border-[1.5px] border-paper/40 border-t-paper" />
                      Sending
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      Send application
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="px-6 py-10 text-center sm:px-10">
              <div className="relative mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-sage-soft">
                <span className="absolute inset-0 animate-ping rounded-full bg-sage/10" />
                <Check className="h-7 w-7 text-sage-deep" strokeWidth={2.2} />
              </div>
              <h2 className="display mt-6 text-[28px] tracking-[-0.02em] text-ink">
                Application sent.
              </h2>
              <p className="mx-auto mt-2 max-w-xs text-[13px] leading-relaxed text-stone">
                Your profile is with {company.name}. You&apos;ll hear back
                within{" "}
                {company.responseTime.replace("Usually replies within ", "")} —
                and we&apos;ll nudge them if you don&apos;t.
              </p>

              <div className="mx-auto mt-6 max-w-sm rounded-xl border border-line bg-paper-raised p-4 text-left">
                <div className="flex items-center gap-2.5">
                  <CompanyMark
                    monogram={company.monogram}
                    tone={company.tone}
                    size="sm"
                  />
                  <div>
                    <p className="text-[12.5px] font-medium text-ink">
                      {job.title}
                    </p>
                    <p className="text-[10.5px] text-stone">
                      {company.name} · {salaryLabel(job)}
                    </p>
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-1.5 border-t border-line pt-3 text-[10.5px] text-stone">
                  <ShieldCheck className="h-3.5 w-3.5 text-sage" />
                  Tracking automatically in your dashboard
                </div>
              </div>

              <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
                <Link
                  href="/dashboard"
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-ink px-5 text-[13px] font-medium text-paper transition hover:bg-ink-soft"
                >
                  View in your tracker
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <button
                  type="button"
                  onClick={close}
                  className="inline-flex h-11 items-center justify-center rounded-xl border border-line-strong px-5 text-[13px] font-medium text-ink transition hover:bg-cream"
                >
                  Keep browsing
                </button>
              </div>
            </div>
          )}
        </div>
      </dialog>
    </>
  );
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 text-[11.5px]">
      <span className="text-stone">{label}</span>
      <span className="text-right font-medium text-ink">{value}</span>
    </div>
  );
}
