import { parseCSV } from "./csv-parser";

// Raw CSV row types
interface RawStudent { student_id: string; name: string; email: string; department: string; semester: string; year_of_study: string; }
interface RawAcademic { student_id: string; attendance: string; assignment_score: string; quiz_score: string; exam_score: string; gpa: string; }
interface RawSkill { skill_id: string; skill_name: string; }
interface RawStudentSkill { student_id: string; skill_name: string; skill_level: string; }
interface RawProject { student_id: string; projects_completed: string; }
interface RawInternship { student_id: string; internships_completed: string; }
interface RawJobReadiness { student_id: string; coding_score: string; communication_score: string; resume_score: string; job_ready_score: string; }

// Merged types
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

async function fetchCSV(path: string): Promise<string> {
  const res = await fetch(path);
  return res.text();
}

export async function loadDataset(): Promise<DataSet> {
  const [studentsCSV, academicCSV, skillsCSV, studentSkillsCSV, projectsCSV, internshipsCSV, jobReadinessCSV] =
    await Promise.all([
      fetchCSV("/data/students.csv"),
      fetchCSV("/data/academic_performance.csv"),
      fetchCSV("/data/skills.csv"),
      fetchCSV("/data/student_skills.csv"),
      fetchCSV("/data/projects.csv"),
      fetchCSV("/data/internships.csv"),
      fetchCSV("/data/job_readiness.csv"),
    ]);

  const rawStudents = parseCSV<RawStudent>(studentsCSV);
  const rawAcademic = parseCSV<RawAcademic>(academicCSV);
  const rawSkills = parseCSV<RawSkill>(skillsCSV);
  const rawStudentSkills = parseCSV<RawStudentSkill>(studentSkillsCSV);
  const rawProjects = parseCSV<RawProject>(projectsCSV);
  const rawInternships = parseCSV<RawInternship>(internshipsCSV);
  const rawJobReadiness = parseCSV<RawJobReadiness>(jobReadinessCSV);

  // Index by student_id
  const academicMap = new Map(rawAcademic.map((r) => [r.student_id, r]));
  const projectMap = new Map(rawProjects.map((r) => [r.student_id, r]));
  const internshipMap = new Map(rawInternships.map((r) => [r.student_id, r]));
  const jobMap = new Map(rawJobReadiness.map((r) => [r.student_id, r]));

  // Group skills by student
  const skillsByStudent = new Map<string, { name: string; level: "Beginner" | "Intermediate" | "Advanced" }[]>();
  rawStudentSkills.forEach((r) => {
    if (!skillsByStudent.has(r.student_id)) skillsByStudent.set(r.student_id, []);
    skillsByStudent.get(r.student_id)!.push({ name: r.skill_name, level: r.skill_level as any });
  });

  const students: StudentFull[] = rawStudents.map((s) => {
    const a = academicMap.get(s.student_id);
    const p = projectMap.get(s.student_id);
    const i = internshipMap.get(s.student_id);
    const j = jobMap.get(s.student_id);
    const attendance = parseFloat(a?.attendance ?? "0");
    const gpa = parseFloat(a?.gpa ?? "0");

    let riskStatus: "safe" | "moderate" | "at-risk" = "safe";
    if (attendance < 60 && gpa < 2.5) riskStatus = "at-risk";
    else if (attendance < 70 || gpa < 3.0) riskStatus = "moderate";

    return {
      id: s.student_id,
      name: s.name,
      email: s.email,
      department: s.department,
      semester: parseInt(s.semester) || 0,
      yearOfStudy: parseInt(s.year_of_study) || 0,
      attendance,
      assignmentScore: parseFloat(a?.assignment_score ?? "0"),
      quizScore: parseFloat(a?.quiz_score ?? "0"),
      examScore: parseFloat(a?.exam_score ?? "0"),
      gpa,
      skills: skillsByStudent.get(s.student_id) ?? [],
      projectsCompleted: parseInt(p?.projects_completed ?? "0"),
      internshipsCompleted: parseInt(i?.internships_completed ?? "0"),
      codingScore: parseFloat(j?.coding_score ?? "0"),
      communicationScore: parseFloat(j?.communication_score ?? "0"),
      resumeScore: parseFloat(j?.resume_score ?? "0"),
      jobReadyScore: parseFloat(j?.job_ready_score ?? "0"),
      riskStatus,
    };
  });

  const skills = rawSkills.map((s) => s.skill_name);
  const departments = [...new Set(students.map((s) => s.department))];

  const departmentStats = departments.map((dept) => {
    const deptStudents = students.filter((s) => s.department === dept);
    return {
      department: dept,
      avgGpa: parseFloat((deptStudents.reduce((a, s) => a + s.gpa, 0) / deptStudents.length).toFixed(2)),
      totalStudents: deptStudents.length,
      avgReadiness: parseFloat((deptStudents.reduce((a, s) => a + s.jobReadyScore, 0) / deptStudents.length).toFixed(1)),
      atRiskCount: deptStudents.filter((s) => s.riskStatus === "at-risk").length,
    };
  });

  return { students, skills, departments, departmentStats };
}
