import { chromium } from 'playwright';

export const URL = process.env.E2E_URL ?? 'http://localhost:8792/';
const SHOTS = process.env.SHOTS;

export async function launch() {
  const browser = await chromium.launch(process.env.PW_CHROMIUM ? { executablePath: process.env.PW_CHROMIUM } : {});
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  return { browser, page, errors };
}

export const button = (page, name) => page.getByRole('button', { name, exact: true });
export const bodyText = (page) => page.locator('body').innerText();

let shot = 0;
/** Saves a numbered screenshot when SHOTS is set (npm run screens). */
export async function snap(page, name) {
  if (!SHOTS) return;
  await page.waitForTimeout(400);
  await page.screenshot({ path: `${SHOTS}/${String(++shot).padStart(2, '0')}-${name}.png` });
}

export async function visible(locator) {
  return (await locator.count()) > 0 && (await locator.first().isVisible());
}

/**
 * Taps "Continue" through narration, speech and captions until `ready()` is
 * true (a choice, a tap prompt, an item tray, a battle, the end panel).
 */
export async function until(page, ready, what, limit = 60) {
  for (let i = 0; i < limit; i++) {
    if (await ready()) return;
    const next = button(page, 'Continue');
    if (await visible(next)) await next.first().click();
    await page.waitForTimeout(250);
  }
  throw new Error(`never reached: ${what}\n--- screen ---\n${(await bodyText(page)).slice(0, 600)}`);
}

export function check(cond, msg) {
  if (!cond) throw new Error(msg);
}
