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

  const manilaNow = new Intl.DateTimeFormat("en-US", { timeZone: "Asia/Manila", hour: "numeric", hour12: true })
    .formatToParts(new Date())
    .find((p) => p.type === "hour")!.value;
  await expect(page.getByRole("cell", { name: new RegExp(`^${manilaNow}:\\d{2} (AM|PM)$`) }).first()).toBeVisible();

  const cookies = await page.context().cookies();
  expect(cookies.find((c) => c.name === "ccc_token")?.httpOnly).toBe(true);

  await page.getByRole("button", { name: "Sign out" }).click();
  await expect(page).toHaveURL(/\/login$/);
});

test("admin uploads the biometric report and downloads the xlsx", async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel("Email").fill("admin@example.com");
  await page.getByLabel("Password").fill("password");
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).toHaveURL(/\/dashboard$/);

  await page.getByRole("link", { name: "Import" }).click();
  await page.getByLabel("Attendance report (CSV)").setInputFiles("../ccc-employment-system-backend/tests/Fixtures/biometric-report.csv");
  await page.getByRole("button", { name: "Import", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("0 created · 0 updated");
  await expect(page.getByRole("heading", { name: "Not imported — Person ID not found" })).toBeVisible();

  await page.getByRole("link", { name: "Time records" }).click();
  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: "Download report" }).click();
  expect((await download).suggestedFilename()).toMatch(/^attendance_\d{4}-\d{2}-01_\d{4}-\d{2}-\d{2}\.xlsx$/);
});
