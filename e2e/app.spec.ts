import { expect, test } from "@playwright/test";

test("home and collections provide the primary public journey", async ({
  page,
}) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Your chat. Their adventure." }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Sign in with Twitch" }),
  ).toBeVisible();
  await expect(page.getByText("Live game", { exact: true })).toHaveCount(0);
  await expect(page.getByText("SYNCED", { exact: true })).toHaveCount(0);
  await expect(page.getByText("A critical hit!", { exact: false })).toHaveCount(
    0,
  );
  await expect(
    page.getByText("Set the dimensions", { exact: true }),
  ).toHaveCount(0);

  await page.goto("/collections");
  await expect(
    page.getByRole("heading", { name: "Latest catches" }),
  ).toBeVisible();
  await expect(page.locator("body")).not.toHaveCSS("overflow-x", "scroll");

  const details = page.locator('button[aria-label^="View "]');
  if ((await details.count()) > 0) {
    await details.first().click();
    await expect(
      page.getByText("Pokédex profile and base statistics."),
    ).toBeVisible();
    await page.keyboard.press("Escape");
  }
});

test("protected transfer pages explain sign-in without redirecting", async ({
  page,
}) => {
  await page.goto("/gift");
  await expect(page).toHaveURL("/gift");
  await expect(
    page.getByRole("heading", { name: "Sign in to gift Pokémon" }),
  ).toBeVisible();

  await page.goto("/trade");
  await expect(page).toHaveURL("/trade");
  await expect(
    page.getByRole("heading", { name: "Sign in to trade Pokémon" }),
  ).toBeVisible();
});

test("collections exposes totals and canonical numbered pagination", async ({
  page,
}) => {
  await page.goto("/collections?page=1&perPage=24");
  await expect(
    page.getByRole("heading", { name: "Latest catches" }),
  ).toBeVisible();
  await expect(page.getByText(/total catches/)).toBeVisible();
  await expect(page.getByText("Next catches", { exact: true })).toHaveCount(0);
});

test("OBS overlay fills the browser source and keeps compact compatibility", async ({
  page,
}) => {
  await page.setViewportSize({ width: 256, height: 76 });
  await page.goto("/overlays/f69621a5-371b-4515-8889-fcb28ae9d031");
  const overlay = page.getByTestId("overlay");
  await expect(overlay).toBeVisible();
  await expect(overlay).toHaveCSS("width", "256px");
  await expect(overlay).toHaveCSS("height", "76px");
  await expect(page.locator("body")).toHaveCSS("background-image", "none");
  await expect(page.locator("body")).not.toHaveCSS("overflow-x", "scroll");
});

test("OBS overlay adapts between wide and portrait browser sources", async ({
  page,
}) => {
  await page.setViewportSize({ width: 640, height: 180 });
  await page.goto(
    "/overlays/f69621a5-371b-4515-8889-fcb28ae9d031?size=large&debug=1",
  );
  const overlay = page.getByTestId("overlay");
  await expect(overlay).toHaveAttribute("data-size", "large");
  await expect(page.locator(".overlay-debug")).toBeVisible();

  const card = page.getByTestId("overlay-card");
  if ((await card.count()) > 0) {
    await expect(card).toHaveCSS("flex-direction", "row");
    await page.setViewportSize({ width: 180, height: 320 });
    await expect(card).toHaveCSS("flex-direction", "column");
  }
});

test("overlay snapshot endpoint is narrow and never cached", async ({
  request,
}) => {
  const response = await request.get(
    "/api/overlays/f69621a5-371b-4515-8889-fcb28ae9d031/snapshot",
  );
  expect(response.status()).toBe(200);
  expect(response.headers()["cache-control"]).toBe("no-store");
  const body = await response.json();
  expect(Object.keys(body).sort()).toEqual([
    "health",
    "lastCatchAt",
    "lastCatchPlayer",
    "lastCatchPoke",
    "lastEventAt",
    "lastEventDamage",
    "lastEventKind",
    "lastEventPlayer",
    "poke",
    "updatedAt",
  ]);
});

test("unknown overlays keep a focused 404 experience", async ({ page }) => {
  const response = await page.goto(
    "/overlays/00000000-0000-0000-0000-000000000000",
  );

  expect(response?.status()).toBe(404);
  await expect(
    page.getByRole("heading", { name: "Overlay not found" }),
  ).toBeVisible();
  await expect(page.getByText("OBS overlay unavailable")).toBeVisible();
});
