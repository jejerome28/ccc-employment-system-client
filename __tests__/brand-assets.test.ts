import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = join(__dirname, "..");

test.each(["ccc-logo.png", "hrdu-seal.png", "building-outline.jpg", "campus.jpg"])("public/brand/%s exists", (f) => {
  expect(existsSync(join(root, "public/brand", f))).toBe(true);
});

test("favicon is the CCC shield", () => {
  expect(existsSync(join(root, "src/app/icon.png"))).toBe(true);
  expect(existsSync(join(root, "src/app/favicon.ico"))).toBe(false);
});

test("theme defines CCC tokens", () => {
  const css = readFileSync(join(root, "src/app/globals.css"), "utf8");
  for (const t of ["--color-navy: #0a1f5c", "--color-royal: #1435b0", "--color-gold: #f2b705", "--color-canvas: #f4f6fb", "--font-heading", "--font-wordmark"]) {
    expect(css).toContain(t);
  }
});
