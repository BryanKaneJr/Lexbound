// Plays Chapter Two in the browser, straight on from Chapter One: Milo's
// pinecone game, a spar with Bluster where a composed command ("Difendi con
// la terra!") stops a gale, the Old Hollow ("Aspetta!", a Flickerwing that
// says "Ho paura...", words carved in stone), the Craglings' plan, Old
// Cinderback, the night at camp, and the rubbing at the Lodge.
import { bodyText, button, check, snap, until, visible } from './helpers.mjs';

/** Fights until the foe backs off, telling Milo what `plan(round)` says: a tile label, or a verb then a sentence. */
async function fight(page, plan, what) {
  await page.waitForFunction(() => /your call/i.test(document.body.innerText), null, { timeout: 30_000 });
  for (let round = 1; round <= 12; round++) {
    const move = plan(round);
    if (move.verb) {
      await button(page, move.verb).click({ timeout: 30_000 });
      await button(page, move.say).click({ timeout: 5_000 });
    } else {
      await button(page, move.tile).click({ timeout: 30_000 });
    }
    await page.waitForTimeout(1200);
    await page.waitForFunction(() => /your call|backs off|worn out/i.test(document.body.innerText), null, { timeout: 30_000 });
    const text = await bodyText(page);
    if (/backs off/.test(text)) return;
    check(!/worn out/.test(text), `Milo lost the fight with ${what}`);
  }
  throw new Error(`the fight with ${what} never ended`);
}

async function backToCamp(page) {
  await until(page, () => visible(button(page, 'Back to camp')), 'the end panel');
  await button(page, 'Back to camp').click();
  await page.waitForTimeout(700);
}

async function keepExploring(page, what) {
  await until(page, () => visible(button(page, 'Keep exploring')), what);
  await button(page, 'Keep exploring').click();
}

