/**
 * Test environment setup.
 *
 * Node 22+ ships an experimental global `localStorage` that is undefined
 * unless `--localstorage-file` is passed, and it shadows jsdom's storage on
 * the shared global object. Point the globals at the storage of the jsdom
 * instance Vitest created, so code under test (zustand's persist
 * middleware) sees a working Web Storage, as in a browser.
 */
const { jsdom } = globalThis as unknown as { jsdom: { window: Window } };

for (const name of ["localStorage", "sessionStorage"] as const) {
  Object.defineProperty(globalThis, name, {
    value: jsdom.window[name],
    configurable: true,
    writable: true,
  });
}
