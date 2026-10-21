export interface InterviewQuestion {
  id: string;
  question: string;
  type: "Technical" | "HR" | "Coding" | "Data Science";
  difficulty: "easy" | "medium" | "hard";
  keywords: string[];
  sampleAnswer: string;
  suggestedStructure?: string;
  followUpQuestion?: string;
}

export interface EvaluationResult {
  score: number;
  maxScore: number;
  feedback: string;
  matchedKeywords: string[];
  missedKeywords: string[];
  strengths: string[];
  improvements: string[];
  suggestedStructure: string;
  followUpQuestion: string;
}

export const interviewQuestions: InterviewQuestion[] = [
  // Technical
  { 
    id: "t1", 
    question: "Explain the difference between overfitting and underfitting in machine learning models.", 
    type: "Technical", 
    difficulty: "medium", 
    keywords: ["overfitting", "underfitting", "bias", "variance", "generalize", "training", "test"], 
    sampleAnswer: "Overfitting occurs when a model learns noise in training data and performs poorly on unseen data (high variance). Underfitting occurs when a model is too simple to capture patterns (high bias). The goal is to find the right balance through cross-validation and regularization.",
    suggestedStructure: "1. Definition of both concepts\n2. Bias-variance tradeoff perspective\n3. Practical mitigation strategies (L1/L2 regularization, dropout, cross-validation)",
    followUpQuestion: "How would you identify whether your deep neural network is specifically overfitting rather than underfitting using training vs validation loss curves?"
  },
  { 
    id: "t2", 
    question: "What is cross-validation and why is it essential in model evaluation?", 
    type: "Technical", 
    difficulty: "medium", 
    keywords: ["cross", "validation", "fold", "k-fold", "generalization", "split", "train", "test"], 
    sampleAnswer: "Cross-validation splits data into k folds, using each fold as a test set while training on the rest. It provides a more reliable estimate of model performance and reduces overfitting to a single train-test split.",
    suggestedStructure: "1. Core mechanism of K-Fold\n2. Advantage over single hold-out set\n3. Stratified vs standard cross-validation for imbalanced data",
    followUpQuestion: "When would you prefer Stratified K-Fold over standard K-Fold cross-validation?"
  },
  { 
    id: "t3", 
    question: "Explain the concept of normalization in relational databases and the benefits of 3NF.", 
    type: "Technical", 
    difficulty: "medium", 
    keywords: ["normalization", "redundancy", "normal form", "1NF", "2NF", "3NF", "dependency", "anomaly"], 
    sampleAnswer: "Normalization organizes database tables to reduce redundancy. 1NF ensures atomic values, 2NF removes partial dependencies, 3NF eliminates transitive dependencies. This prevents insertion, update, and deletion anomalies.",
    suggestedStructure: "1. Purpose of database normalization\n2. Progressive progression: 1NF → 2NF → 3NF\n3. Anomaly prevention and read/write performance tradeoffs",
    followUpQuestion: "In high-throughput analytics or data warehousing, why might you intentionally denormalize a 3NF schema into a Star Schema?"
  },
  { 
    id: "t4", 
    question: "What is the architectural difference between SQL and NoSQL databases, and how do you choose between them?", 
    type: "Technical", 
    difficulty: "easy", 
    keywords: ["SQL", "NoSQL", "relational", "schema", "scalable", "structured", "unstructured", "MongoDB", "table"], 
    sampleAnswer: "SQL databases are relational with ACID transactions and fixed schemas (PostgreSQL, MySQL). NoSQL databases provide flexible data models like documents, key-values, or graphs (MongoDB, Redis). Choose SQL for complex transactions and structured relationships; choose NoSQL for high-volume unstructured reads or dynamic schemas.",
    suggestedStructure: "1. Relational ACID vs Flexible Schema\n2. Vertical vs Horizontal scaling characteristics\n3. Concrete selection criteria based on application requirements",
    followUpQuestion: "How does the CAP theorem influence your database selection when designing a globally distributed service?"
  },
  { 
    id: "t5", 
    question: "Explain the SOLID principles in software engineering with a real-world example.", 
    type: "Technical", 
    difficulty: "hard", 
    keywords: ["single", "responsibility", "open", "closed", "liskov", "interface", "segregation", "dependency", "inversion"], 
    sampleAnswer: "S: Single Responsibility (one reason to change). O: Open/Closed (open for extension, closed for modification). L: Liskov Substitution (subtypes must be substitutable). I: Interface Segregation (clean specific interfaces). D: Dependency Inversion (depend on abstractions, not concretions).",
    suggestedStructure: "1. List each letter and its principle\n2. Provide an example of Open/Closed or Dependency Inversion\n3. Mention how it promotes testability and maintainability",
    followUpQuestion: "How does Dependency Injection in modern frameworks help implement the Dependency Inversion Principle?"
  },

  // HR
  { 
    id: "h1", 
    question: "Tell me about yourself, your academic background, and what drives your interest in this role.", 
    type: "HR", 
    difficulty: "easy", 
    keywords: ["education", "skill", "experience", "project", "passion", "goal", "learn", "team", "university"], 
    sampleAnswer: "I am a Data Science student passionate about transforming raw market and user data into actionable intelligence. Through coursework and practical projects with Python, SQL, and Machine Learning, I have built complete analytics pipelines. I am excited about this role because it allows me to apply analytical problem solving to high-impact products.",
    suggestedStructure: "1. Present: Current education, focus, and core technical strengths\n2. Past: Key project or academic milestone with measurable impact\n3. Future: Alignment with company mission and career trajectory",
    followUpQuestion: "What specific project in your coursework provided the most valuable learning experience, and why?"
  },
  { 
    id: "h2", 
    question: "Describe a challenging situation during a team project and how you resolved conflict or handled pressure.", 
    type: "HR", 
    difficulty: "medium", 
    keywords: ["challenge", "problem", "solution", "team", "deadline", "learn", "result", "communicate", "adapt"], 
    sampleAnswer: "During a semester capstone project, our team faced a tight two-week deadline with conflicting ideas about database schema design. I scheduled a focused alignment meeting where we mapped out the user stories and evaluated the query latency for both approaches. By grounding the decision in empirical testing, we aligned the team and delivered on schedule.",
    suggestedStructure: "Use the STAR Framework:\n- Situation: Context & constraints\n- Task: Objective and conflict\n- Action: Communication & leadership steps taken\n- Result: Quantified or positive outcome",
    followUpQuestion: "If a teammate repeatedly fails to deliver their portion of code before a sprint deadline, how do you handle it?"
  },
  { 
    id: "h3", 
    question: "Where do you see your career progressing over the next 3 to 5 years?", 
    type: "HR", 
    difficulty: "easy", 
    keywords: ["grow", "lead", "expert", "career", "role", "contribute", "learn", "senior", "goal", "impact"], 
    sampleAnswer: "Over the next 3-5 years, I aim to master production engineering and machine learning workflows, progressing into a senior engineering contributor. I want to take ownership of complex systems, mentor junior developers, and drive measurable business outcomes.",
    suggestedStructure: "1. Year 1-2: Skill mastery and rapid organizational impact\n2. Year 3-5: System ownership, architectural leadership, and mentorship\n3. Long-term commitment to continuous learning",
    followUpQuestion: "What skills are you actively learning right now outside of your formal academic curriculum to prepare for that goal?"
  },

  // Coding
  { 
    id: "c1", 
    question: "How would you detect and return all duplicate elements in an unsorted integer array in O(n) time?", 
    type: "Coding", 
    difficulty: "easy", 
    keywords: ["set", "hash", "loop", "count", "duplicate", "seen", "O(n)", "dictionary", "frequency"], 
    sampleAnswer: "Use a hash set to track elements seen so far and another set or list for identified duplicates. Traverse the array once: if element in seen, add to duplicates; otherwise, add to seen. This achieves O(n) time and O(n) auxiliary space.",
    suggestedStructure: "1. State the optimal time and space complexity upfront\n2. Explain the data structure choice (Hash Set vs Sorting)\n3. Walk through edge cases (empty array, all duplicates, no duplicates)",
    followUpQuestion: "Can you solve this in O(1) auxiliary space if the array elements are guaranteed to be within the range [1, n]?"
  },
  { 
    id: "c2", 
    question: "Explain the mechanism of a Least Recently Used (LRU) Cache and how to implement get/put in O(1) time.", 
    type: "Coding", 
    difficulty: "hard", 
    keywords: ["LRU", "cache", "hash", "linked", "list", "O(1)", "get", "put", "evict", "capacity"], 
    sampleAnswer: "An LRU Cache combines a Hash Map and a Doubly Linked List. The hash map maps keys to list nodes for O(1) lookups. The doubly linked list maintains access order: recent items move to head, least recent are evicted from tail when capacity is exceeded.",
    suggestedStructure: "1. Explain why a single array or map alone cannot achieve O(1) for both operations\n2. Explain the dual-structure: Hash Map + Doubly Linked List\n3. Describe node relocation on 'get' and eviction on 'put'",
    followUpQuestion: "How would you handle thread-safety if multiple threads concurrently execute get() and put() on this cache?"
  },

  // Data Science
  { 
    id: "d1", 
    question: "Explain the mathematical and practical differences between Precision, Recall, and the F1-Score.", 
    type: "Data Science", 
    difficulty: "medium", 
    keywords: ["precision", "recall", "F1", "true positive", "false positive", "false negative", "accuracy", "metric"], 
    sampleAnswer: "Precision is TP / (TP + FP), measuring the reliability of positive predictions. Recall is TP / (TP + FN), measuring coverage of actual positive cases. F1-score is the harmonic mean of precision and recall: 2 * (Precision * Recall) / (Precision + Recall). Precision is critical in spam detection; Recall is critical in medical diagnosis or fraud.",
    suggestedStructure: "1. Formula and definition for Precision and Recall\n2. Explain why Accuracy fails on imbalanced datasets\n3. Real-world scenario highlighting Precision vs Recall tradeoff\n4. Role of F1 as harmonic mean",
    followUpQuestion: "In high-stakes cancer screening, would you tune your classification threshold to optimize for high Precision or high Recall?"
  },
  { 
    id: "d2", 
    question: "How do you handle severe class imbalance in a classification problem?", 
    type: "Data Science", 
    difficulty: "medium", 
    keywords: ["imbalance", "SMOTE", "resampling", "undersampling", "oversampling", "class weight", "ROC", "PR-AUC"], 
    sampleAnswer: "Techniques include: 1) Resampling (SMOTE for synthetic minority oversampling or random undersampling), 2) Algorithm adjustment (class weights / focal loss), 3) Metric selection (using PR-AUC instead of standard accuracy), 4) Anomaly detection paradigms for extreme ratios (1:1000).",
    suggestedStructure: "1. Data-level techniques (SMOTE, NearMiss)\n2. Model-level techniques (Class weights, cost-sensitive learning)\n3. Evaluation metric changes (PR-AUC, F1-Score instead of Accuracy)",
    followUpQuestion: "Why should you never apply SMOTE before performing your train-validation-test split?"
  }
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
): EvaluationResult {
  const lowerAnswer = answer.toLowerCase().trim();
  const matched = question.keywords.filter((k) => lowerAnswer.includes(k.toLowerCase()));
  const missed = question.keywords.filter((k) => !lowerAnswer.includes(k.toLowerCase()));

  // Keyword score: up to 5 points
  const keywordScore = Math.min(5, Math.round((matched.length / Math.max(1, question.keywords.length)) * 5));
  
  // Depth & elaboration score: up to 3 points
  const wordCount = lowerAnswer.split(/\s+/).filter(Boolean).length;
  const depthScore = wordCount >= 60 ? 3 : wordCount >= 30 ? 2 : wordCount >= 10 ? 1 : 0;
  
  // Specificity & structure score: up to 2 points
  const structureScore = (lowerAnswer.includes("because") || lowerAnswer.includes("example") || lowerAnswer.includes("tradeoff") || lowerAnswer.includes("result") || lowerAnswer.includes("specifically")) ? 2 : 1;

  const totalScore = Math.min(10, Math.max(1, keywordScore + depthScore + structureScore));

  const strengths: string[] = [];
  if (matched.length >= 3) strengths.push(`Strong domain vocabulary: included ${matched.slice(0, 3).join(", ")}`);
  if (wordCount >= 40) strengths.push("Thorough and well-elaborated response structure");
  if (lowerAnswer.includes("example")) strengths.push("Effectively incorporated practical illustrations");
  if (strengths.length === 0) strengths.push("Attempted core answer structure");

  const improvements: string[] = [];
  if (missed.length > 0) improvements.push(`Incorporate key industry terms: ${missed.slice(0, 3).join(", ")}`);
  if (wordCount < 40) improvements.push("Provide more technical depth and concrete real-world examples");
  if (!lowerAnswer.includes("example")) improvements.push("Add an example from your own project experience to make it memorable");

  let feedback = "";
  if (totalScore >= 8) feedback = "Outstanding response! Comprehensive technical and conceptual grounding.";
  else if (totalScore >= 6) feedback = "Solid response. Adding a specific project example and deeper nuance will make it interview-ready.";
  else if (totalScore >= 4) feedback = "Moderate answer. Make sure to clearly define the fundamental mechanism and trade-offs.";
  else feedback = "Needs development. Review the suggested structure and fundamental concepts.";

  return {
    score: totalScore,
    maxScore: 10,
    feedback,
    matchedKeywords: matched,
    missedKeywords: missed,
    strengths,
    improvements,
    suggestedStructure: question.suggestedStructure || "1. Direct conceptual answer\n2. Core trade-off or mechanism\n3. Practical project example",
    followUpQuestion: question.followUpQuestion || "How would you implement or troubleshoot this in a high-concurrency production setting?"
  };
}
