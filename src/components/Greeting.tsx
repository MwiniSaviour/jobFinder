"use client";

import { useEffect, useState } from "react";

export function Greeting() {
  const [greeting, setGreeting] = useState("Welcome");

  useEffect(() => {
    const hour = new Date().getHours();
    setGreeting(
      hour < 5
        ? "Good evening"
        : hour < 12
          ? "Good morning"
          : hour < 17
            ? "Good afternoon"
            : "Good evening",
    );
  }, []);

  return <p className="text-[13px] font-semibold text-brand">{greeting}</p>;
}
