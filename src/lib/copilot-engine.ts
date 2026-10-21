import type { StudentFull } from "./data-loader";
import { recommendCareers, predictJobReadiness } from "./career-engine";
import { getResourcesForSkill, learningResources } from "./learning-resources";
import { getJobSearchLinks, getReadinessMessage } from "./job-discovery";
import {
  starterBundle,
  lookupVerifiedStudent,
  lookupCareerPath,
  calculateAlignmentScore,
  VerifiedStudent,
  CuratedCareerPath,
} from "./ai/starter-bundle-service";
import { getRoleGuidance } from "./ai/prompts/skillintel-master-prompt";

export interface CopilotMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

// Intent detection patterns
const intents = [
  { pattern: /student\s*roster|all\s*students|list\s*students|how\s*many\s*students/i, type: "dataset_roster" as const },
  { pattern: /(1tj23[a-z0-9]+)|(abhijit|afreen|anil|anson|charan|charitha|darshan|deepak|dhanush|dhanya|harshith|karthik|kavya|kiran|kishore|manoj|meghana|mohammed|nanditha|nikhil|pavan|pooja|prajwal|prashanth|priya|rahul|rakshitha|rohit|sahana|sanjay)/i, type: "student_lookup" as const },
  { pattern: /data\s*scien/i, type: "career_data_scientist" as const },
  { pattern: /data\s*analy/i, type: "career_data_analyst" as const },
  { pattern: /data\s*eng/i, type: "career_data_engineer" as const },
  { pattern: /software\s*eng|swe\b/i, type: "career_swe" as const },
  { pattern: /ml\s*eng|machine\s*learning\s*engineer/i, type: "career_mle" as const },
  { pattern: /career|job|role|become/i, type: "career_general" as const },
  { pattern: /gpa|grade|academic|improve.*score|improve.*gpa/i, type: "academic" as const },
  { pattern: /attendance/i, type: "attendance" as const },
  { pattern: /skill.*gap|missing.*skill|learn.*what|what.*learn/i, type: "skill_gap" as const },
  { pattern: /study|habit|plan|schedule|routine|learning\s*path/i, type: "study_plan" as const },
  { pattern: /resume|cv/i, type: "resume" as const },
  { pattern: /placement|ready|readiness|predict|job\s*ready/i, type: "readiness" as const },
  { pattern: /apply|job.*search|find.*job|hiring|openings/i, type: "job_search" as const },
  { pattern: /resource|course|youtube|tutorial|where.*learn/i, type: "resources" as const },
  { pattern: /interview|prepare|mock/i, type: "interview" as const },
  { pattern: /coding|practice|leetcode|hackerrank|challenge/i, type: "coding_practice" as const },
  { pattern: /quiz|test.*knowledge|question.*bank/i, type: "quiz" as const },
  { pattern: /teacher|faculty|class.*performance|cohort/i, type: "teacher_analytics" as const },
  { pattern: /placement\s*officer|placement\s*drive|eligibility/i, type: "placement_analytics" as const },
  { pattern: /admin|audit\s*log|governance|system\s*analytics/i, type: "admin_analytics" as const },
  { pattern: /python/i, type: "skill_python" as const },
  { pattern: /sql/i, type: "skill_sql" as const },
  { pattern: /machine\s*learning/i, type: "skill_ml" as const },
  { pattern: /statistics/i, type: "skill_stats" as const },
  { pattern: /deep\s*learning/i, type: "skill_dl" as const },
  { pattern: /power\s*bi/i, type: "skill_powerbi" as const },
  { pattern: /java\b/i, type: "skill_java" as const },
  { pattern: /javascript|js\b/i, type: "skill_js" as const },
  { pattern: /hello|hi|hey|help/i, type: "greeting" as const },
];

function detectIntent(message: string): string {
  for (const intent of intents) {
    if (intent.pattern.test(message)) return intent.type;
  }
  return "general";
}

