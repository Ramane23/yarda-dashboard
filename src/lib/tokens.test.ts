import { describe, expect, it } from "vitest";
import {
  DECISIONS,
  NEUTRAL_TONE,
  PHASES,
  decisionTone,
  phaseTone,
  scoreBand,
  scoreTone,
} from "@/lib/tokens";

describe("decision and phase tones", () => {
  it("gives every decision and phase its own semantic colour", () => {
    const decisionClasses = DECISIONS.map((d) => decisionTone(d).text);
    const phaseClasses = PHASES.map((p) => phaseTone(p).text);

    expect(new Set(decisionClasses).size).toBe(DECISIONS.length);
    expect(new Set(phaseClasses).size).toBe(PHASES.length);
    expect(decisionTone("block").soft).toBe("bg-risk-block-soft text-risk-block");
  });

  it("never guesses a colour for unknown values", () => {
    expect(decisionTone("approve")).toBe(NEUTRAL_TONE);
    expect(decisionTone(null)).toBe(NEUTRAL_TONE);
    expect(phaseTone("unknown")).toBe(NEUTRAL_TONE);
  });
});

describe("score bands", () => {
  it.each([
    [0, "allow"],
    [0.39, "allow"],
    [0.4, "review"],
    [0.6, "alert"],
    [0.8, "block"],
    [1, "block"],
  ])("colours a score of %s as %s", (score, band) => {
    expect(scoreBand(score)).toBe(band);
    expect(scoreTone(score)).toBe(decisionTone(band));
  });
});
