import { chromium } from "playwright";

const browser = await chromium.launch({ channel: "chrome" });
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));

await page.goto("http://localhost:5180/#/");
await page.waitForTimeout(1200);
await page.screenshot({ path: "/tmp/oct-shots/rec-collapsed.png" });

await page.getByText("AI Overview").click();
await page.waitForTimeout(400);
await page.screenshot({ path: "/tmp/oct-shots/rec-expanded.png" });

await browser.close();
if (errors.length) {
  console.log("ERRORS:\n" + errors.join("\n"));
  process.exit(1);
}
console.log("OK");
