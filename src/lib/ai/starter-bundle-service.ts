import studentRoster from '@/data/starter_bundle/student_roster_30.json';
import quizQuestions from '@/data/starter_bundle/quiz_questions_sample_20.json';
import codingProblems from '@/data/starter_bundle/coding_problems_sample.json';
import careerPaths from '@/data/starter_bundle/career_paths_sample_10.json';
import academicTemplate from '@/data/starter_bundle/student_academic_analytics_template_30.json';
import parsedResumes from '@/data/starter_bundle/parsed_resumes_synthetic_demo.json';
import interviewSessions from '@/data/starter_bundle/interview_sessions_synthetic_demo.json';
import jobPostings from '@/data/starter_bundle/job_postings_synthetic_demo.json';

export interface VerifiedStudent {
  student_number: number;
  usn: string;
  full_name: string;
  college: string;
  department: string;
  email: string;
  phone: string;
  data_source: string;
}

export interface CuratedQuizQuestion {
  question_id: string;
  category: string;
  difficulty: "Easy" | "Medium" | "Hard" | string;
  question: string;
  options: string[];
  correct_option_index: number;
  explanation: string;
  source_type: string;
  review_status: string;
}

export interface CuratedCodingProblem {
  problem_id: string;
  title: string;
  domain: string;
  difficulty: string;
  description: string;
  input_example: unknown;
  expected_output: unknown;
  visible_test_cases: unknown[];
  expected_time_complexity: string;
  expected_space_complexity: string;
  starter_code: { python?: string; javascript?: string };
  editorial_summary: string;
  source_type: string;
}

export interface CuratedCareerPath {
  path_id: string;
  role_title: string;
  required_skills: string[];
  min_cgpa: number | null;
  required_certifications: string[];
  demand_score: number | null;
  source_type: string;
}

export const starterBundle = {
  students: studentRoster as VerifiedStudent[],
  quizQuestions: quizQuestions as CuratedQuizQuestion[],
  codingProblems: codingProblems as CuratedCodingProblem[],
  careerPaths: careerPaths as CuratedCareerPath[],
  academicAnalytics: academicTemplate,
  parsedResumes,
  interviewSessions,
  jobPostings,
};

/**
 * Searches verified student roster by USN or Name
 */
export function lookupVerifiedStudent(query: string): VerifiedStudent | undefined {
  const q = query.trim().toLowerCase();
  return starterBundle.students.find(
    (s) => s.usn.toLowerCase() === q || s.full_name.toLowerCase().includes(q)
  );
}

/**
 * Retrieves a career path by title
 */
export function lookupCareerPath(roleTitle: string): CuratedCareerPath | undefined {
  const r = roleTitle.trim().toLowerCase();
  return starterBundle.careerPaths.find(
    (p) => p.role_title.toLowerCase() === r || p.role_title.toLowerCase().includes(r)
  );
}

/**
 * Calculates skill alignment score strictly from available verified evidence
 */
export function calculateAlignmentScore(
  studentSkills: string[],
  requiredSkills: string[]
): { score: number; matched: string[]; missing: string[] } {
  if (!requiredSkills || requiredSkills.length === 0) {
    return { score: 100, matched: [], missing: [] };
  }
  const studentSet = new Set(studentSkills.map((s) => s.toLowerCase()));
  const matched: string[] = [];
  const missing: string[] = [];

  requiredSkills.forEach((req) => {
    if (studentSet.has(req.toLowerCase())) {
      matched.push(req);
    } else {
      missing.push(req);
    }
  });

  const score = Math.round((matched.length / requiredSkills.length) * 100);
  return { score, matched, missing };
}
