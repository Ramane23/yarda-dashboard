/**
 * Visual vocabulary of fraud decisions, risk scores and learning phases
 * (plan item UX-02).
 *
 * This is the **only** place that maps a business value to colours. Badges,
 * tables, charts and legends all read from here, so "block" is the same red
 * everywhere, in both themes. Class names reference the semantic tokens of
 * `globals.css`; chart colours read the same CSS variables at runtime.
 */

/** Decisions the scorer can return, from least to most severe. */
export const DECISIONS = ["allow", "review", "alert", "block"] as const;
export type Decision = (typeof DECISIONS)[number];

/** Learning phases of a tenant, in order. */
export const PHASES = ["detection", "learning", "classification", "intelligence"] as const;
export type Phase = (typeof PHASES)[number];

/** Tailwind classes of one visual tone. */
export interface Tone {
  /** Solid foreground colour (text, icons, chart strokes). */
  text: string;
  /** Soft background with matching foreground, for badges and pills. */
  soft: string;
  /** Solid background (dots, bars). */
  solid: string;
  /** Name of the CSS variable holding the colour (for charts). */
  cssVar: string;
}

// Written out in full so Tailwind's scanner sees every class name.
const DECISION_TONES: Record<Decision, Tone> = {
  allow: {
    text: "text-risk-allow",
    soft: "bg-risk-allow-soft text-risk-allow",
    solid: "bg-risk-allow",
    cssVar: "--risk-allow",
  },
  review: {
    text: "text-risk-review",
    soft: "bg-risk-review-soft text-risk-review",
    solid: "bg-risk-review",
    cssVar: "--risk-review",
  },
  alert: {
    text: "text-risk-alert",
    soft: "bg-risk-alert-soft text-risk-alert",
    solid: "bg-risk-alert",
    cssVar: "--risk-alert",
  },
  block: {
    text: "text-risk-block",
    soft: "bg-risk-block-soft text-risk-block",
    solid: "bg-risk-block",
    cssVar: "--risk-block",
  },
};

const PHASE_TONES: Record<Phase, Tone> = {
  detection: {
    text: "text-phase-detection",
    soft: "bg-phase-detection/10 text-phase-detection",
    solid: "bg-phase-detection",
    cssVar: "--phase-detection",
  },
  learning: {
    text: "text-phase-learning",
    soft: "bg-phase-learning/10 text-phase-learning",
    solid: "bg-phase-learning",
    cssVar: "--phase-learning",
  },
  classification: {
    text: "text-phase-classification",
    soft: "bg-phase-classification/10 text-phase-classification",
    solid: "bg-phase-classification",
    cssVar: "--phase-classification",
  },
  intelligence: {
    text: "text-phase-intelligence",
    soft: "bg-phase-intelligence/10 text-phase-intelligence",
    solid: "bg-phase-intelligence",
    cssVar: "--phase-intelligence",
  },
};

/** Tone for values the UI does not recognise (never guess a risk colour). */
export const NEUTRAL_TONE: Tone = {
  text: "text-muted-foreground",
  soft: "bg-muted text-muted-foreground",
  solid: "bg-muted-foreground",
  cssVar: "--muted-foreground",
};

/** Whether `value` is a known decision. */
export function isDecision(value: unknown): value is Decision {
  return typeof value === "string" && (DECISIONS as readonly string[]).includes(value);
}

/** Whether `value` is a known phase. */
export function isPhase(value: unknown): value is Phase {
  return typeof value === "string" && (PHASES as readonly string[]).includes(value);
}

/** Tone of a decision; unknown values get the neutral tone. */
export function decisionTone(decision: string | null | undefined): Tone {
  return isDecision(decision) ? DECISION_TONES[decision] : NEUTRAL_TONE;
}

/** Tone of a phase; unknown values get the neutral tone. */
export function phaseTone(phase: string | null | undefined): Tone {
  return isPhase(phase) ? PHASE_TONES[phase] : NEUTRAL_TONE;
}

/**
 * Score band boundaries used for colouring (not for decisions: the tenant's
 * thresholds decide; these only pick a colour for a raw 0–1 score).
 */
export const SCORE_BANDS = { review: 0.4, alert: 0.6, block: 0.8 } as const;

/** Decision-equivalent colour band of a 0–1 risk score. */
export function scoreBand(score: number): Decision {
  if (score >= SCORE_BANDS.block) return "block";
  if (score >= SCORE_BANDS.alert) return "alert";
  if (score >= SCORE_BANDS.review) return "review";
  return "allow";
}

/** Tone of a 0–1 risk score. */
export function scoreTone(score: number): Tone {
  return DECISION_TONES[scoreBand(score)];
}

/**
 * Resolve a token to a concrete colour string for libraries that need one
 * (Recharts, canvas). Reads the live CSS variable, so it follows the theme.
 *
 * @param cssVar - Variable name, e.g. `"--risk-block"` or `"--chart-1"`.
 * @param alpha - Optional opacity between 0 and 1.
 */
export function cssColor(cssVar: string, alpha = 1): string {
  if (typeof window === "undefined") return `hsl(var(${cssVar}) / ${alpha})`;
  const channels = getComputedStyle(document.documentElement).getPropertyValue(cssVar).trim();
  return channels ? `hsl(${channels} / ${alpha})` : `hsl(var(${cssVar}) / ${alpha})`;
}

/** CSS variables of the categorical chart series, in order. */
export const CHART_SERIES = [
  "--chart-1",
  "--chart-2",
  "--chart-3",
  "--chart-4",
  "--chart-5",
  "--chart-6",
] as const;
