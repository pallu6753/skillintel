import type { StudentFull } from "./data-loader";
import { recommendCareers, predictJobReadiness } from "./career-engine";
import { getResourcesForSkill, learningResources } from "./learning-resources";
import { getJobSearchLinks, getReadinessMessage } from "./job-discovery";

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
  { pattern: /study|habit|plan|schedule|routine|learning\s*path/i, type: "study_plan" as const },
  { pattern: /resume|cv/i, type: "resume" as const },
  { pattern: /placement|ready|readiness|predict|job\s*ready/i, type: "readiness" as const },
  { pattern: /apply|job.*search|find.*job|hiring|openings/i, type: "job_search" as const },
  { pattern: /resource|course|youtube|tutorial|where.*learn/i, type: "resources" as const },
  { pattern: /interview|prepare|mock/i, type: "interview" as const },
  { pattern: /coding|practice|leetcode|hackerrank|challenge/i, type: "coding_practice" as const },
  { pattern: /quiz|test.*knowledge/i, type: "quiz" as const },
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
    out += "\n";
  }
  if (res.docs.length > 0) {
    out += `**📄 Documentation:**\n`;
    res.docs.forEach((d) => { out += `- [${d.title}](${d.url})\n`; });
  }
  return out;
}

function formatJobLinks(role: string): string {
  const links = getJobSearchLinks(role);
  return links.map((l) => `- [${l.icon} ${l.platform}](${l.url})`).join("\n");
}

function formatCareerDetail(role: string, careers: ReturnType<typeof recommendCareers>, prediction: ReturnType<typeof predictJobReadiness>): string {
  const match = careers.find((c) => c.role === role);
  if (!match) return "I couldn't find that career role in my database.";

  let resp = `## ${match.icon} Becoming a ${match.role}\n\n`;
  resp += `**Your match score: ${match.matchScore}%**\n\n`;
  resp += `### What is a ${match.role}?\n`;

  const descriptions: Record<string, string> = {
    "Data Scientist": "Data Scientists analyze complex data using statistics and machine learning to extract insights and build predictive models. They work with Python, SQL, and visualization tools.",
    "Data Analyst": "Data Analysts interpret data to help organizations make better decisions. They use SQL, Excel, Power BI, and Python to clean, analyze, and visualize data.",
    "Machine Learning Engineer": "ML Engineers design and deploy machine learning models at scale. They bridge the gap between data science and software engineering.",
    "Software Engineer": "Software Engineers design, develop, and maintain software systems. They write clean, efficient code and collaborate in teams using agile methodologies.",
    "Business Intelligence Analyst": "BI Analysts transform data into actionable business insights using dashboards, reports, and data visualization tools.",
    "AI Researcher": "AI Researchers push the boundaries of artificial intelligence through novel algorithms, architectures, and theoretical contributions.",
    "Database Administrator": "DBAs manage and optimize databases to ensure data integrity, security, and performance.",
    "Technical Consultant": "Technical Consultants advise organizations on technology solutions, combining technical knowledge with communication skills.",
  };
  resp += (descriptions[role] || "A highly sought-after role in the tech industry.") + "\n\n";

  resp += `### Skills Analysis\n`;
  resp += `**Skills you have:** ${match.matchedSkills.join(", ") || "None yet"}\n`;
  resp += `**Skills you need:** ${match.missingSkills.join(", ") || "All covered! 🎉"}\n\n`;

  if (match.missingSkills.length > 0) {
    resp += `### 📋 Recommended Learning Path\n\n`;
    match.missingSkills.forEach((s, i) => {
      resp += `**Step ${i + 1}: Learn ${s}**\n`;
      const res = getResourcesForSkill(s);
      if (res) {
        if (res.youtube[0]) resp += `  - 🎥 [${res.youtube[0].title}](${res.youtube[0].url})\n`;
        if (res.courses[0]) resp += `  - 📖 [${res.courses[0].title}](${res.courses[0].url})\n`;
        if (res.practice[0]) resp += `  - 💻 [${res.practice[0].title}](${res.practice[0].url})\n`;
      }
      resp += "\n";
    });
  }

  resp += `### 📊 Your Readiness\n`;
  resp += `Placement Score: **${prediction.score}%** — ${prediction.label}\n\n`;

  if (match.matchScore >= 70 || prediction.score >= 70) {
    resp += `### 🚀 Ready to Apply!\n`;
    resp += `You're well-prepared for ${match.role} roles. Start applying:\n\n`;
    resp += formatJobLinks(match.role) + "\n";
  } else {
    resp += `### 🔎 Explore Job Listings\n`;
    resp += `While you build your skills, explore what companies are looking for:\n\n`;
    resp += formatJobLinks(match.role) + "\n";
  }

  return resp;
}

