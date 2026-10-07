import { describe, expect, it } from "vitest";
import {
  EMPTY,
  formatCompact,
  formatDate,
  formatDateTime,
  formatDuration,
  formatMoney,
  formatNumber,
  formatPercent,
  formatRelative,
  formatScore,
  parseTimestamp,
} from "@/lib/format";

/** Intl uses narrow no-break spaces in French; normalise for readable assertions. */
const plain = (text: string) => text.replace(/[  ]/g, " ");

describe("numbers", () => {
  it("groups digits per locale", () => {
    expect(plain(formatNumber(1234567, "fr"))).toBe("1 234 567");
    expect(formatNumber(1234567, "en")).toBe("1,234,567");
  });

  it("uses the locale's decimal separator", () => {
    expect(plain(formatNumber(12.5, "fr", 1))).toBe("12,5");
    expect(formatNumber(12.5, "en", 1)).toBe("12.5");
  });

  it("renders missing or invalid values as an em dash", () => {
    expect(formatNumber(null, "en")).toBe(EMPTY);
    expect(formatNumber(Number.NaN, "fr")).toBe(EMPTY);
    expect(formatPercent(undefined, "en")).toBe(EMPTY);
  });

  it("compacts large values", () => {
    expect(formatCompact(12_300, "en")).toBe("12.3k");
    expect(plain(formatCompact(1_250_000, "fr"))).toBe("1,3 M");
  });

  it("formats percentages, scores and durations", () => {
    expect(formatPercent(0.125, "en")).toBe("12.5%");
    expect(plain(formatPercent(0.125, "fr"))).toBe("12,5 %");
    expect(formatScore(0.874, "en")).toBe("87");
    expect(formatDuration(850, "en")).toBe("850 ms");
    expect(plain(formatDuration(1200, "fr"))).toBe("1,2 s");
  });
});

describe("money", () => {
  it("shows CFA francs without decimals, as each audience writes them", () => {
    expect(plain(formatMoney(1250000, "XOF", "fr"))).toBe("1 250 000 F CFA");
    expect(plain(formatMoney(1250000, "XOF", "en"))).toBe("XOF 1,250,000");
  });

  it("keeps cents for decimal currencies", () => {
    expect(formatMoney(1250, "EUR", "en")).toBe("€1,250.00");
  });

  it("falls back gracefully on unknown currency codes", () => {
    expect(formatMoney(10, "NOPE1", "en")).toBe("10 NOPE1");
  });
});

describe("dates", () => {
  it("treats naive API timestamps as UTC", () => {
    expect(parseTimestamp("2026-10-07T12:00:00")?.toISOString()).toBe("2026-10-07T12:00:00.000Z");
    expect(parseTimestamp("not a date")).toBeNull();
  });

  it("formats in the requested time zone and locale", () => {
    const value = "2026-10-07T23:30:00Z";
    expect(plain(formatDate(value, "fr", { timeZone: "Africa/Niamey" }))).toBe("8 oct. 2026");
    expect(formatDateTime(value, "en", { timeZone: "UTC" })).toBe("7 Oct 2026, 23:30");
  });

  it("formats relative times", () => {
    const now = new Date("2026-10-07T12:00:00Z");
    expect(formatRelative("2026-10-07T09:00:00Z", "en", now)).toBe("3 hours ago");
    expect(formatRelative("2026-10-06T12:00:00Z", "fr", now)).toBe("hier");
  });
});
