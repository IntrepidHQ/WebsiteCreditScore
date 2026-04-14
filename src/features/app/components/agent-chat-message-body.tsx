"use client";

import type { ReactNode } from "react";

const formatInline = (line: string, keyBase: string): ReactNode => {
  if (!line.includes("**")) {
    return line;
  }

  const nodes: ReactNode[] = [];
  const re = /\*\*([^*]+)\*\*/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let i = 0;

  while ((m = re.exec(line)) !== null) {
    if (m.index > last) {
      nodes.push(line.slice(last, m.index));
    }
    nodes.push(
      <strong className="font-semibold text-foreground" key={`${keyBase}-s-${i++}`}>
        {m[1]}
      </strong>,
    );
    last = m.index + m[0].length;
  }

  if (last < line.length) {
    nodes.push(line.slice(last));
  }

  return nodes.length ? nodes : line;
};

const isRuleLine = (line: string) => /^-{3,}$/.test(line.trim());

const isBulletLine = (line: string) => {
  const t = line.trimStart();
  return t.startsWith("- ") || t.startsWith("* ");
};

const stripBullet = (line: string) => {
  const t = line.trimStart();
  if (t.startsWith("- ")) {
    return t.slice(2);
  }
  if (t.startsWith("* ")) {
    return t.slice(2);
  }
  return line;
};

/**
 * Lightweight markdown-ish rendering for assistant replies (bold, lists, rules)
 * without adding a markdown dependency.
 */
export function AgentChatMessageBody({ content, messageKey }: { content: string; messageKey: string }) {
  const rawLines = content.split("\n");
  const blocks: ReactNode[] = [];
  let i = 0;
  let blockIdx = 0;

  while (i < rawLines.length) {
    const line = rawLines[i] ?? "";

    if (line.trim() === "") {
      i += 1;
      continue;
    }

    if (isRuleLine(line)) {
      blocks.push(
        <hr
          className="my-4 border-0 border-t border-border/55"
          key={`${messageKey}-hr-${blockIdx++}`}
        />,
      );
      i += 1;
      continue;
    }

    if (isBulletLine(line)) {
      const items: string[] = [];
      while (i < rawLines.length && isBulletLine(rawLines[i] ?? "")) {
        items.push(stripBullet(rawLines[i] ?? ""));
        i += 1;
      }
      blocks.push(
        <ul
          className="my-3 ml-1 list-disc space-y-1.5 pl-5 text-[14px] leading-relaxed text-muted marker:text-accent/80"
          key={`${messageKey}-ul-${blockIdx++}`}
        >
          {items.map((item, j) => (
            <li className="pl-0.5 text-foreground/90" key={`${messageKey}-li-${j}`}>
              {formatInline(item, `${messageKey}-li-${j}`)}
            </li>
          ))}
        </ul>,
      );
      continue;
    }

    const paraLines: string[] = [];
    while (i < rawLines.length) {
      const next = rawLines[i] ?? "";
      if (next.trim() === "" || isRuleLine(next) || isBulletLine(next)) {
        break;
      }
      paraLines.push(next);
      i += 1;
    }

    const paragraph = paraLines.join("\n").trim();
    if (!paragraph) {
      continue;
    }

    const headingMatch = /^\s*\*\*(.+?)\*\*\s*$/.exec(paragraph);
    if (headingMatch && paraLines.length === 1) {
      blocks.push(
        <h4
          className="mt-5 font-display text-base font-semibold tracking-tight text-foreground first:mt-0 sm:text-[1.05rem]"
          key={`${messageKey}-h-${blockIdx++}`}
        >
          {formatInline(headingMatch[1]!, `${messageKey}-h`)}
        </h4>,
      );
      continue;
    }

    blocks.push(
      <p
        className="text-[15px] leading-[1.65] text-foreground/92 [&+p]:mt-3"
        key={`${messageKey}-p-${blockIdx++}`}
      >
        {paraLines.map((pl, k) => (
          <span key={`${messageKey}-pl-${k}`}>
            {k > 0 ? <br /> : null}
            {formatInline(pl, `${messageKey}-pl-${k}`)}
          </span>
        ))}
      </p>,
    );
  }

  return <div className="space-y-1">{blocks}</div>;
}