export function generateResponse(message: string, student: StudentFull, allSkills: string[]): string {
  const intent = detectIntent(message);
  const prediction = predictJobReadiness(student);
  const studentSkillNames = student.skills.map((s) => s.name);
  const careers = recommendCareers(studentSkillNames);
  const missingSkills = allSkills.filter((s) => !studentSkillNames.includes(s));
  const readiness = getReadinessMessage(prediction.score);

  switch (intent) {
    case "greeting":
      return `👋 Hi **${student.name}**! I'm your SkillIntel AI Copilot.\n\nI can help you with:\n- 🎯 **Career guidance** — "How can I become a Data Scientist?"\n- 📊 **Academic tips** — "How can I improve my GPA?"\n- 🧠 **Skill gap analysis** — "What skills am I missing?"\n- 📚 **Learning resources** — "Where can I learn Python?"\n- 📈 **Placement readiness** — "Am I ready for placement?"\n- 🔍 **Job search** — "Find jobs for me"\n- 🎤 **Interview prep** — "Help me prepare for interviews"\n- 💻 **Coding practice** — "Suggest coding challenges"\n- 📅 **Study plans** — "Make a study plan for Data Science"\n\nWhat would you like to know?`;

    case "career_general": {
      let resp = `## 🎯 Your Career Recommendations\n\nBased on your ${studentSkillNames.length} skills, here are your top matches:\n\n`;
      resp += careers.slice(0, 5).map((c, i) => {
        const ready = c.matchScore >= 70;
        return `${i + 1}. **${c.icon} ${c.role}** — ${c.matchScore}% match ${ready ? "✅ Job Ready" : ""}\n   ✅ Have: ${c.matchedSkills.join(", ") || "None"}\n   ❌ Need: ${c.missingSkills.join(", ") || "All covered!"}`;
      }).join("\n\n");
      resp += `\n\n### 📈 Placement Status: ${prediction.score}% — ${prediction.label}\n${readiness.message}\n`;
      const topReady = careers.find((c) => c.matchScore >= 70);
      if (topReady) {
        resp += `\n### 🚀 Apply Now for ${topReady.role}:\n${formatJobLinks(topReady.role)}\n`;
      }
      resp += `\n💡 Ask me about any specific role for a detailed learning path!`;
      return resp;
    }

    case "career_data_scientist":
      return formatCareerDetail("Data Scientist", careers, prediction);

    case "career_data_analyst":
      return formatCareerDetail("Data Analyst", careers, prediction);

    case "career_swe":
      return formatCareerDetail("Software Engineer", careers, prediction);

    case "career_mle":
      return formatCareerDetail("Machine Learning Engineer", careers, prediction);

    case "job_search": {
      let resp = `## 🔍 Job Search\n\n`;
      resp += `**Your Readiness: ${prediction.score}%** — ${readiness.message}\n\n`;
      if (prediction.score >= 70) {
        resp += `You're ready to apply! Here are job search links for your top matches:\n\n`;
        careers.slice(0, 3).forEach((c) => {
          resp += `### ${c.icon} ${c.role} (${c.matchScore}% match)\n`;
          resp += formatJobLinks(c.role) + "\n\n";
        });
      } else {
        resp += `You're building up — here are listings to explore and set goals:\n\n`;
        careers.slice(0, 2).forEach((c) => {
          resp += `### ${c.icon} ${c.role} (${c.matchScore}% match)\n`;
          resp += formatJobLinks(c.role) + "\n\n";
        });
        resp += `### 💡 To become job-ready:\n`;
        resp += missingSkills.slice(0, 3).map((s) => `- Learn **${s}**`).join("\n");
      }
      return resp;
    }

    case "interview":
      return `## 🎤 Interview Preparation\n\nUse the **Interview Simulator** in the sidebar to practice with AI-evaluated questions!\n\n### Available Interview Types:\n- **Technical** — System design, algorithms, concepts\n- **HR** — Behavioral & situational questions\n- **Coding** — Problem solving & data structures\n- **Data Science** — ML, statistics, data analysis\n\n### Tips for Your Profile:\n${student.skills.length >= 3 ? "✅ You have enough skills for technical rounds" : "⚠️ Build more skills for technical interviews"}\n${prediction.score >= 70 ? "✅ Your profile is strong for HR rounds" : "⚠️ Work on projects to discuss in HR rounds"}\n\n### Recommended Prep:\n1. Practice **2-3 coding problems** daily\n2. Review **system design** concepts\n3. Prepare **STAR method** answers for HR\n4. Mock interviews with peers\n\nGo to **Interview Prep** in the sidebar to start! →`;

    case "coding_practice":
      return `## 💻 Coding Practice Recommendations\n\nUse the **Coding Practice** module in the sidebar!\n\n### Recommended Topics for You:\n${studentSkillNames.includes("Python") ? "- **Python Challenges** — Strengthen your strongest skill\n" : "- **Python Basics** — Start learning Python\n"}${studentSkillNames.includes("SQL") ? "- **SQL Queries** — Practice database problems\n" : "- **SQL Queries** — Essential for data roles\n"}- **Arrays & Strings** — Core interview problems\n- **ML Concepts** — Applied machine learning\n\n### Study Plan:\n- **Easy**: Start here (build confidence)\n- **Medium**: After solving 5+ easy problems\n- **Hard**: When preparing for top companies\n\nGo to **Coding Practice** in the sidebar! →`;

    case "quiz":
      return `## 📝 Quiz Recommendations\n\nThe **Dynamic Quiz System** supports:\n- **Skill Quizzes** — Python, SQL, ML, Statistics, and more\n- **Academic Quizzes** — Data Structures, DBMS, OS, Networks\n\n### Features:\n- Randomized questions each time\n- Difficulty selection (Easy / Medium / Hard)\n- Countdown timer\n- Detailed explanations\n- Score tracking\n\nGo to your Dashboard and start a quiz! →`;

    case "academic":
      return `## 📊 Your Academic Analysis\n\n| Metric | Score |\n|--------|-------|\n| GPA | **${student.gpa.toFixed(2)}** |\n| Attendance | **${student.attendance.toFixed(0)}%** |\n| Quiz Score | **${student.quizScore.toFixed(0)}%** |\n| Assignment | **${student.assignmentScore.toFixed(0)}%** |\n| Exam Score | **${student.examScore.toFixed(0)}%** |\n\n### 💡 Suggestions:\n\n${student.gpa < 3.0 ? "⚠️ Your GPA needs improvement. Focus on assignments and exam preparation.\n" : "✅ Your GPA is good! Keep it up.\n"}${student.attendance < 75 ? "⚠️ Improve attendance — aim for 80%+.\n" : "✅ Attendance is healthy.\n"}${student.quizScore < 60 ? "⚠️ Practice more quizzes to strengthen fundamentals.\n" : "✅ Quiz performance is solid.\n"}\n### 📖 Study Tips:\n1. **Review weak subjects** weekly\n2. **Practice past papers** before exams\n3. **Join study groups** for collaborative learning\n4. **Use active recall** instead of passive reading`;

    case "attendance":
      return `## 📋 Attendance Analysis\n\nYour attendance: **${student.attendance.toFixed(1)}%**\n\n${student.attendance >= 80 ? "✅ Excellent! You're above the recommended 80% threshold." : student.attendance >= 60 ? "⚠️ Your attendance is moderate. Try to reach 80%+ for better academic outcomes." : "🚨 **Critical!** Your attendance is below 60%. This puts you at risk."}\n\n### Why Attendance Matters:\n- Universities often have **75% minimum** attendance requirements\n- Higher attendance correlates with **better GPA**\n- Companies check attendance during placement verification`;

    case "skill_gap":
      return `## 🧠 Your Skill Gap Analysis\n\n**Your Skills (${studentSkillNames.length}):**\n${student.skills.map((s) => `- ${s.name} — *${s.level}*`).join("\n")}\n\n**Missing Skills (${missingSkills.length}):**\n${missingSkills.map((s) => `- ❌ ${s}`).join("\n")}\n\n### 🎯 Priority Skills to Learn:\n${missingSkills.slice(0, 3).map((s, i) => `**${i + 1}. ${s}** — High demand in industry`).join("\n")}\n\nWant resources for any of these? Just ask: *"How do I learn ${missingSkills[0] || "Python"}?"*`;

    case "study_plan": {
      const topCareer = careers[0];
      const skillsToLearn = topCareer?.missingSkills.slice(0, 4) || missingSkills.slice(0, 4);
      let resp = `## 📅 Personalized Learning Path\n\nBased on your goal of becoming a **${topCareer?.role || "Tech Professional"}** (${topCareer?.matchScore || 0}% match):\n\n`;
      skillsToLearn.forEach((s, i) => {
        const res = getResourcesForSkill(s);
        resp += `### Week ${i + 1}: ${s}\n`;
        if (res) {
          if (res.youtube[0]) resp += `- 🎥 Watch: [${res.youtube[0].title}](${res.youtube[0].url})\n`;
          if (res.courses[0]) resp += `- 📖 Course: [${res.courses[0].title}](${res.courses[0].url})\n`;
          if (res.practice[0]) resp += `- 💻 Practice: [${res.practice[0].title}](${res.practice[0].url})\n`;
        }
        resp += `- 📝 Take a quiz on ${s}\n\n`;
      });
      resp += `### Daily Schedule:\n`;
      resp += `| Time | Activity |\n|------|----------|\n`;
      resp += `| Morning | Study theory (1-2 hrs) |\n`;
      resp += `| Afternoon | Coding practice (1 hr) |\n`;
      resp += `| Evening | Projects & revision (1 hr) |\n\n`;
      resp += `⏰ **${student.attendance < 75 ? "6-7 hours/day" : "4-5 hours/day"}** of focused study recommended.`;
      return resp;
    }

    case "resume":
      return `## 📄 Resume Tips\n\nYour resume score: **${student.resumeScore.toFixed(0)}%**\n\n### What to include:\n1. **Contact info** — Email, LinkedIn, GitHub\n2. **Skills section** — List: ${studentSkillNames.join(", ")}\n3. **Projects** — You've completed ${student.projectsCompleted} projects\n4. **Internships** — ${student.internshipsCompleted} internship(s)\n5. **Education** — GPA: ${student.gpa.toFixed(2)}\n\n### Tips to improve:\n- Use **action verbs**: Developed, Implemented, Designed\n- Keep it **1 page** for freshers\n- Add **metrics**: "Improved accuracy by 15%"\n- Use the **Resume Analyzer** in the sidebar for detailed feedback!\n\n${student.resumeScore < 60 ? "⚠️ Your resume needs significant improvement." : "✅ Your resume is in good shape!"}`;

    case "readiness": {
      let resp = `## 📈 Placement Readiness Analysis\n\n**AI Readiness Score: ${prediction.score}%**\n**Status: ${prediction.label}**\n\n${readiness.message}\n\n### Score Breakdown:\n| Factor | Score | Weight | Points |\n|--------|-------|--------|--------|\n`;
      prediction.factors.forEach((f) => {
        resp += `| ${f.name} | ${Math.round(f.value)}% | ${(f.weight * 100).toFixed(0)}% | ${f.contribution} pts |\n`;
      });
      resp += "\n";
      if (prediction.score >= 70) {
        resp += `### 🚀 You're Job Ready!\nStart applying for your top matches:\n\n`;
        careers.slice(0, 3).forEach((c) => {
          if (c.matchScore >= 50) {
            resp += `**${c.icon} ${c.role}** (${c.matchScore}%):\n`;
            resp += formatJobLinks(c.role) + "\n\n";
          }
        });
      } else {
        resp += `### 💡 How to improve:\n`;
        if (student.skills.length < 4) resp += `- Learn more skills (currently ${student.skills.length})\n`;
        if (student.projectsCompleted < 3) resp += `- Complete more projects (currently ${student.projectsCompleted})\n`;
        if (student.gpa < 3.0) resp += `- Improve GPA (currently ${student.gpa.toFixed(2)})\n`;
        if (student.internshipsCompleted < 1) resp += `- Get an internship\n`;
      }
      return resp;
    }

    case "resources":
      return `## 📚 Learning Resources\n\nHere are all the skills you can learn:\n\n${learningResources.map((r) => `- **${r.skill}** — ${r.courses.length} courses, ${r.youtube.length} videos`).join("\n")}\n\nAsk me about any specific skill! For example:\n- *"How do I learn Python?"*\n- *"Resources for Machine Learning"*\n- *"Where can I learn SQL?"*`;

    case "skill_python": return formatResources("Python");
    case "skill_sql": return formatResources("SQL");
    case "skill_ml": return formatResources("Machine Learning");
    case "skill_stats": return formatResources("Statistics");
    case "skill_dl": return formatResources("Deep Learning");
    case "skill_powerbi": return formatResources("Power BI");
    case "skill_java": return formatResources("Java");
    case "skill_js": return formatResources("JavaScript");

    default:
      return `I understand you're asking about *"${message}"*.\n\nHere's what I can help with:\n\n- 🎯 **"What career should I pursue?"** — Career matching\n- 📊 **"How can I improve my GPA?"** — Academic guidance\n- 🧠 **"What skills am I missing?"** — Skill gap analysis\n- 📚 **"Where can I learn Python?"** — Learning resources\n- 📈 **"Am I ready for placement?"** — Readiness assessment\n- 🔍 **"Find jobs for me"** — Job discovery links\n- 🎤 **"Prepare for interviews"** — Interview prep\n- 💻 **"Coding challenges"** — Practice recommendations\n- 📅 **"Make me a study plan"** — Personalized learning path\n- 📄 **"Resume tips"** — Resume improvement\n\nYour current profile: **${studentSkillNames.length} skills** | **GPA ${student.gpa.toFixed(1)}** | **Readiness ${prediction.score}%**\n\nTry asking one of these!`;
  }
}
