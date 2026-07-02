import { supabase } from "@/integrations/supabase/client";
import { parseCSV } from "@/lib/csv-parser";

export interface StudentFull {
  id: string;
  name: string;
  email: string;
  department: string;
  semester: number;
  yearOfStudy: number;
  attendance: number;
  assignmentScore: number;
  quizScore: number;
  examScore: number;
  gpa: number;
  skills: { name: string; level: "Beginner" | "Intermediate" | "Advanced" }[];
  projectsCompleted: number;
  internshipsCompleted: number;
  codingScore: number;
  communicationScore: number;
  resumeScore: number;
  jobReadyScore: number;
  riskStatus: "safe" | "moderate" | "at-risk";
}

export interface DataSet {
  students: StudentFull[];
  skills: string[];
  departments: string[];
  departmentStats: { department: string; avgGpa: number; totalStudents: number; avgReadiness: number; atRiskCount: number }[];
}

async function fetchCsv(path: string): Promise<string> {
  const res = await fetch(path);
  return res.text();
}

function computeRisk(attendance: number, gpa: number): "safe" | "moderate" | "at-risk" {
  if (attendance < 60 && gpa < 2.5) return "at-risk";
  if (attendance < 70 || gpa < 3.0) return "moderate";
  return "safe";
}

async function loadCsvStudents(): Promise<StudentFull[]> {
  const [studentsCsv, academicCsv, skillsCsv, projectsCsv, internshipsCsv, jobCsv] = await Promise.all([
    fetchCsv("/data/students.csv"),
    fetchCsv("/data/academic_performance.csv"),
    fetchCsv("/data/student_skills.csv"),
    fetchCsv("/data/projects.csv"),
    fetchCsv("/data/internships.csv"),
    fetchCsv("/data/job_readiness.csv"),
  ]);

  const students = parseCSV<any>(studentsCsv);
  const academic = parseCSV<any>(academicCsv);
  const skills = parseCSV<any>(skillsCsv);
  const projects = parseCSV<any>(projectsCsv);
  const internships = parseCSV<any>(internshipsCsv);
  const job = parseCSV<any>(jobCsv);

  const academicMap = new Map(academic.map((r) => [r.student_id, r]));
  const projectMap = new Map(projects.map((r) => [r.student_id, r]));
  const internMap = new Map(internships.map((r) => [r.student_id, r]));
  const jobMap = new Map(job.map((r) => [r.student_id, r]));

  const skillsByStudent = new Map<string, { name: string; level: "Beginner" | "Intermediate" | "Advanced" }[]>();
  skills.forEach((r) => {
    if (!skillsByStudent.has(r.student_id)) skillsByStudent.set(r.student_id, []);
    skillsByStudent.get(r.student_id)!.push({
      name: r.skill_name,
      level: (r.skill_level || "Beginner") as any,
    });
  });

  return students.map((s) => {
    const a = academicMap.get(s.student_id) || {};
    const p = projectMap.get(s.student_id) || {};
    const i = internMap.get(s.student_id) || {};
    const j = jobMap.get(s.student_id) || {};
    const attendance = Number(a.attendance ?? 0);
    const gpa = Number(a.gpa ?? 0);

    return {
      id: `csv-${s.student_id}`,
      name: s.name,
      email: s.email,
      department: s.department,
      semester: Number(s.semester ?? 1),
      yearOfStudy: Number(s.year_of_study ?? 1),
      attendance,
      assignmentScore: Number(a.assignment_score ?? 0),
      quizScore: Number(a.quiz_score ?? 0),
      examScore: Number(a.exam_score ?? 0),
      gpa,
      skills: skillsByStudent.get(s.student_id) ?? [],
      projectsCompleted: Number(p.projects_completed ?? 0),
      internshipsCompleted: Number(i.internships_completed ?? 0),
      codingScore: Number(j.coding_score ?? 0),
      communicationScore: Number(j.communication_score ?? 0),
      resumeScore: Number(j.resume_score ?? 0),
      jobReadyScore: Number(j.job_ready_score ?? 0),
      riskStatus: computeRisk(attendance, gpa),
    };
  });
}

