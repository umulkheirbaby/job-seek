import { describe, expect, it } from 'vitest';
import { homeLabelFor, homePathFor } from './homePath';

describe('homePathFor', () => {
  it('sends each role to the right home', () => {
    expect(homePathFor(null)).toBe('/');
    expect(homePathFor({ role: 'job_seeker' })).toBe('/dashboard');
    expect(homePathFor({ role: 'employer' })).toBe('/employer/dashboard');
    expect(homePathFor({ role: 'admin' })).toBe('/admin');
  });
});

describe('homeLabelFor', () => {
  it('labels the programme dashboard for admins', () => {
    expect(homeLabelFor({ role: 'admin' })).toBe('Open programme dashboard');
  });
});
