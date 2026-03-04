// Mock data for the Student Intelligence Platform

export type UserRole = "student" | "faculty" | "placement" | "admin";

export interface Student {
  id: string;
  name: string;
  email: string;
  phone: string;
  department: string;
  course: string;
  semester: number;
  yearOfStudy: number;
  gpa: number;
  attendancePercentage: number;
  skills: { name: string; level: "Beginner" | "Intermediate" | "Advanced" }[];
  jobReadinessScore: number;
  riskStatus: "safe" | "moderate" | "at-risk";
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  category: "skill" | "academic";
  topic: string;
  difficulty: "easy" | "medium" | "hard";
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: "placement" | "internship" | "exam" | "training" | "alert";
  date: string;
  read: boolean;
}

export const mockStudents: Student[] = [
  { id: "S001", name: "Aarav Sharma", email: "aarav@college.edu", phone: "9876543210", department: "Computer Science", course: "B.Tech", semester: 6, yearOfStudy: 3, gpa: 8.5, attendancePercentage: 88, skills: [{ name: "Python", level: "Advanced" }, { name: "SQL", level: "Intermediate" }, { name: "Machine Learning", level: "Beginner" }], jobReadinessScore: 78, riskStatus: "safe" },
  { id: "S002", name: "Priya Patel", email: "priya@college.edu", phone: "9876543211", department: "Computer Science", course: "B.Tech", semester: 6, yearOfStudy: 3, gpa: 9.1, attendancePercentage: 95, skills: [{ name: "Python", level: "Advanced" }, { name: "Data Visualization", level: "Advanced" }, { name: "Machine Learning", level: "Intermediate" }], jobReadinessScore: 92, riskStatus: "safe" },
  { id: "S003", name: "Rahul Kumar", email: "rahul@college.edu", phone: "9876543212", department: "Information Technology", course: "B.Tech", semester: 4, yearOfStudy: 2, gpa: 5.8, attendancePercentage: 52, skills: [{ name: "SQL", level: "Beginner" }], jobReadinessScore: 35, riskStatus: "at-risk" },
  { id: "S004", name: "Sneha Reddy", email: "sneha@college.edu", phone: "9876543213", department: "Computer Science", course: "B.Tech", semester: 8, yearOfStudy: 4, gpa: 7.9, attendancePercentage: 78, skills: [{ name: "Python", level: "Intermediate" }, { name: "Power BI", level: "Advanced" }, { name: "SQL", level: "Advanced" }], jobReadinessScore: 85, riskStatus: "safe" },
  { id: "S005", name: "Vikram Singh", email: "vikram@college.edu", phone: "9876543214", department: "Electronics", course: "B.Tech", semester: 6, yearOfStudy: 3, gpa: 6.2, attendancePercentage: 60, skills: [{ name: "Communication", level: "Advanced" }, { name: "Problem Solving", level: "Intermediate" }], jobReadinessScore: 48, riskStatus: "moderate" },
  { id: "S006", name: "Ananya Gupta", email: "ananya@college.edu", phone: "9876543215", department: "Computer Science", course: "B.Tech", semester: 6, yearOfStudy: 3, gpa: 8.8, attendancePercentage: 92, skills: [{ name: "Python", level: "Advanced" }, { name: "Machine Learning", level: "Advanced" }, { name: "Data Visualization", level: "Advanced" }, { name: "SQL", level: "Advanced" }], jobReadinessScore: 95, riskStatus: "safe" },
  { id: "S007", name: "Deepak Joshi", email: "deepak@college.edu", phone: "9876543216", department: "Information Technology", course: "B.Tech", semester: 4, yearOfStudy: 2, gpa: 7.1, attendancePercentage: 74, skills: [{ name: "Python", level: "Intermediate" }, { name: "SQL", level: "Beginner" }], jobReadinessScore: 55, riskStatus: "moderate" },
  { id: "S008", name: "Kavya Nair", email: "kavya@college.edu", phone: "9876543217", department: "Computer Science", course: "B.Tech", semester: 8, yearOfStudy: 4, gpa: 4.9, attendancePercentage: 45, skills: [{ name: "Communication", level: "Beginner" }], jobReadinessScore: 22, riskStatus: "at-risk" },
];

export const semesterPerformance = [
  { semester: "Sem 1", gpa: 7.2, attendance: 82, quizScore: 68 },
  { semester: "Sem 2", gpa: 7.5, attendance: 85, quizScore: 72 },
  { semester: "Sem 3", gpa: 7.8, attendance: 80, quizScore: 75 },
  { semester: "Sem 4", gpa: 8.0, attendance: 88, quizScore: 78 },
  { semester: "Sem 5", gpa: 8.3, attendance: 90, quizScore: 82 },
  { semester: "Sem 6", gpa: 8.5, attendance: 88, quizScore: 85 },
];

export const skillRadarData = [
  { skill: "Python", score: 90 },
  { skill: "SQL", score: 70 },
  { skill: "ML", score: 55 },
  { skill: "Data Viz", score: 80 },
  { skill: "Communication", score: 75 },
  { skill: "Problem Solving", score: 85 },
];

export const industryRequiredSkills = [
  "Python", "SQL", "Machine Learning", "Data Visualization", "Power BI",
  "Communication", "Problem Solving", "Cloud Computing", "Docker", "Git",
];

