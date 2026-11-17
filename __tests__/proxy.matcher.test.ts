/** @jest-environment node */
import { unstable_doesMiddlewareMatch } from "next/experimental/testing/server";
import { config } from "@/proxy";

const matches = (url: string) => unstable_doesMiddlewareMatch({ config, url });

test.each(["/brand/ccc-logo.png", "/brand/campus.jpg", "/icon.png"])("public asset %s skips the session check", (url) => {
  expect(matches(url)).toBe(false);
});

test("app pages still go through the session check", () => {
  expect(matches("/dashboard")).toBe(true);
});
