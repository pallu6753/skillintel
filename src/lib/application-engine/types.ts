export interface CareerTarget {
  targetRole: string;
  preferredLocations: string[];
  experienceLevel: string;
  workModes: string[];
  targetSkills: string[];
}

export interface MatchScoreDetails {
  skillMatch: number;
  experienceMatch: number;
  educationMatch: number;
  locationMatch: number;
  seniorityMatch: number;
  targetMatch: number;
  finalScore: number;
}

export interface MissingRequirements {
  critical: string[];
  high: string[];
  medium: string[];
  message?: string;
}

export type EligibilityStatus = 'ELIGIBLE' | 'LIKELY_ELIGIBLE' | 'NEEDS_REVIEW' | 'NOT_ELIGIBLE';

export type OpportunityPriority = 'HIGH_PRIORITY' | 'GOOD_OPPORTUNITY' | 'CONSIDER' | 'LOW_PRIORITY';

export interface ApplicationSessionState {
  state: 
    | 'NOT_STARTED'
    | 'PREPARING'
    | 'READY'
    | 'BROWSER_OPEN'
    | 'FORM_DETECTED'
    | 'USER_ACTION_REQUIRED'
    | 'READY_FOR_SUBMISSION'
    | 'SUBMITTED'
    | 'SUBMISSION_NOT_CONFIRMED'
    | 'FAILED'
    | 'CANCELLED';
  currentStep: number;
  missingFields: string[];
}

export interface JobRequirement {
  type: 'skill' | 'experience' | 'education' | 'location' | 'certification' | 'work_auth';
  value: string;
  isMandatory: boolean;
}
