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
      { title: "Power BI Full Course – Edureka", url: "https://www.youtube.com/watch?v=3u7MQz1EyPY" },
      { title: "Power BI Tutorial for Beginners", url: "https://www.youtube.com/watch?v=AGrl-H87pRU" },
    ],
    courses: [
      { title: "Microsoft Power BI Data Analyst", url: "https://www.coursera.org/professional-certificates/microsoft-power-bi-data-analyst", platform: "Coursera" },
      { title: "Power BI Guided Learning", url: "https://learn.microsoft.com/en-us/power-bi/guided-learning/", platform: "Microsoft" },
    ],
    practice: [
      { title: "Power BI Community Gallery", url: "https://community.powerbi.com/t5/Data-Stories-Gallery/bd-p/DataStoriesGallery" },
    ],
    docs: [
      { title: "Power BI Documentation", url: "https://learn.microsoft.com/en-us/power-bi/" },
    ],
  },
  {
    skill: "Data Visualization",
    youtube: [
      { title: "Data Visualization with Python – freeCodeCamp", url: "https://www.youtube.com/watch?v=a9UrKTVEhZM" },
      { title: "Data Visualization Tutorial", url: "https://www.youtube.com/watch?v=Gp2m8ZuXoPg" },
    ],
    courses: [
      { title: "Data Visualization with Tableau", url: "https://www.coursera.org/learn/data-visualization-tableau", platform: "Coursera" },
    ],
    practice: [
      { title: "Tableau Public Gallery", url: "https://public.tableau.com/en-us/gallery/" },
      { title: "Matplotlib Gallery", url: "https://matplotlib.org/stable/gallery/index.html" },
    ],
    docs: [
      { title: "Matplotlib Documentation", url: "https://matplotlib.org/stable/contents.html" },
      { title: "Seaborn Documentation", url: "https://seaborn.pydata.org/" },
    ],
  },
  {
    skill: "Java",
    youtube: [
      { title: "Java Full Course – Bro Code", url: "https://www.youtube.com/watch?v=xk4_1vDrzzo" },
      { title: "Java Programming Full Course", url: "https://www.youtube.com/watch?v=eIrMbAQSU34" },
    ],
    courses: [
      { title: "Java Programming – MOOC.fi", url: "https://java-programming.mooc.fi/", platform: "MOOC.fi" },
    ],
    practice: [
      { title: "LeetCode Java", url: "https://leetcode.com/problemset/all/" },
      { title: "HackerRank Java", url: "https://www.hackerrank.com/domains/java" },
    ],
    docs: [
      { title: "Java SE Documentation", url: "https://docs.oracle.com/en/java/" },
    ],
  },
  {
    skill: "Communication",
    youtube: [
      { title: "Communication Skills Course", url: "https://www.youtube.com/watch?v=HAnw168huqA" },
    ],
    courses: [
      { title: "Improving Communication Skills", url: "https://www.coursera.org/learn/wharton-communication-skills", platform: "Coursera" },
    ],
    practice: [
      { title: "Toastmasters", url: "https://www.toastmasters.org/" },
    ],
    docs: [
      { title: "Harvard Business Review – Communication", url: "https://hbr.org/topic/communication" },
    ],
  },
  {
    skill: "Problem Solving",
    youtube: [
      { title: "DSA Full Course – Abdul Bari", url: "https://www.youtube.com/playlist?list=PLDN4rrl48XKpZkf03iYFl-O29szjTrs_O" },
      { title: "Problem Solving Techniques", url: "https://www.youtube.com/watch?v=E8dYoF-2yU4" },
    ],
    courses: [
      { title: "Algorithmic Toolbox", url: "https://www.coursera.org/learn/algorithmic-toolbox", platform: "Coursera" },
    ],
    practice: [
      { title: "LeetCode", url: "https://leetcode.com/" },
      { title: "Codeforces", url: "https://codeforces.com/" },
    ],
    docs: [
      { title: "GeeksforGeeks DSA", url: "https://www.geeksforgeeks.org/data-structures/" },
    ],
  },
];

export function getResourcesForSkill(skillName: string): LearningResource | undefined {
  return learningResources.find((r) => r.skill.toLowerCase() === skillName.toLowerCase());
}
