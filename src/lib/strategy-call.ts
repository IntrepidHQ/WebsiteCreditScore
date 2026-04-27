/** Calendly event: booking this call kicks off the Strategy Presentation workflow. */
export const STRATEGY_CALL_CALENDLY_BASE = "https://calendly.com/seekercray/30min";

export type StrategyCallMedium = "navbar" | "hero" | "footer" | "scan_report";

export const buildStrategyCallCalendlyUrl = (opts: {
  medium: StrategyCallMedium;
  /** e.g. scanned domain, or a page slug */
  content?: string;
}) => {
  const u = new URL(STRATEGY_CALL_CALENDLY_BASE);
  u.searchParams.set("utm_source", "websitecreditscore");
  u.searchParams.set("utm_medium", opts.medium);
  if (opts.content) u.searchParams.set("utm_content", opts.content);
  return u.toString();
};

export const buildStrategyPresentationUrl = (opts: { medium: StrategyCallMedium; content?: string }) => {
  const u = new URL("https://strategypresentation.com/");
  u.searchParams.set("utm_source", "websitecreditscore");
  u.searchParams.set("utm_medium", opts.medium);
  if (opts.content) u.searchParams.set("utm_content", opts.content);
  return u.toString();
};
