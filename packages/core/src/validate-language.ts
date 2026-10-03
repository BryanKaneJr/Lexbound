import { encounterConcepts } from './encounter';
import type { Content, Encounter, Step } from './schema';

/**
 * Language checks (language bible §64, §67): the rules that keep the
 * creature language grounded, transferable and fair. Run with the rest of
 * validation in the content tests.
 *
 *  - every line is annotated: it teaches concepts, or says it's chatter or a strange line;
 *  - no line is written twice for the same speaker;
 *  - every encounter with creature lines declares its teaching: purpose,
 *    what it introduces, what it reinforces, and how each new concept is grounded;
 *  - evidence only ever judges a concept the encounter declares;
 *  - story scenes only rely on concepts an earlier story scene introduced;
 *  - every concept is met in at least two encounters and said by at least
 *    two speakers (cross-creature transfer is mandatory, §18);
 *  - no concept exists only as a combat command (§59, §76);
 *  - every line is used somewhere, and every field note points at something real.
 */
export function validateLanguage(content: Content): string[] {
  const problems: string[] = [];
  const say = (where: string, msg: string) => problems.push(`${where}: ${msg}`);

  // Lines: annotated and not duplicated.
  const seenText = new Map<string, string>();
  for (const l of content.lines) {
    if (l.concepts.length === 0 && !l.chatter && l.journal !== 'strange') say(`line ${l.id}`, 'teaches nothing: tag its concepts, or mark it chatter or strange');
    const key = `${l.speaker}|${l.text.trim().toLowerCase()}`;
    const twin = seenText.get(key);
    if (twin) say(`line ${l.id}`, `same words, same speaker as ${twin}`);
    seenText.set(key, l.id);
  }

  // Where each line is used.
  const used = new Map<string, string[]>();
  const use = (line: string, where: string) => used.set(line, [...(used.get(line) ?? []), where]);
  for (const enc of content.encounters) for (const s of enc.steps) if (s.type === 'say') use(s.line, enc.id);
  for (const l of content.lexlings) {
    if (!l.battle) continue;
    for (const m of l.battle.moves) if (m.telegraph) use(m.telegraph, `battle.${l.id}`);
    for (const ids of Object.values(l.battle.reactions)) for (const id of ids) use(id, `battle.${l.id}`);
  }
  for (const ids of Object.values(content.milo.reactions)) for (const id of ids) use(id, 'battle.milo');
  for (const id of content.milo.idle) use(id, 'camp');
  use(content.milo.camp.hungry, 'camp');
  use(content.milo.camp.snack, 'camp');
  for (const id of [content.milo.camp.hungry, content.milo.camp.snack]) if (!content.line.has(id)) say('milo.camp', `unknown line "${id}"`);
  for (const l of content.lines) if (!used.has(l.id)) say(`line ${l.id}`, 'is never used');

  // Teaching metadata per encounter.
  for (const enc of content.encounters) problems.push(...validateTeaching(content, enc));

  // Story scenes only lean on concepts introduced earlier in the story.
  const story = content.encounters.filter((e) => e.kind === 'story').sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  const orders = new Map<number, string>();
  const introduced = new Set<string>();
  for (const enc of story) {
    const clash = orders.get(enc.order ?? -1);
    if (clash) say(`encounter ${enc.id}`, `shares story order ${enc.order} with ${clash}`);
    orders.set(enc.order ?? -1, enc.id);
    const t = enc.teaching;
    if (!t) continue;
    for (const c of t.introduces) introduced.add(c);
    for (const c of t.reinforces) if (!introduced.has(c)) say(`encounter ${enc.id}`, `reinforces "${c}" before any earlier story scene introduces it`);
  }

  // Every concept: met in two encounters, said by two speakers, and spoken (not only a command).
  const speakers = new Map<string, Set<string>>();
  const places = new Map<string, Set<string>>();
  for (const l of content.lines) {
    for (const c of l.concepts) {
      if (!speakers.has(c)) speakers.set(c, new Set());
      speakers.get(c)!.add(l.speaker);
      for (const where of used.get(l.id) ?? []) {
        if (!places.has(c)) places.set(c, new Set());
        places.get(c)!.add(where);
      }
    }
  }
  const commandConcepts = new Set(content.milo.commands.flatMap((c) => c.concepts));
  for (const c of content.concepts) {
    const who = speakers.get(c.id);
    if (!who) {
      say(`concept ${c.id}`, commandConcepts.has(c.id) ? 'is only ever a command button: someone needs to say it (§59)' : 'is never said by anyone');
      continue;
    }
    if (who.size < 2) say(`concept ${c.id}`, `is only ever said by ${[...who][0]}: another speaker needs to use it (transfer, §18)`);
    if ((places.get(c.id)?.size ?? 0) < 2) say(`concept ${c.id}`, 'appears in only one place: it needs a second situation');
  }

  // Field notes.
  for (const n of content.notes) {
    if (!content.concept.has(n.concept)) say(`note ${n.id}`, `unknown concept "${n.concept}"`);
    if (n.speaker && n.speaker !== 'milo' && !content.lexling.has(n.speaker)) say(`note ${n.id}`, `unknown speaker "${n.speaker}"`);
  }
  const noteIds = new Set<string>();
  for (const n of content.notes) {
    if (noteIds.has(n.id)) say('notes', `duplicate id "${n.id}"`);
    noteIds.add(n.id);
  }

  return problems;
}

function evidenceOf(step: Step): string[] {
  const outcomes = step.type === 'choice' ? step.options : step.type === 'tap' ? [...step.targets, ...(step.otherwise ? [step.otherwise] : [])] : step.type === 'give' ? step.items : [];
  return outcomes.flatMap((o) => (o.evidence ?? []).map((e) => e.concept));
}

function validateTeaching(content: Content, enc: Encounter): string[] {
  const problems: string[] = [];
  const say = (msg: string) => problems.push(`encounter ${enc.id}: ${msg}`);
  const concepts = encounterConcepts(content, enc);
  const t = enc.teaching;
  if (!t) {
    if (concepts.length) say(`uses ${concepts.join(', ')} but declares no teaching (purpose, introduces, reinforces, grounding)`);
    return problems;
  }
  const declared = new Set([...t.introduces, ...t.reinforces]);
  for (const c of [...t.introduces, ...t.reinforces]) if (!content.concept.has(c)) say(`declares unknown concept "${c}"`);
  for (const c of t.introduces) if (t.reinforces.includes(c)) say(`both introduces and reinforces "${c}"`);
  for (const c of concepts) if (!declared.has(c)) say(`uses "${c}" without declaring it in introduces or reinforces`);
  for (const c of t.introduces) if (!t.grounding.some((g) => g.concept === c)) say(`introduces "${c}" with no grounding: what on screen makes it inferable?`);
  for (const g of t.grounding) if (!declared.has(g.concept)) say(`grounds "${g.concept}", which it doesn't declare`);
  for (const step of enc.steps) for (const c of evidenceOf(step)) if (!declared.has(c)) say(`judges "${c}" without declaring it`);
  return problems;
}
