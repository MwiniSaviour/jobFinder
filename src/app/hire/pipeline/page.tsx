import type { Metadata } from "next";
import { PipelineBoard } from "@/components/hire/pipeline-board";

export const metadata: Metadata = {
  title: "Pipeline",
  description:
    "A calm, shared hiring pipeline — move candidates, leave notes, and keep everyone informed.",
};

export default async function PipelinePage({
  searchParams,
}: {
  searchParams: Promise<{ role?: string }>;
}) {
  const { role } = await searchParams;
  return <PipelineBoard initialRole={role ?? "all"} />;
}
