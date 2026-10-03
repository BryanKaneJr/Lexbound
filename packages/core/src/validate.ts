import type { Content, Effects, Encounter } from './schema';

/**
 * Cross-reference checks the schema can't express: every id points at
 * something real, every goto lands, every line's words exist in the language
 * pack. Run in tests (content package) so broken content never ships
 * (bible §50 step 9, §73 "invalid content references").
 *
 * `art` lists the art ids the app can draw; pass it to check scene art too.
 */
export function validateContent(content: Content, art?: { backgrounds: Set<string>; props: Set<string>; actors: Set<string> }): string[] {
  const problems: string[] = [];
  const say = (where: string, msg: string) => problems.push(`${where}: ${msg}`);

  const dupes = <T extends { id: string }>(kind: string, items: T[]) => {
    const seen = new Set<string>();
    for (const i of items) {
      if (seen.has(i.id)) say(kind, `duplicate id "${i.id}"`);
      seen.add(i.id);
    }
  };
  dupes('concepts', content.concepts);
  dupes('lines', content.lines);
  dupes('abilities', content.abilities);
  dupes('lexlings', content.lexlings);
  dupes('npcs', content.npcs);
  dupes('items', content.items);
  dupes('locations', content.locations);
  dupes('journal', content.journal);
  dupes('encounters', content.encounters);

  const speakers = new Set(['milo', ...content.lexlings.map((l) => l.id)]);
  const elements = new Set(content.elements.elements.map((e) => e.id));

  for (const c of content.concepts) if (!content.word.has(c.id)) say(`concept ${c.id}`, 'has no word in the language pack');
  for (const w of content.words) if (!content.concept.has(w.concept)) say(`word ${w.word}`, `unknown concept "${w.concept}"`);

  for (const l of content.lines) {
    if (!speakers.has(l.speaker)) say(`line ${l.id}`, `unknown speaker "${l.speaker}"`);
    for (const c of l.concepts) {
      const word = content.word.get(c);
      if (!word) {
        say(`line ${l.id}`, `unknown concept "${c}"`);
        continue;
      }
      // The concept's word (or one of its forms) must really be in the line.
      const text = l.text.toLowerCase();
      if (![word.word, ...word.forms].some((f) => text.includes(f.toLowerCase()))) say(`line ${l.id}`, `tags "${c}" but "${word.word}" isn't in "${l.text}"`);
    }
  }

  for (const e of content.elements.elements) {
    if (!content.concept.has(e.concept)) say(`element ${e.id}`, `unknown concept "${e.concept}"`);
  }
  for (const [a, row] of Object.entries(content.elements.chart)) {
    if (!elements.has(a)) say('elements.chart', `unknown attacker "${a}"`);
    for (const d of Object.keys(row)) if (!elements.has(d)) say('elements.chart', `unknown defender "${d}"`);
  }
  for (const ab of content.abilities) if (ab.element && !elements.has(ab.element)) say(`ability ${ab.id}`, `unknown element "${ab.element}"`);

  const lineRef = (where: string, id: string) => {
    if (!content.line.has(id)) say(where, `unknown line "${id}"`);
  };
  const reactionRefs = (where: string, reactions: Record<string, string[]>) => {
    for (const [k, ids] of Object.entries(reactions)) for (const id of ids) lineRef(`${where}.${k}`, id);
  };

  for (const l of content.lexlings) {
    if (!elements.has(l.element)) say(`lexling ${l.id}`, `unknown element "${l.element}"`);
    if (!content.location.has(l.habitat)) say(`lexling ${l.id}`, `unknown habitat "${l.habitat}"`);
    if (!l.battle) continue;
    l.battle.moves.forEach((m, i) => {
      if (!content.ability.has(m.ability)) say(`lexling ${l.id}.moves[${i}]`, `unknown ability "${m.ability}"`);
      if (m.telegraph) lineRef(`lexling ${l.id}.moves[${i}]`, m.telegraph);
    });
    for (const p of l.battle.pattern) if (!l.battle.moves[p]) say(`lexling ${l.id}.pattern`, `no move ${p}`);
    reactionRefs(`lexling ${l.id}.reactions`, l.battle.reactions);
  }

  for (const c of content.milo.commands) {
    if (!content.ability.has(c.ability)) say(`command ${c.id}`, `unknown ability "${c.ability}"`);
    for (const k of c.concepts) if (!content.concept.has(k)) say(`command ${c.id}`, `unknown concept "${k}"`);
  }
  reactionRefs('milo.reactions', content.milo.reactions);
  for (const id of content.milo.idle) lineRef('milo.idle', id);

  for (const loc of content.locations) {
    if (art && !art.backgrounds.has(loc.background)) say(`location ${loc.id}`, `no background art "${loc.background}"`);
    for (const f of loc.requires?.items ?? []) if (!content.item.has(f)) say(`location ${loc.id}`, `unknown item "${f}"`);
  }

  for (const enc of content.encounters) problems.push(...validateEncounter(content, enc, art));
  return problems;
}

