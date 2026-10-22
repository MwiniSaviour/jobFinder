"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import type { CSSProperties, FormEvent } from "react";
import Link from "next/link";
import { SectionHeader } from "@/components/SectionHeader";
import {
  ArrowRightIcon,
  CreditCardIcon,
  GraduationCapIcon,
  PencilIcon,
  ShieldCheckIcon,
  SignOutIcon,
  UserIcon,
} from "@/components/Icons";
import {
  addPaymentMethod,
  addSkill,
  clearSessionFilters,
  detectCardBrand,
  eraseLocalData,
  formatCardNumber,
  isValidExpiry,
  onProfileChange,
  parseExpiry,
  profileStore,
  removePaymentMethod,
  removeQualification,
  removeSkill,
  saveQualification,
  setDefaultPaymentMethod,
  setNotifications,
  updateIdentity,
  type Qualification,
} from "@/lib/profile";

type Draft = {
  name: string;
  email: string;
  phone: string;
  city: string;
};

type QualificationDraft = {
  id: string | null;
  title: string;
  org: string;
  period: string;
  note: string;
};

const EMPTY_QUALIFICATION: QualificationDraft = {
  id: null,
  title: "",
  org: "",
  period: "",
  note: "",
};

const IDENTITY_PLACEHOLDER =
  "Your applications, bookings, and rides stay on this device until you sign in.";

const inputClass =
  "w-full rounded-[14px] border border-border bg-surface-alt p-3 text-sm outline-none placeholder:text-muted focus:border-brand";

const labelClass =
  "flex flex-col gap-1.5 text-[13px] font-medium text-muted";

const iconButtonClass =
  "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-muted transition-colors hover:bg-surface-alt hover:text-foreground";

const cardListClass =
  "divide-y divide-border overflow-hidden rounded-[16px] border border-border shadow-card";

const rowClass =
  "flex items-center justify-between gap-3 p-4 text-[15px] font-medium text-foreground transition-colors hover:bg-surface-alt/60";

const secondaryButtonClass =
  "rounded-[14px] border border-border px-4 py-3 text-[14px] font-medium text-muted transition-colors hover:bg-surface-alt/60";

function sectionDelay(offset: number): CSSProperties {
  return { "--hero-delay": `${offset * 80}ms` } as CSSProperties;
}

function useTwoStep(resetMs = 3000) {
  const [armed, setArmed] = useState(false);
  const timer = useRef<number | null>(null);

  const arm = useCallback(() => {
    setArmed(true);
    if (timer.current !== null) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setArmed(false), resetMs);
  }, [resetMs]);

  const reset = useCallback(() => {
    if (timer.current !== null) window.clearTimeout(timer.current);
    timer.current = null;
    setArmed(false);
  }, []);

  useEffect(
    () => () => {
      if (timer.current !== null) window.clearTimeout(timer.current);
    },
    [],
  );

  return { armed, arm, reset };
}

