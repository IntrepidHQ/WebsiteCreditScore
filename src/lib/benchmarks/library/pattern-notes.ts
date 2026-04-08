import type { BenchmarkVertical, DesignPatternNote } from "@/lib/types/audit";

export const patternNotes: Record<BenchmarkVertical, DesignPatternNote[]> = {
  "service-providers": [
    {
      id: "note-services-grid",
      title: "Use modular proof grids, not long unbroken pages",
      source: "robot-components",
      category: "grid",
      summary: "Service sites benefit from modular grids that let trust, services, and process read in distinct chunks instead of one long brochure column.",
      takeaways: [
        "Use predictable grid rhythm to separate proof from pitch.",
        "Let service cards and proof cards share a unified system.",
        "Reduce scroll fatigue by composing sections as modules, not slabs.",
      ],
      applicability: "Best for home, trade, and commercial service sites with multiple proof types.",
    },
    {
      id: "note-services-color",
      title: "Use restrained tonal color systems",
      source: "Radix Colors",
      category: "color",
      summary: "Premium service sites feel more trustworthy when surfaces, borders, and accents come from a restrained tonal system instead of arbitrary branding colors.",
      takeaways: [
        "Use hue-consistent tonal scales for borders and surfaces.",
        "Reserve vivid color for calls to action and state changes.",
        "Avoid muddy contrast in dark themes.",
      ],
      applicability: "Best for redesigns that need to feel more current and more trustworthy fast.",
    },
    {
      id: "note-services-prompts",
      title: "Prompt patterns should map to business outcomes",
      source: "AI UX Playground",
      category: "prompts",
      summary: "Pattern libraries are only useful if they stay tied to real job-to-be-done outcomes such as calling, requesting service, or booking a visit.",
      takeaways: [
        "Treat hero, proof, CTA, and FAQ as conversion tools, not content filler.",
        "Use prompt patterns to generate options, not final answers.",
        "Score patterns by the friction they remove.",
      ],
      applicability: "Best for service-provider redesign workshops and benchmark reviews.",
    },
  ],
  "private-healthcare": [
    {
      id: "note-healthcare-type",
      title: "Typography should reduce anxiety before it sells",
      source: "AI UX Playground + editorial layout study",
      category: "typography",
      summary: "Healthcare typography performs best when it feels calm, readable, and assured rather than loud or ornamental.",
      takeaways: [
        "Use a stronger lede and caption system for practical patient information.",
        "Keep line lengths shorter in reassurance-heavy sections.",
        "Let hierarchy guide trust instead of decorative treatment.",
      ],
      applicability: "Best for dental, clinic, specialist, and provider-profile experiences.",
    },
    {
      id: "note-healthcare-icons",
      title: "Use consistent icon families for utility only",
      source: "Iconoir + Iconify",
      category: "iconography",
      summary: "Healthcare UI should use icons to clarify logistics and actions, not to decorate every content block.",
      takeaways: [
        "Use one primary icon family and a broad fallback library only when needed.",
        "Keep icons around location, insurance, scheduling, and contact tasks.",
        "Avoid mixing icon metaphors that undermine calm, clinical clarity.",
      ],
      applicability: "Best for patient logistics, provider proof, and intake flows.",
    },
    {
      id: "note-healthcare-workflow",
      title: "Codex should follow a repeatable design-review workflow",
      source: "superpowers + awesome-codex-skills",
      category: "workflow",
      summary: "The strongest UI reviews come from a repeatable skill-driven workflow: benchmark, critique, propose, validate, and refine.",
      takeaways: [
        "Treat design review as a disciplined repeatable process.",
        "Use skills to separate exploration, critique, and implementation.",
        "Capture repeatable UI judgment as reusable notes, not one-off opinions.",
      ],
      applicability: "Best for making WebsiteCreditScore.com’s future audits more consistent across projects.",
    },
  ],
  "product-saas": [
    {
      id: "note-saas-type",
      title: "Typography quality should come from rhythm first",
      source: "Editorial layout study",
      category: "typography",
      summary: "The strongest product sites do not rely on decorative text styling; they use measure, spacing, rhythm, and composition to make typography feel expensive.",
      takeaways: [
        "Use stronger ledes, captions, and stat typography systems.",
        "Balance type blocks with whitespace and supporting media.",
        "Keep emphasis structural instead of effect-heavy.",
      ],
      applicability: "Best for product pages, benchmark storytelling, and high-density landing surfaces.",
    },
  ],
  fintech: [
    {
      id: "note-fintech-grid",
      title: "Financial interfaces need stable layout rhythm",
      source: "Fintech interface study",
      category: "grid",
      summary: "Fintech pages feel safer when the layout is stable, modular, and easy to predict as the story gets denser.",
      takeaways: [
        "Use modular section rhythm to keep complexity readable.",
        "Group proof, compliance, and product detail into deliberate clusters.",
        "Avoid novelty layouts that make financial information feel less stable.",
      ],
      applicability: "Best for fintech homepages, product-overview pages, and trust-heavy comparison surfaces.",
    },
    {
      id: "note-fintech-color",
      title: "Trust color should stay precise, not theatrical",
      source: "Color systems review",
      category: "color",
      summary: "Fintech UIs work best when color supports confidence and state clarity instead of trying to manufacture excitement.",
      takeaways: [
        "Reserve vivid color for emphasis, state, and action.",
        "Use a restrained neutral system so product visuals carry more weight.",
        "Avoid over-signaling security through loud or overly literal visual treatment.",
      ],
      applicability: "Best for payment, banking, and finance products that need a premium trust layer.",
    },
    {
      id: "note-fintech-icons",
      title: "Iconography should clarify systems, not decorate them",
      source: "Product systems review",
      category: "iconography",
      summary: "The strongest fintech sites use icons to explain tasks, flows, and product states rather than to fill empty space.",
      takeaways: [
        "Keep one coherent icon language across the page.",
        "Use icons where they remove explanation from dense product blocks.",
        "Let typography and spacing do most of the premium work.",
      ],
      applicability: "Best for dense product storytelling, benchmark docs, and conversion-heavy product marketing.",
    },
  ],
};
