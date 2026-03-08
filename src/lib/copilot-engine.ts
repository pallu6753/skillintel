import type { StudentFull } from "./data-loader";
import { recommendCareers, predictJobReadiness } from "./career-engine";
import { getResourcesForSkill, learningResources } from "./learning-resources";

export interface CopilotMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

// Intent detection patterns
const intents = [
  { pattern: /data\s*scien/i, type: "career_data_scientist" as const },
  { pattern: /data\s*analy/i, type: "career_data_analyst" as const },
  { pattern: /software\s*engineer/i, type: "career_swe" as const },
  { pattern: /ml\s*engineer|machine\s*learning\s*engineer/i, type: "career_mle" as const },
  { pattern: /career|job|role|become/i, type: "career_general" as const },
  { pattern: /gpa|grade|academic|improve.*score|improve.*gpa/i, type: "academic" as const },
  { pattern: /attendance/i, type: "attendance" as const },
  { pattern: /skill.*gap|missing.*skill|learn.*what|what.*learn/i, type: "skill_gap" as const },
  { pattern: /study|habit|plan|schedule|routine/i, type: "study_plan" as const },
  { pattern: /resume|cv/i, type: "resume" as const },
  { pattern: /placement|ready|readiness|predict/i, type: "readiness" as const },
  { pattern: /resource|course|youtube|tutorial|where.*learn/i, type: "resources" as const },
  { pattern: /python/i, type: "skill_python" as const },
  { pattern: /sql/i, type: "skill_sql" as const },
  { pattern: /machine\s*learning/i, type: "skill_ml" as const },
  { pattern: /statistics/i, type: "skill_stats" as const },
  { pattern: /deep\s*learning/i, type: "skill_dl" as const },
  { pattern: /power\s*bi/i, type: "skill_powerbi" as const },
  { pattern: /hello|hi|hey|help/i, type: "greeting" as const },
];

function detectIntent(message: string): string {
  for (const intent of intents) {
    if (intent.pattern.test(message)) return intent.type;
  }
  return "unknown";
}

function formatResources(skillName: string): string {
  const res = getResourcesForSkill(skillName);
  if (!res) return `I don't have specific resources for ${skillName} yet.`;

  let out = `## 📚 Learn ${res.skill}\n\n`;
  if (res.youtube.length > 0) {
    out += `**🎥 YouTube:**\n`;
    res.youtube.forEach((y) => { out += `- [${y.title}](${y.url})\n`; });
    out += "\n";
  }
  if (res.courses.length > 0) {
    out += `**📖 Courses:**\n`;
    res.courses.forEach((c) => { out += `- [${c.title}](${c.url}) *(${c.platform})*\n`; });
    out += "\n";
  }
  if (res.practice.length > 0) {
    out += `**💻 Practice:**\n`;
    res.practice.forEach((p) => { out += `- [${p.title}](${p.url})\n`; });
  }
  return out;
}

