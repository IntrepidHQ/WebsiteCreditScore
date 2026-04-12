/**
 * Simplified brand-inspired icon marks for Claude (Anthropic), Codex (OpenAI),
 * and Lovable. These are independent representations — not official assets.
 *
 * WebsiteCreditScore.com is not affiliated with, sponsored by, or endorsed by
 * Anthropic, OpenAI, or Lovable.
 */

interface LogoProps {
  className?: string;
}

/** Claude / Anthropic — stylised diamond grid mark */
export function AnthropicLogo({ className = "size-5" }: LogoProps) {
  return (
    <svg
      aria-label="Claude (Anthropic)"
      className={className}
      fill="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Anthropic's mark is reminiscent of a stylised letter A / triangular form */}
      <path d="M12 2L4 20h3.5l1.6-4h5.8l1.6 4H20L12 2zm-1.6 11L12 7.4l1.6 5.6H10.4z" />
    </svg>
  );
}

/** OpenAI / Codex — rotating bloom / asterisk mark */
export function OpenAILogo({ className = "size-5" }: LogoProps) {
  return (
    <svg
      aria-label="Codex (OpenAI)"
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Simplified 6-petal rotating bloom, inspired by OpenAI's mark */}
      <path
        d="M12 2a3.2 3.2 0 0 1 2.78 1.6l5.1 8.83a3.2 3.2 0 0 1 0 3.14L14.78 20.4A3.2 3.2 0 0 1 12 22a3.2 3.2 0 0 1-2.78-1.6L4.12 11.57a3.2 3.2 0 0 1 0-3.14L9.22 3.6A3.2 3.2 0 0 1 12 2z"
        fill="currentColor"
        opacity="0.15"
      />
      <path
        d="M12 5.5l2.3 3.98L18 10.5l-1.8 1.05L18 12.6l-3.7 1.02L12 18.5l-2.3-4.88L6 12.6l1.8-1.05L6 10.5l3.7-1.02L12 5.5z"
        fill="currentColor"
      />
    </svg>
  );
}

/** Lovable — heart mark */
export function LovableLogo({ className = "size-5" }: LogoProps) {
  return (
    <svg
      aria-label="Lovable"
      className={className}
      fill="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.27 2 8.5 2 5.41 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.08C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.41 22 8.5c0 3.77-3.4 6.86-8.55 11.53L12 21.35z" />
    </svg>
  );
}
