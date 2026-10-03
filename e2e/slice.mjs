// Plays the vertical slice (bible §75) in the browser the way a new player
// would: meet Milo, explore Whisperwood, learn acqua at the stream, win the
// first battle with ACQUA, hear Milo retell it, report to Maren. Then checks
// the journal and that the save survives a reload.
import { bodyText, button, check, launch, snap, until, URL, visible } from './helpers.mjs';

const { browser, page, errors } = await launch();
try {
  await page.goto(URL);
  await page.waitForTimeout(1500);

  // The Lodge: Maren, the basket, "Ciao!"
  await snap(page, 'lodge-intro');
  await until(page, () => visible(button(page, 'Say “Ciao!”')), 'the first choice');
  check((await page.getByTestId('creature-line').count()) === 0 || (await bodyText(page)).includes('Ciao!'), 'Milo should have said Ciao!');
  await snap(page, 'ciao-choice');
  await button(page, 'Say “Ciao!”').click();
  await until(page, () => visible(button(page, 'Go to camp')), 'the end of the intro');
  await button(page, 'Go to camp').click();
  await page.waitForTimeout(800);

  // Camp: tap Milo, then head for Whisperwood.
  await snap(page, 'camp');
  await button(page, 'Milo').click();
  await page.waitForTimeout(600);
  await snap(page, 'camp-milo-talks');
  await button(page, 'Go to Whisperwood').click();
  await page.waitForTimeout(600);
  await snap(page, 'whisperwood');
  await button(page, 'Explore').click();

  // Guarda: tap where Milo points.
  await until(page, async () => (await bodyText(page)).includes('Tap something in the scene'), 'the guarda tap');
  await snap(page, 'guarda');
  await button(page, 'bush').click();
  await until(page, () => visible(button(page, 'Follow Milo')), 'vieni');
  await snap(page, 'vieni');
  await button(page, 'Follow Milo').click();
  await until(page, () => visible(button(page, 'Keep exploring')), 'end of first steps');
  await button(page, 'Keep exploring').click();

  // The stream: acqua.
  await until(page, () => visible(button(page, 'Splash Milo')), 'the stream choice');
  await snap(page, 'stream-acqua');
  await button(page, 'Splash Milo').click();
  await until(page, () => visible(button(page, 'Keep exploring')), 'end of the stream');
  await button(page, 'Keep exploring').click();

  // The hot path: Milo asks for acqua. The stick first (he says no), then the flask.
  await until(page, () => visible(button(page, 'Give Water Flask')), 'the give tray');
  await snap(page, 'thirsty');
  await button(page, 'Give Good Stick').click();
  await until(page, () => visible(button(page, 'Give Water Flask')), 'the give tray again');
  await button(page, 'Give Water Flask').click();
  await until(page, () => visible(button(page, 'Keep exploring')), 'end of the hot path');
  await button(page, 'Keep exploring').click();

  // The Emberhog: four tiles; ACQUA wins.
  await until(page, () => visible(button(page, 'ACQUA')), 'the battle');
  for (const word of ['ACQUA', 'FUOCO', 'TERRA', 'VENTO']) check(await visible(button(page, word)), `missing the ${word} tile`);
  await page.waitForTimeout(6000);
  await snap(page, 'battle');
  for (let round = 0; round < 8 && !(await visible(button(page, 'Continue'))); round++) {
    await button(page, 'ACQUA').click({ timeout: 30_000 });
    await page.waitForTimeout(1500);
    if (round === 0) await snap(page, 'battle-acqua');
    await page.waitForFunction(() => /your call|backs off/i.test(document.body.innerText), null, { timeout: 30_000 });
  }
  check((await bodyText(page)).includes('backs off'), 'ACQUA should beat the Emberhog');
  await snap(page, 'victory');
  await button(page, 'Continue').click();
  await until(page, () => visible(button(page, 'Back to camp')), 'after the battle');
  await button(page, 'Back to camp').click();
  await page.waitForTimeout(800);

  // Milo retells it at camp.
  await button(page, 'Milo wants to tell you something').click();
  await until(page, () => visible(button(page, 'Laugh')), 'the retelling');
  await snap(page, 'retell');
  await button(page, 'Laugh').click();
  await until(page, () => visible(button(page, 'Back to camp')), 'end of the retelling');
  await button(page, 'Back to camp').click();
  await page.waitForTimeout(600);

  // The Lodge: Maren, Pip and Bluster. You understand Bluster better than Pip does.
  await button(page, "Go to Translators' Lodge").click();
  await page.waitForTimeout(500);
  await button(page, 'Visit Maren').click();
  await until(page, () => visible(button(page, '“He wants water.”')), 'Pip and Bluster');
  await snap(page, 'pip-bluster');
  await button(page, '“He wants water.”').click();
  await until(page, async () => (await bodyText(page)).includes('End of Chapter One'), 'the end of chapter one');
  await snap(page, 'chapter-one');
  await until(page, () => visible(button(page, 'Back to camp')), 'the end panel');
  await button(page, 'Back to camp').click();
  await page.waitForTimeout(600);

  // The journal kept the strange line.
  await page.getByRole('tab', { name: 'Journal' }).click();
  await page.waitForTimeout(500);
  await snap(page, 'journal');
  await page.getByRole('tab', { name: 'Strange things' }).click();
  await page.waitForTimeout(300);
  check((await bodyText(page)).includes('Sei tu'), 'the journal should keep "Sei tu... Ti abbiamo trovato."');
  await snap(page, 'journal-strange');
  await page.getByRole('tab', { name: 'Lexlings' }).click();
  await page.waitForTimeout(300);
  await snap(page, 'bestiary');
  await page.getByRole('tab', { name: 'Milo' }).click();
  await page.waitForTimeout(500);
  await snap(page, 'milo');
  await page.getByRole('tab', { name: 'Map' }).click();
  await page.waitForTimeout(500);
  await snap(page, 'map');

  // Progress survives a reload: no intro again, Milo remembers.
  await page.reload();
  await page.waitForTimeout(1500);
  check(!(await bodyText(page)).includes('smells of old paper'), 'reload should not replay the intro');
  await page.getByRole('tab', { name: 'Milo' }).click();
  await page.waitForTimeout(400);
  check((await bodyText(page)).includes('Acqua'), 'Things Milo says should survive a reload');

  check(errors.length === 0, `page errors:\n${errors.join('\n')}`);
  console.log('ok       vertical slice played start to finish');
} finally {
  await browser.close();
}
