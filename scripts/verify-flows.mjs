// Walks the seven prototype flows and captures screenshots + console errors.
import { chromium } from "playwright";

const BASE = "http://localhost:5180";
const OUT = "/tmp/oct-shots";
const errors = [];

const browser = await chromium.launch({ channel: "chrome" });
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
page.on("pageerror", (e) => errors.push(`pageerror: ${e.message}`));
page.on("console", (m) => {
  if (m.type() === "error") errors.push(`console: ${m.text()}`);
});

const shot = (name, fullPage = false) => page.screenshot({ path: `${OUT}/${name}.png`, fullPage });

await page.goto(BASE + "/#/");
await page.waitForTimeout(1200);

// Flow 1: Home -> Overdue -> Article Detail -> Back
await page.getByText("Investigate overdue articles").click();
await page.waitForTimeout(400);
await shot("flow1-overdue-expanded");
await page.locator("button", { hasText: /^TNQ-45/ }).first().click();
await page.waitForTimeout(600);
await shot("flow1-article-detail", true);
await page.getByText("Back to planning workspace").click();
await page.waitForTimeout(500);

// Flow 2: Due Today -> Workload Breakdown -> Article Detail
await page.getByText("View workload breakdown").click();
await page.waitForTimeout(400);
await shot("flow2-duetoday-breakdown");
await page.goBack().catch(() => {});
await page.goto(BASE + "/#/");
await page.waitForTimeout(600);

// Flow 3: Capacity grid -> Employee Detail
const empCard = page.locator("main section >> button", { hasText: /articles/ }).first();
await empCard.hover();
await page.waitForTimeout(500);
await shot("flow3-employee-hover");
await empCard.click();
await page.waitForTimeout(600);
await shot("flow3-employee-detail", true);
await page.goto(BASE + "/#/");
await page.waitForTimeout(600);

// Flow 4: Filter by location (click Chennai card)
await page.getByText("Click to focus workspace on Chennai").click();
await page.waitForTimeout(500);
await shot("flow4-location-filter", true);
await page.getByText("Filtering workspace by Chennai").click();
await page.waitForTimeout(300);

// Flow 5: Group capacity grid by process
await page.locator("select").filter({ hasText: "Location" }).last().selectOption("process");
await page.waitForTimeout(400);
await shot("flow5-group-by-process", true);

// Flow 6: AI recommendation -> recommended action -> apply
await page.getByText("Review reallocation plan").click();
await page.waitForTimeout(400);
await shot("flow6-recommendation-modal");
await page.getByText("Apply to today's plan").click();
await page.waitForTimeout(300);
await shot("flow6-recommendation-applied");
await page.keyboard.press("Escape");
await page.locator('button[aria-label="Close"]').click();
await page.waitForTimeout(300);

// Flow 7: Upcoming forecast tabs + grouping
await page.getByText("Next 3 Days").click();
await page.waitForTimeout(300);
await page.getByText("Explore forecast").click();
await page.waitForTimeout(400);
await shot("flow7-upcoming-forecast", true);

// Full home for final look
await page.goto(BASE + "/#/");
await page.waitForTimeout(800);
await shot("final-home", true);

await browser.close();
if (errors.length) {
  console.log("ERRORS:\n" + errors.join("\n"));
  process.exit(1);
}
console.log("All flows OK, no console errors.");
