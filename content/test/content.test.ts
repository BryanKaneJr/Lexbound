import { describe, expect, it } from 'vitest';
import { validateContent } from '@lexbound/core';
import { content } from '../index';

describe('content', () => {
  it('passes the schema and every cross-reference', () => {
    expect(validateContent(content)).toEqual([]);
  });
});
