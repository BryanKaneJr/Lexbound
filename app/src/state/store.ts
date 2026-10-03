import {
  applyEvents,
  loadSave,
  newSave,
  type GameEvent,
  type Notice,
  type Save,
  type Settings,
} from '@lexbound/core';
import { create } from 'zustand';
import { content } from '@/game/content';
import { clearSave, readSave, writeSave } from './storage';

/**
 * The one game store. The save is the only state that persists; every change
 * to it is a GameEvent from an engine, applied by the core's applyEvents.
 * Notices (bond up, new journal entry...) queue here for the toast layer.
 */
type GameStore = {
  ready: boolean;
  save: Save;
  loadStatus: 'ok' | 'migrated' | 'reset' | 'new';
  notices: (Notice & { key: number })[];
  hydrate: () => Promise<void>;
  dispatch: (events: GameEvent[]) => void;
  dismiss: (key: number) => void;
  settings: (patch: Partial<Settings>) => void;
  /** Debug only: replace the save wholesale. */
  replace: (save: Save) => void;
  reset: () => Promise<void>;
};

const freshSeed = () => Math.floor(Math.random() * 2 ** 32) >>> 0;
const tzOffset = () => new Date().getTimezoneOffset();

let writeTimer: ReturnType<typeof setTimeout> | undefined;
function persist(save: Save) {
  if (writeTimer) clearTimeout(writeTimer);
  writeTimer = setTimeout(() => void writeSave(save), 250);
}

let noticeKey = 0;

export const useGame = create<GameStore>((set, get) => ({
  ready: false,
  save: newSave(Date.now(), freshSeed()),
  loadStatus: 'new',
  notices: [],
  hydrate: async () => {
    const raw = await readSave();
    if (raw === null) {
      set({ ready: true, loadStatus: 'new' });
      return;
    }
    const { save, status } = loadSave(raw, Date.now(), freshSeed());
    set({ ready: true, save, loadStatus: status });
    if (status !== 'ok') persist(save);
  },
  dispatch: (events) => {
    if (events.length === 0) return;
    const { save, notices } = applyEvents(get().save, content, events, Date.now(), tzOffset());
    const queued = notices.map((n) => ({ ...n, key: ++noticeKey }));
    set((s) => ({ save, notices: [...s.notices, ...queued].slice(-6) }));
    persist(save);
  },
  dismiss: (key) => set((s) => ({ notices: s.notices.filter((n) => n.key !== key) })),
  settings: (patch) => {
    const save = { ...get().save, settings: { ...get().save.settings, ...patch } };
    set({ save });
    persist(save);
  },
  replace: (save) => {
    set({ save });
    persist(save);
  },
  reset: async () => {
    await clearSave();
    set({ save: newSave(Date.now(), freshSeed()), notices: [], loadStatus: 'new' });
  },
}));

/** Reads a seed for an engine and advances the save's seed. */
export function takeSeed(): number {
  const { save, dispatch } = useGame.getState();
  const seed = save.seed;
  dispatch([{ type: 'seed' }]);
  return seed;
}
