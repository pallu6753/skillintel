export interface InterviewQuestion {
  id: string;
  question: string;
  type: "Technical" | "HR" | "Coding" | "Data Science";
  difficulty: "easy" | "medium" | "hard";
  keywords: string[];
  sampleAnswer: string;
}

export const interviewQuestions: InterviewQuestion[] = [
  // Technical
  { id: "t1", question: "Explain the difference between overfitting and underfitting.", type: "Technical", difficulty: "medium", keywords: ["overfitting", "underfitting", "bias", "variance", "generalize", "training", "test"], sampleAnswer: "Overfitting occurs when a model learns noise in training data and performs poorly on unseen data (high variance). Underfitting occurs when a model is too simple to capture patterns (high bias). The goal is to find the right balance." },
  { id: "t2", question: "What is cross-validation and why is it important?", type: "Technical", difficulty: "medium", keywords: ["cross", "validation", "fold", "k-fold", "generalization", "split", "train", "test"], sampleAnswer: "Cross-validation splits data into k folds, using each fold as a test set while training on the rest. It provides a more reliable estimate of model performance and reduces overfitting to a single train-test split." },
  { id: "t3", question: "Explain the concept of normalization in databases.", type: "Technical", difficulty: "medium", keywords: ["normalization", "redundancy", "normal form", "1NF", "2NF", "3NF", "dependency", "anomaly"], sampleAnswer: "Normalization organizes database tables to reduce redundancy. 1NF ensures atomic values, 2NF removes partial dependencies, 3NF eliminates transitive dependencies. This prevents insertion, update, and deletion anomalies." },
  { id: "t4", question: "What is the difference between SQL and NoSQL databases?", type: "Technical", difficulty: "easy", keywords: ["SQL", "NoSQL", "relational", "schema", "scalable", "structured", "unstructured", "MongoDB", "table"], sampleAnswer: "SQL databases are relational with fixed schemas (MySQL, PostgreSQL). NoSQL databases are flexible, supporting documents, key-value pairs, or graphs (MongoDB, Redis). SQL is best for structured data; NoSQL for unstructured/scalable systems." },
  { id: "t5", question: "Explain the SOLID principles in software engineering.", type: "Technical", difficulty: "hard", keywords: ["single", "responsibility", "open", "closed", "liskov", "interface", "segregation", "dependency", "inversion"], sampleAnswer: "S: Single Responsibility — one class, one job. O: Open/Closed — open for extension, closed for modification. L: Liskov Substitution — subtypes must be substitutable. I: Interface Segregation — specific interfaces over general ones. D: Dependency Inversion — depend on abstractions." },
  { id: "t6", question: "What are REST APIs and how do they work?", type: "Technical", difficulty: "easy", keywords: ["REST", "API", "HTTP", "GET", "POST", "PUT", "DELETE", "endpoint", "stateless", "resource"], sampleAnswer: "REST (Representational State Transfer) uses HTTP methods (GET, POST, PUT, DELETE) to perform CRUD operations on resources via URLs. It's stateless, meaning each request contains all needed information." },
  { id: "t7", question: "Explain the time complexity of common sorting algorithms.", type: "Technical", difficulty: "hard", keywords: ["bubble", "merge", "quick", "heap", "O(n)", "log", "complexity", "worst", "average", "sort"], sampleAnswer: "Bubble Sort: O(n²). Merge Sort: O(n log n) always. Quick Sort: O(n log n) average, O(n²) worst. Heap Sort: O(n log n). For most cases, Merge/Quick Sort are preferred for large datasets." },
  { id: "t8", question: "What is the difference between processes and threads?", type: "Technical", difficulty: "medium", keywords: ["process", "thread", "memory", "shared", "independent", "lightweight", "context", "switch", "concurrent"], sampleAnswer: "A process is an independent program with its own memory space. A thread is a lightweight unit within a process that shares memory. Threads are faster to create and context-switch but require synchronization." },

  // HR
  { id: "h1", question: "Tell me about yourself.", type: "HR", difficulty: "easy", keywords: ["education", "skill", "experience", "project", "passion", "goal", "learn", "team", "university"], sampleAnswer: "I'm a B.Tech student in Computer Science with a strong foundation in Python, SQL, and Machine Learning. I've completed projects in data analysis and am passionate about using data to solve real-world problems." },
  { id: "h2", question: "Where do you see yourself in 5 years?", type: "HR", difficulty: "easy", keywords: ["grow", "lead", "expert", "career", "role", "contribute", "learn", "senior", "goal", "impact"], sampleAnswer: "I see myself as a senior data professional, leading projects and mentoring junior team members. I want to deepen my expertise in ML/AI and contribute to impactful products." },
  { id: "h3", question: "What is your greatest weakness?", type: "HR", difficulty: "medium", keywords: ["improve", "learn", "overcome", "challenge", "work", "better", "honest", "growth"], sampleAnswer: "I sometimes spend too much time perfecting details. I'm working on balancing quality with efficiency by setting deadlines and prioritizing the most impactful tasks." },
  { id: "h4", question: "Why should we hire you?", type: "HR", difficulty: "medium", keywords: ["skill", "value", "contribute", "team", "experience", "problem", "solve", "unique", "passion", "result"], sampleAnswer: "I bring a combination of strong technical skills, hands-on project experience, and eagerness to learn. My data analysis projects demonstrate my ability to deliver results and I work well in teams." },
  { id: "h5", question: "Describe a challenging situation and how you handled it.", type: "HR", difficulty: "medium", keywords: ["challenge", "problem", "solution", "team", "deadline", "learn", "result", "communicate", "adapt"], sampleAnswer: "During a group project, we faced a tight deadline with unclear requirements. I organized a team meeting, broke the task into smaller parts, assigned roles, and we delivered on time with clear communication." },
  { id: "h6", question: "How do you handle stress and pressure?", type: "HR", difficulty: "easy", keywords: ["prioritize", "calm", "plan", "organize", "deadline", "break", "focus", "manage", "balance"], sampleAnswer: "I stay organized by breaking tasks into smaller steps and prioritizing based on deadlines. I also take short breaks to stay focused and maintain a healthy work-life balance." },

  // Coding
  { id: "c1", question: "How would you find duplicates in an array?", type: "Coding", difficulty: "easy", keywords: ["set", "hash", "loop", "count", "duplicate", "seen", "O(n)", "dictionary", "frequency"], sampleAnswer: "Use a hash set: iterate through the array, check if each element is in the set. If yes, it's a duplicate. If no, add it. Time: O(n), Space: O(n)." },
  { id: "c2", question: "Explain how you would implement a LRU Cache.", type: "Coding", difficulty: "hard", keywords: ["LRU", "cache", "hash", "linked", "list", "O(1)", "get", "put", "evict", "capacity"], sampleAnswer: "Use a doubly linked list for order tracking and a hash map for O(1) access. On get/put, move the node to the head. When capacity is exceeded, remove the tail (least recently used)." },
  { id: "c3", question: "What is the difference between DFS and BFS?", type: "Coding", difficulty: "medium", keywords: ["DFS", "BFS", "depth", "breadth", "stack", "queue", "tree", "graph", "traverse", "visit"], sampleAnswer: "DFS explores deep before backtracking (uses stack/recursion). BFS explores level by level (uses queue). DFS is good for path finding; BFS finds shortest path in unweighted graphs." },
  { id: "c4", question: "How would you reverse a linked list?", type: "Coding", difficulty: "medium", keywords: ["reverse", "linked", "list", "pointer", "prev", "next", "node", "iterate", "head"], sampleAnswer: "Use three pointers: prev, current, next. For each node, save next, point current to prev, move prev to current, move current to next. Return prev as new head." },

  // Data Science
  { id: "d1", question: "Explain the difference between classification and regression.", type: "Data Science", difficulty: "easy", keywords: ["classification", "regression", "categorical", "continuous", "predict", "label", "discrete", "output"], sampleAnswer: "Classification predicts categorical labels (spam/not spam). Regression predicts continuous values (house prices). Both are supervised learning but differ in output type." },
  { id: "d2", question: "What is feature engineering and why is it important?", type: "Data Science", difficulty: "medium", keywords: ["feature", "engineering", "transform", "create", "variable", "model", "performance", "domain", "knowledge"], sampleAnswer: "Feature engineering is creating new features from existing data to improve model performance. It requires domain knowledge and can include encoding, scaling, combining, or deriving new variables." },
  { id: "d3", question: "How do you handle missing data?", type: "Data Science", difficulty: "medium", keywords: ["missing", "null", "impute", "mean", "median", "mode", "drop", "fill", "NaN", "handle"], sampleAnswer: "Options: drop rows/columns with missing data, impute with mean/median/mode, use interpolation, or use algorithms that handle missing values natively (like XGBoost)." },
  { id: "d4", question: "What is the curse of dimensionality?", type: "Data Science", difficulty: "hard", keywords: ["dimension", "curse", "high", "feature", "sparse", "distance", "PCA", "reduction", "overfit"], sampleAnswer: "As features increase, data becomes sparse in high-dimensional space, making distance metrics unreliable and models prone to overfitting. Solutions: PCA, feature selection, dimensionality reduction." },
  { id: "d5", question: "Explain precision, recall, and F1-score.", type: "Data Science", difficulty: "medium", keywords: ["precision", "recall", "F1", "true positive", "false positive", "false negative", "accuracy", "metric"], sampleAnswer: "Precision = TP/(TP+FP) — accuracy of positive predictions. Recall = TP/(TP+FN) — coverage of actual positives. F1 = harmonic mean of precision and recall, balancing both." },
];

