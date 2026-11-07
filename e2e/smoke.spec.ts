import { expect, test } from "@playwright/test";

test("guest is sent to login, admin can sign in without clock buttons, and sign out", async ({ page }) => {
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

  await expect(page.getByRole("button", { name: "Time in" })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Time out" })).toHaveCount(0);

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
