import { describe, it, expect, beforeEach } from "vitest";
import { predictJobReadiness } from "@/lib/career-engine";
import type { StudentFull } from "@/lib/data-loader";
import {
  calculateJobMatch,
  discoverAndMatchJobs,
  analyzeCustomJobPosting,
  verifiedJobPool,
  JobOpportunity,
} from "@/lib/job-discovery/matching-engine";
import {
  getIntegrations,
  verifyLinkedInProfile,
  verifyHackerRankProfile,
  verifyLeetCodeProfile,
  disconnectIntegration,
  getAllConnectedSkills,
} from "@/lib/integrations/platform-integrations";

// Sample verified mock student
const mockStudent: StudentFull = {
  id: "student-1",
  name: "Abhijit Sagar",
  email: "abhijit@example.edu",
  department: "Data Science",
  semester: 6,
  yearOfStudy: 3,
  attendance: 88,
  assignmentScore: 85,
  quizScore: 90,
  examScore: 84,
  gpa: 8.6, // 10.0 scale
  skills: [
    { name: "Python", level: "Advanced" },
    { name: "Machine Learning", level: "Intermediate" },
    { name: "SQL", level: "Advanced" },
    { name: "Statistics", level: "Intermediate" },
  ],
  projectsCompleted: 3,
  internshipsCompleted: 1,
  codingScore: 85,
  communicationScore: 80,
  resumeScore: 88,
  jobReadyScore: 86,
  riskStatus: "safe",
};

describe("Deterministic 100-Point Job Readiness Index", () => {
  it("calculates deterministic readiness scoring with exact category breakdown", () => {
    const result = predictJobReadiness(mockStudent);

    expect(result.score).toBeGreaterThanOrEqual(60);
    expect(result.score).toBeLessThanOrEqual(100);
    expect(result.label).toBe("Ready for Placement");

    // Check factors sum to total score
    const factorSum = Math.round(result.factors.reduce((a, f) => a + f.contribution, 0));
    expect(factorSum).toBe(result.score);

    // Check category max points
    expect(result.breakdown.academic).toBeGreaterThan(0);
    expect(result.breakdown.technical).toBeGreaterThan(0);
    expect(result.breakdown.practical).toBeGreaterThan(0);
    expect(result.breakdown.evaluative).toBeGreaterThan(0);

    const totalCategoryPoints =
      result.breakdown.academic +
      result.breakdown.technical +
      result.breakdown.practical +
      result.breakdown.evaluative;
    expect(Math.round(totalCategoryPoints)).toBe(result.score);
  });

  it("handles 4.0 scale GPA correctly alongside 10.0 scale CGPA", () => {
    const student4Scale: StudentFull = {
      ...mockStudent,
      gpa: 3.8, // 4.0 scale
    };
    const result = predictJobReadiness(student4Scale);
    expect(result.score).toBeGreaterThan(70);
    const gpaFactor = result.factors.find((f) => f.name.includes("GPA"));
    expect(gpaFactor?.contribution).toBeCloseTo(23.8, 1);
  });

  it("identifies students needing improvement when metrics are deficient", () => {
    const strugglingStudent: StudentFull = {
      ...mockStudent,
      gpa: 4.5, // 10 scale
      attendance: 55,
      skills: [{ name: "Python", level: "Beginner" }],
      projectsCompleted: 0,
      internshipsCompleted: 0,
      codingScore: 30,
    };
    const result = predictJobReadiness(strugglingStudent);
    expect(result.score).toBeLessThan(60);
    expect(result.label).toBe("Needs Improvement");
  });
});

