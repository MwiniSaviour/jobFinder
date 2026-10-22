"use client";

import { useState, type FormEvent } from "react";
import { ArrowRightIcon, SearchIcon } from "./Icons";

export function SearchBar({
  onSearch,
  placeholder = "Search jobs",
  initialValue = "",
  ariaLabel,
  className,
}: {
  onSearch: (query: string) => void;
  placeholder?: string;
  initialValue?: string;
  ariaLabel?: string;
  className?: string;
}) {
  const [value, setValue] = useState(initialValue);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = value.trim();
    if (!trimmed) return;
    onSearch(trimmed);
    setValue("");
  };

  return (
    <form
      role="search"
      onSubmit={handleSubmit}
      className={className ? `relative ${className}` : "relative"}
    >
      <input
        type="text"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder={placeholder}
        aria-label={ariaLabel ?? placeholder}
        className="h-12 w-full rounded-[18px] border border-border bg-surface pl-12 pr-12 text-[15px] outline-none transition-colors placeholder:text-muted focus:border-brand"
      />
      <span className="pointer-events-none absolute left-2 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-surface-alt text-muted">
        <SearchIcon className="size-4" />
      </span>
      <button
        type="submit"
        aria-label="Search"
        className="absolute right-2 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-full bg-brand text-white transition-colors hover:bg-brand-strong"
      >
        <ArrowRightIcon className="size-4" />
      </button>
    </form>
  );
}