export const skillQuizQuestions: QuizQuestion[] = [
  { id: "sq1", question: "What is the output of print(type([])) in Python?", options: ["<class 'list'>", "<class 'tuple'>", "<class 'dict'>", "<class 'set'>"], correctAnswer: 0, category: "skill", topic: "Python", difficulty: "easy" },
  { id: "sq2", question: "Which SQL clause is used to filter grouped results?", options: ["WHERE", "HAVING", "FILTER", "GROUP BY"], correctAnswer: 1, category: "skill", topic: "SQL", difficulty: "medium" },
  { id: "sq3", question: "What does the 'fit' method do in scikit-learn?", options: ["Makes predictions", "Trains the model", "Evaluates the model", "Preprocesses data"], correctAnswer: 1, category: "skill", topic: "Machine Learning", difficulty: "medium" },
  { id: "sq4", question: "Which Python library is primarily used for data visualization?", options: ["NumPy", "Pandas", "Matplotlib", "Scikit-learn"], correctAnswer: 2, category: "skill", topic: "Data Visualization", difficulty: "easy" },
  { id: "sq5", question: "What is overfitting in ML?", options: ["Model performs well on training data but poorly on test data", "Model performs poorly on both", "Model is too simple", "Model has too few features"], correctAnswer: 0, category: "skill", topic: "Machine Learning", difficulty: "hard" },
  { id: "sq6", question: "Which JOIN returns all rows from both tables?", options: ["INNER JOIN", "LEFT JOIN", "RIGHT JOIN", "FULL OUTER JOIN"], correctAnswer: 3, category: "skill", topic: "SQL", difficulty: "medium" },
  { id: "sq7", question: "What does REST stand for?", options: ["Representational State Transfer", "Remote Execution Standard Tool", "Rapid Enterprise Service Technology", "Real-time Event Stream Transfer"], correctAnswer: 0, category: "skill", topic: "Technical Knowledge", difficulty: "easy" },
  { id: "sq8", question: "Which algorithm is best for classification with small datasets?", options: ["Deep Learning", "Random Forest", "K-Nearest Neighbors", "Linear Regression"], correctAnswer: 2, category: "skill", topic: "Machine Learning", difficulty: "hard" },
];

export const academicQuizQuestions: QuizQuestion[] = [
  { id: "aq1", question: "What is the time complexity of binary search?", options: ["O(n)", "O(log n)", "O(n²)", "O(1)"], correctAnswer: 1, category: "academic", topic: "Data Structures", difficulty: "easy" },
  { id: "aq2", question: "Which normal form eliminates transitive dependencies?", options: ["1NF", "2NF", "3NF", "BCNF"], correctAnswer: 2, category: "academic", topic: "DBMS", difficulty: "medium" },
  { id: "aq3", question: "What is a deadlock in operating systems?", options: ["When a process crashes", "When two processes wait for each other indefinitely", "When CPU overheats", "When memory is full"], correctAnswer: 1, category: "academic", topic: "Operating Systems", difficulty: "medium" },
  { id: "aq4", question: "Which layer of OSI model handles routing?", options: ["Data Link", "Network", "Transport", "Session"], correctAnswer: 1, category: "academic", topic: "Computer Networks", difficulty: "easy" },
  { id: "aq5", question: "What is the purpose of virtual memory?", options: ["Speed up CPU", "Extend available memory using disk", "Encrypt data", "Compress files"], correctAnswer: 1, category: "academic", topic: "Operating Systems", difficulty: "medium" },
  { id: "aq6", question: "What data structure uses LIFO principle?", options: ["Queue", "Stack", "Array", "Linked List"], correctAnswer: 1, category: "academic", topic: "Data Structures", difficulty: "easy" },
];

export const mockNotifications: Notification[] = [
  { id: "n1", title: "Google Placement Drive", message: "Google is visiting campus on March 15. Students with GPA > 7.5 are eligible.", type: "placement", date: "2026-03-04", read: false },
  { id: "n2", title: "Summer Internship at Microsoft", message: "Apply for Microsoft's summer internship program. Deadline: March 20.", type: "internship", date: "2026-03-03", read: false },
  { id: "n3", title: "Mid-Semester Exam Schedule", message: "Mid-semester exams start from March 25. Check the timetable.", type: "exam", date: "2026-03-02", read: true },
  { id: "n4", title: "Python Workshop", message: "Free Python workshop on March 10. Register now!", type: "training", date: "2026-03-01", read: true },
  { id: "n5", title: "Low Attendance Alert", message: "Your attendance is below 60%. Please attend classes regularly.", type: "alert", date: "2026-02-28", read: false },
];

export const careerPaths = [
  { skills: ["Python", "Machine Learning", "Data Visualization"], career: "Data Scientist", readiness: 85 },
  { skills: ["SQL", "Power BI", "Data Visualization"], career: "Data Analyst", readiness: 78 },
  { skills: ["Python", "Cloud Computing", "Docker"], career: "DevOps Engineer", readiness: 62 },
  { skills: ["Communication", "Problem Solving"], career: "Product Manager", readiness: 70 },
];

export const departmentStats = [
  { department: "Computer Science", avgGpa: 7.8, totalStudents: 120, placedStudents: 85 },
  { department: "Information Technology", avgGpa: 7.2, totalStudents: 90, placedStudents: 55 },
  { department: "Electronics", avgGpa: 6.9, totalStudents: 80, placedStudents: 40 },
  { department: "Mechanical", avgGpa: 7.0, totalStudents: 100, placedStudents: 45 },
];

export const studyHabits = {
  dailyStudyHours: 4.5,
  sleepHours: 6.5,
  socialMediaUsage: 3,
  onlineLearningHours: 2,
  revisionFrequency: "Weekly",
};
