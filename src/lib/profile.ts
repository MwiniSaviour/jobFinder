import { createCollectionStore } from "./store";
import {
  readLocalRaw,
  registerMigration,
  removeRaw,
  writeRaw,
} from "./storage";
import {
  freshFilters,
  freshState,
  writeFilters,
  writeJobsState,
} from "./state";

export const PROFILE_STORAGE_KEY = "jf:profile";
export const PROFILE_VERSION = 1;
const CARD_DIGITS_MIN = 12;
const CARD_DIGITS_MAX = 19;

export type ProfileNotifications = {
  email: boolean;
  sms: boolean;
};

export type Qualification = {
  id: string;
  title: string;
  org: string;
  period: string;
  note?: string;
};

export type PaymentBrand = "Visa" | "Mastercard" | "Amex";

export type PaymentMethod = {
  id: string;
  brand: PaymentBrand;
  last4: string;
  expMonth: number;
  expYear: number;
};

export type ProfileState = {
  version: 1;
  name: string;
  email: string;
  phone: string;
  city: string;
  bio?: string;
  skills: string[];
  qualifications: Qualification[];
  paymentMethods: PaymentMethod[];
  notifications: ProfileNotifications;
  region?: string | null;
  savedPlaces?: string[];
};

export type IdentityPatch = Pick<
  ProfileState,
  "name" | "email" | "phone" | "city"
>;

export function freshProfile(): ProfileState {
  return {
    version: PROFILE_VERSION,
    name: "",
    email: "",
    phone: "",
    city: "",
    region: null,
    savedPlaces: [],
    skills: [],
    qualifications: [],
    paymentMethods: [],
    notifications: { email: true, sms: false },
  };
}

function isString(value: unknown): value is string {
  return typeof value === "string";
}

function isMonth(value: unknown): value is number {
  return (
    typeof value === "number" &&
    Number.isInteger(value) &&
    value >= 1 &&
    value <= 12
  );
}

function isExpiryYear(value: unknown): value is number {
  return (
    typeof value === "number" && Number.isInteger(value) && value >= 0 && value <= 99
  );
}

function isPaymentBrand(value: unknown): value is PaymentBrand {
  return (
    value === "Visa" || value === "Mastercard" || value === "Amex"
  );
}

function isQualification(value: unknown): value is Qualification {
  if (!value || typeof value !== "object") return false;
  const item = value as Record<string, unknown>;
  return (
    isString(item.id) &&
    item.id.length > 0 &&
    isString(item.title) &&
    isString(item.org) &&
    isString(item.period) &&
    (item.note === undefined || isString(item.note))
  );
}

function isPaymentMethod(value: unknown): value is PaymentMethod {
  if (!value || typeof value !== "object") return false;
  const item = value as Record<string, unknown>;
  return (
    isString(item.id) &&
    item.id.length > 0 &&
    isPaymentBrand(item.brand) &&
    isString(item.last4) &&
    /^\d{4}$/.test(item.last4) &&
    isMonth(item.expMonth) &&
    isExpiryYear(item.expYear)
  );
}

function isNotifications(value: unknown): value is ProfileNotifications {
  if (!value || typeof value !== "object") return false;
  const item = value as Record<string, unknown>;
  return (
    typeof item.email === "boolean" && typeof item.sms === "boolean"
  );
}

function isProfileState(value: unknown): value is ProfileState {
  if (!value || typeof value !== "object") return false;
  const item = value as Record<string, unknown>;
  return (
    item.version === PROFILE_VERSION &&
    isString(item.name) &&
    isString(item.email) &&
    isString(item.phone) &&
    isString(item.city) &&
    (item.bio === undefined || isString(item.bio)) &&
    Array.isArray(item.skills) &&
    item.skills.every(isString) &&
    Array.isArray(item.qualifications) &&
    item.qualifications.every(isQualification) &&
    Array.isArray(item.paymentMethods) &&
    item.paymentMethods.every(isPaymentMethod) &&
    isNotifications(item.notifications)
  );
}

export function parseProfile(raw: string | null): ProfileState {
  if (!raw) return freshProfile();
  try {
    const parsed: unknown = JSON.parse(raw);
    return isProfileState(parsed) ? parsed : freshProfile();
  } catch {
    return freshProfile();
  }
}

export const profileStore = createCollectionStore<ProfileState>(
  PROFILE_STORAGE_KEY,
  parseProfile,
  "persistent",
);

export function readProfile(): ProfileState {
  return profileStore.getSnapshot();
}

export function writeProfile(state: ProfileState): void {
  profileStore.write(state);
}

export function onProfileChange(listener: () => void): () => void {
  return profileStore.subscribe(listener);
}

let idCounter = 0;

export function nextProfileId(prefix: string): string {
  idCounter += 1;
  return `${prefix}_${Date.now().toString(36)}${idCounter.toString(36)}`;
}

