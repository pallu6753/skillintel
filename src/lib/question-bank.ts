export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  category: "skill" | "academic";
  topic: string;
  difficulty: "easy" | "medium" | "hard";
  explanation: string;
}

export const questionBank: QuizQuestion[] = [
  // Python
  { id: "py1", question: "What is the output of print(type([])) in Python?", options: ["<class 'list'>", "<class 'tuple'>", "<class 'dict'>", "<class 'set'>"], correctAnswer: 0, category: "skill", topic: "Python", difficulty: "easy", explanation: "[] creates an empty list, so type([]) returns <class 'list'>." },
  { id: "py2", question: "What does 'self' refer to in a Python class?", options: ["The class itself", "The current instance", "A global variable", "The parent class"], correctAnswer: 1, category: "skill", topic: "Python", difficulty: "easy", explanation: "'self' refers to the current instance of the class, allowing access to its attributes and methods." },
  { id: "py3", question: "Which keyword is used to create a generator in Python?", options: ["return", "yield", "generate", "iter"], correctAnswer: 1, category: "skill", topic: "Python", difficulty: "medium", explanation: "'yield' pauses the function and returns a value, making it a generator function." },
  { id: "py4", question: "What is a decorator in Python?", options: ["A loop construct", "A function that modifies another function", "A data type", "A class method"], correctAnswer: 1, category: "skill", topic: "Python", difficulty: "medium", explanation: "Decorators wrap a function to extend its behavior without modifying its code." },
  { id: "py5", question: "What is the difference between '==' and 'is' in Python?", options: ["No difference", "'==' checks value, 'is' checks identity", "'is' checks value, '==' checks identity", "Both check identity"], correctAnswer: 1, category: "skill", topic: "Python", difficulty: "medium", explanation: "'==' compares values while 'is' checks if both variables point to the same object in memory." },
  { id: "py6", question: "What does the GIL (Global Interpreter Lock) do?", options: ["Speeds up multi-threading", "Prevents multiple threads from executing Python bytecode simultaneously", "Manages memory allocation", "Handles file I/O"], correctAnswer: 1, category: "skill", topic: "Python", difficulty: "hard", explanation: "The GIL ensures only one thread executes Python bytecode at a time, which can be a bottleneck for CPU-bound multi-threaded programs." },
  { id: "py7", question: "What is list comprehension?", options: ["A way to sort lists", "A concise way to create lists", "A method to delete lists", "A type of linked list"], correctAnswer: 1, category: "skill", topic: "Python", difficulty: "easy", explanation: "List comprehension provides a concise syntax: [expr for item in iterable if condition]." },
  { id: "py8", question: "What is the output of len('Hello World')?", options: ["10", "11", "12", "Error"], correctAnswer: 1, category: "skill", topic: "Python", difficulty: "easy", explanation: "'Hello World' has 11 characters including the space." },

  // SQL
  { id: "sql1", question: "Which SQL clause is used to filter grouped results?", options: ["WHERE", "HAVING", "FILTER", "GROUP BY"], correctAnswer: 1, category: "skill", topic: "SQL", difficulty: "medium", explanation: "HAVING filters groups after GROUP BY, while WHERE filters rows before grouping." },
  { id: "sql2", question: "Which JOIN returns all rows from both tables?", options: ["INNER JOIN", "LEFT JOIN", "RIGHT JOIN", "FULL OUTER JOIN"], correctAnswer: 3, category: "skill", topic: "SQL", difficulty: "medium", explanation: "FULL OUTER JOIN returns all rows from both tables, with NULLs where there's no match." },
  { id: "sql3", question: "What does DISTINCT do in SQL?", options: ["Sorts results", "Removes duplicate rows", "Counts rows", "Groups rows"], correctAnswer: 1, category: "skill", topic: "SQL", difficulty: "easy", explanation: "DISTINCT removes duplicate rows from the result set." },
  { id: "sql4", question: "What is a primary key?", options: ["Any column", "A column that uniquely identifies each row", "A foreign reference", "An index"], correctAnswer: 1, category: "skill", topic: "SQL", difficulty: "easy", explanation: "A primary key uniquely identifies each record in a table and cannot be NULL." },
  { id: "sql5", question: "What is normalization in databases?", options: ["Making data bigger", "Organizing data to reduce redundancy", "Deleting data", "Encrypting data"], correctAnswer: 1, category: "skill", topic: "SQL", difficulty: "medium", explanation: "Normalization organizes data into tables to minimize redundancy and dependency." },
  { id: "sql6", question: "What is an SQL injection?", options: ["A database backup method", "A security vulnerability where malicious SQL is inserted", "A type of JOIN", "A stored procedure"], correctAnswer: 1, category: "skill", topic: "SQL", difficulty: "hard", explanation: "SQL injection exploits vulnerabilities by inserting malicious SQL code through user inputs." },
  { id: "sql7", question: "What does the COALESCE function do?", options: ["Joins tables", "Returns the first non-null value", "Counts nulls", "Deletes nulls"], correctAnswer: 1, category: "skill", topic: "SQL", difficulty: "hard", explanation: "COALESCE returns the first non-null value in a list of expressions." },
  { id: "sql8", question: "What is a subquery?", options: ["A query inside another query", "A duplicate query", "A backup query", "A delete query"], correctAnswer: 0, category: "skill", topic: "SQL", difficulty: "medium", explanation: "A subquery is a query nested inside another query, used to return data for the outer query." },

  // Machine Learning
  { id: "ml1", question: "What does the 'fit' method do in scikit-learn?", options: ["Makes predictions", "Trains the model", "Evaluates the model", "Preprocesses data"], correctAnswer: 1, category: "skill", topic: "Machine Learning", difficulty: "medium", explanation: "The fit() method trains the model on the provided training data." },
  { id: "ml2", question: "What is overfitting in ML?", options: ["Model performs well on training data but poorly on test data", "Model performs poorly on both", "Model is too simple", "Model has too few features"], correctAnswer: 0, category: "skill", topic: "Machine Learning", difficulty: "hard", explanation: "Overfitting occurs when a model learns noise in training data, reducing its ability to generalize." },
  { id: "ml3", question: "Which algorithm is best for classification with small datasets?", options: ["Deep Learning", "Random Forest", "K-Nearest Neighbors", "Linear Regression"], correctAnswer: 2, category: "skill", topic: "Machine Learning", difficulty: "hard", explanation: "KNN works well with small datasets as it doesn't need to learn complex parameters." },
  { id: "ml4", question: "What is cross-validation?", options: ["Testing on training data", "Splitting data into folds for training and testing", "Using two datasets", "A type of neural network"], correctAnswer: 1, category: "skill", topic: "Machine Learning", difficulty: "medium", explanation: "Cross-validation splits data into k folds, training on k-1 and testing on 1, rotating through all folds." },
  { id: "ml5", question: "What is the bias-variance tradeoff?", options: ["Choosing between speed and accuracy", "Balancing underfitting and overfitting", "Selecting features", "Tuning hyperparameters"], correctAnswer: 1, category: "skill", topic: "Machine Learning", difficulty: "hard", explanation: "High bias = underfitting, high variance = overfitting. The tradeoff is finding the right model complexity." },
  { id: "ml6", question: "What is a confusion matrix?", options: ["A random matrix", "A table showing predicted vs actual classifications", "A correlation matrix", "An error matrix"], correctAnswer: 1, category: "skill", topic: "Machine Learning", difficulty: "medium", explanation: "A confusion matrix shows True Positives, True Negatives, False Positives, and False Negatives." },
  { id: "ml7", question: "What is gradient descent?", options: ["A sorting algorithm", "An optimization algorithm to minimize loss", "A classification method", "A data preprocessing step"], correctAnswer: 1, category: "skill", topic: "Machine Learning", difficulty: "medium", explanation: "Gradient descent iteratively adjusts parameters in the direction that reduces the loss function." },
  { id: "ml8", question: "What type of learning is clustering?", options: ["Supervised", "Unsupervised", "Reinforcement", "Semi-supervised"], correctAnswer: 1, category: "skill", topic: "Machine Learning", difficulty: "easy", explanation: "Clustering is unsupervised learning as it finds patterns without labeled data." },

  // Statistics
  { id: "st1", question: "What is the median of [1, 3, 5, 7, 9]?", options: ["3", "5", "7", "4"], correctAnswer: 1, category: "skill", topic: "Statistics", difficulty: "easy", explanation: "The median is the middle value in a sorted dataset. Here it's the 3rd value: 5." },
  { id: "st2", question: "What does standard deviation measure?", options: ["Central tendency", "Spread of data around the mean", "Skewness", "Kurtosis"], correctAnswer: 1, category: "skill", topic: "Statistics", difficulty: "easy", explanation: "Standard deviation quantifies the amount of variation or dispersion in a set of values." },
  { id: "st3", question: "What is a p-value?", options: ["Probability of the data given null hypothesis is true", "Probability of error", "Population percentage", "Power of test"], correctAnswer: 0, category: "skill", topic: "Statistics", difficulty: "medium", explanation: "A p-value is the probability of observing results as extreme as the data, assuming the null hypothesis is true." },
  { id: "st4", question: "What is the Central Limit Theorem?", options: ["Means of samples approach normal distribution as sample size increases", "All data is normally distributed", "Large samples are always accurate", "Variance decreases with sample size"], correctAnswer: 0, category: "skill", topic: "Statistics", difficulty: "hard", explanation: "CLT states that the distribution of sample means approaches a normal distribution as n increases, regardless of population distribution." },

  // Java
  { id: "ja1", question: "What is the JVM?", options: ["Java Virtual Machine — runs Java bytecode", "Java Version Manager", "Java Variable Method", "Java Visual Monitor"], correctAnswer: 0, category: "skill", topic: "Java", difficulty: "easy", explanation: "JVM (Java Virtual Machine) executes Java bytecode, enabling platform independence." },
  { id: "ja2", question: "What is polymorphism in Java?", options: ["Multiple inheritance", "Same method behaving differently based on object", "Variable naming convention", "Error handling"], correctAnswer: 1, category: "skill", topic: "Java", difficulty: "medium", explanation: "Polymorphism allows methods to behave differently based on the object that calls them (method overriding/overloading)." },
  { id: "ja3", question: "What is the difference between abstract class and interface?", options: ["No difference", "Abstract class can have implementation, interface cannot (before Java 8)", "Interface can have constructors", "Abstract class supports multiple inheritance"], correctAnswer: 1, category: "skill", topic: "Java", difficulty: "hard", explanation: "Abstract classes can have method implementations and state, while interfaces (pre-Java 8) only define method signatures." },
  { id: "ja4", question: "What does 'final' keyword do in Java?", options: ["Ends the program", "Prevents modification (variable/method/class)", "Creates a loop", "Defines a constructor"], correctAnswer: 1, category: "skill", topic: "Java", difficulty: "easy", explanation: "'final' makes variables constant, methods non-overridable, and classes non-inheritable." },

  // Data Visualization
  { id: "dv1", question: "Which Python library is primarily used for data visualization?", options: ["NumPy", "Pandas", "Matplotlib", "Scikit-learn"], correctAnswer: 2, category: "skill", topic: "Data Visualization", difficulty: "easy", explanation: "Matplotlib is Python's foundational plotting library for creating static, animated, and interactive visualizations." },
  { id: "dv2", question: "What type of chart is best for showing proportions?", options: ["Line chart", "Pie chart", "Scatter plot", "Histogram"], correctAnswer: 1, category: "skill", topic: "Data Visualization", difficulty: "easy", explanation: "Pie charts show proportions of a whole, making it easy to compare parts to the total." },
  { id: "dv3", question: "What is Seaborn built on top of?", options: ["Plotly", "Matplotlib", "D3.js", "Bokeh"], correctAnswer: 1, category: "skill", topic: "Data Visualization", difficulty: "medium", explanation: "Seaborn is a statistical visualization library built on top of Matplotlib with a higher-level API." },

  // Power BI
  { id: "pb1", question: "What is DAX in Power BI?", options: ["A chart type", "Data Analysis Expressions — a formula language", "A data connector", "A dashboard template"], correctAnswer: 1, category: "skill", topic: "Power BI", difficulty: "medium", explanation: "DAX (Data Analysis Expressions) is a formula language used in Power BI for calculations and data analysis." },
  { id: "pb2", question: "What is a measure in Power BI?", options: ["A table column", "A calculated value using DAX", "A filter", "A report page"], correctAnswer: 1, category: "skill", topic: "Power BI", difficulty: "medium", explanation: "A measure is a dynamic calculation created using DAX that aggregates data based on context." },

  // Deep Learning
  { id: "dl1", question: "What is a neural network activation function?", options: ["A function that starts the network", "A function that introduces non-linearity", "A loss function", "A data preprocessing function"], correctAnswer: 1, category: "skill", topic: "Deep Learning", difficulty: "medium", explanation: "Activation functions introduce non-linearity, enabling networks to learn complex patterns." },
  { id: "dl2", question: "What is backpropagation?", options: ["Forward passing data", "Computing gradients to update weights", "A data augmentation technique", "A regularization method"], correctAnswer: 1, category: "skill", topic: "Deep Learning", difficulty: "hard", explanation: "Backpropagation calculates the gradient of the loss function with respect to weights, enabling learning via gradient descent." },
  { id: "dl3", question: "What is a CNN best suited for?", options: ["Text data", "Image data", "Tabular data", "Time series only"], correctAnswer: 1, category: "skill", topic: "Deep Learning", difficulty: "medium", explanation: "Convolutional Neural Networks (CNNs) are designed for image processing, using convolutional layers to detect spatial features." },

  // Academic - Data Structures
  { id: "ds1", question: "What is the time complexity of binary search?", options: ["O(n)", "O(log n)", "O(n²)", "O(1)"], correctAnswer: 1, category: "academic", topic: "Data Structures", difficulty: "easy", explanation: "Binary search halves the search space each step, giving O(log n) complexity." },
  { id: "ds2", question: "What data structure uses LIFO principle?", options: ["Queue", "Stack", "Array", "Linked List"], correctAnswer: 1, category: "academic", topic: "Data Structures", difficulty: "easy", explanation: "Stack follows Last-In-First-Out (LIFO) — the last element added is the first removed." },
  { id: "ds3", question: "What is the worst-case time complexity of QuickSort?", options: ["O(n log n)", "O(n²)", "O(n)", "O(log n)"], correctAnswer: 1, category: "academic", topic: "Data Structures", difficulty: "medium", explanation: "QuickSort's worst case is O(n²) when the pivot selection is poor (e.g., already sorted data)." },
  { id: "ds4", question: "What is a hash collision?", options: ["Two keys mapping to the same index", "A hash function error", "Memory overflow", "A sorting error"], correctAnswer: 0, category: "academic", topic: "Data Structures", difficulty: "medium", explanation: "A collision occurs when two different keys produce the same hash value, requiring resolution strategies like chaining." },
  { id: "ds5", question: "What is the time complexity of accessing an element in an array by index?", options: ["O(1)", "O(n)", "O(log n)", "O(n²)"], correctAnswer: 0, category: "academic", topic: "Data Structures", difficulty: "easy", explanation: "Array access by index is O(1) because elements are stored in contiguous memory." },

  // Academic - DBMS
  { id: "db1", question: "Which normal form eliminates transitive dependencies?", options: ["1NF", "2NF", "3NF", "BCNF"], correctAnswer: 2, category: "academic", topic: "DBMS", difficulty: "medium", explanation: "3NF eliminates transitive dependencies — no non-key attribute depends on another non-key attribute." },
  { id: "db2", question: "What is ACID in database transactions?", options: ["A programming language", "Atomicity, Consistency, Isolation, Durability", "A type of index", "A backup method"], correctAnswer: 1, category: "academic", topic: "DBMS", difficulty: "medium", explanation: "ACID properties ensure reliable database transactions: Atomicity, Consistency, Isolation, Durability." },
  { id: "db3", question: "What is a foreign key?", options: ["A primary key in another table", "A column referencing a primary key in another table", "An encrypted key", "A unique index"], correctAnswer: 1, category: "academic", topic: "DBMS", difficulty: "easy", explanation: "A foreign key creates a relationship between tables by referencing the primary key of another table." },

  // Academic - Operating Systems
  { id: "os1", question: "What is a deadlock in operating systems?", options: ["When a process crashes", "When two processes wait for each other indefinitely", "When CPU overheats", "When memory is full"], correctAnswer: 1, category: "academic", topic: "Operating Systems", difficulty: "medium", explanation: "A deadlock occurs when two or more processes are blocked, each waiting for resources held by the other." },
  { id: "os2", question: "What is the purpose of virtual memory?", options: ["Speed up CPU", "Extend available memory using disk", "Encrypt data", "Compress files"], correctAnswer: 1, category: "academic", topic: "Operating Systems", difficulty: "medium", explanation: "Virtual memory uses disk space to extend RAM, allowing programs larger than physical memory to run." },
  { id: "os3", question: "What is a semaphore?", options: ["A type of memory", "A synchronization mechanism for process coordination", "A CPU register", "A file system"], correctAnswer: 1, category: "academic", topic: "Operating Systems", difficulty: "hard", explanation: "A semaphore is a variable used to control access to shared resources in concurrent programming." },

  // Academic - Computer Networks
  { id: "cn1", question: "Which layer of OSI model handles routing?", options: ["Data Link", "Network", "Transport", "Session"], correctAnswer: 1, category: "academic", topic: "Computer Networks", difficulty: "easy", explanation: "The Network layer (Layer 3) handles routing, forwarding, and addressing (e.g., IP)." },
  { id: "cn2", question: "What does TCP stand for?", options: ["Transfer Control Protocol", "Transmission Control Protocol", "Total Communication Protocol", "Transport Carrier Protocol"], correctAnswer: 1, category: "academic", topic: "Computer Networks", difficulty: "easy", explanation: "TCP (Transmission Control Protocol) provides reliable, ordered, and error-checked data delivery." },
  { id: "cn3", question: "What is the difference between TCP and UDP?", options: ["No difference", "TCP is reliable and connection-oriented, UDP is faster but unreliable", "UDP is more secure", "TCP is faster"], correctAnswer: 1, category: "academic", topic: "Computer Networks", difficulty: "medium", explanation: "TCP guarantees delivery with connection setup; UDP sends data without guarantees, making it faster for streaming." },
];

export function generateQuiz(
  category: "skill" | "academic",
  topic?: string,
  count: number = 10,
  difficulty?: "easy" | "medium" | "hard"
): QuizQuestion[] {
  let filtered = questionBank.filter((q) => q.category === category);
  if (topic) filtered = filtered.filter((q) => q.topic === topic);
  if (difficulty) filtered = filtered.filter((q) => q.difficulty === difficulty);

  // Shuffle and take count
  const shuffled = [...filtered].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, Math.min(count, shuffled.length));
}

export function getAvailableTopics(category: "skill" | "academic"): string[] {
  const topics = new Set(questionBank.filter((q) => q.category === category).map((q) => q.topic));
  return Array.from(topics).sort();
}
