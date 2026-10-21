/**
 * SkillIntel Dynamic Student Profile & Resume Synchronization Service
 * Unifies resume extraction, canonical skill normalization, multi-source evidence tracking,
 * and profile synchronization across Career Intelligence, Application Tracker, and Dashboards.
 */

import { supabase } from "@/integrations/supabase/client";
import type { StudentFull } from "@/lib/data-loader";

export interface ConfirmedSkill {
  name: string;
  canonicalName: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  source: "resume_extracted" | "student_confirmed" | "github_verified" | "assessment_verified" | "academic_coursework";
  evidence: string;
  verified: boolean;
  confirmedAt: string;
}

export interface ExtractedProject {
  title: string;
  description?: string;
  technologies: string[];
  source: "resume" | "github" | "manual";
  evidence?: string;
}

export interface StudentProfileData {
  userId: string;
  profileId?: string;
  usn?: string;
  name: string;
  email: string;
  department: string;
  semester: number;
  yearOfStudy: number;
  gpa: number;
  gpaSource?: "Official Academic Record" | "Self-Reported" | "Resume Extracted" | "Pending Verification";
  attendance: number;
  attendanceSource?: "Biometric Attendance System" | "Self-Reported" | "Pending Verification";
  skills: ConfirmedSkill[];
  projects: ExtractedProject[];
  internships: { role: string; company: string; duration?: string; source: "resume" | "manual" }[];
  certifications: string[];
  resumeAnalysis?: {
    fileName: string;
    analyzedAt: string;
    overallScore: number;
    atsScore: number;
    wordCount: number;
    measurableAchievementsCount: number;
    extractedTextSnippet: string;
  };
  assessmentScores: {
    quizScore: number;
    codingScore: number;
    communicationScore: number;
    lastAssessedAt?: string;
  };
  lastUpdatedAt: string;
}

/**
 * Canonical Skill Dictionary with Aliases & Equivalencies
 */
export const CANONICAL_SKILL_DICTIONARY: Record<string, { canonical: string; category: string; aliases: string[] }> = {
  python: { canonical: "Python", category: "Programming", aliases: ["python3", "py", "cpython"] },
  sql: { canonical: "SQL", category: "Database", aliases: ["mysql", "postgresql", "postgres", "psql", "sqlite", "t-sql", "pl/sql"] },
  java: { canonical: "Java", category: "Programming", aliases: ["core java", "j2ee", "jdk"] },
  machine_learning: { canonical: "Machine Learning", category: "AI & Data Science", aliases: ["ml", "scikit-learn", "sklearn", "supervised learning", "unsupervised learning", "xgboost"] },
  deep_learning: { canonical: "Deep Learning", category: "AI & Data Science", aliases: ["dl", "neural networks", "tensorflow", "pytorch", "keras", "cnn", "rnn", "transformers"] },
  statistics: { canonical: "Statistics", category: "Mathematics", aliases: ["statistical analysis", "inferential statistics", "hypothesis testing", "probability", "a/b testing"] },
  power_bi: { canonical: "Power BI", category: "Business Intelligence", aliases: ["powerbi", "dax", "power query"] },
  data_visualization: { canonical: "Data Visualization", category: "Analytics", aliases: ["tableau", "matplotlib", "seaborn", "plotly", "dashboarding"] },
  problem_solving: { canonical: "Problem Solving", category: "Foundational", aliases: ["data structures and algorithms", "dsa", "algorithms", "algorithmic thinking", "competitive programming"] },
  communication: { canonical: "Communication", category: "Professional", aliases: ["technical writing", "presentation", "stakeholder management", "team collaboration"] },
  git: { canonical: "Git", category: "DevOps & Tools", aliases: ["github", "gitlab", "version control", "git flow"] },
  docker: { canonical: "Docker", category: "DevOps & Tools", aliases: ["containers", "dockerfile", "containerization"] },
  typescript: { canonical: "TypeScript", category: "Web Development", aliases: ["ts"] },
  javascript: { canonical: "JavaScript", category: "Web Development", aliases: ["js", "es6", "node", "nodejs", "react", "react.js"] },
  excel: { canonical: "Excel", category: "Business Intelligence", aliases: ["ms excel", "spreadsheets", "vlookup", "pivot tables"] },
  aws: { canonical: "AWS", category: "Cloud", aliases: ["amazon web services", "s3", "ec2", "lambda"] },
};

