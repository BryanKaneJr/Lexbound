import type { Save } from './save';
import type { Content, FieldNote } from './schema';

/**
 * Field notes the protagonist has written so far (language bible §41).
 * Triggers use facts that never fade (who was heard, how many situations,
 * whether the player ever acted on it), so a note never disappears once
 * written, even if the player is rusty.
 */
export function visibleNotes(content: Content, save: Save): FieldNote[] {
  return content.notes.filter((n) => {
    const s = save.concepts[n.concept];
    if (!s) return false;
    switch (n.when) {
      case 'heard':
        return n.speaker ? s.speakers.includes(n.speaker) : s.exposures > 0;
      case 'noticed':
        return s.contexts.length >= 2;
      case 'used':
        return s.successes > 0;
      case 'transfer':
        return s.speakers.length >= 2;
    }
  });
}
