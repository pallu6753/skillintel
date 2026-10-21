import { RawJobRecord, ValidationResult, ValidationIssue } from '../types';

export function validateJob(job: RawJobRecord): ValidationResult {
  const issues: ValidationIssue[] = [];

  // Required fields
  if (!job.title || job.title.trim() === '') {
    issues.push({ field: 'title', message: 'Missing required field: title', severity: 'error' });
  }
  if (!job.company || job.company.trim() === '') {
    issues.push({ field: 'company', message: 'Missing required field: company', severity: 'warning' });
  }
  if (!job.location || job.location.trim() === '') {
    issues.push({ field: 'location', message: 'Missing required field: location', severity: 'warning' });
  }

  // Logical constraints
  if (job.salary_min !== undefined && job.salary_min !== null && job.salary_max !== undefined && job.salary_max !== null) {
    if (job.salary_min > job.salary_max) {
      issues.push({ field: 'salary', message: 'salary_min cannot be greater than salary_max', severity: 'error' });
    }
  }

  if (job.experience_min !== undefined && job.experience_min !== null && job.experience_max !== undefined && job.experience_max !== null) {
    if (job.experience_min > job.experience_max) {
      issues.push({ field: 'experience', message: 'experience_min cannot be greater than experience_max', severity: 'error' });
    }
  }

  if (job.experience_min !== undefined && job.experience_min !== null && job.experience_min < 0) {
    issues.push({ field: 'experience_min', message: 'experience_min cannot be negative', severity: 'error' });
  }

  if (job.source_url && job.source_url.trim() !== '') {
    try {
      new URL(job.source_url);
    } catch (e) {
      issues.push({ field: 'source_url', message: 'Invalid URL format', severity: 'error' });
    }
  }

  const hasErrors = issues.some(i => i.severity === 'error');
  const hasWarnings = issues.some(i => i.severity === 'warning');

  return {
    status: hasErrors ? 'INVALID' : hasWarnings ? 'WARNING' : 'VALID',
    issues
  };
}
