interface SparklineProps {
  values: number[];
  label: string;
  width?: number;
  height?: number;
  stroke?: string;
  fill?: string;
  ariaLabel?: string;
}

export function Sparkline({
  values,
  label,
  width = 480,
  height = 96,
  stroke = "var(--theme-accent)",
  fill = "color-mix(in srgb, var(--theme-accent) 16%, transparent)",
  ariaLabel,
}: SparklineProps) {
  if (values.length === 0) {
    return (
      <div className="flex h-24 items-center justify-center text-xs text-muted">
        No data
      </div>
    );
  }

  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);
  const range = max - min || 1;
  const stepX = values.length > 1 ? width / (values.length - 1) : 0;
  const points = values.map((v, i) => {
    const x = i * stepX;
    const y = height - ((v - min) / range) * (height - 8) - 4;
    return `${x},${y}`;
  });
  const pathLine = `M ${points.join(" L ")}`;
  const pathArea = `M 0,${height} L ${points.join(" L ")} L ${width},${height} Z`;

  return (
    <svg
      aria-label={ariaLabel ?? label}
      className="h-24 w-full"
      preserveAspectRatio="none"
      role="img"
      viewBox={`0 0 ${width} ${height}`}
    >
      <path d={pathArea} fill={fill} />
      <path d={pathLine} fill="none" stroke={stroke} strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
    </svg>
  );
}
