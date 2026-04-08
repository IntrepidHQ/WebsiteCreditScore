import Anthropic from "@anthropic-ai/sdk";

/**
 * Shared Anthropic client. Instantiated lazily so the module can be imported
 * without throwing when ANTHROPIC_API_KEY is absent (graceful degradation).
 */
let _client: Anthropic | null = null;

export function getAnthropicClient(): Anthropic | null {
  if (!process.env.ANTHROPIC_API_KEY?.trim()) {
    return null;
  }

  if (!_client) {
    _client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY.trim() });
  }

  return _client;
}
