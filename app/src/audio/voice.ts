import { WRITING } from '@lexbound/core';
import * as Speech from 'expo-speech';
import { content } from '@/game/content';
import { useGame } from '@/state/store';

/**
 * Creature voices. Every creature line is spoken aloud in the creature
 * language (bible §29): listening matters as much as reading.
 *
 * For the prototype the device's own text-to-speech speaks each line, with a
 * pitch and pace per species so Milo always sounds like Milo. A recorded clip
 * can replace any line later: put it in CLIPS by line id and it wins.
 */
const CLIPS: Record<string, number> = {};

function voiceFor(speaker: string) {
  if (speaker === 'milo') return content.milo.voice;
  return content.lexling.get(speaker)?.voice ?? { pitch: 1, rate: 1 };
}

/** Removes the stage directions TTS would read out literally ("..." pauses are kept). */
function speakable(text: string): string {
  return text.replace(/\bGrrr+!?/gi, '').trim() || text;
}

export function speakLine(lineId: string, opts: { slow?: boolean } = {}): void {
  const settings = useGame.getState().save.settings;
  if (!settings.voice) return;
  const line = content.line.get(lineId);
  // Writing is read, not heard.
  if (!line || CLIPS[lineId] || line.speaker === WRITING) return;
  const voice = voiceFor(line.speaker);
  try {
    void Speech.stop();
    Speech.speak(speakable(line.text), {
      language: content.language.speechLocale,
      pitch: voice.pitch,
      rate: voice.rate * settings.speechRate * (opts.slow ? 0.65 : 1),
    });
  } catch {
    // No speech engine (some browsers, tests): the text is still on screen.
  }
}

/** The player's own call to Milo in battle ("Difendi con l'acqua!"), in a plain human voice. */
export function speakCall(text: string): void {
  const settings = useGame.getState().save.settings;
  if (!settings.voice) return;
  try {
    void Speech.stop();
    Speech.speak(text, { language: content.language.speechLocale, pitch: 1, rate: settings.speechRate });
  } catch {
    // No speech engine: the call is still on screen.
  }
}

export function stopVoice(): void {
  try {
    void Speech.stop();
  } catch {}
}