describe("Personalized Job Discovery & Profile Matching Engine", () => {
  it("computes profile match with multi-factor weighting against verified job", () => {
    const job = verifiedJobPool[0]; // Junior Data Scientist
    const match = calculateJobMatch(job, mockStudent, undefined, "test-user");

    expect(match.overallScore).toBeGreaterThanOrEqual(70);
    expect(match.eligibilityStatus).toBe("Eligible");
    expect(match.factors.skillScore).toBeGreaterThan(80);
    expect(match.matchedSkills.length).toBeGreaterThanOrEqual(3);
    expect(match.matchedSkills.some((ms) => ms.name === "Python")).toBe(true);
    expect(match.missingSkills.length).toBe(0);
  });

  it("flags skill gaps and returns actionable prep steps", () => {
    const sweJob: JobOpportunity = {
      id: "TEST-SWE",
      title: "C++ Systems Engineer",
      company: "Embedded Tech",
      location: "Bengaluru",
      workArrangement: "Onsite",
      requiredSkills: ["C++", "Linux Kernel", "RTOS", "Assembly"],
      minGpa: 3.0,
      source: "partner_feed",
      sourceAttribution: {
        sourceName: "Partner Feed",
        trustScore: 90,
        verifiedAt: "2026-10-21",
      },
      description: "Low-level systems programming role",
    };

    const match = calculateJobMatch(sweJob, mockStudent, undefined, "test-user");
    expect(match.eligibilityStatus).toBe("Skill Gap");
    expect(match.missingSkills).toContain("C++");
    expect(match.actionablePrepSteps.length).toBeGreaterThan(0);
  });

  it("discovers and ranks all available jobs for student", () => {
    const ranked = discoverAndMatchJobs(mockStudent, undefined, "test-user");
    expect(ranked.length).toBeGreaterThanOrEqual(2);
    // Should be sorted in descending order of match score
    expect(ranked[0].match.overallScore).toBeGreaterThanOrEqual(ranked[1].match.overallScore);
  });

  it("analyzes custom job postings pasted by student (LinkedIn compliant)", () => {
    const customText = `Data Analyst Trainee
FinTech Insights Bengaluru
Required Skills:
- Hands-on experience with SQL and Python
- Proficient in Data Visualization and Excel
- CGPA 7.0+`;

    const result = analyzeCustomJobPosting(customText, mockStudent, undefined, "test-user");

    expect(result.source).toBe("user_import");
    expect(result.sourceAttribution.complianceNote).toContain("LinkedIn");
    expect(result.requiredSkills).toContain("SQL");
    expect(result.requiredSkills).toContain("Python");
    expect(result.match.overallScore).toBeGreaterThan(70);
  });
});

describe("Platform Integrations & Verification", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("verifies LinkedIn profile manually with anti-scraping disclosure", () => {
    const state = verifyLinkedInProfile(
      {
        profileUrl: "https://www.linkedin.com/in/abhijit-sagar-vtu",
        headline: "Data Science Student at T. John Institute",
        experienceYears: 1,
        skills: ["Python", "SQL", "Machine Learning"],
      },
      "test-user"
    );

    expect(state.connected).toBe(true);
    expect(state.status).toBe("verified");
    expect(state.verificationBadge).toContain("Partner API Required");
    expect(state.disclosureNote).toContain("LinkedIn Partner authorization");
    expect(state.extractedSkills.length).toBe(3);
  });

  it("rejects invalid LinkedIn profile URLs without /in/ pattern", () => {
    expect(() => {
      verifyLinkedInProfile(
        {
          profileUrl: "https://google.com/search",
          headline: "Student",
          experienceYears: 1,
          skills: ["Python"],
        },
        "test-user"
      );
    }).toThrow("Invalid LinkedIn profile URL");
  });

  it("verifies HackerRank profile with score and badges", () => {
    const state = verifyHackerRankProfile(
      {
        username: "abhijit_code",
        problemSolvingScore: 420,
        badges: [
          { name: "Python", stars: 5 },
          { name: "Problem Solving", stars: 4 },
        ],
      },
      "test-user"
    );

    expect(state.connected).toBe(true);
    expect(state.stats.problemSolvingScore).toBe(420);
    expect(state.extractedSkills.length).toBe(3); // 2 badges + problem solving score
  });

  it("verifies LeetCode profile with solved stats", () => {
    const state = verifyLeetCodeProfile(
      {
        username: "abhijit_leetcode",
        totalSolved: 120,
        easySolved: 60,
        mediumSolved: 50,
        hardSolved: 10,
        contestRating: 1680,
      },
      "test-user"
    );

    expect(state.connected).toBe(true);
    expect(state.stats.totalSolved).toBe(120);
    expect(state.extractedSkills.some((s) => s.name.includes("Algorithms"))).toBe(true);
  });

  it("aggregates verified skills across connected platforms into student profile", () => {
    verifyLinkedInProfile(
      {
        profileUrl: "https://www.linkedin.com/in/abhijit",
        headline: "Student",
        experienceYears: 1,
        skills: ["Power BI"],
      },
      "test-user"
    );

    verifyHackerRankProfile(
      {
        username: "coder",
        problemSolvingScore: 300,
        badges: [{ name: "SQL", stars: 5 }],
      },
      "test-user"
    );

    const allSkills = getAllConnectedSkills("test-user");
    expect(allSkills.some((s) => s.name === "Power BI")).toBe(true);
    expect(allSkills.some((s) => s.name === "SQL")).toBe(true);

    disconnectIntegration("linkedin", "test-user");
    const afterDisconnect = getAllConnectedSkills("test-user");
    expect(afterDisconnect.some((s) => s.name === "Power BI")).toBe(false);
  });
});

