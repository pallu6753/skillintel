import { describe, it, expect, beforeEach } from "vitest";
import {
  parseAndExtractResume,
  normalizeSkillName,
  syncResumeToProfile,
  getStudentProfile,
  profileToStudentFull,
  SAMPLE_DATA_SCIENCE_RESUME,
} from "@/lib/profile/student-profile-service";
import { recommendCareers, predictJobReadiness } from "@/lib/career-engine";
import { starterBundle, lookupVerifiedStudent } from "@/lib/ai/starter-bundle-service";
import { fetchTrustedJobs } from "@/lib/trust-engine/db-service";

describe("Resume Extraction and Normalization Pipeline", () => {
  it("normalizes skill aliases into canonical SkillIntel competencies", () => {
    expect(normalizeSkillName("python3").canonical).toBe("Python");
    expect(normalizeSkillName("postgres").canonical).toBe("SQL");
    expect(normalizeSkillName("scikit-learn").canonical).toBe("Machine Learning");
    expect(normalizeSkillName("dsa").canonical).toBe("Problem Solving");
    expect(normalizeSkillName("powerbi").canonical).toBe("Power BI");
  });

  it("extracts competencies, projects, and education from a valid resume", () => {
    const extracted = parseAndExtractResume(SAMPLE_DATA_SCIENCE_RESUME, "test_resume.pdf");

    expect(extracted.extractedSkills.length).toBeGreaterThanOrEqual(4);
    const skillNames = extracted.extractedSkills.map((s) => s.canonicalName);
    expect(skillNames).toContain("Python");
    expect(skillNames).toContain("SQL");
    expect(skillNames).toContain("Machine Learning");
    expect(skillNames).toContain("Deep Learning");

    expect(extracted.extractedEducation.cgpa).toBe(8.6);
    expect(extracted.extractedProjects.length).toBeGreaterThanOrEqual(1);
    expect(extracted.extractedInternships.length).toBeGreaterThanOrEqual(1);
    expect(extracted.atsScore).toBeGreaterThanOrEqual(60);
    expect(extracted.wordCount).toBeGreaterThan(100);
  });
});

describe("Automatic Profile Synchronization & Career Intelligence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("synchronizes resume extraction into student profile and updates career match dynamically", async () => {
    const userId = "student-test-123";

    // 1. Initial profile without resume
    const initialProfile = getStudentProfile(userId);
    initialProfile.skills = []; // empty skills simulate unassessed student
    const emptyStudent = profileToStudentFull(initialProfile);

    const emptyRecommendations = recommendCareers(emptyStudent.skills.map((s) => s.name));
    emptyRecommendations.forEach((r) => {
      expect(r.matchScore).toBe(0);
    });

    // 2. Synchronize resume
    const updatedProfile = await syncResumeToProfile(userId, SAMPLE_DATA_SCIENCE_RESUME, "resume.pdf");
    expect(updatedProfile.skills.length).toBeGreaterThan(3);

    const updatedStudent = profileToStudentFull(updatedProfile);
    const updatedRecommendations = recommendCareers(updatedStudent.skills.map((s) => s.name));

    const dataScientistMatch = updatedRecommendations.find((r) => r.role === "Data Scientist");
    expect(dataScientistMatch).toBeDefined();
    expect(dataScientistMatch?.matchScore).toBe(100);
    expect(dataScientistMatch?.matchedSkills).toContain("Python");
    expect(dataScientistMatch?.matchedSkills).toContain("Machine Learning");
    expect(dataScientistMatch?.missingSkills.length).toBe(0);
  });

  it("calculates 100-point deterministic readiness with 67 specified and 33 defined points", () => {
    const student = profileToStudentFull(getStudentProfile("student-ready-test"));
    const readiness = predictJobReadiness(student);

    expect(readiness.specifiedSubtotal67).toBeGreaterThan(0);
    expect(readiness.specifiedSubtotal67).toBeLessThanOrEqual(67);

    expect(readiness.remainingDefined33).toBeGreaterThan(0);
    expect(readiness.remainingDefined33).toBeLessThanOrEqual(33);

    expect(readiness.score).toBe(
      Math.min(Math.round(readiness.specifiedSubtotal67 + readiness.remainingDefined33), 100)
    );
  });

  it("handles missing inputs explicitly with 'Pending Information' status without fabricating scores", () => {
    const unassessedProfile = getStudentProfile("unassessed-user");
    unassessedProfile.gpa = 0;
    unassessedProfile.attendance = 0;
    unassessedProfile.skills = [];
    unassessedProfile.projects = [];
    unassessedProfile.assessmentScores = { quizScore: 0, codingScore: 0, communicationScore: 0 };
    unassessedProfile.resumeAnalysis = undefined;

    const student = profileToStudentFull(unassessedProfile);
    student.resumeScore = 0;
    const readiness = predictJobReadiness(student);

    const gpaFactor = readiness.factors.find((f) => f.name.includes("GPA"));
    expect(gpaFactor?.status).toBe("Pending Information");
    expect(gpaFactor?.contribution).toBe(0);

    const attendanceFactor = readiness.factors.find((f) => f.name.includes("Attendance"));
    expect(attendanceFactor?.status).toBe("Pending Information");

    expect(readiness.score).toBe(0);
    expect(readiness.label).toBe("Needs Improvement");
  });

  it("ensures student data isolation by scoping profiles to specific user IDs", async () => {
    await syncResumeToProfile("student-A", SAMPLE_DATA_SCIENCE_RESUME, "studentA.pdf");
    const profileA = getStudentProfile("student-A");
    const profileB = getStudentProfile("student-B");

    expect(profileA.resumeAnalysis?.fileName).toBe("studentA.pdf");
    expect(profileB.resumeAnalysis).toBeUndefined();
  });
});

describe("Database & Roster Integrity", () => {
  it("strictly preserves the exact 30 verified students in demo roster", () => {
    expect(starterBundle.students.length).toBe(30);

    // Verify first and last students from the approved roster
    const firstStudent = lookupVerifiedStudent("1TJ23DS001");
    expect(firstStudent?.full_name).toBe("ABHIJIT SAGAR");
    expect(firstStudent?.department).toBe("DS");

    const lastStudent = lookupVerifiedStudent("1TJ23DS031");
    expect(lastStudent?.full_name).toBe("VISHAL CHAUHAN");
    expect(lastStudent?.department).toBe("DS");
  });

  it("ensures fetchTrustedJobs returns verified postings and never an empty list", async () => {
    const jobs = await fetchTrustedJobs();
    expect(jobs.length).toBeGreaterThanOrEqual(5);
    expect(jobs[0].trust_score).toBeGreaterThanOrEqual(90);
    expect(jobs[0].cleaned_skills.length).toBeGreaterThan(0);
  });
});
