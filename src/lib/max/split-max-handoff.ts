/** Delimiter between design markdown and plain coding-agent instructions. */
export const MAX_HANDOFF_CODING_SEP = "\n\n---WCS_CODING_PROMPT---\n\n";

const MAX_HANDOFF_CODING_MARKER = "---WCS_CODING_PROMPT---";

/**
 * Join markdown design handoff and a plain coding-agent prompt for reliable client splitting.
 */
export const composeTaggedMaxHandoff = (markdownBody: string, codingAgentPrompt: string): string => {
  const md = markdownBody.trim();
  const coding = codingAgentPrompt.trim();
  return `${md}${MAX_HANDOFF_CODING_SEP}${coding}`;
};

const extractLastFencedBlock = (source: string): string | null => {
  const matches = [...source.matchAll(/```(?:\w+)?\s*([\s\S]*?)```/g)];
  if (!matches.length) return null;
  const last = matches[matches.length - 1];
  const body = last?.[1]?.trim();
  return body && body.length > 0 ? body : null;
};

export type SplitMaxHandoff = {
  handoffMarkdown: string;
  codingAgentPrompt: string;
};

/**
 * Split a stored/generated MAX payload into markdown vs coding-agent paste text.
 */
export const splitMaxHandoff = (raw: string): SplitMaxHandoff => {
  const trimmed = raw.trim();
  let idx = trimmed.indexOf(MAX_HANDOFF_CODING_SEP);
  let sepLen = MAX_HANDOFF_CODING_SEP.length;
  if (idx === -1) {
    idx = trimmed.indexOf(MAX_HANDOFF_CODING_MARKER);
    sepLen = MAX_HANDOFF_CODING_MARKER.length;
  }
  if (idx === -1) {
    const fallbackCoding = extractLastFencedBlock(trimmed) ?? trimmed;
    return { handoffMarkdown: trimmed, codingAgentPrompt: fallbackCoding };
  }
  const handoffMarkdown = trimmed.slice(0, idx).trim();
  const codingAgentPrompt = trimmed.slice(idx + sepLen).trim();
  return { handoffMarkdown, codingAgentPrompt };
};