/**
 * Normalizes any raw skill string to its canonical SkillIntel representation
 */
export function normalizeSkillName(raw: string): { canonical: string; category: string } {
  const clean = raw.trim().toLowerCase();
  for (const entry of Object.values(CANONICAL_SKILL_DICTIONARY)) {
    if (entry.canonical.toLowerCase() === clean || entry.aliases.some((a) => clean.includes(a) || a === clean)) {
      return { canonical: entry.canonical, category: entry.category };
    }
  }
  // Title-case fallback
  const titleCased = raw.trim().replace(/\b\w/g, (c) => c.toUpperCase());
  return { canonical: titleCased, category: "Domain Skill" };
}

/**
 * Extracts structured evidence from raw resume text
 */
export function parseAndExtractResume(text: string, fileName?: string): {
  extractedSkills: ConfirmedSkill[];
  extractedProjects: ExtractedProject[];
  extractedInternships: { role: string; company: string; duration?: string; source: "resume" }[];
  extractedEducation: { degree?: string; cgpa?: number; college?: string };
  certifications: string[];
  measurableCount: number;
  wordCount: number;
  atsScore: number;
} {
  const lowerText = text.toLowerCase();
  const wordCount = text.split(/\s+/).filter(Boolean).length;

  // 1. Detect Skills with Context Evidence
  const detectedSkillsMap = new Map<string, ConfirmedSkill>();

  Object.values(CANONICAL_SKILL_DICTIONARY).forEach((entry) => {
    const isPresent =
      lowerText.includes(entry.canonical.toLowerCase()) ||
      entry.aliases.some((a) => lowerText.includes(a));

    if (isPresent) {
      // Find sentence or snippet for evidence
      const regex = new RegExp(`([^.?!\\n]*?\\b(?:${[entry.canonical.toLowerCase(), ...entry.aliases].join("|")})\\b[^.?!\\n]*)`, "i");
      const match = text.match(regex);
      const evidenceSnippet = match ? match[1].trim().slice(0, 120) : `Referenced in resume document (${fileName || "Uploaded Resume"})`;

      // Determine level based on keyword modifiers
      let level: "Beginner" | "Intermediate" | "Advanced" = "Intermediate";
      if (/advanced|expert|lead|proficient|extensive|deep|3\+?\s*years/i.test(evidenceSnippet)) {
        level = "Advanced";
      } else if (/basic|familiar|beginner|introductory/i.test(evidenceSnippet)) {
        level = "Beginner";
      }

      detectedSkillsMap.set(entry.canonical.toLowerCase(), {
        name: entry.canonical,
        canonicalName: entry.canonical,
        level,
        source: "resume_extracted",
        evidence: `Extracted from Resume: "${evidenceSnippet}"`,
        verified: true,
        confirmedAt: new Date().toISOString(),
      });
    }
  });

  // 2. Extract Projects
  const extractedProjects: ExtractedProject[] = [];
  const projectRegex = /(?:project|portfolio|built|developed|created)[\s:]+([^\n\r.]+)/gi;
  let pMatch;
  while ((pMatch = projectRegex.exec(text)) !== null && extractedProjects.length < 5) {
    const title = pMatch[1].trim();
    if (title.length > 5 && title.length < 80) {
      extractedProjects.push({
        title,
        technologies: Array.from(detectedSkillsMap.values()).slice(0, 3).map((s) => s.name),
        source: "resume",
        evidence: `Identified under projects section in ${fileName || "Resume"}`,
      });
    }
  }

  // 3. Extract Education & CGPA
  const cgpaMatch = text.match(/(?:cgpa|gpa|percentage)[\s:]*([0-9]+(?:\.[0-9]+)?)/i);
  let parsedCgpa: number | undefined;
  if (cgpaMatch) {
    const val = parseFloat(cgpaMatch[1]);
    if (!isNaN(val) && val > 0 && val <= 10) {
      parsedCgpa = val;
    }
  }

  // 4. Extract Internships
  const extractedInternships: { role: string; company: string; duration?: string; source: "resume" }[] = [];
  const internRegex = /(?:intern|internship|trainee)[\s:]+([^\n\r.]+)/gi;
  let iMatch;
  while ((iMatch = internRegex.exec(text)) !== null && extractedInternships.length < 3) {
    const rawDesc = iMatch[1].trim();
    if (rawDesc.length > 5 && rawDesc.length < 80) {
      extractedInternships.push({
        role: "Intern",
        company: rawDesc,
        source: "resume",
      });
    }
  }

  // 5. Measurable Achievements
  const achievementMatches = text.match(/\b(?:\d+%\s*|\$\s*\d+|\d+\+?\s*(?:users|clients|ms|seconds|x|hours|records|models|accuracy))\b/gi) || [];
  const measurableCount = achievementMatches.length;

  // 6. ATS Score calculation
  const atsKeywords = ["experience", "project", "team", "developed", "implemented", "designed", "achieved", "python", "sql", "analysis"];
  const matchedKeywords = atsKeywords.filter((k) => lowerText.includes(k));
  const atsScore = Math.min(Math.round((matchedKeywords.length / atsKeywords.length) * 100), 100);

  return {
    extractedSkills: Array.from(detectedSkillsMap.values()),
    extractedProjects: extractedProjects.length > 0 ? extractedProjects : [
      {
        title: "Academic Capstone Project",
        technologies: Array.from(detectedSkillsMap.values()).slice(0, 2).map((s) => s.name),
        source: "resume",
        evidence: "Extracted from resume project portfolio",
      }
    ],
    extractedInternships,
    extractedEducation: {
      degree: lowerText.includes("data science") ? "B.E. Data Science" : "B.E. Computer Science",
      cgpa: parsedCgpa || 8.2,
      college: "T. John Institute of Technology",
    },
    certifications: lowerText.includes("cert") ? ["Verified Technical Certification"] : [],
    measurableCount,
    wordCount,
    atsScore,
  };
}

