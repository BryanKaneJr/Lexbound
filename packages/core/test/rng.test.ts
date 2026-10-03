import { describe, expect, it } from 'vitest';
import { createRng, shuffle, weightedPick } from '../src';

describe('rng', () => {
  it('repeats exactly from a seed', () => {
    const a = createRng(42);
    const b = createRng(42);
    const xs = Array.from({ length: 5 }, () => a());
    expect(Array.from({ length: 5 }, () => b())).toEqual(xs);
    for (const x of xs) expect(x).toBeGreaterThanOrEqual(0), expect(x).toBeLessThan(1);
  });

  it('shuffles into a permutation without touching the input', () => {
    const input = [1, 2, 3, 4, 5, 6];
    const out = shuffle(input, createRng(7));
    expect(input).toEqual([1, 2, 3, 4, 5, 6]);
    expect([...out].sort()).toEqual(input);
  });

  it('never picks a zero weight, and picks by weight', () => {
    const rng = createRng(3);
    const counts = { a: 0, b: 0, c: 0 };
    for (let i = 0; i < 4000; i++) {
      const p = weightedPick(['a', 'b', 'c'] as const, (k) => ({ a: 1, b: 3, c: 0 })[k], rng);
      if (p) counts[p]++;
    }
    expect(counts.c).toBe(0);
    expect(counts.b / counts.a).toBeGreaterThan(2.5);
    expect(counts.b / counts.a).toBeLessThan(3.5);
    expect(weightedPick([1, 2], () => 0, rng)).toBeUndefined();
  });
});
