"use client";

import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { useToast } from "@/components/ui/toast";

export function NewsletterForm() {
  const [email, setEmail] = useState("");
  const { toast } = useToast();

  return (
    <form
      className="mt-5 flex max-w-sm items-center gap-2"
      onSubmit={(event) => {
        event.preventDefault();
        if (!email.trim()) return;
        toast({
          title: "You're on the list",
          description:
            "One letter a week. The roles worth opening, and nothing else.",
          tone: "success",
        });
        setEmail("");
      }}
    >
      <label htmlFor="newsletter-email" className="sr-only">
        Email address
      </label>
      <input
        id="newsletter-email"
        type="email"
        required
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        placeholder="you@example.com"
        className="h-11 min-w-0 flex-1 rounded-[10px] border border-line-strong bg-paper px-3.5 text-[13.5px] text-ink placeholder:text-stone-light focus:border-ink focus:outline-none"
      />
      <button
        type="submit"
        aria-label="Subscribe to the weekly letter"
        className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-[10px] bg-ink text-paper transition hover:bg-ink-soft"
      >
        <ArrowRight className="h-4 w-4" />
      </button>
    </form>
  );
}
