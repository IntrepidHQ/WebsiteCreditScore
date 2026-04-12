import { AgentChatPanel } from "@/features/app/components/agent-chat-panel";
import { SectionHeading } from "@/components/common/section-heading";

export function LandingChatSection() {
  return (
    <section className="presentation-section py-8" id="chat">
      <div className="mx-auto w-full max-w-[min(100%,96rem)] space-y-8 px-4 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
          <SectionHeading
            eyebrow="AI Assistant"
            title="Ask about your website or draft an outreach message"
            description="Ask anything — from 'what should I fix first?' to 'draft a cold email for this prospect.' Uses Claude Haiku for quick answers, Sonnet for design questions."
          />
        </div>
        <div className="mx-auto max-w-3xl">
          <AgentChatPanel endpoint="/api/chat" />
        </div>
      </div>
    </section>
  );
}