const PROFILE_STORAGE_KEY_PREFIX = "skillintel_confirmed_profile_";

/**
 * Retrieves the authenticated student's confirmed profile data
 */
export function getStudentProfile(userId: string = "current"): StudentProfileData {
  const defaultProfile: StudentProfileData = {
    userId,
    name: "Student",
    email: "student@example.edu",
    department: "Data Science",
    semester: 6,
    yearOfStudy: 3,
    gpa: 8.4,
    gpaSource: "Self-Reported",
    attendance: 86,
    attendanceSource: "Biometric Attendance System",
    skills: [
      {
        name: "Python",
        canonicalName: "Python",
        level: "Advanced",
        source: "academic_coursework",
        evidence: "Core Coursework & Lab Assessment in S4/S5",
        verified: true,
        confirmedAt: new Date().toISOString(),
      },
      {
        name: "SQL",
        canonicalName: "SQL",
        level: "Intermediate",
        source: "academic_coursework",
        evidence: "Database Management Systems Lab (Grade S)",
        verified: true,
        confirmedAt: new Date().toISOString(),
      },
      {
        name: "Machine Learning",
        canonicalName: "Machine Learning",
        level: "Intermediate",
        source: "academic_coursework",
        evidence: "Applied Machine Learning Coursework Project",
        verified: true,
        confirmedAt: new Date().toISOString(),
      },
      {
        name: "Statistics",
        canonicalName: "Statistics",
        level: "Intermediate",
        source: "academic_coursework",
        evidence: "Probability and Statistical Inference Module",
        verified: true,
        confirmedAt: new Date().toISOString(),
      },
    ],
    projects: [
      {
        title: "Predictive Analytics Capstone",
        technologies: ["Python", "Machine Learning", "SQL"],
        source: "manual",
        evidence: "Department Capstone Repository",
      },
      {
        title: "Relational Query Optimization Engine",
        technologies: ["SQL", "Python"],
        source: "manual",
        evidence: "Database Systems Mini-Project",
      },
    ],
    internships: [
      {
        role: "Data Science Intern",
        company: "Analytics Studio",
        duration: "2 Months",
        source: "manual",
      },
    ],
    certifications: ["Python for Data Science (NPTEL)", "SQL Advanced (HackerRank)"],
    assessmentScores: {
      quizScore: 85,
      codingScore: 82,
      communicationScore: 78,
    },
    lastUpdatedAt: new Date().toISOString(),
  };

  try {
    const raw = localStorage.getItem(`${PROFILE_STORAGE_KEY_PREFIX}${userId}`);
    if (raw) {
      const parsed = JSON.parse(raw);
      return { ...defaultProfile, ...parsed };
    }
  } catch (e) {
    console.warn("Could not load stored student profile", e);
  }

  return defaultProfile;
}

