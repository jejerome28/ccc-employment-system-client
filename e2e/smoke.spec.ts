import { expect, test } from "@playwright/test";

// Needs the backend running with `php artisan migrate:fresh --seed` (seed has no attendance for today).
test("guest is sent to login, admin can sign in, time someone in, and sign out", async ({ page }) => {
  await page.goto("/dashboard");
  await expect(page).toHaveURL(/\/login$/);

  await page.getByLabel("Email").fill("admin@example.com");
  await page.getByLabel("Password").fill("wrong-password");
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page.getByRole("alert")).toHaveText("Invalid credentials.");

  await page.getByLabel("Password").fill("password");
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
  await expect(page.getByRole("heading", { name: "Today" })).toBeVisible();

  const timeInButtons = page.getByRole("button", { name: "Time in" });
  const before = await timeInButtons.count();
  await timeInButtons.first().click();
  await expect(timeInButtons).toHaveCount(before - 1);
  await expect(page.getByRole("button", { name: "Time out" }).first()).toBeVisible();

  const cookies = await page.context().cookies();
  expect(cookies.find((c) => c.name === "ccc_token")?.httpOnly).toBe(true);

  await page.getByRole("button", { name: "Sign out" }).click();
  await expect(page).toHaveURL(/\/login$/);
});
