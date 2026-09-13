import { describe, expect, it } from 'vitest';
import { statusLabel } from './applicationLabels';

describe('statusLabel', () => {
  it('maps hired to a placement-friendly label', () => {
    expect(statusLabel('hired')).toBe('Hired');
    expect(statusLabel('shortlisted')).toBe('Shortlisted');
    expect(statusLabel('unknown')).toBe('unknown');
  });
});
