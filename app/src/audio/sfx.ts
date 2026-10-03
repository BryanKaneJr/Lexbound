import { createAudioPlayer, setAudioModeAsync, type AudioPlayer } from 'expo-audio';
import { useGame } from '@/state/store';

/**
 * Sound effects: placeholder synths from scripts/make-sfx.mjs. Replace a
 * file in app/assets/sfx/ with a real recording of the same name any time.
 * Sound is decoration: a failure never interrupts play.
 */
export type Sfx = 'tap' | 'pop' | 'splash' | 'fire' | 'earth' | 'wind' | 'hit' | 'heal' | 'steam' | 'sparkle' | 'victory' | 'defeat' | 'bond';

const FILES: Record<Sfx, number> = {
  tap: require('../../assets/sfx/tap.wav'),
  pop: require('../../assets/sfx/pop.wav'),
  splash: require('../../assets/sfx/splash.wav'),
  fire: require('../../assets/sfx/fire.wav'),
  earth: require('../../assets/sfx/earth.wav'),
  wind: require('../../assets/sfx/wind.wav'),
  hit: require('../../assets/sfx/hit.wav'),
  heal: require('../../assets/sfx/heal.wav'),
  steam: require('../../assets/sfx/steam.wav'),
  sparkle: require('../../assets/sfx/sparkle.wav'),
  victory: require('../../assets/sfx/victory.wav'),
  defeat: require('../../assets/sfx/defeat.wav'),
  bond: require('../../assets/sfx/bond.wav'),
};

const VOLUME: Partial<Record<Sfx, number>> = { tap: 0.3, pop: 0.4, sparkle: 0.5 };

/** An element's sound, for attacks. */
export const ELEMENT_SFX: Record<string, Sfx> = { water: 'splash', fire: 'fire', earth: 'earth', wind: 'wind' };

const players = new Map<Sfx, AudioPlayer>();
let modeSet = false;

export function playSfx(name: Sfx): void {
  if (!useGame.getState().save.settings.sound) return;
  try {
    if (!modeSet) {
      modeSet = true;
      void setAudioModeAsync({ playsInSilentMode: false, interruptionMode: 'mixWithOthers' }).catch(() => {});
    }
    let p = players.get(name);
    if (!p) {
      p = createAudioPlayer(FILES[name]);
      p.volume = VOLUME[name] ?? 0.6;
      players.set(name, p);
    }
    const player = p;
    void player
      .seekTo(0)
      .then(() => player.play())
      .catch(() => {});
  } catch {
    // Decoration only.
  }
}
