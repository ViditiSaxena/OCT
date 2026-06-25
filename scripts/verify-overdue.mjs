import { chromium } from "playwright";

const browser = await chromium.launch({ channel: "chrome" });
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));

await page.goto("http://localhost:5180/#/");
await page.waitForTimeout(1200);
await page.screenshot({ path: "/tmp/oct-shots/overdue-default.png" });

await page.getByText("Click to focus workspace on Coimbatore").click();
await page.waitForTimeout(500);
await page.screenshot({ path: "/tmp/oct-shots/overdue-coimbatore.png" });

await page.getByText("Filtering workspace by Coimbatore").click();
await page.waitForTimeout(300);
await page.getByText("Click to focus workspace on Chennai").click();
await page.waitForTimeout(500);
await page.screenshot({ path: "/tmp/oct-shots/overdue-chennai.png" });

await browser.close();
if (errors.length) {
  console.log("ERRORS:\n" + errors.join("\n"));
  process.exit(1);
}
console.log("OK");
