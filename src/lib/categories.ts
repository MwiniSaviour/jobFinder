import type { ComponentType, SVGProps } from "react";
import {
  CalendarIcon,
  CarIcon,
  ClipboardIcon,
  CoffeeIcon,
  GraduationCapIcon,
  HeartIcon,
  HomeIcon,
  MonitorIcon,
  PackageIcon,
  PawIcon,
  ShieldCheckIcon,
  ShoppingBagIcon,
  SparklesIcon,
  WrenchIcon,
} from "../components/Icons";

export type CategoryDef = {
  name: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
};

export const JOB_CATEGORIES: CategoryDef[] = [
  { name: "Delivery", icon: CarIcon },
  { name: "Food & drink", icon: CoffeeIcon },
  { name: "Tech", icon: MonitorIcon },
  { name: "Driving", icon: CarIcon },
  { name: "Education", icon: GraduationCapIcon },
  { name: "Warehouse", icon: PackageIcon },
  { name: "Retail", icon: ShoppingBagIcon },
  { name: "Cleaning", icon: SparklesIcon },
  { name: "Office", icon: ClipboardIcon },
  { name: "Security", icon: ShieldCheckIcon },
  { name: "Caregiving", icon: HeartIcon },
  { name: "Events", icon: CalendarIcon },
];

export const SERVICE_CATEGORIES: CategoryDef[] = [
  { name: "Home", icon: HomeIcon },
  { name: "Repair", icon: WrenchIcon },
  { name: "Maintenance", icon: WrenchIcon },
  { name: "Tech", icon: MonitorIcon },
  { name: "Moving", icon: CarIcon },
  { name: "Pet", icon: PawIcon },
  { name: "Laundry & Dry Cleaning", icon: SparklesIcon },
  { name: "Car Wash", icon: CarIcon },
  { name: "Catering", icon: CoffeeIcon },
  { name: "Beauty & Wellness", icon: SparklesIcon },
];