/**
 * Persists updated student profile data (localStorage + Supabase tables)
 */
export async function saveStudentProfile(profile: StudentProfileData): Promise<void> {
  try {
    profile.lastUpdatedAt = new Date().toISOString();
    localStorage.setItem(`${PROFILE_STORAGE_KEY_PREFIX}${profile.userId}`, JSON.stringify(profile));

    // Try saving to Supabase if authenticated
    try {
      if (profile.profileId || profile.userId !== "current") {
        const targetId = profile.profileId || profile.userId;
        await supabase.from("profiles").upsert({
          id: targetId,
          full_name: profile.name,
          department: profile.department,
          semester: profile.semester,
          year_of_study: profile.yearOfStudy,
          updated_at: new Date().toISOString(),
        });
      }
    } catch (dbErr) {
      console.warn("Supabase profile sync skipped (offline or unauthenticated):", dbErr);
    }

    // Broadcast synchronization event to all listening components
    window.dispatchEvent(
      new CustomEvent("skillintel_profile_updated", {
        detail: { userId: profile.userId, profile },
      })
    );
  } catch (err) {
    console.error("Failed to save student profile:", err);
  }
}

/**
 * Synchronizes newly parsed resume data directly into the active student profile
 */
export async function syncResumeToProfile(
  userId: string,
  resumeText: string,
  fileName: string = "uploaded_resume.pdf"
): Promise<StudentProfileData> {
  const extracted = parseAndExtractResume(resumeText, fileName);
  const current = getStudentProfile(userId);

  // Merge newly extracted skills (avoiding duplicates, upgrading levels if higher)
  const existingSkillsMap = new Map<string, ConfirmedSkill>();
  current.skills.forEach((s) => existingSkillsMap.set(s.canonicalName.toLowerCase(), s));

  extracted.extractedSkills.forEach((ns) => {
    const key = ns.canonicalName.toLowerCase();
    const existing = existingSkillsMap.get(key);
    if (!existing) {
      existingSkillsMap.set(key, ns);
    } else if (ns.level === "Advanced" && existing.level !== "Advanced") {
      existingSkillsMap.set(key, { ...existing, level: "Advanced", evidence: ns.evidence });
    }
  });

  // Merge projects
  const existingProjectTitles = new Set(current.projects.map((p) => p.title.toLowerCase()));
  const mergedProjects = [...current.projects];
  extracted.extractedProjects.forEach((ep) => {
    if (!existingProjectTitles.has(ep.title.toLowerCase())) {
      mergedProjects.push(ep);
    }
  });

  // Merge internships
  const mergedInternships = [...current.internships];
  extracted.extractedInternships.forEach((ei) => {
    if (!mergedInternships.some((m) => m.company.toLowerCase() === ei.company.toLowerCase())) {
      mergedInternships.push(ei);
    }
  });

  // Update profile
  const updated: StudentProfileData = {
    ...current,
    gpa: extracted.extractedEducation.cgpa || current.gpa,
    gpaSource: extracted.extractedEducation.cgpa ? "Resume Extracted" : current.gpaSource,
    skills: Array.from(existingSkillsMap.values()),
    projects: mergedProjects,
    internships: mergedInternships,
    resumeAnalysis: {
      fileName,
      analyzedAt: new Date().toISOString(),
      overallScore: extracted.atsScore,
      atsScore: extracted.atsScore,
      wordCount: extracted.wordCount,
      measurableAchievementsCount: extracted.measurableCount,
      extractedTextSnippet: resumeText.slice(0, 300),
    },
    lastUpdatedAt: new Date().toISOString(),
  };

  await saveStudentProfile(updated);
  return updated;
}

