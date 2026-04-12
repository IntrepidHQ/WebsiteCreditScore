import Link from "next/link";

import { SectionHeading } from "@/components/common/section-heading";
import { Button } from "@/components/ui/button";

export const LandingChatSection = () => {
  return (
    <section className="presentation-section py-8" id="chat">
      <div className="mx-auto w-full max-w-[min(100%,96rem)] space-y-8 px-4 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
          <SectionHeading
            eyebrow="Workspace assistant"
            title="Chat is available inside the workspace (MAX)"
            description="We keep the assistant next to your saved audits so answers can reference real scores and findings. MAX unlocks the chat endpoint and keeps the experience aligned with build handoffs."
          />
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Button asChild size="lg">
            <Link href="/app/chat">Open workspace chat</Link>
          </Button>
          <Button asChild size="lg" variant="secondary">
            <Link href="/app/login?next=%2Fapp%2Fchat">Sign in to continue</Link>
          </Button>
        </div>
      </div>
    </section>
  );
};
