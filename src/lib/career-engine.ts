import type { StudentFull } from "./data-loader";

// Career roles and their required skills
export const careerRoles = [
  { role: "Data Scientist", skills: ["Python", "Machine Learning", "Statistics", "Deep Learning"], icon: "🧪" },
  { role: "Data Analyst", skills: ["Python", "SQL", "Power BI", "Data Visualization", "Statistics"], icon: "📊" },
  { role: "Machine Learning Engineer", skills: ["Python", "Machine Learning", "Deep Learning", "Statistics"], icon: "🤖" },
  { role: "Software Engineer", skills: ["Java", "Problem Solving", "SQL"], icon: "💻" },
  { role: "Business Intelligence Analyst", skills: ["SQL", "Power BI", "Data Visualization", "Communication"], icon: "📈" },
  { role: "AI Researcher", skills: ["Python", "Deep Learning", "Machine Learning", "Statistics"], icon: "🔬" },
  { role: "Database Administrator", skills: ["SQL", "Java", "Problem Solving"], icon: "🗄️" },
  { role: "Technical Consultant", skills: ["Communication", "Problem Solving", "SQL", "Python"], icon: "🎯" },
];

export interface CareerMatch {
  role: string;
  icon: string;
  matchScore: number;
  matchedSkills: string[];
  missingSkills: string[];
  requiredSkills: string[];
}

export function recommendCareers(studentSkills: string[]): CareerMatch[] {
  const skillSet = new Set(studentSkills.map((s) => s.toLowerCase()));

  return careerRoles
    .map((cr) => {
      const matched = cr.skills.filter((s) => skillSet.has(s.toLowerCase()));
      const missing = cr.skills.filter((s) => !skillSet.has(s.toLowerCase()));
      const matchScore = Math.round((matched.length / cr.skills.length) * 100);

      return {
        role: cr.role,
        icon: cr.icon,
        matchScore,
        matchedSkills: matched,
        missingSkills: missing,
        requiredSkills: cr.skills,
      };
    })
    .sort((a, b) => b.matchScore - a.matchScore);
}

export interface ReadinessFactor {
  name: string;
  value: number;
  weight: number;
  contribution: number;
  maxPoints: number;
  category: "Academic" | "Technical" | "Practical" | "Evaluative";
  status: "Assessed" | "Pending Information";
  description: string;
}

export interface JobReadinessResult {
  score: number;
  label: "Ready for Placement" | "Needs Improvement";
  factors: ReadinessFactor[];
  specifiedSubtotal67: number;
  remainingDefined33: number;
  breakdown: {
    academic: number;
    technical: number;
    practical: number;
    evaluative: number;
  };
  summary: string;
}