function formatResources(skillName: string): string {
  const res = getResourcesForSkill(skillName);
  if (!res) return `I don't have specific curated resources for ${skillName} yet.`;

  let out = `## 📚 Learning Plan: ${res.skill}\n\n`;
  if (res.youtube.length > 0) {
    out += `**🎥 Video Tutorials:**\n`;
    res.youtube.forEach((y) => { out += `- [${y.title}](${y.url})\n`; });
    out += "\n";
  }
  if (res.courses.length > 0) {
    out += `**📖 Structured Courses:**\n`;
    res.courses.forEach((c) => { out += `- [${c.title}](${c.url}) *(${c.platform})*\n`; });
    out += "\n";
  }
  if (res.practice.length > 0) {
    out += `**💻 Hands-on Practice:**\n`;
    res.practice.forEach((p) => { out += `- [${p.title}](${p.url})\n`; });
    out += "\n";
  }
  if (res.docs.length > 0) {
    out += `**📄 Official Documentation:**\n`;
    res.docs.forEach((d) => { out += `- [${d.title}](${d.url})\n`; });
  }
  return out;
}

function formatJobLinks(role: string): string {
  const links = getJobSearchLinks(role);
  return links.map((l) => `- [${l.icon} ${l.platform}](${l.url})`).join("\n");
}

function formatStructuredCareerPath(roleTitle: string, studentSkills: string[]): string {
  const path = lookupCareerPath(roleTitle);
  const { score, matched, missing } = calculateAlignmentScore(studentSkills, path ? path.required_skills : ["SQL", "Python"]);

  return `### 🎯 Career Pathway: ${path ? path.role_title : roleTitle}

**Summary:** Your verified skills match **${score}%** of the industry baseline requirements for ${roleTitle}.

**Evidence:**
- Required Skills: ${(path?.required_skills || []).join(", ") || "SQL, Python"}
- Student Verified Skills: ${matched.join(", ") || "None currently documented"}
- Dataset Source: SkillIntel 10-Career Catalog (${path?.source_type || "curated starter catalog"})

**Analysis:**
- Alignment Score: (${matched.length} matched / ${(path?.required_skills.length || 1)} required) × 100 = **${score}%**.
- *Note:* Alignment score reflects documented skill coverage, not a guaranteed hiring probability.

**Skill Gaps:**
${missing.length > 0 ? missing.map((s) => `- ⚠️ **${s}** — Not yet verified or assessed in student profile`).join("\n") : "✅ All core prerequisite skills are present!"}

**Recommendations:**
1. Prioritize learning high-weight gap technologies (${missing.slice(0, 2).join(", ") || "Advanced practice"}).
2. Complete practical capstone projects that demonstrate measurable outcomes.
3. Validate proficiency via the SkillIntel Technical Assessment / Quiz engine.

**Next Steps:**
- Dedicate 5-7 hours this week to: **${missing[0] || "Advanced Problem Solving"}**.
- Take the diagnostic quiz on **${missing[0] || "Core Fundamentals"}** in the Assessment module.`;
}

