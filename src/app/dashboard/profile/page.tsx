import type { Metadata } from "next";
import { ProfileEditor } from "@/components/app/profile-editor";

export const metadata: Metadata = {
  title: "Your profile",
  description:
    "One considered profile — experience, skills, preferences, and visibility.",
};

export default function ProfilePage() {
  return <ProfileEditor />;
}
