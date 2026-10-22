import type { ComponentType, SVGProps } from "react";
import { BriefcaseIcon, CarIcon, WrenchIcon } from "./Icons";

type CategoryIcon = ComponentType<SVGProps<SVGSVGElement>>;

const ICONS: Record<string, CategoryIcon> = {
  delivery: CarIcon,
  driving: CarIcon,
  moving: CarIcon,
  tech: BriefcaseIcon,
  repair: WrenchIcon,
  maintenance: WrenchIcon,
  home: WrenchIcon,
};

const TINTS: Record<string, string> = {
  delivery: "#ecfeff",
  driving: "#e0f2fe",
  moving: "#e0f2fe",
  tech: "#e0f2fe",
  repair: "#ccfbf1",
  maintenance: "#ccfbf1",
  home: "#f1f5f9",
};

const DEFAULT_TINT = "#eff6ff";

type CategoryTileProps = {
  category: string;
  size?: "sm" | "md" | "lg";
  className?: string;
};

export function CategoryTile({ category, size = "md", className }: CategoryTileProps) {
  const key = category.toLowerCase();
  const Icon = ICONS[key];
  const tint = TINTS[key] ?? DEFAULT_TINT;
  const large = size === "lg";
  const small = size === "sm";

  return (
    <span
      className={`relative flex items-center justify-center shrink-0 ${
        large
          ? "w-[72px] h-[72px] rounded-[18px]"
          : small
            ? "w-12 h-12 rounded-[12px]"
            : "w-14 h-14 rounded-[14px]"
      } ${className ?? ""}`}
      style={{ backgroundColor: tint }}
    >
      {Icon ? (
        <Icon className={`text-brand ${large ? "h-8 w-8" : small ? "h-5 w-5" : "h-6 w-6"}`} />
      ) : (
        <span className={`font-semibold text-brand ${large ? "text-2xl" : small ? "text-base" : "text-lg"}`}>
          {category.trim().charAt(0).toUpperCase()}
        </span>
      )}
    </span>
  );
}
