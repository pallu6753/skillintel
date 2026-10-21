import { CleanedJobRecord } from '../types';

export type DuplicateResult = {
  status: 'UNIQUE' | 'POSSIBLE_DUPLICATE' | 'CONFIRMED_DUPLICATE';
  canonicalId?: string;
  confidence?: number;
};

export function calculateSimilarity(str1: string, str2: string): number {
  if (str1 === str2) return 1.0;
  const s1 = str1.toLowerCase();
  const s2 = str2.toLowerCase();
  if (s1.includes(s2) || s2.includes(s1)) return 0.8;
  return 0; // simplified for now
}

export function detectDuplicates(
  newJob: CleanedJobRecord,
  existingJobs: CleanedJobRecord[]
): DuplicateResult {
  let highestConfidence = 0;
  let canonicalId: string | undefined;

  for (const job of existingJobs) {
    if (job.job_id === newJob.job_id) continue;

    let score = 0;
    let factors = 0;

    if (newJob.cleaned_company && job.cleaned_company) {
      score += calculateSimilarity(newJob.cleaned_company, job.cleaned_company);
      factors++;
    }
    
    if (newJob.cleaned_title && job.cleaned_title) {
      score += calculateSimilarity(newJob.cleaned_title, job.cleaned_title);
      factors++;
    }

    if (newJob.cleaned_location && job.cleaned_location) {
      score += calculateSimilarity(newJob.cleaned_location, job.cleaned_location);
      factors++;
    }

    if (factors === 0) continue;
    
    const overallConfidence = score / factors;
    if (overallConfidence > highestConfidence) {
      highestConfidence = overallConfidence;
      canonicalId = job.job_id;
    }
  }

  if (highestConfidence > 0.9) {
    return { status: 'CONFIRMED_DUPLICATE', canonicalId, confidence: highestConfidence };
  } else if (highestConfidence > 0.7) {
    return { status: 'POSSIBLE_DUPLICATE', canonicalId, confidence: highestConfidence };
  }

  return { status: 'UNIQUE' };
}
