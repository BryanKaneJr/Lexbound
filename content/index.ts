import { loadContent, type Content } from '@lexbound/core';
import abilities from './data/abilities.json';
import concepts from './data/concepts.json';
import elements from './data/elements.json';
import camp from './data/it/encounters/camp.json';
import lodge from './data/it/encounters/lodge.json';
import whisperwood from './data/it/encounters/whisperwood.json';
import language from './data/it/language.json';
import lines from './data/it/lines.json';
import words from './data/it/words.json';
import items from './data/items.json';
import journal from './data/journal.json';
import lexlings from './data/lexlings.json';
import locations from './data/locations.json';
import milo from './data/milo.json';
import npcs from './data/npcs.json';

/**
 * The game's content, as data. Language-neutral files sit in `data/`; the
 * creature-language pack (words, lines and the encounter scripts that use
 * them) sits in `data/it/`. Add an encounter by adding it to a location's
 * file; add a location's file here.
 */
export const raw = {
  language,
  concepts,
  words,
  lines,
  elements,
  abilities,
  lexlings,
  milo,
  npcs,
  items,
  locations,
  journal,
  encounters: [...lodge, ...camp, ...whisperwood],
};

export const content: Content = loadContent(raw);
