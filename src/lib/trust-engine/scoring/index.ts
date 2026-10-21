import { RawJobRecord, CleanedJobRecord } from '../types';

export type JobQualityScore = {
  source_score: number;
  evidence_score: number;
  completeness_score: number;
  consistency_score: number;
  freshness_score: number;
  duplicate_score: number;
  anomaly_score: number;
  final_trust_score: number;
  verification_status: 'VERIFIED' | 'NEEDS_REVIEW' | 'REJECTED';
};

export function calculateTrustScore(
  rawJob: RawJobRecord,
  cleanedJob: CleanedJobRecord,
  sourceReliability: number = 50, // default
  evidenceScore: number = 0,
  duplicateConfidence: number = 0,
  anomalyScore: number = 0
): JobQualityScore {
  
  // Completeness (15%)
  let completeness = 0;
  if (cleanedJob.cleaned_title) completeness += 20;
  if (cleanedJob.cleaned_company) completeness += 20;
  if (cleanedJob.cleaned_location) completeness += 20;
  if (cleanedJob.normalized_salary_min !== undefined) completeness += 20;
  if (cleanedJob.cleaned_skills.length > 0) completeness += 20;

  // Consistency (15%)
  let consistency = 100;
  if (cleanedJob.normalized_salary_min && cleanedJob.normalized_salary_max && cleanedJob.normalized_salary_min > cleanedJob.normalized_salary_max) {
    consistency -= 50;
  }
  if (cleanedJob.normalized_experience_max && cleanedJob.normalized_experience_max > 20 && cleanedJob.cleaned_title.toLowerCase().includes('intern')) {
    consistency -= 50; // Intern with 20 yrs experience
  }

  // Freshness (10%)
  let freshness = 100;
  if (rawJob.date_posted) {
    const posted = new Date(rawJob.date_posted);
    const now = new Date();
    const days = (now.getTime() - posted.getTime()) / (1000 * 3600 * 24);
    if (days > 90) freshness = 20;
    else if (days > 30) freshness = 50;
    else if (days > 7) freshness = 80;
  }

  // Duplicate adjustment (10%)
  // If high duplicate confidence, score is lower (unless we are canonical, handled elsewhere)
  const dedupScore = duplicateConfidence > 0.9 ? 0 : duplicateConfidence > 0.7 ? 50 : 100;

  // Anomaly adjustment (5%)
  const anomScore = 100 - anomalyScore; // anomalyScore 0-100 where 100 is highly anomalous

  // Calculate final (weighted)
  const weights = {
    source: 0.25,
    evidence: 0.20,
    completeness: 0.15,
    consistency: 0.15,
    freshness: 0.10,
    duplicate: 0.10,
    anomaly: 0.05
  };

  const final_trust_score = Math.round(
    (sourceReliability * weights.source) +
    (evidenceScore * weights.evidence) +
    (completeness * weights.completeness) +
    (consistency * weights.consistency) +
    (freshness * weights.freshness) +
    (dedupScore * weights.duplicate) +
    (anomScore * weights.anomaly)
  );

  let verification_status: 'VERIFIED' | 'NEEDS_REVIEW' | 'REJECTED' = 'NEEDS_REVIEW';

  if (consistency < 50 || final_trust_score < 30) {
    verification_status = 'REJECTED';
  } else if (final_trust_score >= 70 && consistency === 100 && evidenceScore >= 50) {
    verification_status = 'VERIFIED';
  }

  return {
    source_score: sourceReliability,
    evidence_score: evidenceScore,
    completeness_score: completeness,
    consistency_score: consistency,
    freshness_score: freshness,
    duplicate_score: dedupScore,
    anomaly_score: anomScore,
    final_trust_score,
    verification_status
  };
}
