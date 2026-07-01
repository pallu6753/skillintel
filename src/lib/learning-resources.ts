export interface LearningResource {
  skill: string;
  youtube: { title: string; url: string }[];
  courses: { title: string; url: string; platform: string }[];
  practice: { title: string; url: string }[];
  docs: { title: string; url: string }[];
}

export const learningResources: LearningResource[] = [
  {
    skill: "Python",
    youtube: [
      { title: "Python Full Course for Beginners", url: "https://www.youtube.com/watch?v=_uQrJ0TkZlc" },
      { title: "Python for Data Science – freeCodeCamp", url: "https://www.youtube.com/watch?v=LHBE6Q9XlzI" },
    ],
    courses: [
      { title: "Python for Everybody", url: "https://www.coursera.org/specializations/python", platform: "Coursera" },
      { title: "Automate the Boring Stuff", url: "https://automatetheboringstuff.com/", platform: "Free Book" },
    ],
    practice: [
      { title: "HackerRank Python", url: "https://www.hackerrank.com/domains/python" },
      { title: "LeetCode Python", url: "https://leetcode.com/problemset/all/?topicSlugs=python" },
    ],
    docs: [
      { title: "Python Official Docs", url: "https://docs.python.org/3/" },
      { title: "Real Python Tutorials", url: "https://realpython.com/" },
    ],
  },
  {
    skill: "SQL",
    youtube: [
      { title: "SQL Full Course", url: "https://www.youtube.com/watch?v=HXV3zeQKqGY" },
    ],
    courses: [
      { title: "SQL for Data Science", url: "https://www.coursera.org/learn/sql-for-data-science", platform: "Coursera" },
    ],
    practice: [
      { title: "HackerRank SQL", url: "https://www.hackerrank.com/domains/sql" },
    ],
    docs: [
      { title: "MySQL Reference Manual", url: "https://dev.mysql.com/doc/" },
    ],
  },
  {
    skill: "Machine Learning",
    youtube: [
      { title: "Machine Learning Full Course", url: "https://www.youtube.com/watch?v=GwIo3gDZCVQ" },
    ],
    courses: [
      { title: "Machine Learning", url: "https://www.coursera.org/learn/machine-learning", platform: "Coursera" },
    ],
    practice: [
      { title: "Kaggle Learn", url: "https://www.kaggle.com/learn" },
    ],
    docs: [
      { title: "Scikit-learn Documentation", url: "https://scikit-learn.org/stable/" },
    ],
  },
  {
    skill: "Statistics",
    youtube: [
      { title: "Statistics for Data Science", url: "https://www.youtube.com/watch?v=xxpc-HPKN28" },
    ],
    courses: [
      { title: "Statistics", url: "https://www.coursera.org/learn/statistics", platform: "Coursera" },
    ],
    practice: [
      { title: "Khan Academy Statistics", url: "https://www.khanacademy.org/math/statistics-probability" },
    ],
    docs: [
      { title: "Statlect", url: "https://www.statlect.com/" },
    ],
  },
  {
    skill: "Deep Learning",
    youtube: [
      { title: "Deep Learning Tutorial", url: "https://www.youtube.com/watch?v=aircAruvnKk" },
    ],
    courses: [
      { title: "Deep Learning Specialization", url: "https://www.coursera.org/specializations/deep-learning", platform: "Coursera" },
    ],
    practice: [
      { title: "Kaggle Deep Learning", url: "https://www.kaggle.com/learn/deep-learning" },
    ],
    docs: [
      { title: "PyTorch Documentation", url: "https://pytorch.org/docs/stable/index.html" },
    ],
  },
  {
    skill: "Power BI",
    youtube: [
      { title: "Power BI Full Course", url: "https://www.youtube.com/watch?v=AGrl-H87pRU" },
    ],
    courses: [
      { title: "Power BI", url: "https://www.coursera.org/learn/power-bi", platform: "Coursera" },
    ],
    practice: [
      { title: "Microsoft Power BI Training", url: "https://learn.microsoft.com/en-us/training/powerplatform/power-bi" },
    ],
    docs: [
      { title: "Power BI Documentation", url: "https://learn.microsoft.com/en-us/power-bi/" },
    ],
  },
  {
    skill: "Data Visualization",
    youtube: [
      { title: "Data Visualization Tutorial", url: "https://www.youtube.com/watch?v=Gp2m8ZuXoPg" },
    ],
    courses: [
      { title: "Data Visualization", url: "https://www.coursera.org/learn/data-visualization", platform: "Coursera" },
    ],
    practice: [
      { title: "Kaggle Datasets", url: "https://www.kaggle.com/datasets" },
    ],
    docs: [
      { title: "Matplotlib Documentation", url: "https://matplotlib.org/stable/" },
    ],
  },
  {
    skill: "Java",
    youtube: [
      { title: "Java Programming Full Course", url: "https://www.youtube.com/watch?v=eIrMbAQSU34" },
    ],
    courses: [
      { title: "Java Programming", url: "https://www.coursera.org/learn/java-programming", platform: "Coursera" },
    ],
    practice: [
      { title: "HackerRank Java", url: "https://www.hackerrank.com/domains/java" },
    ],
    docs: [
      { title: "Java SE Documentation", url: "https://docs.oracle.com/en/java/" },
    ],
  },
  {
    skill: "Communication",
    youtube: [
      { title: "Communication Skills Training", url: "https://www.youtube.com/watch?v=HAnw168huqA" },
    ],
    courses: [
      { title: "Communication Skills", url: "https://www.coursera.org/learn/communication-skills", platform: "Coursera" },
    ],
    practice: [
      { title: "Toastmasters", url: "https://www.toastmasters.org" },
    ],
    docs: [
      { title: "Mind Tools – Communication", url: "https://www.mindtools.com/communication-skills" },
    ],
  },
  {
    skill: "Problem Solving",
    youtube: [
      { title: "Problem Solving Techniques", url: "https://www.youtube.com/watch?v=UFc-RPbq8kg" },
    ],
    courses: [
      { title: "Problem Solving", url: "https://www.coursera.org/learn/problem-solving", platform: "Coursera" },
    ],
    practice: [
      { title: "LeetCode", url: "https://leetcode.com/problemset" },
    ],
    docs: [
      { title: "GeeksforGeeks Problem Solving", url: "https://www.geeksforgeeks.org/problem-solving-techniques/" },
    ],
  },
];

export function getResourcesForSkill(skillName: string): LearningResource | undefined {
  return learningResources.find((r) => r.skill.toLowerCase() === skillName.toLowerCase());
}