function NotificationSwitch({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (next: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`relative h-6 w-10 shrink-0 rounded-full transition-colors ${
        checked ? "bg-brand" : "bg-border"
      }`}
    >
      <span
        className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-surface shadow-card transition-transform ${
          checked ? "translate-x-4" : "translate-x-0"
        }`}
      />
    </button>
  );
}

export default function ProfilePage() {
  const profile = useSyncExternalStore(
    onProfileChange,
    profileStore.getSnapshot,
    profileStore.getServerSnapshot,
  );

  const [editOpen, setEditOpen] = useState(false);
  const [draft, setDraft] = useState<Draft>({
    name: "",
    email: "",
    phone: "",
    city: "",
  });
  const [skillInput, setSkillInput] = useState("");
  const [qualDraft, setQualDraft] =
    useState<QualificationDraft>(EMPTY_QUALIFICATION);
  const [cardOpen, setCardOpen] = useState(false);
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");

  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<number | null>(null);

  const notify = useCallback((message: string) => {
    setToast(message);
    if (toastTimer.current !== null) window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 2400);
  }, []);

  useEffect(
    () => () => {
      if (toastTimer.current !== null) window.clearTimeout(toastTimer.current);
    },
    [],
  );

  const signOutSteps = useTwoStep();
  const eraseSteps = useTwoStep();

  const identityLine = [profile.email, profile.phone, profile.city]
    .filter((part) => part.trim().length > 0)
    .join(" · ");

  const initials = profile.name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");

  const cardDigits = cardNumber.replace(/\D/g, "");
  const cardBrand = detectCardBrand(cardDigits);

  const openEdit = () => {
    setDraft({
      name: profile.name,
      email: profile.email,
      phone: profile.phone,
      city: profile.city,
    });
    setEditOpen(true);
  };

  const submitIdentity = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!draft.name.trim()) {
      notify("Add a name before saving.");
      return;
    }
    updateIdentity(draft);
    setEditOpen(false);
    notify("Profile saved.");
  };

  const submitSkill = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const value = skillInput.trim();
    if (!value) return;
    addSkill(value);
    setSkillInput("");
    notify("Skill saved.");
  };

  const startQualificationEdit = (entry: Qualification) => {
    setQualDraft({
      id: entry.id,
      title: entry.title,
      org: entry.org,
      period: entry.period,
      note: entry.note ?? "",
    });
  };

  const submitQualification = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!qualDraft.title.trim() || !qualDraft.org.trim()) {
      notify("Title and organization are required.");
      return;
    }
    saveQualification(
      {
        title: qualDraft.title,
        org: qualDraft.org,
        period: qualDraft.period,
        note: qualDraft.note,
      },
      qualDraft.id ?? undefined,
    );
    const wasEditing = qualDraft.id !== null;
    setQualDraft(EMPTY_QUALIFICATION);
    notify(wasEditing ? "Qualification updated." : "Qualification added.");
  };

  const handleExpiryChange = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 4);
    setExpiry(
      digits.length > 2
        ? `${digits.slice(0, 2)}/${digits.slice(2)}`
        : digits,
    );
  };

  const submitCard = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const parsed = parseExpiry(expiry);
    if (!cardBrand || cardDigits.length < 12) {
      notify("Enter a valid card number.");
      return;
    }
    if (!parsed) {
      notify("Enter the expiry as MM/YY.");
      return;
    }
    if (!isValidExpiry(parsed.month, parsed.year)) {
      notify("That card is expired.");
      return;
    }
    const added = addPaymentMethod(cardDigits, parsed.month, parsed.year);
    if (!added) {
      notify("Could not save that card.");
      return;
    }
    setCardNumber("");
    setExpiry("");
    setCardOpen(false);
    notify("Card saved. Only the last four digits are stored.");
  };

  const handleSignOut = () => {
    if (!signOutSteps.armed) {
      signOutSteps.arm();
      return;
    }
    signOutSteps.reset();
    clearSessionFilters();
    notify("Signed out. Saved searches were cleared.");
  };

  const handleErase = () => {
    if (!eraseSteps.armed) {
      eraseSteps.arm();
      return;
    }
    eraseSteps.reset();
    eraseLocalData();
    setEditOpen(false);
    setQualDraft(EMPTY_QUALIFICATION);
    setCardNumber("");
    setExpiry("");
    setCardOpen(false);
    notify("Local data erased.");
  };

  return (
    <main className="mx-auto max-w-lg space-y-8 px-5 pb-10 pt-6">
      <header
        className="hero-rise flex items-center gap-3.5"
        style={sectionDelay(0)}
      >
        <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[16px] bg-brand-soft">
          {initials ? (
            <span className="text-[18px] font-semibold tracking-tight text-brand">
              {initials}
            </span>
          ) : (
            <UserIcon className="h-6 w-6 text-brand" />
          )}
        </span>
        <div className="min-w-0 flex-1">
          <h1 className="text-[26px] font-semibold leading-tight tracking-[-0.02em] text-foreground">
            {profile.name.trim() || "Your profile"}
          </h1>
          <p className="truncate text-[13px] text-muted">
            {identityLine || IDENTITY_PLACEHOLDER}
          </p>
        </div>
        <button
          type="button"
          onClick={openEdit}
          aria-label="Edit profile"
          className={iconButtonClass}
        >
          <PencilIcon className="h-4 w-4" />
        </button>
      </header>

      {editOpen && (
        <form
          onSubmit={submitIdentity}
          className="space-y-3 rounded-[16px] border border-border bg-surface p-4 shadow-card"
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <label className={labelClass}>
              Full name
              <input
                value={draft.name}
                onChange={(event) =>
                  setDraft({ ...draft, name: event.target.value })
                }
                placeholder="Jordan Rivera"
                autoComplete="name"
                className={inputClass}
              />
            </label>
            <label className={labelClass}>
              Email
              <input
                value={draft.email}
                onChange={(event) =>
                  setDraft({ ...draft, email: event.target.value })
                }
                placeholder="you@example.com"
                type="email"
                autoComplete="email"
                className={inputClass}
              />
            </label>
            <label className={labelClass}>
              Phone
              <input
                value={draft.phone}
                onChange={(event) =>
                  setDraft({ ...draft, phone: event.target.value })
                }
                placeholder="(555) 010-4477"
                type="tel"
                autoComplete="tel"
                className={inputClass}
              />
            </label>
            <label className={labelClass}>
              City
              <input
                value={draft.city}
                onChange={(event) =>
                  setDraft({ ...draft, city: event.target.value })
                }
                placeholder="Austin, TX"
                className={inputClass}
              />
            </label>
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              className="flex-1 rounded-[14px] bg-brand px-4 py-3 text-[14px] font-semibold text-white transition-colors hover:bg-brand-strong"
            >
              Save profile
            </button>
            <button
              type="button"
              onClick={() => setEditOpen(false)}
              className={secondaryButtonClass}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <section className="hero-rise" style={sectionDelay(1)}>
        <SectionHeader title="Skills" />
        <form onSubmit={submitSkill} className="flex gap-2">
          <input
            value={skillInput}
            onChange={(event) => setSkillInput(event.target.value)}
            placeholder="Add a skill"
            aria-label="Add a skill"
            className={`${inputClass} flex-1`}
          />
          <button
            type="submit"
            className="rounded-[14px] border border-border bg-surface px-4 text-[14px] font-semibold text-brand transition-colors hover:bg-surface-alt/60"
          >
            Add
          </button>
        </form>
        {profile.skills.length > 0 ? (
          <ul className="mt-3 flex flex-wrap gap-2">
            {profile.skills.map((skill) => (
              <li
                key={skill}
                className="flex items-center gap-1.5 rounded-full border border-border bg-surface-alt py-1 pl-2.5 pr-1.5 text-[12px] font-medium text-foreground"
              >
                {skill}
                <button
                  type="button"
                  onClick={() => removeSkill(skill)}
                  aria-label={`Remove ${skill}`}
                  className="flex h-5 w-5 items-center justify-center rounded-full text-muted transition-colors hover:bg-surface hover:text-foreground"
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 text-[13px] text-muted">
            No skills yet. Add the ones employers search for.
          </p>
        )}
      </section>

      <section className="hero-rise" style={sectionDelay(2)}>
        <SectionHeader title="Qualifications" />
        <div className="space-y-3">
          {profile.qualifications.length > 0 ? (
            <ul className={cardListClass}>
              {profile.qualifications.map((entry) => (
                <li key={entry.id} className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-[15px] font-medium text-foreground">
                        {entry.title}
                      </p>
                      <p className="text-[13px] text-muted">
                        {[entry.org, entry.period].filter(Boolean).join(" · ")}
                      </p>
                      {entry.note && (
                        <p className="mt-1 text-[13px] text-muted">
                          {entry.note}
                        </p>
                      )}
                    </div>
                    <div className="flex shrink-0 gap-1">
                      <button
                        type="button"
                        onClick={() => startQualificationEdit(entry)}
                        aria-label={`Edit ${entry.title}`}
                        className={iconButtonClass}
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          removeQualification(entry.id);
                          notify("Qualification removed.");
                        }}
                        aria-label={`Remove ${entry.title}`}
                        className={iconButtonClass}
                      >
                        ×
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-[13px] text-muted">
              Add degrees, certificates, or training.
            </p>
          )}
          <form
            onSubmit={submitQualification}
            className="space-y-3 rounded-[16px] border border-border bg-surface p-4 shadow-card"
          >
            <p className="flex items-center gap-2 text-[14px] font-semibold text-foreground">
              <GraduationCapIcon className="h-4 w-4 text-brand" />
              {qualDraft.id ? "Edit qualification" : "Add qualification"}
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className={labelClass}>
                Title
                <input
                  value={qualDraft.title}
                  onChange={(event) =>
                    setQualDraft({ ...qualDraft, title: event.target.value })
                  }
                  placeholder="Certified electrician"
                  className={inputClass}
                />
              </label>
              <label className={labelClass}>
                Organization
                <input
                  value={qualDraft.org}
                  onChange={(event) =>
                    setQualDraft({ ...qualDraft, org: event.target.value })
                  }
                  placeholder="Austin Trade School"
                  className={inputClass}
                />
              </label>
              <label className={labelClass}>
                Period
                <input
                  value={qualDraft.period}
                  onChange={(event) =>
                    setQualDraft({ ...qualDraft, period: event.target.value })
                  }
                  placeholder="2021 — 2024"
                  className={inputClass}
                />
              </label>
              <label className={labelClass}>
                Note (optional)
                <input
                  value={qualDraft.note}
                  onChange={(event) =>
                    setQualDraft({ ...qualDraft, note: event.target.value })
                  }
                  placeholder="First-class licence"
                  className={inputClass}
                />
              </label>
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="flex-1 rounded-[14px] bg-brand px-4 py-3 text-[14px] font-semibold text-white transition-colors hover:bg-brand-strong"
              >
                {qualDraft.id ? "Update" : "Save qualification"}
              </button>
              {qualDraft.id && (
                <button
                  type="button"
                  onClick={() => setQualDraft(EMPTY_QUALIFICATION)}
                  className={secondaryButtonClass}
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>
      </section>

      <section className="hero-rise" style={sectionDelay(3)}>
        <SectionHeader title="Account" />
        <div className={cardListClass}>
          <div className={rowClass}>
            <span>Email notifications</span>
            <NotificationSwitch
              label="Email notifications"
              checked={profile.notifications.email}
              onChange={(next) =>
                setNotifications({ ...profile.notifications, email: next })
              }
            />
          </div>
          <div className={rowClass}>
            <span>SMS notifications</span>
            <NotificationSwitch
              label="SMS notifications"
              checked={profile.notifications.sms}
              onChange={(next) =>
                setNotifications({ ...profile.notifications, sms: next })
              }
            />
          </div>
          <button
            type="button"
            onClick={handleSignOut}
            className={`flex w-full items-center justify-between gap-3 p-4 text-left transition-colors hover:bg-surface-alt/60 ${
              signOutSteps.armed ? "bg-surface-alt/80" : ""
            }`}
          >
            <span className="flex items-center gap-3 text-[15px] font-medium text-foreground">
              <SignOutIcon className="h-5 w-5 text-brand" />
              {signOutSteps.armed
                ? "Tap again to confirm sign out"
                : "Sign out"}
            </span>
          </button>
          <button
            type="button"
            onClick={handleErase}
            className={`flex w-full items-center justify-between gap-3 p-4 text-left transition-colors hover:bg-surface-alt/60 ${
              eraseSteps.armed ? "bg-surface-alt/80" : ""
            }`}
          >
            <span className="flex items-center gap-3 text-[15px] font-medium text-foreground">
              <ShieldCheckIcon className="h-5 w-5 text-brand" />
              {eraseSteps.armed
                ? "Tap again to erase everything"
                : "Erase local data"}
            </span>
          </button>
        </div>
        <p className="mt-2 px-1 text-[12px] text-muted">
          Erasing clears your profile, applications, saved searches, and
          payment methods from this device.
        </p>
      </section>

      <section className="hero-rise" style={sectionDelay(4)}>
        <SectionHeader title="Payment methods" />
        <div className="space-y-3">
          {profile.paymentMethods.length > 0 ? (
            <ul className={cardListClass}>
              {profile.paymentMethods.map((method, index) => (
                <li
                  key={method.id}
                  className="flex items-center justify-between gap-3 p-4"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] bg-brand-soft">
                      <CreditCardIcon className="h-5 w-5 text-brand" />
                    </span>
                    <div className="min-w-0">
                      <p className="text-[15px] font-medium text-foreground">
                        {method.brand} •••• {method.last4}
                        {index === 0 && (
                          <span className="ml-2 rounded-full bg-brand-soft px-2 py-0.5 align-middle text-[11px] font-medium text-brand">
                            Default
                          </span>
                        )}
                      </p>
                      <p className="text-[13px] text-muted">
                        Expires{" "}
                        {String(method.expMonth).padStart(2, "0")}/
                        {String(method.expYear).padStart(2, "0")}
                      </p>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    {index !== 0 && (
                      <button
                        type="button"
                        onClick={() => setDefaultPaymentMethod(method.id)}
                        className="rounded-full border border-border px-3 py-1 text-[12px] font-medium text-brand transition-colors hover:bg-surface-alt/60"
                      >
                        Make default
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        removePaymentMethod(method.id);
                        notify("Card removed.");
                      }}
                      aria-label={`Remove ${method.brand} ending in ${method.last4}`}
                      className={iconButtonClass}
                    >
                      ×
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-[13px] text-muted">
              Save a card to check out faster. Only the last four digits are
              stored.
            </p>
          )}

          {cardOpen ? (
            <form
              onSubmit={submitCard}
              className="space-y-3 rounded-[16px] border border-border bg-surface p-4 shadow-card"
            >
              <label className={labelClass}>
                Card number
                <input
                  value={cardNumber}
                  onChange={(event) =>
                    setCardNumber(formatCardNumber(event.target.value))
                  }
                  inputMode="numeric"
                  autoComplete="cc-number"
                  placeholder="4242 4242 4242 4242"
                  className={inputClass}
                />
              </label>
              <p className="text-[12px] text-muted">
                {cardBrand
                  ? `${cardBrand} detected. Only the last four digits are stored on this device.`
                  : "Only the last four digits are stored on this device. Full card numbers are never saved."}
              </p>
              <label className={labelClass}>
                Expiry (MM/YY)
                <input
                  value={expiry}
                  onChange={(event) => handleExpiryChange(event.target.value)}
                  inputMode="numeric"
                  autoComplete="cc-exp"
                  placeholder="MM/YY"
                  className={inputClass}
                />
              </label>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 rounded-[14px] bg-brand px-4 py-3 text-[14px] font-semibold text-white transition-colors hover:bg-brand-strong"
                >
                  Save card
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setCardOpen(false);
                    setCardNumber("");
                    setExpiry("");
                  }}
                  className={secondaryButtonClass}
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <button
              type="button"
              onClick={() => setCardOpen(true)}
              className="w-full rounded-[16px] border border-dashed border-border bg-surface p-4 text-[14px] font-semibold text-brand transition-colors hover:bg-surface-alt/60"
            >
              Add payment method
            </button>
          )}
        </div>
      </section>

      <section className="hero-rise" style={sectionDelay(5)}>
        <SectionHeader title="Your activity" />
        <div className={cardListClass}>
          <Link href="/activity" className={rowClass}>
            <span className="flex items-center gap-3">
              <ShieldCheckIcon className="h-5 w-5 text-brand" />
              Applications, bookings, and rides
            </span>
            <ArrowRightIcon className="h-4 w-4 shrink-0 text-muted" />
          </Link>
        </div>
      </section>

      {toast && (
        <div
          role="status"
          className="pointer-events-none fixed inset-x-0 bottom-20 z-50 flex justify-center px-6"
        >
          <p className="rounded-full border border-border bg-surface px-4 py-2 text-[13px] font-medium text-foreground shadow-card">
            {toast}
          </p>
        </div>
      )}
    </main>
  );
}
