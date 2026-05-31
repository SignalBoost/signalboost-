import { expect, test } from "@playwright/test";

test.describe("Reviews module", () => {
  test("supports multilingual submission and moderation workflow", async ({ page }) => {
    await page.goto("/reviews");
    await expect(page.getByLabel("Wireframe preview for the Reviews module")).toBeVisible();
    await page.getByRole("button", { name: "Español" }).click();
    await expect(page.getByText("¿Cómo fue tu visita?")).toBeVisible();
    await page.getByRole("radio", { name: "★" }).nth(1).click();
    await page.getByLabel("Written review").fill("Malo y lento");
    await page.getByRole("button", { name: "Submit review" }).click();
    await expect(page.getByText(/NEGATIVE|PRIVATE/i)).toBeVisible();
  });

  test("passes responsive cockpit checks", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/reviews");
    await expect(page.getByText("Full review lifecycle cockpit")).toBeVisible();
    await expect(page.getByText("Multi-location reputation dashboard")).toBeVisible();
  });

  test("validates API sync surface", async ({ request }) => {
    const response = await request.get("/api/reviews/sync");
    expect(response.ok()).toBeTruthy();
    const payload = await response.json();
    expect(payload.connectors.map((item: { platform: string }) => item.platform)).toContain("google");
    expect(payload.connectors.map((item: { platform: string }) => item.platform)).toContain("yelp");
  });
});
