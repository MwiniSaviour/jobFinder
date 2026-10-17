import type { Metadata } from "next";
import { SavedView } from "@/components/app/saved-view";

export const metadata: Metadata = {
  title: "Saved roles",
  description: "Your shortlist of roles worth a second look.",
};

export default function SavedPage() {
  return <SavedView />;
}