export function updateIdentity(patch: IdentityPatch): void {
  const current = readProfile();
  writeProfile({
    ...current,
    name: patch.name.trim(),
    email: patch.email.trim(),
    phone: patch.phone.trim(),
    city: patch.city.trim(),
  });
}

export function setRegion(value: string | null): void {
  const current = readProfile();
  writeProfile({ ...current, region: value });
}

export function setNotifications(next: ProfileNotifications): void {
  const current = readProfile();
  writeProfile({ ...current, notifications: next });
}

export function addSkill(skill: string): void {
  const normalized = skill.trim();
  if (!normalized) return;
  const current = readProfile();
  const exists = current.skills.some(
    (item) => item.toLowerCase() === normalized.toLowerCase(),
  );
  if (exists) return;
  writeProfile({ ...current, skills: [...current.skills, normalized] });
}

export function removeSkill(skill: string): void {
  const current = readProfile();
  writeProfile({
    ...current,
    skills: current.skills.filter((item) => item !== skill),
  });
}

export function saveQualification(
  input: Omit<Qualification, "id">,
  id?: string,
): void {
  const entry: Qualification = {
    id: id ?? nextProfileId("q"),
    title: input.title.trim(),
    org: input.org.trim(),
    period: input.period.trim(),
    note: input.note?.trim() || undefined,
  };
  const current = readProfile();
  const qualifications = id
    ? current.qualifications.map((item) => (item.id === id ? entry : item))
    : [...current.qualifications, entry];
  writeProfile({ ...current, qualifications });
}

export function removeQualification(id: string): void {
  const current = readProfile();
  writeProfile({
    ...current,
    qualifications: current.qualifications.filter((item) => item.id !== id),
  });
}

export function detectCardBrand(digits: string): PaymentBrand | null {
  if (digits.startsWith("4")) return "Visa";
  if (digits.startsWith("5") || digits.startsWith("2")) return "Mastercard";
  if (digits.startsWith("3")) return "Amex";
  return null;
}

export function formatCardNumber(value: string): string {
  return value
    .replace(/\D/g, "")
    .slice(0, CARD_DIGITS_MAX)
    .replace(/(.{4})/g, "$1 ")
    .trim();
}

export function parseExpiry(
  value: string,
): { month: number; year: number } | null {
  const match = /^(\d{2})\s*\/\s*(\d{2})$/.exec(value.trim());
  if (!match) return null;
  const month = Number(match[1]);
  const year = Number(match[2]);
  return month >= 1 && month <= 12 ? { month, year } : null;
}

export function isValidExpiry(
  month: number,
  year: number,
  now: Date = new Date(),
): boolean {
  const currentYear = now.getFullYear() % 100;
  const currentMonth = now.getMonth() + 1;
  return year > currentYear || (year === currentYear && month >= currentMonth);
}

export function addPaymentMethod(
  cardNumber: string,
  expMonth: number,
  expYear: number,
): PaymentMethod | null {
  const digits = cardNumber.replace(/\D/g, "");
  const brand = detectCardBrand(digits);
  if (
    !brand ||
    digits.length < CARD_DIGITS_MIN ||
    digits.length > CARD_DIGITS_MAX
  ) {
    return null;
  }
  if (!isValidExpiry(expMonth, expYear)) return null;
  const method: PaymentMethod = {
    id: nextProfileId("pm"),
    brand,
    last4: digits.slice(-4),
    expMonth,
    expYear,
  };
  const current = readProfile();
  writeProfile({
    ...current,
    paymentMethods: [...current.paymentMethods, method],
  });
  return method;
}

export function setDefaultPaymentMethod(id: string): void {
  const current = readProfile();
  if (current.paymentMethods[0]?.id === id) return;
  const target = current.paymentMethods.find((method) => method.id === id);
  if (!target) return;
  writeProfile({
    ...current,
    paymentMethods: [
      target,
      ...current.paymentMethods.filter((method) => method.id !== id),
    ],
  });
}

export function removePaymentMethod(id: string): void {
  const current = readProfile();
  writeProfile({
    ...current,
    paymentMethods: current.paymentMethods.filter(
      (method) => method.id !== id,
    ),
  });
}

export function clearSessionFilters(): void {
  writeFilters(freshFilters());
}

export function eraseLocalData(): void {
  writeProfile(freshProfile());
  writeJobsState(freshState());
  clearSessionFilters();
}

export async function migrateLegacyProfile(): Promise<void> {
  const legacyKey = `CapacitorStorage.${PROFILE_STORAGE_KEY}`;
  const legacyRaw = readLocalRaw(legacyKey);
  if (legacyRaw === null) return;
  await removeRaw(legacyKey, "persistent");
  if (readLocalRaw(PROFILE_STORAGE_KEY) !== null) return;
  writeRaw(PROFILE_STORAGE_KEY, legacyRaw, "persistent");
}

registerMigration(migrateLegacyProfile);
