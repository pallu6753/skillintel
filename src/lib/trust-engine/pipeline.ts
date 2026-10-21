import { RawJobRecord } from './types';
import { validateJob } from './validation';
import { cleanAndNormalizeJob } from './cleaning';
import { detectDuplicates } from './deduplication';
import { calculateTrustScore } from './scoring';

export async function processJobRecord(
  rawJob: RawJobRecord, 
  existingJobs: any[], 
  sourceReliability: number = 50,
  evidenceScore: number = 0,
  anomalyScore: number = 0
) {
  // 1. Validate
  const validation = validateJob(rawJob);
  if (validation.status === 'INVALID') {
    return {
      status: 'REJECTED',
      reason: 'Validation Failed',
      validation,
    };
  }

  // 2. Clean & Normalize
  const cleaned = cleanAndNormalizeJob(rawJob);

  // 3. Deduplicate
  const duplicateCheck = detectDuplicates(cleaned, existingJobs);

  // 4. Score
  const score = calculateTrustScore(
    rawJob,
    cleaned,
    sourceReliability,
    evidenceScore,
    duplicateCheck.confidence || 0,
    anomalyScore
  );

  return {
    status: score.verification_status,
    validation,
    cleaned,
    duplicateCheck,
    score,
  };
}
