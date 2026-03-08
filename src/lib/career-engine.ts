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

// ML-like job readiness prediction using weighted features
export function predictJobReadiness(student: StudentFull): {
  score: number;
  label: "Ready for Placement" | "Needs Improvement";
  factors: { name: string; value: number; weight: number; contribution: number }[];
} {
  const skillScore = student.skills.length > 0
    ? student.skills.reduce((acc, s) => acc + (s.level === "Advanced" ? 100 : s.level === "Intermediate" ? 66 : 33), 0) / student.skills.length
    : 0;

  const factors = [
    { name: "GPA (normalized)", value: Math.min(student.gpa / 4, 1) * 100, weight: 0.25 },
    { name: "Attendance", value: student.attendance, weight: 0.15 },
    { name: "Skill Proficiency", value: skillScore, weight: 0.20 },
    { name: "Projects Completed", value: Math.min(student.projectsCompleted / 5, 1) * 100, weight: 0.15 },
    { name: "Internship Experience", value: Math.min(student.internshipsCompleted / 3, 1) * 100, weight: 0.10 },
    { name: "Coding Score", value: student.codingScore, weight: 0.08 },
    { name: "Communication Score", value: student.communicationScore, weight: 0.04 },
    { name: "Resume Score", value: student.resumeScore, weight: 0.03 },
  ];

  const score = Math.round(
    factors.reduce((acc, f) => acc + f.value * f.weight, 0)
  );

  return {
    score: Math.min(score, 100),
    label: score >= 60 ? "Ready for Placement" : "Needs Improvement",
    factors: factors.map((f) => ({ ...f, contribution: Math.round(f.value * f.weight) })),
  };
}