async function loadDbStudents(): Promise<StudentFull[]> {
  const [profilesRes, academicRes, studentSkillsRes, projectsRes, internshipsRes, jobReadinessRes] =
    await Promise.all([
      supabase.from("profiles").select("*"),
      supabase.from("academic_performance").select("*"),
      supabase.from("student_skills").select("*, skills(name)"),
      supabase.from("projects").select("*"),
      supabase.from("internships").select("*"),
      supabase.from("job_readiness").select("*"),
    ]);

  const profiles = profilesRes.data ?? [];
  const academicMap = new Map((academicRes.data ?? []).map((r) => [r.student_id, r]));
  const projectMap = new Map((projectsRes.data ?? []).map((r) => [r.student_id, r]));
  const internshipMap = new Map((internshipsRes.data ?? []).map((r) => [r.student_id, r]));
  const jobMap = new Map((jobReadinessRes.data ?? []).map((r) => [r.student_id, r]));

  const skillsByStudent = new Map<string, { name: string; level: "Beginner" | "Intermediate" | "Advanced" }[]>();
  (studentSkillsRes.data ?? []).forEach((r: any) => {
    if (!skillsByStudent.has(r.student_id)) skillsByStudent.set(r.student_id, []);
    skillsByStudent.get(r.student_id)!.push({
      name: r.skills?.name ?? "Unknown",
      level: (r.proficiency ?? "Beginner") as any,
    });
  });

  return profiles.map((p) => {
    const a: any = academicMap.get(p.id) ?? {};
    const pr: any = projectMap.get(p.id) ?? {};
    const i: any = internshipMap.get(p.id) ?? {};
    const j: any = jobMap.get(p.id) ?? {};
    const attendance = Number(a.attendance ?? 0);
    const gpa = Number(a.gpa ?? 0);

    return {
      id: p.id,
      name: p.full_name,
      email: p.email ?? "",
      department: p.department ?? "Unknown",
      semester: p.semester ?? 1,
      yearOfStudy: p.year_of_study ?? 1,
      attendance,
      assignmentScore: Number(a.assignment_score ?? 0),
      quizScore: Number(a.quiz_score ?? 0),
      examScore: Number(a.exam_score ?? 0),
      gpa,
      skills: skillsByStudent.get(p.id) ?? [],
      projectsCompleted: pr.projects_completed ?? 0,
      internshipsCompleted: i.internships_completed ?? 0,
      codingScore: Number(j.coding_score ?? 0),
      communicationScore: Number(j.communication_score ?? 0),
      resumeScore: Number(j.resume_score ?? 0),
      jobReadyScore: Number(j.job_ready_score ?? 0),
      riskStatus: computeRisk(attendance, gpa),
    };
  });
}

export async function loadDataset(): Promise<DataSet> {
  // Merge CSV (rich 1000-row demo dataset) with DB (real logged-in demo users like Pallavi)
  const [csvStudents, dbStudents] = await Promise.all([
    loadCsvStudents().catch(() => []),
    loadDbStudents().catch(() => []),
  ]);

  // De-dupe by email — DB profiles take priority
  const seen = new Set(dbStudents.map((s) => s.email.toLowerCase()).filter(Boolean));
  const students = [
    ...dbStudents,
    ...csvStudents.filter((s) => !seen.has(s.email.toLowerCase())),
  ];

  const skills = [...new Set(students.flatMap((s) => s.skills.map((sk) => sk.name)))];
  const departments = [...new Set(students.map((s) => s.department))].filter(Boolean);

  const departmentStats = departments.map((dept) => {
    const deptStudents = students.filter((s) => s.department === dept);
    const len = deptStudents.length || 1;
    return {
      department: dept,
      avgGpa: parseFloat((deptStudents.reduce((a, s) => a + s.gpa, 0) / len).toFixed(2)),
      totalStudents: deptStudents.length,
      avgReadiness: parseFloat((deptStudents.reduce((a, s) => a + s.jobReadyScore, 0) / len).toFixed(1)),
      atRiskCount: deptStudents.filter((s) => s.riskStatus === "at-risk").length,
    };
  });

  return { students, skills, departments, departmentStats };
}
