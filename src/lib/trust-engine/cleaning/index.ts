import { RawJobRecord, CleanedJobRecord } from '../types';
import { normalizeSkills } from '../normalization/skills';

export function parseLpaSalary(salaryStr: string): { min?: number, max?: number, currency?: string } {
  // e.g. "₹8 LPA - ₹12 LPA"
  const cleanStr = salaryStr.replace(/,/g, '');
  const lpaMatch = cleanStr.match(/(\d+(?:\.\d+)?)\s*LPA/gi);
  if (lpaMatch && lpaMatch.length >= 1) {
    const nums = lpaMatch.map(s => parseFloat(s));
    if (nums.length === 1) {
      return { min: nums[0] * 100000, max: nums[0] * 100000, currency: 'INR' };
    } else {
      return { min: nums[0] * 100000, max: nums[1] * 100000, currency: 'INR' };
    }
  }
  return {};
}

export function cleanAndNormalizeJob(job: RawJobRecord): CleanedJobRecord {
  const cleanString = (str?: string) => str ? str.replace(/<[^>]*>?/gm, '').replace(/\s+/g, ' ').trim() : '';
  const cleanTitleCase = (str?: string) => {
    const s = cleanString(str);
    return s.charAt(0).toUpperCase() + s.slice(1);
  };

  const cleaned_title = cleanTitleCase(job.title);
  const cleaned_company = cleanTitleCase(job.company);
  const cleaned_location = cleanTitleCase(job.location);

  let cleaned_skills = job.raw_skills?.map(cleanString).filter(Boolean) || [];
  cleaned_skills = normalizeSkills(cleaned_skills);

  let normalized_salary_min = job.salary_min;
  let normalized_salary_max = job.salary_max;
  
  if (job.raw_payload && job.raw_payload.salary_text) {
     const extracted = parseLpaSalary(job.raw_payload.salary_text);
     if (extracted.min) normalized_salary_min = extracted.min;
     if (extracted.max) normalized_salary_max = extracted.max;
  }

  return {
    job_id: job.id,
    cleaned_title,
    cleaned_company,
    cleaned_location,
    cleaned_skills,
    normalized_salary_min,
    normalized_salary_max,
    normalized_experience_min: job.experience_min,
    normalized_experience_max: job.experience_max,
  };
}
