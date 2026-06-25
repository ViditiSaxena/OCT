import { chromium } from "playwright";

const browser = await chromium.launch({ channel: "chrome" });
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));

await page.goto("http://localhost:5180/#/");
await page.waitForTimeout(1200);

const row = page.locator("button", { hasText: "Meena Pillai" }).first();
await row.scrollIntoViewIfNeeded();
await page.mouse.wheel(0, -120);
await page.waitForTimeout(300);
await page.screenshot({ path: "/tmp/oct-shots/table-default.png" });

await row.hover();
await page.waitForTimeout(500);
await page.screenshot({ path: "/tmp/oct-shots/table-hover.png" });

await browser.close();
if (errors.length) {
  console.log("ERRORS:\n" + errors.join("\n"));
  process.exit(1);
}
console.log("OK");