// ML-like job readiness prediction using deterministic 100-point weighted features
// Specified subtotal: GPA 25 + Attendance 14 + Skills 16 + Projects 12 = 67 pts
// Explicitly defined remaining: Coding 15 + Resume 10 + Quiz 8 = 33 pts (Total: 100 pts)
export function predictJobReadiness(student: StudentFull): JobReadinessResult {
  const hasSkills = student.skills && student.skills.length > 0;
  const skillScore = hasSkills
    ? student.skills.reduce((acc, s) => acc + (s.level === "Advanced" ? 100 : s.level === "Intermediate" ? 66 : 33), 0) / student.skills.length
    : 0;

  // Support both 4.0 GPA and 10.0 CGPA scales
  const hasGpa = (student.gpa || 0) > 0;
  const normalizedGpa = hasGpa
    ? (student.gpa > 4 ? Math.min(student.gpa / 10, 1) * 100 : Math.min(student.gpa / 4, 1) * 100)
    : 0;

  const hasAttendance = (student.attendance || 0) > 0;
  const hasProjects = (student.projectsCompleted || 0) > 0;
  const hasCoding = (student.codingScore || 0) > 0;
  const hasResume = (student.resumeScore || 0) > 0;
  const hasQuiz = (student.quizScore || 0) > 0;

  const rawFactors: Omit<ReadinessFactor, "contribution">[] = [
    // Specified 67 Points
    {
      name: "GPA / CGPA Performance",
      value: Math.round(normalizedGpa),
      weight: 0.25,
      maxPoints: 25,
      category: "Academic",
      status: hasGpa ? "Assessed" : "Pending Information",
      description: hasGpa ? "Undergraduate cumulative grade performance (max 25 pts)" : "Academic record pending official institutional verification",
    },
    {
      name: "Attendance & Consistency",
      value: Math.round(Math.min(student.attendance || 0, 100)),
      weight: 0.14,
      maxPoints: 14,
      category: "Academic",
      status: hasAttendance ? "Assessed" : "Pending Information",
      description: hasAttendance ? "Classroom attendance and lecture participation regularity (max 14 pts)" : "Attendance records pending department register verification",
    },
    {
      name: "Verified Skill Proficiency",
      value: Math.round(skillScore),
      weight: 0.16,
      maxPoints: 16,
      category: "Technical",
      status: hasSkills ? "Assessed" : "Pending Information",
      description: hasSkills ? "Confirmed competency across verified technology stacks (max 16 pts)" : "No confirmed skills found; upload resume or complete assessment",
    },
    {
      name: "Portfolio & Capstone Projects",
      value: Math.round(Math.min((student.projectsCompleted || 0) / 3, 1) * 100),
      weight: 0.12,
      maxPoints: 12,
      category: "Practical",
      status: hasProjects ? "Assessed" : "Pending Information",
      description: hasProjects ? "End-to-end deliverables and public GitHub repositories (max 12 pts)" : "Portfolio projects pending submission or resume verification",
    },
    // Explicitly Defined Remaining 33 Points
    {
      name: "Coding Assessment & DSA",
      value: Math.round(student.codingScore || 0),
      weight: 0.15,
      maxPoints: 15,
      category: "Technical",
      status: hasCoding ? "Assessed" : "Pending Information",
      description: hasCoding ? "Algorithmic problem-solving score on platform challenges (max 15 pts)" : "Coding challenge score pending assessment completion",
    },
    {
      name: "ATS Resume Quality & Rigor",
      value: Math.round(student.resumeScore || 0),
      weight: 0.10,
      maxPoints: 10,
      category: "Evaluative",
      status: hasResume ? "Assessed" : "Pending Information",
      description: hasResume ? "ATS structural scan, quantifiable metrics, and impact statement rigor (max 10 pts)" : "Resume not yet uploaded; analyze resume to earn points",
    },
    {
      name: "Technical Quiz & Milestones",
      value: Math.round(student.quizScore || 0),
      weight: 0.08,
      maxPoints: 8,
      category: "Evaluative",
      status: hasQuiz ? "Assessed" : "Pending Information",
      description: hasQuiz ? "Domain assessment accuracy and milestone completions (max 8 pts)" : "Quiz milestones pending attempt in Skills Hub",
    },
  ];

  const factors: ReadinessFactor[] = rawFactors.map((f) => ({
    ...f,
    contribution: parseFloat((f.value * f.weight).toFixed(1)),
  }));

  const specifiedSubtotal67 = parseFloat(
    factors.slice(0, 4).reduce((acc, f) => acc + f.contribution, 0).toFixed(1)
  );

  const remainingDefined33 = parseFloat(
    factors.slice(4).reduce((acc, f) => acc + f.contribution, 0).toFixed(1)
  );

  const totalPoints = factors.reduce((acc, f) => acc + f.contribution, 0);
  const score = Math.min(Math.round(totalPoints), 100);

  const breakdown = {
    academic: parseFloat(factors.filter((f) => f.category === "Academic").reduce((a, f) => a + f.contribution, 0).toFixed(1)),
    technical: parseFloat(factors.filter((f) => f.category === "Technical").reduce((a, f) => a + f.contribution, 0).toFixed(1)),
    practical: parseFloat(factors.filter((f) => f.category === "Practical").reduce((a, f) => a + f.contribution, 0).toFixed(1)),
    evaluative: parseFloat(factors.filter((f) => f.category === "Evaluative").reduce((a, f) => a + f.contribution, 0).toFixed(1)),
  };

  const label: "Ready for Placement" | "Needs Improvement" = score >= 60 ? "Ready for Placement" : "Needs Improvement";

  const summary = `Readiness Index: ${score}/100 (${label}). Core Specified: ${specifiedSubtotal67}/67 pts, Assessments/Resume: ${remainingDefined33}/33 pts. Academic: ${breakdown.academic}/39 pts, Technical: ${breakdown.technical}/31 pts, Practical: ${breakdown.practical}/12 pts, Evaluative: ${breakdown.evaluative}/18 pts.`;

  return {
    score,
    label,
    factors,
    specifiedSubtotal67,
    remainingDefined33,
    breakdown,
    summary,
  };
}

