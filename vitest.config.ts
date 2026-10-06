import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

/**
 * Unit tests for browser-side logic (HTTP client, session, navigation).
 * jsdom provides `window`, `localStorage` and `BroadcastChannel`.
 */
export default defineConfig({
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
  test: {
    environment: "jsdom",
    // localStorage only exists for documents with a real origin.
    environmentOptions: { jsdom: { url: "https://app.yarda.test/" } },
    setupFiles: ["src/test/setup.ts"],
    include: ["src/**/*.test.ts"],
    restoreMocks: true,
  },
});