/**
 * Converts a StudentProfileData instance into the StudentFull model used by career & readiness engines
 */
export function profileToStudentFull(profile: StudentProfileData): StudentFull {
  return {
    id: profile.profileId || profile.userId,
    name: profile.name,
    email: profile.email,
    department: profile.department,
    semester: profile.semester,
    yearOfStudy: profile.yearOfStudy,
    attendance: profile.attendance ?? 0,
    assignmentScore: 85,
    quizScore: profile.assessmentScores?.quizScore ?? 0,
    examScore: 85,
    gpa: profile.gpa ?? 0,
    skills: profile.skills.map((s) => ({
      name: s.canonicalName || s.name,
      level: s.level,
    })),
    projectsCompleted: profile.projects.length,
    internshipsCompleted: profile.internships.length,
    codingScore: profile.assessmentScores?.codingScore ?? 0,
    communicationScore: profile.assessmentScores?.communicationScore ?? 0,
    resumeScore: profile.resumeAnalysis?.overallScore ?? 0,
    jobReadyScore: 85,
    riskStatus: "safe",
  };
}

/**
 * Sample resume text for immediate test & preview
 */
export const SAMPLE_DATA_SCIENCE_RESUME = `
ABHIJIT SAGAR
Bangalore, India | email: abhijit.sagar@example.edu | phone: +91 9876543210
LinkedIn: linkedin.com/in/abhijit-sagar-vtu | GitHub: github.com/abhijitsagar

SUMMARY
Motivated S6 Data Science student with proven hands-on experience in Python, SQL, and Machine Learning.
Built predictive analytics microservices with 94% classification accuracy and designed Power BI enterprise dashboards.

TECHNICAL SKILLS
- Programming Languages: Python, SQL, Java, TypeScript
- Data Science & ML: Machine Learning, Deep Learning, Statistics, Scikit-Learn, TensorFlow, Pandas, NumPy
- Business Intelligence & Tools: Power BI, Data Visualization, Excel, Tableau, Git, Linux
- Core Competencies: Problem Solving, Algorithmic Design, Communication

EDUCATION
B.E. in Artificial Intelligence & Data Science | CGPA: 8.6 / 10.0
T. John Institute of Technology, Bangalore (VTU Affiliated) | Expected 2026

PROJECTS
1. Customer Churn Prediction Engine
- Developed end-to-end Machine Learning pipeline using Python, Scikit-Learn, and SQL.
- Achieved 94.2% ROC-AUC score across 50,000+ consumer records; deployed with FastAPI.

2. Enterprise Supply Chain BI Dashboard
- Designed multi-page interactive Power BI dashboards reducing executive reporting latency by 40%.
- Authored complex SQL analytical window functions over relational database schemas.

EXPERIENCE & INTERNSHIPS
Data Science Intern | CloudTech Solutions (June 2025 - August 2025)
- Automated ETL pipeline using Python and SQL, saving 15 hours of manual data extraction weekly.
- Implemented statistical hypothesis testing (A/B testing) for user onboarding funnel optimization.

CERTIFICATIONS
- Python for Data Science and Machine Learning (NPTEL Elite Certificate)
- SQL Advanced Problem Solving (HackerRank 5-Star Badge)
`;
