import type { ReactNode } from "react";
import { CategoryTile } from "./CategoryTile";

type ChipRowProps = {
  label: string;
  children: ReactNode;
  className?: string;
};

export function ChipRow({ label, children, className }: ChipRowProps) {
  return (
    <div
      role="group"
      aria-label={label}
      className={`no-scrollbar -mx-5 flex snap-x snap-mandatory gap-2 overflow-x-auto px-5 pb-1 [scroll-padding-left:1.25rem] ${className ?? ""}`}
    >
      {children}
    </div>
  );
}

type CategoryTileRowProps = {
  categories: readonly string[];
  onSelect: (category: string) => void;
};

export function CategoryTileRow({ categories, onSelect }: CategoryTileRowProps) {
  return (
    <div className="no-scrollbar -mx-5 flex snap-x snap-mandatory gap-2.5 overflow-x-auto px-5 pb-1 [scroll-padding-left:1.25rem]">
      {categories.map((category) => (
        <button
          key={category}
          type="button"
          title={category}
          className="flex w-16 shrink-0 snap-start flex-col items-center gap-1.5 transition-transform active:scale-[0.97] motion-reduce:active:scale-100"
          onClick={() => onSelect(category)}
        >
          <CategoryTile category={category} size="sm" />
          <span className="w-full truncate text-center text-[11px] font-medium text-muted">
            {category}
          </span>
        </button>
      ))}
    </div>
  );
}
