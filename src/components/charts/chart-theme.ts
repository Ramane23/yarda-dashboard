"use client";

import { useTheme } from "next-themes";
import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { CHART_SERIES, DECISIONS, cssColor, decisionTone, type Decision } from "@/lib/tokens";

/** Concrete colours and styles for Recharts, resolved from the design tokens. */
export interface ChartTheme {
  axis: string;
  grid: string;
  cursor: string;
  series: string[];
  decision: Record<Decision, string>;
  tooltip: { contentStyle: CSSProperties; labelStyle: CSSProperties; itemStyle: CSSProperties };
  tick: { fontSize: number; fill: string };
}

/**
 * Chart colours that follow the active theme (plan item UX-07).
 *
 * Recharts needs concrete colour strings, so the CSS variables are read at
 * runtime and re-read whenever the theme changes. No chart hardcodes a hex.
 */
export function useChartTheme(): ChartTheme {
  const { resolvedTheme } = useTheme();
  const [revision, setRevision] = useState(0);
  // Variables change after the class switch is painted; re-read on the next frame.
  useEffect(() => {
    const frame = requestAnimationFrame(() => setRevision((value) => value + 1));
    return () => cancelAnimationFrame(frame);
  }, [resolvedTheme]);

  return useMemo(() => {
    const axis = cssColor("--muted-foreground");
    return {
      axis,
      grid: cssColor("--border"),
      cursor: cssColor("--muted-foreground", 0.08),
      series: CHART_SERIES.map((name) => cssColor(name)),
      decision: Object.fromEntries(
        DECISIONS.map((d) => [d, cssColor(decisionTone(d).cssVar)]),
      ) as Record<Decision, string>,
      tick: { fontSize: 11, fill: axis },
      tooltip: {
        contentStyle: {
          background: cssColor("--popover"),
          border: `1px solid ${cssColor("--border")}`,
          borderRadius: 8,
          boxShadow: "0 8px 24px -8px rgb(0 0 0 / 0.2)",
          fontSize: 12,
          padding: "8px 10px",
        },
        labelStyle: { color: axis, marginBottom: 4 },
        itemStyle: { color: cssColor("--popover-foreground"), padding: 0 },
      },
    };
    // `revision` forces a re-read of the CSS variables after a theme change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [revision]);
}
