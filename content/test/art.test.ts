import { describe, expect, it } from 'vitest';
import { validateContent } from '@lexbound/core';
import { ART_IDS } from '../../app/src/art/ids';
import { content } from '../index';

describe('art', () => {
  it('every scene uses art the app can draw', () => {
    expect(validateContent(content, ART_IDS)).toEqual([]);
  });
});