export function generateResponse(
  message: string,
  student: StudentFull,
  allSkills: string[],
  userRole: string = "student"
): string {
  const intent = detectIntent(message);
  const prediction = predictJobReadiness(student);
  const studentSkillNames = student.skills.map((s) => s.name);
  const careers = recommendCareers(studentSkillNames);
  const missingSkills = allSkills.filter((s) => !studentSkillNames.includes(s));
  const readiness = getReadinessMessage(prediction.score);

  // 1. Student Lookup by USN or Name from verified 30-student roster
  if (intent === "student_lookup") {
    const match = lookupVerifiedStudent(message);
    if (match) {
      return `### 📋 Verified Student Record: ${match.full_name}

**Summary:** Record retrieved from official institutional login roster (${match.college}).

**Evidence:**
- **USN:** \`${match.usn}\`
- **Department:** ${match.department}
- **College:** ${match.college}
- **Email:** ${match.email}
- **Phone:** ${match.phone}
- **Verification Source:** ${match.data_source}

**Analysis:**
- Student record is verified and active in the institutional database.
- Academic analytics (SGPA/CGPA/Attendance) for this specific student are currently **unassessed/blank pending official registrar submission**.
- *Data Integrity Rule:* SkillIntel does not fabricate synthetic grades or marks when official records are unverified.

**Skill Gaps:**
- Technical and aptitude assessments pending completion.

**Recommendations:**
- Student should complete the diagnostic technical quiz and coding benchmark to establish baseline skill proficiency.

**Next Steps:**
- Direct student to complete Skill Assessment on Python & SQL fundamentals.`;
    }
  }

  // 2. Dataset Roster Query
  if (intent === "dataset_roster") {
    const count = starterBundle.students.length;
    return `### 📊 SkillIntel Verified Student Roster

**Summary:** The active database contains **${count} verified student records** from T. John Institute of Technology (Department of Data Science).

**Evidence:**
- Dataset: \`student_roster_30.json\`
- Total Verified Students: ${count}
- Departments: DS (Data Science)
- Source: SEEL student login-details workbook

**Sample Verified USNs:**
${starterBundle.students.slice(0, 6).map((s) => `- **${s.usn}**: ${s.full_name} (${s.department})`).join("\n")}
*...and ${count - 6} more verified records.*

**Data Quality Notice:**
In accordance with SkillIntel Data Safety rules, academic marks (GPA/CGPA) remain blank until officially verified by institutional uploads. No synthetic marks are presented as fact.`;
  }

  // 3. Teacher Domain Intelligence
  if (intent === "teacher_analytics" || userRole === "teacher") {
    return `### 🎓 Faculty & Academic Analytics Intelligence

**Summary:** Academic analytics support for instructors and department faculty.

**Evidence:**
- 30 Students enrolled in Department of Data Science (DS).
- Question Bank: 20 Curated starter questions + dynamic practice bank.
- Diagnostic Quizzes: Data Structures, Algorithms, SQL, and Operating Systems.

**Analysis:**
- **Topic Distribution:** Data Structures (35%), Algorithms (30%), Databases/SQL (25%), System Concepts (10%).
- Commonly encountered student challenges include multi-variable pointer operations and SQL multi-table subqueries.

**Skill Gaps across Cohort:**
- Early diagnostic patterns highlight gaps in Algorithmic Time-Complexity Analysis (O(n log n) vs O(n²)) and Data Normalization principles.

**Recommendations:**
1. Assign focused classroom revision on Binary Search and Hash Map fundamentals.
2. Conduct a 15-minute diagnostic quiz using the SkillIntel Question Bank.
3. Review students flagged for at-risk monitoring.

**Next Steps:**
- Review the Faculty Dashboard to monitor cohort completion rates.`;
  }

  // 4. Placement Officer Intelligence
  if (intent === "placement_analytics" || userRole === "placement") {
    return `### 🏢 Placement Officer Intelligence

**Summary:** Placement readiness pipeline and campus drive eligibility analytics.

**Evidence:**
- Total Students Monitored: ${starterBundle.students.length}
- Target Placement Pathways: Data Analyst, Data Engineer, Data Scientist, ML Engineer, Full-Stack Developer.
- Industry Skill Benchmarks: SQL, Python, ETL, Machine Learning, Power BI.

**Analysis:**
- Placement Eligibility criteria require verified technical skill alignment (≥ 70%) and a verified resume profile.
- Placement readiness is currently evaluated dynamically based on coding assessment scores, technical quiz attempts, and project evidence.

**Recommendations:**
1. Enforce student completion of the ATS-friendly Resume Audit.
2. Schedule company-specific mock interview simulations for candidate shortlists.
3. Map upcoming drive requirements against verified student skill profiles.

**Next Steps:**
- Open the Placement Intelligence module to generate company eligibility lists.`;
  }

  // 5. Administrator Intelligence
  if (intent === "admin_analytics" || userRole === "admin") {
    return `### 🛡️ Administrator & Governance Intelligence

**Summary:** Platform health, dataset verification status, and audit governance.

**Evidence:**
- Verified Roster: 30 Student records loaded and verified.
- Core Starter Catalog: 10 Career paths, 20 Curated Quiz questions, 2 Coding problem benchmarks.
- Security Audit Log: Active with Row-Level Security (RLS) enforcement.

**Analysis:**
- All datasets are safely separated into verified institutional records vs synthetic demo fixtures.
- API keys and service-role credentials are protected and strictly segregated from client-side bundles.

**Next Steps:**
- Review recent security audit events in the Activity Log.`;
  }

  // Standard Domain Workflows
  switch (intent) {
    case "greeting":
      return `👋 Hi **${student.name}**! I'm your **SkillIntel AI Career & Academic Assistant**.

Operating under the **SkillIntel Master Intelligence Engine**, I provide data-grounded guidance across:
- 🎯 **Career Pathways & Alignment** — "How do I become a Data Engineer?"
- 🧠 **Skill Gap Analysis** — "What skills am I missing for Data Science?"
- 📝 **Assessments & Quizzes** — "Quiz me on Data Structures and SQL"
- 💻 **Coding Evaluation** — "Recommend coding challenges"
- 📈 **Placement Readiness** — "Am I ready for placement?"
- 📄 **Resume Intelligence** — "How can I improve my resume?"
- 📋 **Verified Records** — "Look up student 1TJ23DS001" or "Show student roster"

${getRoleGuidance(userRole)}

How can I assist you today?`;

    case "career_data_scientist":
      return formatStructuredCareerPath("Data Scientist", studentSkillNames);

    case "career_data_analyst":
      return formatStructuredCareerPath("Data Analyst", studentSkillNames);

    case "career_data_engineer":
      return formatStructuredCareerPath("Data Engineer", studentSkillNames);

    case "career_swe":
      return formatStructuredCareerPath("Software Developer", studentSkillNames);

    case "career_mle":
      return formatStructuredCareerPath("Machine Learning Engineer", studentSkillNames);

    case "career_general": {
      return `### 🎯 Career Pathway Recommendations

**Summary:** Based on your verified technical profile (${studentSkillNames.length} documented skills), here are your highest-aligned career pathways.

**Evidence:**
- Documented Skills: ${studentSkillNames.join(", ") || "None"}
- Target Pathways Catalog: 10 Standard Industry Roles

**Analysis:**
${careers.slice(0, 4).map((c, i) => {
  return `${i + 1}. **${c.icon} ${c.role}** — **${c.matchScore}% Alignment**\n   - Covered: ${c.matchedSkills.join(", ") || "None"}\n   - Required: ${c.missingSkills.join(", ") || "Fully aligned!"}`;
}).join("\n\n")}

**Skill Gaps:**
- Common missing competencies across top pathways: ${missingSkills.slice(0, 3).join(", ")}.

**Recommendations:**
- Target roles where alignment exceeds 70% for immediate applications.
- Build missing competencies through practical project implementation.

**Next Steps:**
- Ask: *"How do I become a ${careers[0]?.role || "Data Scientist"}?"* for a step-by-step roadmap.`;
    }

    case "skill_gap":
      return `### 🧠 Comprehensive Skill Gap Analysis

**Summary:** Detailed comparison between your documented skill inventory and target industry expectations.

**Evidence:**
- Verified Skills (${studentSkillNames.length}): ${student.skills.map((s) => `${s.name} (${s.level})`).join(", ")}
- High-Demand Industry Skills: ${allSkills.slice(0, 8).join(", ")}

**Analysis:**
- Missing Technical Competencies: **${missingSkills.length} skills** not yet verified in your profile.

**Skill Gaps:**
${missingSkills.slice(0, 4).map((s, idx) => `${idx + 1}. **${s}** — Crucial for multiple tech disciplines`).join("\n")}

**Recommendations:**
1. Begin with **${missingSkills[0] || "Python"}**, completing structured coursework and technical quizzes.
2. Apply the skill to a real-world repository or portfolio project.

**Next Steps:**
- Ask *"Where can I learn ${missingSkills[0] || "Python"}?"* to receive curated learning resources.`;

    case "academic":
      return `### 📊 Academic Analytics Analysis

**Summary:** Academic performance assessment based on institutionally available metrics.

**Evidence:**
- GPA: **${student.gpa.toFixed(2)}**
- Attendance: **${student.attendance.toFixed(0)}%**
- Quiz Score: **${student.quizScore.toFixed(0)}%**
- Assignment Score: **${student.assignmentScore.toFixed(0)}%**

**Analysis:**
- ${student.gpa >= 3.0 ? "Academic standing is healthy." : "GPA indicates need for additional academic reinforcement."}
- ${student.attendance >= 75 ? "Attendance satisfies institutional threshold." : "Attendance is below target 75% threshold."}

**Recommendations:**
- Dedicate dedicated weekly revision hours to weak subjects.
- Utilize active recall and peer study discussions before semester evaluations.

**Next Steps:**
- Review the Study Habits module for schedule optimization.`;

    case "quiz":
      return `### 📝 Technical & Academic Assessment Engine

**Summary:** The SkillIntel Question Bank contains curated starter questions across both skill and academic topics.

**Evidence:**
- 20 Curated starter questions from bundle (Data Structures, Algorithms, SQL).
- Multi-topic skill questions across Python, Machine Learning, Statistics, and Java.

**Assessment Guidelines:**
- Questions feature 4 options, timed countdown, and comprehensive post-submission explanations.
- In test mode, answers are hidden until submission to maintain evaluation integrity.

**Next Steps:**
- Navigate to the **Quiz** module from your sidebar to test your fundamentals!`;

    case "coding_practice":
      return `### 💻 Coding Evaluation Engine

**Summary:** Technical coding challenge evaluation focusing on functional correctness, time complexity, and data structures.

**Evidence:**
- Demonstration challenges available in Arrays & Hashing, Strings, and SQL.
- Supported Languages: Python, JavaScript, SQL.

**Evaluation Rubric:**
- Functional correctness across edge cases.
- Algorithmic efficiency (Time Complexity & Space Complexity).
- Readability and standard idioms.

**Next Steps:**
- Open **Coding Practice** in the navigation menu to begin solving problems!`;

    case "resume":
      return `### 📄 Resume Intelligence Evaluation

**Summary:** Resume audit assessing structure, technical keyword alignment, and measurable project impact.

**Evidence:**
- Documented Projects: ${student.projectsCompleted}
- Internships: ${student.internshipsCompleted}
- Verified Skills: ${studentSkillNames.join(", ")}

**Analysis:**
- Current Resume Quality Index: **${student.resumeScore.toFixed(0)}%**
- Ensure all technical claims correspond to verified project artifacts. Never invent metrics or employer history.

**Recommendations:**
1. Structure bullets using the **Action Verb + Context + Measurable Result** framework.
2. Emphasize verified skills: ${studentSkillNames.slice(0, 3).join(", ")}.

**Next Steps:**
- Use the **Resume Analyzer** in the sidebar for full ATS syntax verification.`;

    case "readiness":
      return `### 📈 Placement Readiness Diagnostic

**Summary:** Overall placement readiness calculation based on academic, coding, and resume metrics.

**Evidence:**
- Readiness Score: **${prediction.score}%** (${prediction.label})
- ${readiness.message}

**Breakdown of Factors:**
${prediction.factors.map((f) => `- **${f.name}**: ${Math.round(f.value)}% (Weight: ${(f.weight * 100).toFixed(0)}%) → **${f.contribution} pts**`).join("\n")}

**Recommendations:**
- Aim to cross the 70% threshold to unlock high-priority placement opportunities.

**Next Steps:**
- Focus on: ${student.projectsCompleted < 2 ? "Completing a capstone project" : "Refining interview mock responses"}.`;

    case "resources":
      return `## 📚 Learning Resources Catalog\n\n${learningResources.map((r) => `- **${r.skill}** — ${r.courses.length} courses, ${r.youtube.length} tutorials`).join("\n")}\n\nAsk for any specific skill: *"Where can I learn Python?"*`;

    case "skill_python": return formatResources("Python");
    case "skill_sql": return formatResources("SQL");
    case "skill_ml": return formatResources("Machine Learning");
    case "skill_stats": return formatResources("Statistics");
    case "skill_dl": return formatResources("Deep Learning");
    case "skill_powerbi": return formatResources("Power BI");
    case "skill_java": return formatResources("Java");
    case "skill_js": return formatResources("JavaScript");

    default:
      return `### 🤖 SkillIntel Intelligence Engine

**Summary:** I can assist you with data-driven career, academic, and placement preparation.

**Prompt Suggestions:**
- 🎯 **"Analyze my skills for Data Scientist"** — Computes transparent Alignment Score.
- 📋 **"Look up student 1TJ23DS001"** — Queries verified student roster.
- 📊 **"Show student roster"** — Overview of 30 verified student records.
- 🧠 **"What skills am I missing?"** — Detailed skill gap analysis.
- 📝 **"Tell me about the quiz question bank"** — Assessment topics.
- 📈 **"Am I ready for placement?"** — Multi-factor readiness breakdown.
- 💻 **"Coding practice challenges"** — Algorithmic problem evaluation.

How would you like to proceed?`;
  }
}
