import { describe, expect, it } from "vitest";
import { DEFAULT_AFTER_LOGIN, readSetPasswordLink, safeNextPath } from "@/lib/navigation";

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

describe("readSetPasswordLink", () => {
  it("reads the token and mode from the fragment", () => {
    expect(readSetPasswordLink("#token=abc&mode=reset", "")).toEqual({
      token: "abc",
      mode: "reset",
    });
    expect(readSetPasswordLink("#token=abc", "")).toEqual({ token: "abc", mode: "invite" });
  });

  it("still accepts links that used the query string", () => {
    expect(readSetPasswordLink("", "?token=old&mode=reset")).toEqual({
      token: "old",
      mode: "reset",
    });
  });

  it("prefers the fragment when both are present", () => {
    expect(readSetPasswordLink("#token=new", "?token=old")).toEqual({
      token: "new",
      mode: "invite",
    });
  });

  it("falls back to the forgot-password form without a token", () => {
    expect(readSetPasswordLink("", "")).toEqual({ token: null, mode: "forgot" });
    expect(readSetPasswordLink("#token=", "")).toEqual({ token: null, mode: "forgot" });
  });
});
