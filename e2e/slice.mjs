// Plays Chapter One in the browser the way a new player would: meet Milo,
// feed him on the first night, explore Whisperwood, learn acqua at the
// stream, feed a hungry Pebblit that uses Milo's word, win the first battle
// by listening (ACQUA for "Fuoco!", TERRA for "All'attacco!"), hear Milo
// retell it, and catch Pip misreading Bluster. Then checks the journal and
// that the save survives a reload. Then plays Chapter Two (chapter2.mjs).
import { playChapterTwo } from './chapter2.mjs';
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

  // The first night: Milo is starving. The stick first (he says no), then the sunberries.
  await snap(page, 'camp');
  await button(page, 'Milo wants to tell you something').click();
  await until(page, () => visible(button(page, 'Give Sunberries')), 'the first meal');
  await snap(page, 'fame');
  await button(page, 'Give Good Stick').click();
  await until(page, () => visible(button(page, 'Give Sunberries')), 'the first meal again');
  await button(page, 'Give Sunberries').click();
  await until(page, async () => (await bodyText(page)).includes('Mi ricordo'), "Milo's memory");
  await snap(page, 'first-night');
  await until(page, () => visible(button(page, 'Back to camp')), 'the end of the first night');
  await button(page, 'Back to camp').click();
  await page.waitForTimeout(600);

  // Camp: tap Milo, then head for Whisperwood.
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

  // A wild Pebblit says Milo's word for hunger.
  await until(page, async () => (await bodyText(page)).includes('Ho fame'), 'the Pebblit saying "Ho fame..."');
  await snap(page, 'ho-fame');
  await until(page, () => visible(button(page, 'Give Sunberries')), 'the hungry Pebblit');
  await button(page, 'Give Sunberries').click();
  await until(page, () => visible(button(page, 'Keep exploring')), 'end of the Pebblit');
  await button(page, 'Keep exploring').click();

  // The hot path: Milo asks for acqua. The stick first (he says no), then the flask.
  await until(page, () => visible(button(page, 'Give Water Flask')), 'the give tray');
  await snap(page, 'thirsty');
  await button(page, 'Give Good Stick').click();
  await until(page, () => visible(button(page, 'Give Water Flask')), 'the give tray again');
  await button(page, 'Give Water Flask').click();
  await until(page, () => visible(button(page, 'Keep exploring')), 'end of the hot path');
  await button(page, 'Keep exploring').click();

  // The Emberhog announces each move. Listening pays: ACQUA when it shouts "Fuoco!",
  // TERRA when it shouts "All'attacco!" (its pattern opens fire, charge, fire).
  await until(page, () => visible(button(page, 'ACQUA')), 'the battle');
  for (const word of ['ACQUA', 'FUOCO', 'TERRA', 'VENTO']) check(await visible(button(page, word)), `missing the ${word} tile`);
  await page.waitForFunction(() => /your call/i.test(document.body.innerText), null, { timeout: 30_000 });
  await snap(page, 'battle');
  for (const [round, word] of ['ACQUA', 'TERRA', 'ACQUA'].entries()) {
    await button(page, word).click({ timeout: 30_000 });
    await page.waitForTimeout(1500);
    if (round === 1) await snap(page, 'battle-terra-wall');
    await page.waitForFunction(() => /your call|backs off/i.test(document.body.innerText), null, { timeout: 30_000 });
  }
  check((await bodyText(page)).includes('backs off'), 'listening should beat the Emberhog in three rounds');
  check((await bodyText(page)).includes('40 / 40'), 'nothing should have landed on Milo');
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

  // The Lodge: Pip says Bluster is restless. Bluster says "Ho fame."
  await button(page, "Go to Translators' Lodge").click();
  await page.waitForTimeout(500);
  await button(page, 'Visit Maren').click();
  await until(page, () => visible(button(page, 'Offer Bluster a sunberry')), 'Pip and Bluster');
  await snap(page, 'pip-bluster');
  await button(page, 'Offer Bluster a sunberry').click();
  await until(page, async () => (await bodyText(page)).includes('End of Chapter One'), 'the end of chapter one');
  await snap(page, 'chapter-one');
  await until(page, () => visible(button(page, 'Back to camp')), 'the end panel');
  await button(page, 'Back to camp').click();
  await page.waitForTimeout(600);

  // The journal kept the strange line.
  await page.getByRole('tab', { name: 'Journal' }).click();
  await page.waitForTimeout(500);
  await snap(page, 'journal');
  await page.getByRole('tab', { name: 'Field notes' }).click();
  await page.waitForTimeout(300);
  check((await bodyText(page)).includes('A wild Pebblit said “fame”'), 'field notes should record the Pebblit using Milo\'s word');
  await snap(page, 'field-notes');
  await page.getByRole('tab', { name: 'Strange things' }).click();
  await page.waitForTimeout(300);
  check((await bodyText(page)).includes('Sei tu'), 'the journal should keep "Sei tu... Ti abbiamo trovato."');
  check((await bodyText(page)).includes('Mi ricordo'), "the journal should keep Milo's memory");
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
  console.log('ok       chapter one played start to finish');

  await playChapterTwo(page);
  check(errors.length === 0, `page errors:\n${errors.join('\n')}`);
  console.log('ok       chapter two played start to finish');
} finally {
  await browser.close();
}
