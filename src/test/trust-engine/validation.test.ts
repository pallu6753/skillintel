import { describe, it, expect } from 'vitest';
import { validateJob } from '../../lib/trust-engine/validation';
import { RawJobRecord } from '../../lib/trust-engine/types';

describe('Trust Engine - Validation', () => {
  it('should pass a valid record', () => {
    const job: RawJobRecord = {
      id: '1',
      title: 'Software Engineer',
      company: 'Tech Corp',
      location: 'Remote',
      salary_min: 100000,
      salary_max: 150000,
      experience_min: 2,
      experience_max: 5,
      source_url: 'https://example.com/job/1',
      collected_at: new Date().toISOString()
    };
    const result = validateJob(job);
    expect(result.status).toBe('VALID');
    expect(result.issues).toHaveLength(0);
  });

  it('should flag missing title as INVALID', () => {
    const job: RawJobRecord = {
      id: '2',
      title: '',
      company: 'Tech Corp',
      collected_at: new Date().toISOString()
    };
    const result = validateJob(job);
    expect(result.status).toBe('INVALID');
    expect(result.issues).toContainEqual(expect.objectContaining({ field: 'title' }));
  });

  it('should flag salary_min > salary_max as INVALID', () => {
    const job: RawJobRecord = {
      id: '3',
      title: 'Software Engineer',
      company: 'Tech Corp',
      location: 'Remote',
      salary_min: 150000,
      salary_max: 100000,
      collected_at: new Date().toISOString()
    };
    const result = validateJob(job);
    expect(result.status).toBe('INVALID');
    expect(result.issues).toContainEqual(expect.objectContaining({ field: 'salary' }));
  });

  it('should flag negative experience as INVALID', () => {
    const job: RawJobRecord = {
      id: '4',
      title: 'Software Engineer',
      company: 'Tech Corp',
      location: 'Remote',
      experience_min: -1,
      collected_at: new Date().toISOString()
    };
    const result = validateJob(job);
    expect(result.status).toBe('INVALID');
    expect(result.issues).toContainEqual(expect.objectContaining({ field: 'experience_min' }));
  });

  it('should flag invalid URL as INVALID', () => {
    const job: RawJobRecord = {
      id: '5',
      title: 'Software Engineer',
      company: 'Tech Corp',
      location: 'Remote',
      source_url: 'not-a-url',
      collected_at: new Date().toISOString()
    };
    const result = validateJob(job);
    expect(result.status).toBe('INVALID');
    expect(result.issues).toContainEqual(expect.objectContaining({ field: 'source_url' }));
  });
});
