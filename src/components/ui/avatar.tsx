import { cn, initials } from "@/lib/utils";

const tones = [
  "bg-clay-soft text-clay-deep",
  "bg-sage-soft text-sage-deep",
  "bg-ochre-soft text-[#8a641f]",
  "bg-plum-soft text-plum",
  "bg-cream text-ink-soft",
];

export function Avatar({
  name,
  src,
  size = "md",
  className,
  ring = false,
}: {
  name: string;
  src?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
  ring?: boolean;
}) {
  const sizes = {
    xs: "h-6 w-6 text-[9px]",
    sm: "h-8 w-8 text-[10px]",
    md: "h-10 w-10 text-[11px]",
    lg: "h-12 w-12 text-[13px]",
    xl: "h-16 w-16 text-base",
  };
  const tone = tones[(name.charCodeAt(0) + name.length) % tones.length];

  return (
    <span
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full font-semibold tracking-[-0.02em]",
        sizes[size],
        !src && tone,
        ring && "ring-2 ring-paper",
        className,
      )}
      title={name}
    >
      {src ? (
        <img
          src={src}
          alt={name}
          className="h-full w-full object-cover"
          loading="lazy"
        />
      ) : (
        <span aria-hidden="true">{initials(name)}</span>
      )}
      <span className="sr-only">{name}</span>
    </span>
  );
}

export function AvatarStack({
  people,
  max = 4,
  size = "sm",
}: {
  people: { name: string; src?: string }[];
  max?: number;
  size?: "xs" | "sm" | "md";
}) {
  const visible = people.slice(0, max);
  const rest = people.length - visible.length;
  return (
    <div className="flex items-center -space-x-2.5">
      {visible.map((person) => (
        <Avatar
          key={person.name}
          name={person.name}
          src={person.src}
          size={size}
          ring
        />
      ))}
      {rest > 0 && (
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-ink text-[10px] font-medium text-paper ring-2 ring-paper">
          +{rest}
        </span>
      )}
    </div>
  );
}