describe("Direct Job Application Links & Resume Prep Intelligence", () => {
  it("generates legitimate direct job portal URLs for external application", async () => {
    const { getDirectJobApplyLinks } = await import("@/lib/job-discovery");
    const links = getDirectJobApplyLinks("Data Engineer", "Snowflake", "Bengaluru");

    expect(links.linkedIn).toContain("linkedin.com/jobs/search");
    expect(links.linkedIn).toContain("Data%20Engineer%20Snowflake");
    expect(links.linkedIn).toContain("Bengaluru");

    expect(links.indeed).toContain("indeed.com/jobs");
    expect(links.indeed).toContain("Data+Engineer+Snowflake");

    expect(links.googleJobs).toContain("google.com/search");
    expect(links.googleJobs).toContain("jobs+apply");
  });

  it("handles custom direct apply company URLs gracefully", async () => {
    const { getDirectJobApplyLinks } = await import("@/lib/job-discovery");
    const links = getDirectJobApplyLinks("ML Engineer", "Acme Corp", "Remote", "https://careers.acme.com/apply/123");

    expect(links.companyPortal).toBe("https://careers.acme.com/apply/123");
  });

  it("supports tailoring, editing, and synchronizing resume text for target job requirements", async () => {
    const { getStudentProfile, syncResumeToProfile } = await import("@/lib/profile/student-profile-service");
    const initialProfile = getStudentProfile("test-prep-user");

    const tailoredText = `
ABHIJIT SAGAR
Bangalore, India | abhijit@example.edu
SUMMARY
Data engineering candidate with extensive experience in scalable data pipeline development, statistical analysis, and cross-functional team collaboration.

SKILLS
- Python, SQL, Snowflake, Apache Airflow, Docker, Git

PROJECTS & EXPERIENCE
- Developed and implemented distributed ETL workflows with Snowflake and Airflow processing 1M+ daily records.
- Designed automated data quality assertions achieving 99.8% pipeline fidelity.

EDUCATION
B.E. Data Science | CGPA: 8.8
    `;

    const updated = await syncResumeToProfile("test-prep-user", tailoredText, "DataEngineer_v3.pdf");
    expect(updated.skills.some((s) => s.canonicalName === "Python")).toBe(true);
    expect(updated.skills.some((s) => s.canonicalName === "SQL")).toBe(true);
    expect(updated.resumeAnalysis?.fileName).toBe("DataEngineer_v3.pdf");
    expect(updated.resumeAnalysis?.atsScore).toBeGreaterThan(60);
  });
});