function validateEncounter(content: Content, enc: Encounter, art?: { backgrounds: Set<string>; props: Set<string>; actors: Set<string> }): string[] {
  const problems: string[] = [];
  const where = `encounter ${enc.id}`;
  const say = (msg: string) => problems.push(`${where}: ${msg}`);
  const stepIds = new Set<string>();
  for (const s of enc.steps) {
    if (!s.id) continue;
    if (stepIds.has(s.id)) say(`duplicate step id "${s.id}"`);
    stepIds.add(s.id);
  }
  if (!content.location.has(enc.location)) say(`unknown location "${enc.location}"`);
  if (enc.kind === 'story' && enc.order === undefined) say('story encounters need an order');

  const props = new Set(enc.scene.props.map((p) => p.id));
  const actors = new Set(enc.scene.actors.map((a) => a.id));
  const placed = new Set([...props, ...actors]);
  const backgrounds = [enc.scene.background];
  if (art) {
    for (const p of enc.scene.props) if (!art.props.has(p.art)) say(`no prop art "${p.art}"`);
    for (const a of enc.scene.actors) if (!art.actors.has(a.art)) say(`no actor art "${a.art}"`);
  }

  const goto = (target: string | undefined, step: string) => {
    if (target && !stepIds.has(target)) say(`${step} goes to missing step "${target}"`);
  };
  const effects = (e: Effects | undefined, step: string) => {
    if (!e) return;
    for (const i of Object.keys(e.items ?? {})) if (!content.item.has(i)) say(`${step}: unknown item "${i}"`);
    for (const l of [...(e.discover ?? []), ...(e.befriend ?? [])]) if (!content.lexling.has(l)) say(`${step}: unknown lexling "${l}"`);
    for (const j of e.journal ?? []) if (!content.entry.has(j)) say(`${step}: unknown journal entry "${j}"`);
  };
  const evidence = (ev: { concept: string }[] | undefined, step: string) => {
    for (const e of ev ?? []) if (!content.concept.has(e.concept)) say(`${step}: unknown concept "${e.concept}"`);
  };

  let ends = 0;
  enc.steps.forEach((s, i) => {
    const name = `step ${s.id ?? i} (${s.type})`;
    goto(s.next, name);
    switch (s.type) {
      case 'talk':
        if (!content.npc.has(s.npc)) say(`${name}: unknown npc "${s.npc}"`);
        if (!actors.has(s.npc)) say(`${name}: "${s.npc}" isn't in the scene`);
        break;
      case 'say': {
        const line = content.line.get(s.line);
        if (!line) say(`${name}: unknown line "${s.line}"`);
        else if (!actors.has(s.by ?? line.speaker)) say(`${name}: speaker "${s.by ?? line.speaker}" isn't in the scene`);
        if (s.look && !placed.has(s.look)) say(`${name}: looks at missing "${s.look}"`);
        break;
      }
      case 'act':
        if (!placed.has(s.actor)) say(`${name}: "${s.actor}" isn't in the scene`);
        if (s.look && !placed.has(s.look)) say(`${name}: looks at missing "${s.look}"`);
        break;
      case 'stage':
        for (const p of [...(s.show ?? []), ...(s.hide ?? []), ...(s.move ?? []).map((m) => m.id), ...Object.keys(s.mood ?? {})]) {
          if (!placed.has(p)) say(`${name}: stages missing "${p}"`);
        }
        if (s.background) backgrounds.push(s.background);
        break;
      case 'choice':
        s.options.forEach((o, k) => {
          goto(o.goto, `${name} option ${k}`);
          effects(o.effects, `${name} option ${k}`);
          evidence(o.evidence, `${name} option ${k}`);
        });
        break;
      case 'tap':
        for (const t of s.targets) {
          if (!props.has(t.prop) && !actors.has(t.prop)) say(`${name}: target "${t.prop}" isn't in the scene`);
          goto(t.goto, name);
          effects(t.effects, name);
          evidence(t.evidence, name);
        }
        if (s.otherwise) {
          goto(s.otherwise.goto, name);
          evidence(s.otherwise.evidence, name);
        }
        break;
      case 'give':
        for (const it of s.items) {
          if (!content.item.has(it.item)) say(`${name}: unknown item "${it.item}"`);
          goto(it.goto, name);
          effects(it.effects, name);
          evidence(it.evidence, name);
        }
        break;
      case 'battle':
        if (!content.lexling.get(s.enemy)?.battle) say(`${name}: "${s.enemy}" can't battle`);
        goto(s.win, name);
        goto(s.lose, name);
        if (s.background) backgrounds.push(s.background);
        break;
      case 'reward':
        effects(s.effects, name);
        break;
      case 'branch':
        goto(s.then, name);
        goto(s.else, name);
        break;
      case 'end':
        ends++;
        break;
      default:
        break;
    }
  });
  if (ends === 0) say('has no end step');
  if (art) for (const b of backgrounds) if (!art.backgrounds.has(b)) say(`no background art "${b}"`);
  return problems;
}
