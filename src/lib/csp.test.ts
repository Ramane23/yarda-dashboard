import { describe, expect, it } from "vitest";
import { buildCsp, generateNonce } from "@/lib/csp";

describe("buildCsp", () => {
  it("only lets nonce-bearing scripts run in production", () => {
    const policy = buildCsp("abc", false);

    expect(policy).toContain("script-src 'self' 'nonce-abc' 'strict-dynamic'");
    expect(policy).not.toContain("unsafe-eval");
    expect(policy).toContain("frame-ancestors 'none'");
    expect(policy).toContain("object-src 'none'");
    expect(policy).toContain("upgrade-insecure-requests");
  });

  it("allows eval only in development", () => {
    expect(buildCsp("abc", true)).toContain("'unsafe-eval'");
    expect(buildCsp("abc", true)).not.toContain("upgrade-insecure-requests");
  });
});

describe("generateNonce", () => {
  it("returns distinct 128-bit values", () => {
    const first = generateNonce();

    expect(atob(first)).toHaveLength(16);
    expect(generateNonce()).not.toBe(first);
  });
});
