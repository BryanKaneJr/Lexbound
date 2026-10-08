import { content } from '@lexbound/content';
import { lineLevel, scaffoldLevel, WRITING, type ConceptState, type ScaffoldLevel } from '@lexbound/core';

export { content };

export function elementColor(element: string | null | undefined): string {
  return content.elements.elements.find((e) => e.id === element)?.color ?? '#8A8F99';
}

/** The creature-language word for a concept ("acqua"). */
export function wordFor(concept: string): string {
  return content.word.get(concept)?.word ?? concept;
}

export function speakerName(id: string): string {
  if (id === 'milo') return 'Milo';
  if (id === WRITING) return 'Carved in stone';
  return content.lexling.get(id)?.name ?? content.npc.get(id)?.name ?? id;
}

export function conceptLevel(states: Record<string, ConceptState>, concept: string, now: number): ScaffoldLevel {
  return scaffoldLevel(states[concept], now);
}

export function lineScaffold(states: Record<string, ConceptState>, lineId: string, now: number): ScaffoldLevel {
  const line = content.line.get(lineId);
  return line ? lineLevel(states, line.concepts, now) : 3;
}

/** Icons for the concepts in a line that have one (water, fire...), for heavy scaffolding. */
export function lineIcons(lineId: string): string[] {
  const line = content.line.get(lineId);
  if (!line) return [];
  return line.concepts.map((c) => content.concept.get(c)?.icon).filter((i): i is string => !!i);
}
