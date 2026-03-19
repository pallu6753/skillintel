import { supabase } from "@/integrations/supabase/client";

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

export async function loadDataset(): Promise<DataSet> {
  // Fetch all data from Supabase in parallel
  const [profilesRes, academicRes, skillsRes, studentSkillsRes, projectsRes, internshipsRes, jobReadinessRes] =
    await Promise.all([
      supabase.from("profiles").select("*").limit(500),
      supabase.from("academic_performance").select("*").limit(500),
      supabase.from("skills").select("*"),
      supabase.from("student_skills").select("*, skills(name)").limit(2000),
      supabase.from("projects").select("*").limit(500),
      supabase.from("internships").select("*").limit(500),
      supabase.from("job_readiness").select("*").limit(500),
    ]);

  const profiles = profilesRes.data ?? [];
  const academic = academicRes.data ?? [];
  const allSkills = skillsRes.data ?? [];
  const studentSkills = studentSkillsRes.data ?? [];
  const projects = projectsRes.data ?? [];
  const internships = internshipsRes.data ?? [];
  const jobReadiness = jobReadinessRes.data ?? [];

  // Index by student_id (profile id)
  const academicMap = new Map(academic.map((r) => [r.student_id, r]));
  const projectMap = new Map(projects.map((r) => [r.student_id, r]));
  const internshipMap = new Map(internships.map((r) => [r.student_id, r]));
  const jobMap = new Map(jobReadiness.map((r) => [r.student_id, r]));

  // Group skills by student
  const skillsByStudent = new Map<string, { name: string; level: "Beginner" | "Intermediate" | "Advanced" }[]>();
  studentSkills.forEach((r: any) => {
    const sid = r.student_id;
    if (!skillsByStudent.has(sid)) skillsByStudent.set(sid, []);
    const skillName = r.skills?.name ?? "Unknown";
    skillsByStudent.get(sid)!.push({ name: skillName, level: (r.proficiency ?? "Beginner") as any });
  });

  const students: StudentFull[] = profiles.map((p) => {
    const a = academicMap.get(p.id);
    const pr = projectMap.get(p.id);
    const i = internshipMap.get(p.id);
    const j = jobMap.get(p.id);
    const attendance = Number(a?.attendance ?? 0);
    const gpa = Number(a?.gpa ?? 0);

    let riskStatus: "safe" | "moderate" | "at-risk" = "safe";
    if (attendance < 60 && gpa < 2.5) riskStatus = "at-risk";
    else if (attendance < 70 || gpa < 3.0) riskStatus = "moderate";

    return {
      id: p.id,
      name: p.full_name,
      email: p.email ?? "",
      department: p.department ?? "Unknown",
      semester: p.semester ?? 1,
      yearOfStudy: p.year_of_study ?? 1,
      attendance,
      assignmentScore: Number(a?.assignment_score ?? 0),
      quizScore: Number(a?.quiz_score ?? 0),
      examScore: Number(a?.exam_score ?? 0),
      gpa,
      skills: skillsByStudent.get(p.id) ?? [],
      projectsCompleted: pr?.projects_completed ?? 0,
      internshipsCompleted: i?.internships_completed ?? 0,
      codingScore: Number(j?.coding_score ?? 0),
      communicationScore: Number(j?.communication_score ?? 0),
      resumeScore: Number(j?.resume_score ?? 0),
      jobReadyScore: Number(j?.job_ready_score ?? 0),
      riskStatus,
    };
  });

  const skills = allSkills.map((s) => s.name);
  const departments = [...new Set(students.map((s) => s.department))];

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
