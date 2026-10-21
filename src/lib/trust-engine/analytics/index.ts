import { CleanedJobRecord, JobQualityScore } from '../types';

export type TrustedJob = CleanedJobRecord & {
  trust_score: number;
  verification_status: string;
};

// Filters out rejected jobs and duplicates to form the Trusted Analytics Layer
export function buildTrustedLayer(
  jobs: { cleaned: CleanedJobRecord; score: JobQualityScore; duplicate: any }[]
): TrustedJob[] {
  return jobs
    .filter(j => j.score.verification_status !== 'REJECTED')
    .filter(j => j.duplicate.status !== 'CONFIRMED_DUPLICATE')
    .map(j => ({
      ...j.cleaned,
      trust_score: j.score.final_trust_score,
      verification_status: j.score.verification_status
    }));
}

export function calculateSkillTrends(trustedJobs: TrustedJob[], roleFilter?: string) {
  const filteredJobs = roleFilter 
    ? trustedJobs.filter(j => j.cleaned_title.toLowerCase().includes(roleFilter.toLowerCase()))
    : trustedJobs;

  const totalValid = filteredJobs.length;
  if (totalValid === 0) return [];

  const skillCounts: Record<string, number> = {};
  filteredJobs.forEach(job => {
    job.cleaned_skills.forEach(skill => {
      skillCounts[skill] = (skillCounts[skill] || 0) + 1;
    });
  });

  return Object.entries(skillCounts)
    .map(([skill, count]) => ({
      skill,
      count,
      percentage: Math.round((count / totalValid) * 100)
    }))
    .sort((a, b) => b.count - a.count);
}

export function generateEvidenceBackedRecommendation(
  studentSkills: string[], 
  trustedJobs: TrustedJob[], 
  targetRole: string
) {
  const trends = calculateSkillTrends(trustedJobs, targetRole);
  const studentSkillSet = new Set(studentSkills.map(s => s.toLowerCase()));

  const missingSkills = trends.filter(t => !studentSkillSet.has(t.skill.toLowerCase()));

  if (trends.length === 0) {
    return {
      message: "Insufficient validated data to determine market requirements for this role.",
      critical: [],
      high: [],
      medium: []
    };
  }

  const critical = missingSkills.filter(s => s.percentage >= 50);
  const high = missingSkills.filter(s => s.percentage >= 25 && s.percentage < 50);
  const medium = missingSkills.filter(s => s.percentage > 0 && s.percentage < 25);

  return {
    message: `Based on ${trustedJobs.length} validated job postings for ${targetRole}.`,
    critical,
    high,
    medium
  };
}
