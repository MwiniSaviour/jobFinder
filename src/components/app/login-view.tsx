"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Check, Eye, EyeOff } from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";

type Mode = "signin" | "create";

export function LoginView({ initialMode }: { initialMode: Mode }) {
  const [mode, setMode] = useState<Mode>(initialMode);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const isCreate = mode === "create";

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast({
        title: isCreate ? "Your account is ready" : "Welcome back, Amara",
        description: "Taking you to your dashboard.",
        tone: "success",
      });
      router.push("/dashboard");
    }, 700);
  };

  return (
    <div className="grid min-h-screen bg-paper lg:grid-cols-[1fr_1.02fr]">
      <div className="flex min-h-screen flex-col px-5 py-6 sm:px-10 lg:px-14">
        <div className="flex items-center justify-between">
          <Logo />
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-[11.5px] font-medium text-stone transition hover:text-ink"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Morrow
          </Link>
        </div>

        <div className="mx-auto my-auto w-full max-w-[382px] py-12">
          <p className="eyebrow">
            <span className="h-1 w-1 rounded-full bg-clay" />
            {isCreate ? "Create your account" : "Candidate sign in"}
          </p>
          <h1 className="display mt-4 text-[clamp(2.1rem,4vw,2.9rem)] leading-[1.02] text-ink">
            {isCreate ? (
              <>
                Make room for
                <br />
                <em className="italic">better work</em>.
              </>
            ) : (
              <>
                Welcome <em className="italic">back</em>.
              </>
            )}
          </h1>
          <p className="mt-3 text-[13px] leading-relaxed text-stone">
            {isCreate
              ? "One considered profile. Fewer, better applications. An honest answer, either way."
              : "Your applications, offers, and saved roles are right where you left them."}
          </p>

          <div className="mt-7 grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() =>
                toast({
                  title: "Google sign-in",
                  description: "Connect your Google account to continue.",
                })
              }
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-line-strong bg-paper-raised text-[12px] font-medium text-ink transition hover:border-ink/30 hover:bg-cream/50"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1Z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84Z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15A11 11 0 0 0 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52Z"
                />
              </svg>
              Google
            </button>
            <button
              type="button"
              onClick={() =>
                toast({
                  title: "LinkedIn sign-in",
                  description: "We'll import your headline and experience.",
                })
              }
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-line-strong bg-paper-raised text-[12px] font-medium text-ink transition hover:border-ink/30 hover:bg-cream/50"
            >
              <svg
                viewBox="0 0 24 24"
                fill="currentColor"
                className="h-4 w-4 text-[#0A66C2]"
                aria-hidden="true"
              >
                <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.13 1.45-2.13 2.94v5.67H9.35V9h3.41v1.56h.05a3.74 3.74 0 0 1 3.37-1.85c3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.34 7.43a2.07 2.07 0 1 1 0-4.13 2.07 2.07 0 0 1 0 4.13ZM7.12 20.45H3.56V9h3.56v11.45Z" />
              </svg>
              LinkedIn
            </button>
          </div>

          <div className="my-6 flex items-center gap-3">
            <span className="h-px flex-1 bg-line" />
            <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-stone-light">
              or with email
            </span>
            <span className="h-px flex-1 bg-line" />
          </div>

          <form onSubmit={submit} className="space-y-3.5">
            {isCreate && (
              <div>
                <label
                  htmlFor="auth-name"
                  className="mb-1.5 block text-[12px] font-medium text-ink-soft"
                >
                  Full name
                </label>
                <input
                  id="auth-name"
                  required
                  autoComplete="name"
                  placeholder="Amara Mensah"
                  className="input-base"
                />
              </div>
            )}
            <div>
              <label
                htmlFor="auth-email"
                className="mb-1.5 block text-[12px] font-medium text-ink-soft"
              >
                Email
              </label>
              <input
                id="auth-email"
                type="email"
                required
                autoComplete="email"
                defaultValue={isCreate ? "" : "amara.mensah@hey.com"}
                placeholder="you@example.com"
                className="input-base"
              />
            </div>
            <div>
              <div className="mb-1.5 flex items-baseline justify-between">
                <label
                  htmlFor="auth-password"
                  className="text-[12px] font-medium text-ink-soft"
                >
                  Password
                </label>
                {!isCreate && (
                  <button
                    type="button"
                    onClick={() =>
                      toast({
                        title: "Check your inbox",
                        description: "A reset link is on its way.",
                      })
                    }
                    className="text-[10.5px] text-stone underline decoration-line-strong underline-offset-4 transition hover:text-ink"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="relative">
                <input
                  id="auth-password"
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={8}
                  autoComplete={isCreate ? "new-password" : "current-password"}
                  defaultValue={isCreate ? "" : "morrow-demo-2026"}
                  placeholder="At least 8 characters"
                  className="input-base pr-11"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-stone transition hover:bg-cream hover:text-ink"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {isCreate && (
                <p className="mt-1.5 flex items-center gap-1.5 text-[10px] text-stone-light">
                  <Check className="h-3 w-3 text-sage" />
                  Eight characters or more. A phrase works nicely.
                </p>
              )}
            </div>

            {isCreate && (
              <label className="flex cursor-pointer items-start gap-2.5 pt-1 text-[11px] leading-relaxed text-stone">
                <input
                  type="checkbox"
                  required
                  className="mt-0.5 h-4 w-4 shrink-0 appearance-none rounded-[4px] border border-line-strong bg-paper checked:border-ink checked:bg-ink"
                />
                I agree to Morrow&apos;s{" "}
                <Link
                  href="/"
                  className="text-ink underline decoration-line-strong underline-offset-2"
                >
                  terms
                </Link>{" "}
                and{" "}
                <Link
                  href="/"
                  className="text-ink underline decoration-line-strong underline-offset-2"
                >
                  privacy policy
                </Link>
                .
              </label>
            )}

            <Button
              type="submit"
              size="lg"
              className="mt-1 w-full"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-[1.5px] border-paper/40 border-t-paper" />
                  One moment
                </>
              ) : (
                <>
                  {isCreate ? "Create my account" : "Sign in"}
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </form>

          <button
            type="button"
            onClick={() => router.push("/dashboard")}
            className="mt-2.5 inline-flex h-10 w-full items-center justify-center gap-1.5 rounded-xl text-[11.5px] font-medium text-stone transition hover:bg-cream hover:text-ink"
          >
            Continue with the demo account
            <ArrowRight className="h-3 w-3" />
          </button>

          <p className="mt-6 text-center text-[12px] text-stone">
            {isCreate ? "Already have an account?" : "New to Morrow?"}{" "}
            <button
              type="button"
              onClick={() => setMode(isCreate ? "signin" : "create")}
              className="font-medium text-ink underline decoration-line-strong underline-offset-4 transition hover:text-clay-deep"
            >
              {isCreate ? "Sign in" : "Create one"}
            </button>
          </p>

          <div className="mt-8 flex items-center justify-center gap-2 border-t border-line pt-5 text-[10.5px] text-stone-light">
            <span>Hiring instead?</span>
            <Link
              href="/hire"
              className="inline-flex items-center gap-1 font-medium text-ink transition hover:text-clay-deep"
            >
              Open the recruiter workspace
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>

        <div className="flex items-center justify-between text-[10px] text-stone-light">
          <span>© 2026 Morrow Labs</span>
          <span className="hidden sm:inline">Made with care in Accra</span>
        </div>
      </div>

      <div className="relative hidden p-3 lg:block">
        <div className="relative h-full min-h-[calc(100vh-1.5rem)] overflow-hidden rounded-[1.75rem]">
          <Image
            src="/images/team-meeting.jpg"
            alt="A team working together in a warm, sunlit studio"
            fill
            sizes="50vw"
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/20 to-ink/20" />

          <div className="absolute inset-x-0 top-0 flex items-center justify-between p-7">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-ink/30 px-3 py-1.5 text-[10px] font-medium text-paper backdrop-blur">
              <span className="h-1.5 w-1.5 rounded-full bg-ochre" />
              The considered job board
            </span>
            <Link
              href="/jobs"
              className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-ink/30 px-3 py-1.5 text-[10px] font-medium text-paper backdrop-blur transition hover:bg-ink/50"
            >
              Explore roles
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="absolute inset-x-0 bottom-0 p-8 lg:p-10">
            <blockquote className="display max-w-lg text-[clamp(1.55rem,2.4vw,2.1rem)] leading-[1.18] tracking-[-0.02em] text-paper">
              “The salary was in the listing. That one detail changed the whole
              conversation — we talked about the work instead of dancing around{" "}
              <em className="italic text-[#f0c98a]">money</em>.”
            </blockquote>
            <div className="mt-6 flex items-center gap-3">
              <Avatar
                name="Priya Raman"
                src="/images/avatar-priya.jpg"
                size="md"
                className="ring-2 ring-white/20"
              />
              <div>
                <p className="text-[12px] font-medium text-paper">
                  Priya Raman
                </p>
                <p className="text-[10.5px] text-paper/60">
                  Staff Product Designer · hired through Morrow
                </p>
              </div>
            </div>
            <div className="mt-8 grid max-w-md grid-cols-3 gap-6 border-t border-white/15 pt-6">
              {[
                { value: "24", label: "open roles" },
                { value: "12", label: "teams hiring" },
                { value: "3 days", label: "average reply" },
              ].map((stat) => (
                <div key={stat.label}>
                  <p className="display text-[24px] leading-none text-paper">
                    {stat.value}
                  </p>
                  <p className="mt-1.5 text-[10px] text-paper/50">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