export function getInterviewQuestions(
  type?: InterviewQuestion["type"],
  count: number = 5
): InterviewQuestion[] {
  let filtered = [...interviewQuestions];
  if (type) filtered = filtered.filter((q) => q.type === type);
  const shuffled = filtered.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, Math.min(count, shuffled.length));
}

export function evaluateAnswer(
  question: InterviewQuestion,
  answer: string
): { score: number; maxScore: number; feedback: string; matchedKeywords: string[]; missedKeywords: string[] } {
  const lowerAnswer = answer.toLowerCase();
  const matched = question.keywords.filter((k) => lowerAnswer.includes(k.toLowerCase()));
  const missed = question.keywords.filter((k) => !lowerAnswer.includes(k.toLowerCase()));

  const keywordScore = Math.min(5, Math.round((matched.length / question.keywords.length) * 5));
  const lengthScore = answer.length > 200 ? 3 : answer.length > 100 ? 2 : answer.length > 30 ? 1 : 0;
  const totalScore = Math.min(10, keywordScore + lengthScore + (answer.length > 50 ? 2 : 0));

  let feedback = "";
  if (totalScore >= 8) feedback = "Excellent answer! You covered the key concepts thoroughly.";
  else if (totalScore >= 6) feedback = "Good answer. Consider adding more specific details and examples.";
  else if (totalScore >= 4) feedback = "Decent attempt. Try to cover more key concepts and provide examples.";
  else feedback = "Needs improvement. Study the topic and try to cover the fundamental concepts.";

  if (missed.length > 0 && missed.length <= 4) {
    feedback += ` Consider mentioning: ${missed.slice(0, 3).join(", ")}.`;
  }

  return { score: totalScore, maxScore: 10, feedback, matchedKeywords: matched, missedKeywords: missed };
}