export async function playChapterTwo(page) {
  // Camp: Milo's game. Every shot is announced the same way.
  await page.getByRole('tab', { name: 'Camp' }).click();
  await page.waitForTimeout(600);
  await button(page, 'Milo wants to tell you something').click();
  await until(page, async () => (await bodyText(page)).includes("Attacco con l'acqua!"), "Milo's first shot");
  await snap(page, 'ch2-practice');
  await until(page, () => visible(button(page, 'Toss a pinecone at Milo')), 'the pinecone game');
  await button(page, 'Toss a pinecone at Milo').click();
  await backToCamp(page);

  // The Lodge: Pip wants a spar. Bluster's gale is too big to stop with an attack,
  // so a wall goes up first. His pattern is gust, gale, swoop, gale.
  await button(page, "Go to Translators' Lodge").click();
  await page.waitForTimeout(500);
  await button(page, 'Visit Maren').click();
  await until(page, () => visible(button(page, 'ACQUA')), 'the spar');
  check(await visible(page.getByTestId('verbs')), 'the verb row should appear once Milo knows verbs');
  for (const verb of ['ATTACCA', 'DIFENDI']) check(await visible(button(page, verb)), `missing the ${verb} verb`);
  check((await bodyText(page)).includes('Bluster'), 'the spar should name Bluster');
  await page.waitForFunction(() => /your call/i.test(document.body.innerText), null, { timeout: 30_000 });
  await snap(page, 'ch2-spar');
  await button(page, 'DIFENDI').click();
  await page.waitForTimeout(300);
  check(await visible(button(page, 'Difendi con la terra!')), 'picking DIFENDI should turn the tiles into the rest of the sentence');
  await snap(page, 'ch2-spar-difendi');
  await button(page, 'DIFENDI').click();
  await fight(page, (r) => (r % 2 === 0 ? { verb: 'DIFENDI', say: 'Difendi con la terra!' } : { tile: 'ACQUA' }), 'Bluster');
  await snap(page, 'ch2-spar-won');
  await button(page, 'Continue').click();
  await backToCamp(page);

  // The Old Hollow opens.
  await button(page, 'Go to The Old Hollow').click();
  await page.waitForTimeout(500);
  await snap(page, 'ch2-hollow-place');
  await button(page, 'Explore').click();
  await until(page, () => visible(button(page, 'Stop where you are')), 'the first "Aspetta!"');
  check((await bodyText(page)).includes('Aspetta!'), 'Milo should say "Aspetta!"');
  await snap(page, 'ch2-aspetta');
  await button(page, 'Stop where you are').click();
  await until(page, () => visible(button(page, 'Stay put')), '"Aspetta qui."');
  await button(page, 'Stay put').click();
  await keepExploring(page, 'the end of the entrance');

  // A Flickerwing too scared to glow.
  await until(page, async () => (await bodyText(page)).includes('Ho paura'), 'the Flickerwing');
  await snap(page, 'ch2-ho-paura');
  await until(page, () => visible(button(page, 'Sit down quietly next to it')), 'the Flickerwing choice');
  await button(page, 'Sit down quietly next to it').click();
  await until(page, async () => (await bodyText(page)).includes('Non ho fame'), '"Non ho fame... ho paura."');
  await keepExploring(page, 'the end of the Flickerwing');

  // Words carved in stone.
  await until(page, () => visible(page.getByTestId('inscription')), 'the carved words');
  check((await bodyText(page)).includes('QUI DORME LA LUCE'), 'the stone should read QUI DORME LA LUCE');
  check(!(await visible(button(page, 'Hear it again'))), 'carved words are read, not heard');
  await snap(page, 'ch2-inscription');
  await until(page, () => visible(button(page, 'Take a rubbing for Maren')), 'the rubbing');
  await button(page, 'Take a rubbing for Maren').click();
  await keepExploring(page, 'the end of the stones');

  // Two Craglings plan an ambush. Their pattern is stones, charge, stones, stones, charge.
  await until(page, () => visible(button(page, 'Keep listening')), 'the Craglings');
  await button(page, 'Keep listening').click();
  await until(page, () => visible(button(page, 'VENTO')), 'the Cragling fight');
  await snap(page, 'ch2-cragling');
  await fight(page, (r) => ({ tile: [2, 5].includes(r) ? 'TERRA' : 'VENTO' }), 'the Cragling');
  await button(page, 'Continue').click();
  await keepExploring(page, 'the end of the Craglings');

  // Old Cinderback: fire, the great fire, charge, the great fire... Shield the great fire, then strike.
  await until(page, () => visible(button(page, 'ACQUA')), 'Old Cinderback');
  check((await bodyText(page)).includes('Old Cinderback'), 'the boss should be named');
  await page.waitForFunction(() => /your call/i.test(document.body.innerText), null, { timeout: 30_000 });
  await snap(page, 'ch2-cinderback');
  const boss = [{ tile: 'ACQUA' }, { verb: 'DIFENDI', say: "Difendi con l'acqua!" }, { verb: 'ATTACCA', say: "Attacca con l'acqua!" }, { verb: 'DIFENDI', say: "Difendi con l'acqua!" }, { tile: 'ACQUA' }, { verb: 'DIFENDI', say: "Difendi con l'acqua!" }];
  await fight(page, (r) => boss[(r - 1) % boss.length], 'Old Cinderback');
  await snap(page, 'ch2-cinderback-won');
  await button(page, 'Continue').click();
  await until(page, async () => (await bodyText(page)).includes('Non sai cosa sei'), "Cinderback's last words");
  await backToCamp(page);

  // That night, Milo says what the Flickerwing said.
  await button(page, 'Milo wants to tell you something').click();
  await until(page, () => visible(button(page, 'Hold him')), 'the night at camp');
  check((await bodyText(page)).includes('Ho paura.'), 'Milo should say "Ho paura."');
  await button(page, 'Hold him').click();
  await backToCamp(page);

  // The Lodge: the rubbing and the basket tag.
  await button(page, "Go to Translators' Lodge").click();
  await page.waitForTimeout(500);
  await button(page, 'Visit Maren').click();
  await until(page, () => visible(button(page, 'Hold the rubbing up to Bluster')), 'the report');
  await snap(page, 'ch2-report');
  await button(page, 'Hold the rubbing up to Bluster').click();
  await until(page, async () => (await bodyText(page)).includes('End of Chapter Two'), 'the end of chapter two');
  await backToCamp(page);

  // The journal keeps the carved words with the strange things, as carved, with no voice.
  await page.getByRole('tab', { name: 'Journal' }).click();
  await page.waitForTimeout(400);
  await page.getByRole('tab', { name: 'Strange things' }).click();
  await page.waitForTimeout(300);
  const strange = await bodyText(page);
  check(strange.includes('QUI DORME LA LUCE') && strange.includes('Carved in stone'), 'the journal should keep the carved words');
  check(strange.includes('Non sai cosa sei'), "the journal should keep Cinderback's last words");
  await snap(page, 'ch2-journal-strange');
  await page.getByRole('tab', { name: 'Lexlings' }).click();
  await page.waitForTimeout(300);
  await snap(page, 'ch2-bestiary');
}
