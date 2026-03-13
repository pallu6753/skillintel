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
      { title: "SQL Full Course – freeCodeCamp", url: "https://www.youtube.com/watch?v=HXV3zeQKqGY" },
      { title: "SQL Tutorial for Beginners", url: "https://www.youtube.com/watch?v=7S_tz1z_5bA" },
    ],
    courses: [
      { title: "SQL for Data Science", url: "https://www.coursera.org/learn/sql-for-data-science", platform: "Coursera" },
      { title: "W3Schools SQL", url: "https://www.w3schools.com/sql/", platform: "W3Schools" },
    ],
    practice: [
      { title: "SQLZoo", url: "https://sqlzoo.net/" },
      { title: "HackerRank SQL", url: "https://www.hackerrank.com/domains/sql" },
    ],
    docs: [
      { title: "PostgreSQL Documentation", url: "https://www.postgresql.org/docs/" },
      { title: "MySQL Reference Manual", url: "https://dev.mysql.com/doc/" },
    ],
  },
  {
    skill: "Machine Learning",
    youtube: [
      { title: "Machine Learning by Andrew Ng (Stanford)", url: "https://www.youtube.com/playlist?list=PLLssT5z_DsK-h9vYZkQkYNWcItqhlRJLN" },
      { title: "ML Full Course – Simplilearn", url: "https://www.youtube.com/watch?v=GwIo3gDZCVQ" },
    ],
    courses: [
      { title: "Machine Learning Specialization", url: "https://www.coursera.org/specializations/machine-learning-introduction", platform: "Coursera" },
      { title: "Intro to ML – Kaggle", url: "https://www.kaggle.com/learn/intro-to-machine-learning", platform: "Kaggle" },
    ],
    practice: [
      { title: "Kaggle Competitions", url: "https://www.kaggle.com/competitions" },
      { title: "Scikit-learn Examples", url: "https://scikit-learn.org/stable/auto_examples/" },
    ],
    docs: [
      { title: "Scikit-learn Documentation", url: "https://scikit-learn.org/stable/documentation.html" },
      { title: "Google ML Crash Course", url: "https://developers.google.com/machine-learning/crash-course" },
    ],
  },
  {
    skill: "Statistics",
    youtube: [
      { title: "Statistics Full Course – MarinStatsLectures", url: "https://www.youtube.com/playlist?list=PLqzoL9-eJTNBZDG8jaNuhap1C9q6VHyVa" },
      { title: "Khan Academy Statistics", url: "https://www.youtube.com/playlist?list=PL1328115D3D8A2566" },
      { title: "Statistics for Data Science", url: "https://www.youtube.com/watch?v=xxpc-HPKN28" },
    ],
    courses: [
      { title: "Statistics with Python", url: "https://www.coursera.org/specializations/statistics-with-python", platform: "Coursera" },
      { title: "Khan Academy Stats", url: "https://www.khanacademy.org/math/statistics-probability", platform: "Khan Academy" },
    ],
    practice: [
      { title: "StatQuest", url: "https://statquest.org/" },
      { title: "Brilliant Statistics", url: "https://brilliant.org/courses/statistics/" },
    ],
    docs: [
      { title: "NIST Statistics Handbook", url: "https://www.itl.nist.gov/div898/handbook/" },
    ],
  },
  {
    skill: "Deep Learning",
    youtube: [
      { title: "Deep Learning Specialization – Andrew Ng", url: "https://www.youtube.com/playlist?list=PLkDaE6sCZn6Ec-XTbcX1uRg2_u4xOEky" },
      { title: "Neural Networks – 3Blue1Brown", url: "https://www.youtube.com/playlist?list=PLZHQObOWTQDNU6R1_67000Dx_ZCJB-3pi" },
      { title: "Deep Learning Tutorial", url: "https://www.youtube.com/watch?v=aircAruvnKk" },
    ],
    courses: [
      { title: "Deep Learning Specialization", url: "https://www.coursera.org/specializations/deep-learning", platform: "Coursera" },
      { title: "Fast.ai Practical DL", url: "https://course.fast.ai/", platform: "Fast.ai" },
    ],
    practice: [
      { title: "TensorFlow Playground", url: "https://playground.tensorflow.org/" },
      { title: "Kaggle Deep Learning", url: "https://www.kaggle.com/learn/intro-to-deep-learning" },
    ],
    docs: [
      { title: "TensorFlow Documentation", url: "https://www.tensorflow.org/api_docs" },
      { title: "PyTorch Documentation", url: "https://pytorch.org/docs/stable/" },
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
