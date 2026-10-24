"use client";

import { Assistant } from "@/components/ai-assistant/Assistant";
import { PageHeading } from "@/components/ui";

export default function AssistantPage() {
  return (
    <>
      <PageHeading
        title="AI Planning Assistant"
        subtitle="Ask anything about your plan, or generate tasks, ideas and budget lines straight into the dashboard."
      />
      <Assistant />
    </>
  );
}
