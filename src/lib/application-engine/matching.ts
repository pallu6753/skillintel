import { CareerTarget, MatchScoreDetails, EligibilityStatus, OpportunityPriority, JobRequirement } from './types';
import { TrustedJob } from '../trust-engine/analytics';

// Simplified representation of User Profile for the matching engine
export interface UserProfileMatchData {
  skills: string[];
  experienceYears: number;
  educationLevel: string;
  location: string;
  workModePref: string[];
  target: CareerTarget;
}

export function extractRequirements(job: TrustedJob): JobRequirement[] {
  // In a real system, this uses NLP/LLMs to extract fields from the job description
  // Here we map structured fields to requirements safely
  const reqs: JobRequirement[] = [];
  
  // Skills are always preferred unless marked mandatory (we assume mandatory if extracted by trust engine)
  job.cleaned_skills.forEach(skill => {
    reqs.push({ type: 'skill', value: skill, isMandatory: true });
  });

  if (job.normalized_experience_min !== undefined) {
    reqs.push({ type: 'experience', value: `${job.normalized_experience_min} years`, isMandatory: true });
  }

  if (job.cleaned_location) {
    reqs.push({ type: 'location', value: job.cleaned_location, isMandatory: true });
  }

  return reqs;
}

export function calculateMatchScore(
  job: TrustedJob, 
  user: UserProfileMatchData
): MatchScoreDetails {
  
  // 1. Skill Match (40%)
  const jobSkills = new Set(job.cleaned_skills.map(s => s.toLowerCase()));
  const userSkills = new Set(user.skills.map(s => s.toLowerCase()));
  
  let matchingSkills = 0;
  jobSkills.forEach(s => { if (userSkills.has(s)) matchingSkills++; });
  const skillMatch = jobSkills.size > 0 ? (matchingSkills / jobSkills.size) * 100 : 100;

  // 2. Experience Match (20%)
  let experienceMatch = 100;
  if (job.normalized_experience_min !== undefined) {
    if (user.experienceYears < job.normalized_experience_min) {
      experienceMatch = Math.max(0, 100 - ((job.normalized_experience_min - user.experienceYears) * 20));
    }
  }

  // 3. Education Match (10%)
  const educationMatch = 100; // Simulated (assume meets requirements for demo)

  // 4. Location Match (10%)
  let locationMatch = 100;
  if (job.cleaned_location && user.location && !job.cleaned_location.toLowerCase().includes(user.location.toLowerCase()) && !job.cleaned_location.toLowerCase().includes('remote')) {
    locationMatch = user.target.preferredLocations.some(l => job.cleaned_location?.toLowerCase().includes(l.toLowerCase())) ? 80 : 20;
  }

  // 5. Seniority Match (10%)
  let seniorityMatch = 100;
  // If title has "Senior" but target is "Entry Level"
  if (job.cleaned_title.toLowerCase().includes('senior') && user.target.experienceLevel.toLowerCase().includes('entry')) {
    seniorityMatch = 20;
  }

  // 6. Career Target Alignment (10%)
  let targetMatch = 0;
  if (job.cleaned_title.toLowerCase().includes(user.target.targetRole.toLowerCase())) {
    targetMatch = 100;
  } else {
    targetMatch = 50; // Partial match
  }

  const finalScore = Math.round(
    (skillMatch * 0.40) +
    (experienceMatch * 0.20) +
    (educationMatch * 0.10) +
    (locationMatch * 0.10) +
    (seniorityMatch * 0.10) +
    (targetMatch * 0.10)
  );

  return {
    skillMatch: Math.round(skillMatch),
    experienceMatch: Math.round(experienceMatch),
    educationMatch: Math.round(educationMatch),
    locationMatch: Math.round(locationMatch),
    seniorityMatch: Math.round(seniorityMatch),
    targetMatch: Math.round(targetMatch),
    finalScore
  };
}

export function determineEligibility(
  requirements: JobRequirement[],
  user: UserProfileMatchData
): EligibilityStatus {
  const mandatorySkills = requirements.filter(r => r.type === 'skill' && r.isMandatory).map(r => r.value.toLowerCase());
  const userSkillSet = new Set(user.skills.map(s => s.toLowerCase()));
  
  let missingMandatory = 0;
  mandatorySkills.forEach(s => {
    if (!userSkillSet.has(s)) missingMandatory++;
  });

  const mandatoryExp = requirements.find(r => r.type === 'experience' && r.isMandatory);
  const expFailed = mandatoryExp && parseInt(mandatoryExp.value) > user.experienceYears;

  if (expFailed || missingMandatory > 2) {
    return 'NOT_ELIGIBLE';
  } else if (missingMandatory > 0) {
    return 'NEEDS_REVIEW';
  } else if (mandatorySkills.length > 0 && missingMandatory === 0) {
    return 'ELIGIBLE';
  }
  
  return 'LIKELY_ELIGIBLE'; // Unsure
}

export function calculateOpportunityPriority(
  matchScore: number,
  trustScore: number,
  eligibility: EligibilityStatus,
  isFresh: boolean
): OpportunityPriority {
  
  if (eligibility === 'NOT_ELIGIBLE' || trustScore < 50) return 'LOW_PRIORITY';
  
  let score = matchScore * 0.5 + trustScore * 0.4 + (isFresh ? 10 : 0);
  
  if (eligibility === 'ELIGIBLE') score += 10;
  if (eligibility === 'NEEDS_REVIEW') score -= 10;

  if (score >= 85) return 'HIGH_PRIORITY';
  if (score >= 70) return 'GOOD_OPPORTUNITY';
  if (score >= 50) return 'CONSIDER';
  return 'LOW_PRIORITY';
}
