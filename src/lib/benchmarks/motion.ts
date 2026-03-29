import type { SiteObservation } from "@/lib/types/audit";
import { clampScore } from "@/lib/utils/scores";

export interface AnimationPattern {
  id: string;
  title: string;
  summary: string;
  example: string;
  pointValue: number;
  signals: string[];
  bestPractice: string;
  caution: string;
}

export interface AnimationGuidanceCard {
  id: string;
  title: string;
  source: string;
  summary: string;
  takeaways: string[];
}

const animationPatterns: AnimationPattern[] = [
  {
    id: "micro-feedback",
    title: "Micro-interaction feedback",
    summary: "Hover, focus, and press feedback that confirms a control is alive without pulling attention.",
    example: "Button lifts on hover and compresses on press with only transform and opacity.",
    pointValue: 1,
    signals: ["micro-feedback"],
    bestPractice: "Keep it quick, consistent, and tied to affordance.",
    caution: "If every card and icon jitters differently, the interface feels noisy instead of premium.",
  },
  {
    id: "state-feedback",
    title: "Form and state feedback",
    summary: "Validation, success, warning, and disclosure motion that clarifies a change in state.",
    example: "A form success toast fades in and a field error slides into place without layout jump.",
    pointValue: 1,
    signals: ["state-feedback"],
    bestPractice: "Use motion to explain a state change, not to hide one.",
    caution: "Long delays or bouncy motion make simple tasks feel slower than they are.",
  },
  {
    id: "section-reveal",
    title: "Section reveal and sequencing",
    summary: "Light entrance motion that helps the page read in order as the visitor scrolls.",
    example: "The hero copy and first row of cards enter with a short stagger as the section mounts.",
    pointValue: 1,
    signals: ["reveal"],
    bestPractice: "Reveal only once, keep distance short, and support reduced motion.",
    caution: "If every section animates the same way, the page starts feeling like a template.",
  },
  {
    id: "scroll-story",
    title: "Scroll storytelling",
    summary: "Subtle scroll-triggered motion that guides attention through a narrative or proof sequence.",
    example: "A benchmark case study animates images and copy in sequence as the visitor moves down the page.",
    pointValue: 2,
    signals: ["scroll-story"],
    bestPractice: "Let motion support comprehension; avoid pinning unless it improves the story.",
    caution: "Heavy scrubbed motion can hurt performance and make the page feel over-designed.",
  },
  {
    id: "layout-transition",
    title: "Layout transitions and FLIP",
    summary: "Motion that keeps filters, reordering, tabs, and card rearrangements understandable.",
    example: "Benchmark cards reorder with a FLIP-style transform instead of snapping into a new grid.",
    pointValue: 2,
    signals: ["layout-transition"],
    bestPractice: "Use transform-based transitions so the browser can keep the interface responsive.",
    caution: "If the whole page relayouts every time a filter changes, the motion feels expensive.",
  },
  {
    id: "route-transition",
    title: "Page and route transitions",
    summary: "A restrained transition between major views that keeps the interface feeling continuous.",
    example: "Opening a report fades the old surface out and the new report in, without blocking content.",
    pointValue: 1,
    signals: ["page-transition"],
    bestPractice: "Keep route transitions short and make them skippable under reduced motion.",
    caution: "A long full-screen transition adds ceremony where the user just wants the next view.",
  },
  {
    id: "text-motion",
    title: "Editorial typography motion",
    summary: "Kinetic type or staged copy reveal used sparingly to strengthen hierarchy and pacing.",
    example: "The hero lede fades in after the title while stats arrive a beat later.",
    pointValue: 1,
    signals: ["text-motion"],
    bestPractice: "Make the typography still feel readable if motion is disabled.",
    caution: "Animated lettering should never be required to understand the message.",
  },
  {
    id: "reduced-motion",
    title: "Reduced-motion support",
    summary: "Respecting reduced-motion preferences and simplifying or disabling nonessential effects.",
    example: "The same screen renders without scroll-triggered movement when motion is reduced.",
    pointValue: 1,
    signals: ["reduced-motion"],
    bestPractice: "Treat reduced-motion as a first-class mode, not a fallback exception.",
    caution: "If disabling motion breaks the design, the design depends on motion too much.",
  },
];

const animationGuidance: AnimationGuidanceCard[] = [
  {
    id: "purpose",
    title: "Every animation needs a job",
    source: "GSAP docs + Motion.dev",
    summary:
      "Use motion to guide attention, confirm state changes, or explain transitions. Decorative motion without a job should not earn points.",
    takeaways: [
      "Keep motion tied to a task the user can understand immediately.",
      "Prefer short, readable motion over big theatrical movement.",
      "If the page is already clear, less motion is usually better.",
    ],
  },
  {
    id: "performance",
    title: "Keep it composited and light",
    source: "Motion.dev performance guidance",
    summary:
      "The safest motion work uses transforms and opacity, avoids layout thrash, and stays light on mobile and lower-power devices.",
    takeaways: [
      "Prefer transform and opacity whenever the effect allows it.",
      "Use scroll-based storytelling sparingly and only where it clarifies the content.",
      "Avoid long-running or constantly moving effects unless they truly add value.",
    ],
  },
  {
    id: "react",
    title: "Use GSAP the React-safe way",
    source: "GSAP docs + learning resources",
    summary:
      "In React, scope animations so they clean up predictably and respect component lifecycles.",
    takeaways: [
      "Use `gsap.context()` and revert cleanly on unmount.",
      "Pair motion with `matchMedia()` and reduced-motion preferences.",
      "Treat plugins like ScrollTrigger or Flip as tools for specific problems, not defaults for every screen.",
    ],
  },
  {
    id: "accessibility",
    title: "Motion should always be optional",
    source: "Accessibility guidance + user preference support",
    summary:
      "A site can still be excellent without motion. The goal is quality enhancement, not decoration pressure.",
    takeaways: [
      "Honor reduced-motion preferences and simplify nonessential effects.",
      "Do not rely on animation as the only way to communicate meaning.",
      "If motion is removed, the interface should still read well immediately.",
    ],
  },
];

export function getAnimationPatterns() {
  return animationPatterns;
}

export function getAnimationGuidance() {
  return animationGuidance;
}

export function calculateAnimationScore(observation: SiteObservation) {
  const signals = new Set(observation.motionSignals);

  if (!signals.size) {
    return 0;
  }

  const score = animationPatterns.reduce(
    (total, pattern) =>
      total + (pattern.signals.some((signal) => signals.has(signal)) ? pattern.pointValue : 0),
    0,
  );

  return clampScore(score);
}

export function getAnimationPatternMatches(observation: SiteObservation) {
  const signals = new Set(observation.motionSignals);

  return animationPatterns.map((pattern) => ({
    ...pattern,
    matched: pattern.signals.some((signal) => signals.has(signal)),
  }));
}
