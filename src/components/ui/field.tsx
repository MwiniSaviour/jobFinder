import { cn } from "@/lib/utils";
import type {
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";
import { ChevronDown } from "lucide-react";

export function Label({
  children,
  htmlFor,
  optional = false,
  className,
}: {
  children: ReactNode;
  htmlFor?: string;
  optional?: boolean;
  className?: string;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className={cn(
        "mb-1.5 flex items-baseline justify-between gap-3 text-[13px] font-medium text-ink-soft",
        className,
      )}
    >
      <span>{children}</span>
      {optional && (
        <span className="text-[11.5px] font-normal text-stone-light">
          Optional
        </span>
      )}
    </label>
  );
}

export function Hint({
  children,
  error,
}: {
  children: ReactNode;
  error?: boolean;
}) {
  return (
    <p
      className={cn(
        "mt-1.5 text-[12px] leading-snug text-stone",
        error && "text-clay-deep",
      )}
    >
      {children}
    </p>
  );
}

export function TextInput({
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn("input-base", className)} {...props} />;
}

export function Textarea({
  className,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn("input-base min-h-28 resize-y leading-relaxed", className)}
      {...props}
    />
  );
}

export function Select({
  className,
  children,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement> & { children: ReactNode }) {
  return (
    <div className="relative">
      <select
        className={cn("input-base appearance-none pr-10", className)}
        {...props}
      >
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-stone" />
    </div>
  );
}

export function Checkbox({
  checked,
  onChange,
  label,
  count,
  className,
  id,
}: {
  checked?: boolean;
  onChange?: () => void;
  label: ReactNode;
  count?: number;
  className?: string;
  id?: string;
}) {
  return (
    <label
      htmlFor={id}
      className={cn(
        "group flex cursor-pointer select-none items-center gap-2.5 py-1.5 text-[13.5px] text-ink-soft transition hover:text-ink",
        className,
      )}
    >
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="peer sr-only"
      />
      <span className="flex h-[17px] w-[17px] shrink-0 items-center justify-center rounded-[5px] border border-line-strong bg-white transition group-hover:border-stone peer-checked:border-ink peer-checked:bg-ink peer-focus-visible:ring-2 peer-focus-visible:ring-ink/20 group-has-[input:checked]:border-ink group-has-[input:checked]:bg-ink [&>svg]:opacity-0 group-has-[input:checked]:[&>svg]:opacity-100">
        <svg
          viewBox="0 0 12 12"
          fill="none"
          className="h-2.5 w-2.5 text-paper transition-opacity"
        >
          <path
            d="M2.5 6.2 4.8 8.5 9.5 3.8"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      <span className="flex-1 leading-snug">{label}</span>
      {typeof count === "number" && (
        <span className="text-[11.5px] tabular-nums text-stone-light">
          {count}
        </span>
      )}
    </label>
  );
}

export function Toggle({
  checked,
  onChange,
  label,
  description,
  id,
}: {
  checked: boolean;
  onChange: () => void;
  label: string;
  description?: string;
  id?: string;
}) {
  return (
    <div className="flex items-start justify-between gap-6 py-3">
      <div>
        <p id={id} className="text-[13.5px] font-medium text-ink">
          {label}
        </p>
        {description && (
          <p className="mt-0.5 text-[12.5px] leading-snug text-stone">
            {description}
          </p>
        )}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-labelledby={id}
        onClick={onChange}
        className={cn(
          "relative mt-0.5 h-[22px] w-[38px] shrink-0 rounded-full border transition-colors duration-200",
          checked ? "border-ink bg-ink" : "border-line-strong bg-cream",
        )}
      >
        <span
          className={cn(
            "absolute top-1/2 h-[16px] w-[16px] -translate-y-1/2 rounded-full bg-white shadow-sm transition-all duration-200",
            checked ? "left-[19px]" : "left-[3px]",
          )}
        />
      </button>
    </div>
  );
}
