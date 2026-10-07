import { describe, expect, it } from "vitest";
import { matchesConfirmation } from "@/components/ui/confirm-dialog";

describe("matchesConfirmation", () => {
  it("accepts the exact phrase, ignoring surrounding spaces", () => {
    expect(matchesConfirmation("  a1b2c3  ", "a1b2c3")).toBe(true);
  });

  it("rejects partial, differently cased or empty input", () => {
    expect(matchesConfirmation("a1b2", "a1b2c3")).toBe(false);
    expect(matchesConfirmation("A1B2C3", "a1b2c3")).toBe(false);
    expect(matchesConfirmation("", "")).toBe(false);
  });
});
