"use client";

import { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

export type TrendPoint = { key: string; label: string; value: number };

/**
 * One measure over a window. Drawn at the width it is actually given rather
 * than stretched from a fixed viewBox: a chart squeezed into a phone should
 * lose its labels, not distort its own line and letters.
 *
 * Reading a value is a hover on a desktop and a drag on a phone — the same
 * pointer handler serves both — and the figures are also printed under the
 * chart for anyone who reaches it by keyboard or screen reader.
 */
export function TrendChart({
  points,
  format,
  height = 220,
  caption,
  className,
}: {
  points: TrendPoint[];
  format: (value: number) => string;
  height?: number;
  /** What the chart is, for anyone who cannot see it. */
  caption: string;
  className?: string;
}) {
  const frame = useRef<HTMLDivElement>(null);
  // A sensible desktop width for the first paint, corrected on mount. The
  // alternative — rendering nothing until measured — flashes an empty panel.
  const [width, setWidth] = useState(760);
  const [at, setAt] = useState<number | null>(null);

  useEffect(() => {
    const element = frame.current;
    if (!element) return;
    const observer = new ResizeObserver(([entry]) => {
      setWidth(entry.contentRect.width);
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const padL = 54;
  const padR = 10;
  const padT = 12;
  const padB = 24;
  const innerW = Math.max(width - padL - padR, 40);
  const innerH = Math.max(height - padT - padB, 40);

  const top = niceMax(Math.max(...points.map((point) => point.value), 0));
  const last = points.length - 1;

  const x = (index: number) =>
    padL + (last > 0 ? (innerW * index) / last : innerW / 2);
  const y = (value: number) => padT + innerH - (value / top) * innerH;

  const line = points
    .map((point, i) => `${i ? "L" : "M"}${x(i).toFixed(2)} ${y(point.value).toFixed(2)}`)
    .join(" ");
  const area = points.length
    ? `${line} L${x(last).toFixed(2)} ${padT + innerH} L${x(0).toFixed(2)} ${padT + innerH} Z`
    : "";

  // Six labels is what fits on the narrowest screen the studio supports; the
  // rest of the axis is inferred from those.
  const every = Math.max(1, Math.ceil(points.length / (width < 480 ? 4 : 7)));
  const active = at === null ? null : points[at];

  function track(event: React.PointerEvent<SVGSVGElement>) {
    if (last <= 0) return;
    const box = event.currentTarget.getBoundingClientRect();
    const ratio = (event.clientX - box.left - padL) / innerW;
    setAt(Math.min(last, Math.max(0, Math.round(ratio * last))));
  }

  return (
    <figure className={cn("relative", className)} ref={frame}>
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        className="block touch-pan-y text-accent"
        role="img"
        aria-label={caption}
        onPointerMove={track}
        onPointerDown={track}
        onPointerLeave={() => setAt(null)}
      >
        <defs>
          <linearGradient id="trend-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="currentColor" stopOpacity={0.22} />
            <stop offset="100%" stopColor="currentColor" stopOpacity={0} />
          </linearGradient>
        </defs>

        {[1, 0.5, 0].map((step) => (
          <g key={step}>
            <line
              x1={padL}
              x2={padL + innerW}
              y1={padT + innerH * (1 - step)}
              y2={padT + innerH * (1 - step)}
              className="stroke-border"
              strokeWidth={1}
            />
            <text
              x={padL - 8}
              y={padT + innerH * (1 - step)}
              dy="0.32em"
              textAnchor="end"
              className="fill-foreground/45 text-[10.5px] font-feature-tnum"
            >
              {format(top * step)}
            </text>
          </g>
        ))}

        {points.map((point, i) =>
          // The last column always keeps its label; an interval label that
          // would land on top of it is dropped rather than overlapped.
          i === last || (i % every === 0 && last - i >= every / 2) ? (
            <text
              key={point.key}
              x={x(i)}
              y={height - 6}
              textAnchor={i === 0 ? "start" : i === last ? "end" : "middle"}
              className="fill-foreground/45 text-[10.5px]"
            >
              {point.label}
            </text>
          ) : null
        )}

        {area ? <path d={area} fill="url(#trend-fill)" /> : null}
        <path
          d={line}
          fill="none"
          stroke="currentColor"
          strokeWidth={1.75}
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {active ? (
          <g>
            <line
              x1={x(at!)}
              x2={x(at!)}
              y1={padT}
              y2={padT + innerH}
              className="stroke-foreground/25"
              strokeWidth={1}
              strokeDasharray="3 3"
            />
            <circle
              cx={x(at!)}
              cy={y(active.value)}
              r={4}
              fill="currentColor"
              className="stroke-admin-surface"
              strokeWidth={2}
            />
          </g>
        ) : null}
      </svg>

      {active ? (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute top-1 -translate-x-1/2 rounded-md border border-border bg-admin-surface px-2.5 py-1.5 text-center shadow-sm"
          style={{ left: Math.min(Math.max(x(at!), 62), Math.max(width - 62, 62)) }}
        >
          <p className="text-[11px] whitespace-nowrap text-foreground/55">{active.label}</p>
          <p className="text-[13px] font-semibold whitespace-nowrap font-feature-tnum">
            {format(active.value)}
          </p>
        </div>
      ) : null}

      <figcaption className="sr-only">
        {caption}.{" "}
        {points.map((point) => `${point.label}: ${format(point.value)}`).join(". ")}
      </figcaption>
    </figure>
  );
}

/**
 * A round number at or above the tallest column, so the axis reads 0 / 25k /
 * 50k rather than 0 / 23,914 / 47,828.
 */
function niceMax(value: number) {
  if (value <= 0) return 1;
  const magnitude = 10 ** Math.floor(Math.log10(value));
  const scaled = value / magnitude;
  const step = scaled <= 1 ? 1 : scaled <= 2 ? 2 : scaled <= 5 ? 5 : 10;
  return step * magnitude;
}
