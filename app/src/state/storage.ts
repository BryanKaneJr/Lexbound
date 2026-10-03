import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'lexbound.save';

/** Reads the stored save as raw JSON (or null). The core's loadSave validates and migrates it. */
export async function readSave(): Promise<unknown> {
  try {
    const text = await AsyncStorage.getItem(KEY);
    return text ? JSON.parse(text) : null;
  } catch {
    return null;
  }
}

export async function writeSave(save: unknown): Promise<void> {
  try {
    await AsyncStorage.setItem(KEY, JSON.stringify(save));
  } catch {
    // Saving is retried on the next change; never interrupt play over it.
  }
}

export async function clearSave(): Promise<void> {
  try {
    await AsyncStorage.removeItem(KEY);
  } catch {}
}
