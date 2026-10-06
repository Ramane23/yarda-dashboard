import { describe, expect, it } from "vitest";
import { DEFAULT_AFTER_LOGIN, safeNextPath } from "@/lib/navigation";

const ORIGIN = "https://app.yarda.ai";

describe("safeNextPath", () => {
  it.each([
    ["/dashboard/review", "/dashboard/review"],
    ["/dashboard?period=7d#top", "/dashboard?period=7d#top"],
  ])("keeps same-origin path %s", (raw, expected) => {
    expect(safeNextPath(raw, ORIGIN)).toBe(expected);
  });

  it.each([
    null,
    "",
    "dashboard",
    "https://evil.example/login",
    "//evil.example/login",
    "/\\evil.example/login",
    "/\\/evil.example",
    "javascript:alert(1)",
  ])("rejects %s", (raw) => {
    expect(safeNextPath(raw, ORIGIN)).toBe(DEFAULT_AFTER_LOGIN);
  });
});
