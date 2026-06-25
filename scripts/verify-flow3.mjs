import { chromium } from "playwright";

const BASE = "http://localhost:5180";
const OUT = "/tmp/oct-shots";
const errors = [];

const browser = await chromium.launch({ channel: "chrome" });
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
page.on("pageerror", (e) => errors.push(`pageerror: ${e.message}`));

await page.goto(BASE + "/#/");
await page.waitForTimeout(1200);

// Re-check overdue expanded table after layout fix
await page.getByText("Investigate overdue articles").click();
await page.waitForTimeout(400);
await page.screenshot({ path: `${OUT}/recheck-overdue-table.png` });

// Flow 3: hover then open an employee card by name
const card = page.locator("button", { hasText: "Ravi Gupta" }).first();
await card.scrollIntoViewIfNeeded();
await card.hover();
await page.waitForTimeout(600);
await page.screenshot({ path: `${OUT}/recheck-employee-hover.png` });
await card.click();
await page.waitForTimeout(700);
await page.screenshot({ path: `${OUT}/recheck-employee-detail.png`, fullPage: true });

await browser.close();
if (errors.length) {
  console.log("ERRORS:\n" + errors.join("\n"));
  process.exit(1);
}
console.log("Flow 3 OK.");
