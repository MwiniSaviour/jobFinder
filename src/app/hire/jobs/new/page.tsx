import type { Metadata } from "next";
import { PostJobWizard } from "@/components/hire/post-job-wizard";

export const metadata: Metadata = {
  title: "Post a role",
  description:
    "Write a clear, honest role and publish it to candidates in minutes.",
};

export default function NewJobPage() {
  return <PostJobWizard />;
}