export function generateResponse(message: string, student: StudentFull, allSkills: string[]): string {
  const intent = detectIntent(message);
  const prediction = predictJobReadiness(student);
  const studentSkillNames = student.skills.map((s) => s.name);
  const careers = recommendCareers(studentSkillNames);
  const missingSkills = allSkills.filter((s) => !studentSkillNames.includes(s));

  switch (intent) {
    case "greeting":
      return `👋 Hi **${student.name}**! I'm your SkillIntel AI Copilot.\n\nI can help you with:\n- 🎯 **Career guidance** — "How can I become a Data Scientist?"\n- 📊 **Academic tips** — "How can I improve my GPA?"\n- 🧠 **Skill gap analysis** — "What skills am I missing?"\n- 📚 **Learning resources** — "Where can I learn Python?"\n- 📈 **Placement readiness** — "Am I ready for placement?"\n- 📖 **Study plans** — "Make a study plan for Data Science"\n\nWhat would you like to know?`;

    case "career_general":
      return `## 🎯 Your Career Recommendations\n\nBased on your ${studentSkillNames.length} skills, here are your top matches:\n\n${careers.slice(0, 5).map((c, i) => `${i + 1}. **${c.icon} ${c.role}** — ${c.matchScore}% match\n   ✅ Have: ${c.matchedSkills.join(", ") || "None"}\n   ❌ Need: ${c.missingSkills.join(", ") || "All covered!"}`).join("\n\n")}\n\n💡 **Tip:** Focus on learning **${careers[0]?.missingSkills[0] || "advanced topics"}** to boost your top match!`;

    case "career_data_scientist": {
      const ds = careers.find((c) => c.role === "Data Scientist");
      let resp = `## 🧪 Becoming a Data Scientist\n\n`;
      if (ds) {
        resp += `Your match score: **${ds.matchScore}%**\n\n`;
        resp += `**Skills you have:** ${ds.matchedSkills.join(", ") || "None yet"}\n`;
        resp += `**Skills you need:** ${ds.missingSkills.join(", ") || "All covered! 🎉"}\n\n`;
        if (ds.missingSkills.length > 0) {
          resp += `### 📋 Recommended Learning Path:\n\n`;
          ds.missingSkills.forEach((s, i) => { resp += `**Step ${i + 1}:** Learn ${s}\n`; });
          resp += "\n";
          ds.missingSkills.forEach((s) => { resp += formatResources(s) + "\n"; });
        }
      }
      return resp;
    }

    case "career_data_analyst": {
      const da = careers.find((c) => c.role === "Data Analyst");
      let resp = `## 📊 Becoming a Data Analyst\n\n`;
      if (da) {
        resp += `Your match score: **${da.matchScore}%**\n\n`;
        resp += `**Skills you have:** ${da.matchedSkills.join(", ") || "None yet"}\n`;
        resp += `**Skills you need:** ${da.missingSkills.join(", ") || "All covered! 🎉"}\n\n`;
        if (da.missingSkills.length > 0) {
          resp += `### 📋 Learning Path:\n\n`;
          da.missingSkills.forEach((s, i) => { resp += `**Step ${i + 1}:** Learn ${s}\n`; });
          resp += "\n";
          da.missingSkills.forEach((s) => { resp += formatResources(s) + "\n"; });
        }
      }
      return resp;
    }

    case "career_swe":
    case "career_mle": {
      const roleName = intent === "career_swe" ? "Software Engineer" : "Machine Learning Engineer";
      const match = careers.find((c) => c.role === roleName);
      let resp = `## 💻 Becoming a ${roleName}\n\n`;
      if (match) {
        resp += `Your match score: **${match.matchScore}%**\n\n`;
        resp += `**Have:** ${match.matchedSkills.join(", ") || "None"}\n**Need:** ${match.missingSkills.join(", ") || "All covered!"}\n\n`;
        match.missingSkills.forEach((s) => { resp += formatResources(s) + "\n"; });
      }
      return resp;
    }

    case "academic":
      return `## 📊 Your Academic Analysis\n\n| Metric | Score |\n|--------|-------|\n| GPA | **${student.gpa.toFixed(2)}** |\n| Attendance | **${student.attendance.toFixed(0)}%** |\n| Quiz Score | **${student.quizScore.toFixed(0)}%** |\n| Assignment | **${student.assignmentScore.toFixed(0)}%** |\n| Exam Score | **${student.examScore.toFixed(0)}%** |\n\n### 💡 Suggestions:\n\n${student.gpa < 3.0 ? "⚠️ Your GPA needs improvement. Focus on assignments and exam preparation.\n" : "✅ Your GPA is good! Keep it up.\n"}${student.attendance < 75 ? "⚠️ Improve attendance — aim for 80%+.\n" : "✅ Attendance is healthy.\n"}${student.quizScore < 60 ? "⚠️ Practice more quizzes to strengthen fundamentals.\n" : "✅ Quiz performance is solid.\n"}\n### 📖 Study Tips:\n1. **Review weak subjects** weekly\n2. **Practice past papers** before exams\n3. **Join study groups** for collaborative learning\n4. **Use active recall** instead of passive reading`;

    case "attendance":
      return `## 📋 Attendance Analysis\n\nYour attendance: **${student.attendance.toFixed(1)}%**\n\n${student.attendance >= 80 ? "✅ Excellent! You're above the recommended 80% threshold." : student.attendance >= 60 ? "⚠️ Your attendance is moderate. Try to reach 80%+ for better academic outcomes." : "🚨 **Critical!** Your attendance is below 60%. This puts you at risk."}\n\n### Why Attendance Matters:\n- Universities often have **75% minimum** attendance requirements\n- Higher attendance correlates with **better GPA**\n- Companies check attendance during placement verification`;

    case "skill_gap":
      return `## 🧠 Your Skill Gap Analysis\n\n**Your Skills (${studentSkillNames.length}):**\n${student.skills.map((s) => `- ${s.name} — *${s.level}*`).join("\n")}\n\n**Missing Skills (${missingSkills.length}):**\n${missingSkills.map((s) => `- ❌ ${s}`).join("\n")}\n\n### 🎯 Priority Skills to Learn:\n${missingSkills.slice(0, 3).map((s, i) => `**${i + 1}. ${s}** — High demand in industry`).join("\n")}\n\nWant resources for any of these? Just ask: *"How do I learn ${missingSkills[0] || "Python"}?"*`;

    case "study_plan":
      return `## 📅 Personalized Study Plan\n\nBased on your profile, here's a 4-week plan:\n\n### Week 1: Strengthen Fundamentals\n- Review ${missingSkills[0] || "Python"} basics (2 hrs/day)\n- Complete 5 practice problems\n- Attend all classes\n\n### Week 2: Build Skills\n- Start ${missingSkills[1] || "SQL"} course\n- Work on a mini-project\n- Take practice quizzes\n\n### Week 3: Apply Knowledge\n- Begin ${missingSkills[2] || "Machine Learning"} fundamentals\n- Start a portfolio project\n- Practice coding daily (1 hr)\n\n### Week 4: Review & Prepare\n- Revise all topics\n- Update resume with new skills\n- Take mock interviews\n\n⏰ **Recommended:** ${student.attendance < 75 ? "6-7 hours/day" : "4-5 hours/day"} of focused study`;

    case "resume":
      return `## 📄 Resume Tips\n\nYour resume score: **${student.resumeScore.toFixed(0)}%**\n\n### What to include:\n1. **Contact info** — Email, LinkedIn, GitHub\n2. **Skills section** — List: ${studentSkillNames.join(", ")}\n3. **Projects** — You've completed ${student.projectsCompleted} projects\n4. **Internships** — ${student.internshipsCompleted} internship(s)\n5. **Education** — GPA: ${student.gpa.toFixed(2)}\n\n### Tips to improve:\n- Use **action verbs**: Developed, Implemented, Designed\n- Keep it **1 page** for freshers\n- Add **metrics**: "Improved accuracy by 15%"\n- Use the **Resume Analyzer** in the sidebar for detailed feedback!\n\n${student.resumeScore < 60 ? "⚠️ Your resume needs significant improvement." : "✅ Your resume is in good shape!"}`;

    case "readiness":
      return `## 📈 Placement Readiness Analysis\n\n**AI Readiness Score: ${prediction.score}%**\n**Status: ${prediction.label}**\n\n### Score Breakdown:\n${prediction.factors.map((f) => `| ${f.name} | ${f.contribution} pts (${Math.round(f.value)}% × ${(f.weight * 100).toFixed(0)}% weight) |`).join("\n")}\n\n${prediction.score >= 70 ? "✅ You're on track for placement! Keep building your portfolio." : prediction.score >= 50 ? "⚠️ You're making progress. Focus on:\n- Improving ${prediction.factors.filter(f => f.value < 60).map(f => f.name).join(", ")}" : "🚨 You need significant improvement. Priority areas:\n- " + prediction.factors.filter(f => f.value < 50).map(f => f.name).join("\n- ")}`;

    case "resources":
      return `## 📚 Learning Resources\n\nHere are all the skills you can learn:\n\n${learningResources.map((r) => `- **${r.skill}** — ${r.courses.length} courses, ${r.youtube.length} videos`).join("\n")}\n\nAsk me about any specific skill! For example:\n- *"How do I learn Python?"*\n- *"Resources for Machine Learning"*\n- *"Where can I learn SQL?"*`;

    case "skill_python": return formatResources("Python");
    case "skill_sql": return formatResources("SQL");
    case "skill_ml": return formatResources("Machine Learning");
    case "skill_stats": return formatResources("Statistics");
    case "skill_dl": return formatResources("Deep Learning");
    case "skill_powerbi": return formatResources("Power BI");

    default:
      return `I understand you're asking about *"${message}"*.\n\nHere are some things I can help with:\n\n- 🎯 **"What career should I pursue?"**\n- 📊 **"How can I improve my GPA?"**\n- 🧠 **"What skills am I missing?"**\n- 📚 **"Where can I learn Python?"**\n- 📈 **"Am I ready for placement?"**\n- 📅 **"Make me a study plan"**\n- 📄 **"Resume tips"**\n\nTry asking one of these!`;
  }
}
