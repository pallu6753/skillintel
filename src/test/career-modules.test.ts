import { describe, it, expect } from "vitest";
import { recommendCareers } from "@/lib/career-engine";
import { evaluateAnswer, getInterviewQuestions, interviewQuestions } from "@/lib/interview-questions";
import { starterBundle, lookupCareerPath, lookupVerifiedStudent, calculateAlignmentScore } from "@/lib/ai/starter-bundle-service";

describe("Career Intelligence Engine", () => {
  it("calculates accurate match scores for student skills", () => {
    const skills = ["Python", "SQL", "Statistics"];
    const matches = recommendCareers(skills);

    expect(matches.length).toBeGreaterThan(0);
    const dataAnalyst = matches.find((m) => m.role === "Data Analyst");
    expect(dataAnalyst).toBeDefined();
    expect(dataAnalyst?.matchedSkills).toContain("Python");
    expect(dataAnalyst?.matchedSkills).toContain("SQL");
    expect(dataAnalyst?.matchedSkills).toContain("Statistics");
    expect(dataAnalyst?.matchScore).toBeGreaterThan(0);
  });

  it("handles empty student skills gracefully without errors", () => {
    const matches = recommendCareers([]);
    expect(matches.length).toBeGreaterThan(0);
    matches.forEach((m) => {
      expect(m.matchScore).toBe(0);
      expect(m.matchedSkills).toEqual([]);
      expect(m.missingSkills.length).toBeGreaterThan(0);
    });
  });
});

describe("Interview Prep Simulator", () => {
  it("retrieves curated interview questions by track", () => {
    const technicalQs = getInterviewQuestions("Technical", 3);
    expect(technicalQs.length).toBe(3);
    technicalQs.forEach((q) => expect(q.type).toBe("Technical"));
  });

  it("evaluates answers against explicit rubrics with strengths & improvements", () => {
    const q = interviewQuestions.find((item) => item.id === "t1")!;
    const answer = "Overfitting happens when a model learns noise with high variance on training data, whereas underfitting has high bias. We use cross-validation and regularization to balance them.";
    const evalResult = evaluateAnswer(q, answer);

    expect(evalResult.score).toBeGreaterThanOrEqual(5);
    expect(evalResult.maxScore).toBe(10);
    expect(evalResult.strengths.length).toBeGreaterThan(0);
    expect(evalResult.suggestedStructure).toBeDefined();
    expect(evalResult.followUpQuestion).toBeDefined();
  });
});

describe("Career Starter Bundle Datasets", () => {
  it("loads 30 verified student records with no synthetic marks", () => {
    expect(starterBundle.students.length).toBe(30);
    const abhijit = lookupVerifiedStudent("1TJ23DS001");
    expect(abhijit).toBeDefined();
    expect(abhijit?.full_name).toBe("ABHIJIT SAGAR");
    expect(abhijit?.department).toBe("DS");
  });

  it("loads curated career paths and calculates alignment scores", () => {
    const dataScientistPath = lookupCareerPath("Data Scientist");
    expect(dataScientistPath).toBeDefined();
    expect(dataScientistPath?.required_skills).toContain("Python");

    const alignment = calculateAlignmentScore(["Python", "SQL"], dataScientistPath!.required_skills);
    expect(alignment.score).toBeGreaterThan(0);
    expect(alignment.matched).toContain("Python");
    expect(alignment.matched).toContain("SQL");
  });
});
