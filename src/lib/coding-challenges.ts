export interface CodingChallenge {
  id: string;
  title: string;
  description: string;
  difficulty: "Easy" | "Medium" | "Hard";
  topic: string;
  starterCode: string;
  solution: string;
  explanation: string;
  testCases: string[];
}

export const codingChallenges: CodingChallenge[] = [
  // Arrays
  {
    id: "arr1",
    title: "Two Sum",
    description: "Given an array of integers `nums` and an integer `target`, return the indices of the two numbers that add up to `target`.\n\n**Example:**\n- Input: nums = [2, 7, 11, 15], target = 9\n- Output: [0, 1]\n- Explanation: nums[0] + nums[1] = 2 + 7 = 9",
    difficulty: "Easy",
    topic: "Arrays",
    starterCode: "def two_sum(nums, target):\n    # Your code here\n    pass",
    solution: "def two_sum(nums, target):\n    seen = {}\n    for i, num in enumerate(nums):\n        complement = target - num\n        if complement in seen:\n            return [seen[complement], i]\n        seen[num] = i\n    return []",
    explanation: "Use a hash map to store each number and its index. For each number, check if the complement (target - num) exists in the map. This gives O(n) time complexity.",
    testCases: ["two_sum([2,7,11,15], 9) → [0,1]", "two_sum([3,2,4], 6) → [1,2]", "two_sum([3,3], 6) → [0,1]"],
  },
  {
    id: "arr2",
    title: "Maximum Subarray",
    description: "Given an integer array `nums`, find the contiguous subarray with the largest sum.\n\n**Example:**\n- Input: nums = [-2, 1, -3, 4, -1, 2, 1, -5, 4]\n- Output: 6\n- Explanation: [4, -1, 2, 1] has the largest sum = 6",
    difficulty: "Medium",
    topic: "Arrays",
    starterCode: "def max_subarray(nums):\n    # Your code here\n    pass",
    solution: "def max_subarray(nums):\n    max_sum = current_sum = nums[0]\n    for num in nums[1:]:\n        current_sum = max(num, current_sum + num)\n        max_sum = max(max_sum, current_sum)\n    return max_sum",
    explanation: "Kadane's Algorithm: Track the maximum sum ending at each position. If current_sum becomes negative, restart from the current element.",
    testCases: ["max_subarray([-2,1,-3,4,-1,2,1,-5,4]) → 6", "max_subarray([1]) → 1", "max_subarray([-1]) → -1"],
  },
  {
    id: "arr3",
    title: "Remove Duplicates from Sorted Array",
    description: "Given a sorted array `nums`, remove duplicates in-place and return the new length.\n\n**Example:**\n- Input: nums = [1, 1, 2]\n- Output: 2, nums = [1, 2, ...]",
    difficulty: "Easy",
    topic: "Arrays",
    starterCode: "def remove_duplicates(nums):\n    # Your code here\n    pass",
    solution: "def remove_duplicates(nums):\n    if not nums:\n        return 0\n    i = 0\n    for j in range(1, len(nums)):\n        if nums[j] != nums[i]:\n            i += 1\n            nums[i] = nums[j]\n    return i + 1",
    explanation: "Use two pointers: 'i' tracks the position of the last unique element, 'j' scans forward. When a new unique element is found, increment i and copy it.",
    testCases: ["remove_duplicates([1,1,2]) → 2", "remove_duplicates([0,0,1,1,1,2,2,3,3,4]) → 5"],
  },

  // Strings
  {
    id: "str1",
    title: "Reverse a String",
    description: "Write a function to reverse a string.\n\n**Example:**\n- Input: 'hello'\n- Output: 'olleh'",
    difficulty: "Easy",
    topic: "Strings",
    starterCode: "def reverse_string(s):\n    # Your code here\n    pass",
    solution: "def reverse_string(s):\n    return s[::-1]",
    explanation: "Python slicing with [::-1] reverses the string. Alternatively, use two pointers swapping from both ends.",
    testCases: ["reverse_string('hello') → 'olleh'", "reverse_string('Python') → 'nohtyP'"],
  },
  {
    id: "str2",
    title: "Valid Palindrome",
    description: "Check if a string is a palindrome, considering only alphanumeric characters and ignoring case.\n\n**Example:**\n- Input: 'A man, a plan, a canal: Panama'\n- Output: True",
    difficulty: "Easy",
    topic: "Strings",
    starterCode: "def is_palindrome(s):\n    # Your code here\n    pass",
    solution: "def is_palindrome(s):\n    cleaned = ''.join(c.lower() for c in s if c.isalnum())\n    return cleaned == cleaned[::-1]",
    explanation: "Filter out non-alphanumeric characters, convert to lowercase, then check if the string equals its reverse.",
    testCases: ["is_palindrome('A man, a plan, a canal: Panama') → True", "is_palindrome('race a car') → False"],
  },
  {
    id: "str3",
    title: "Longest Common Prefix",
    description: "Find the longest common prefix string amongst an array of strings.\n\n**Example:**\n- Input: ['flower', 'flow', 'flight']\n- Output: 'fl'",
    difficulty: "Medium",
    topic: "Strings",
    starterCode: "def longest_common_prefix(strs):\n    # Your code here\n    pass",
    solution: "def longest_common_prefix(strs):\n    if not strs:\n        return ''\n    prefix = strs[0]\n    for s in strs[1:]:\n        while not s.startswith(prefix):\n            prefix = prefix[:-1]\n            if not prefix:\n                return ''\n    return prefix",
    explanation: "Start with the first string as prefix, then iteratively shorten it until it matches the start of every other string.",
    testCases: ["longest_common_prefix(['flower','flow','flight']) → 'fl'", "longest_common_prefix(['dog','car','race']) → ''"],
  },

  // SQL Queries
  {
    id: "sql1",
    title: "Find Second Highest Salary",
    description: "Write a SQL query to find the second highest salary from an Employee table.\n\n**Table: Employee**\n| Id | Salary |\n|----|--------|\n| 1  | 100    |\n| 2  | 200    |\n| 3  | 300    |",
    difficulty: "Medium",
    topic: "SQL Queries",
    starterCode: "-- Write your SQL query here\nSELECT \nFROM Employee",
    solution: "SELECT MAX(Salary) AS SecondHighestSalary\nFROM Employee\nWHERE Salary < (SELECT MAX(Salary) FROM Employee);",
    explanation: "First find the maximum salary, then find the maximum salary that is less than the overall maximum.",
    testCases: ["Expected output: 200"],
  },
  {
    id: "sql2",
    title: "Duplicate Emails",
    description: "Write a SQL query to find all duplicate emails in a table.\n\n**Table: Person**\n| Id | Email   |\n|----|--------|\n| 1  | a@b.com |\n| 2  | c@d.com |\n| 3  | a@b.com |",
    difficulty: "Easy",
    topic: "SQL Queries",
    starterCode: "-- Write your SQL query here\nSELECT \nFROM Person",
    solution: "SELECT Email\nFROM Person\nGROUP BY Email\nHAVING COUNT(*) > 1;",
    explanation: "Group by Email and use HAVING to filter groups with more than one occurrence.",
    testCases: ["Expected output: a@b.com"],
  },

  // Python Basics
  {
    id: "pyb1",
    title: "FizzBuzz",
    description: "Print numbers 1 to n. For multiples of 3 print 'Fizz', for multiples of 5 print 'Buzz', for multiples of both print 'FizzBuzz'.\n\n**Example:**\n- Input: n = 15\n- Output: [1, 2, 'Fizz', 4, 'Buzz', ..., 'FizzBuzz']",
    difficulty: "Easy",
    topic: "Python Basics",
    starterCode: "def fizzbuzz(n):\n    # Your code here\n    pass",
    solution: "def fizzbuzz(n):\n    result = []\n    for i in range(1, n + 1):\n        if i % 15 == 0:\n            result.append('FizzBuzz')\n        elif i % 3 == 0:\n            result.append('Fizz')\n        elif i % 5 == 0:\n            result.append('Buzz')\n        else:\n            result.append(str(i))\n    return result",
    explanation: "Check divisibility by 15 first (both 3 and 5), then by 3, then by 5. Order matters!",
    testCases: ["fizzbuzz(5) → ['1','2','Fizz','4','Buzz']", "fizzbuzz(15)[-1] → 'FizzBuzz'"],
  },
  {
    id: "pyb2",
    title: "Fibonacci Sequence",
    description: "Generate the first n numbers of the Fibonacci sequence.\n\n**Example:**\n- Input: n = 7\n- Output: [0, 1, 1, 2, 3, 5, 8]",
    difficulty: "Easy",
    topic: "Python Basics",
    starterCode: "def fibonacci(n):\n    # Your code here\n    pass",
    solution: "def fibonacci(n):\n    if n <= 0:\n        return []\n    if n == 1:\n        return [0]\n    fib = [0, 1]\n    for _ in range(2, n):\n        fib.append(fib[-1] + fib[-2])\n    return fib",
    explanation: "Start with [0, 1] and keep appending the sum of the last two numbers until you have n numbers.",
    testCases: ["fibonacci(7) → [0,1,1,2,3,5,8]", "fibonacci(1) → [0]"],
  },
  {
    id: "pyb3",
    title: "Matrix Transpose",
    description: "Write a function to transpose a matrix (swap rows and columns).\n\n**Example:**\n- Input: [[1,2,3],[4,5,6]]\n- Output: [[1,4],[2,5],[3,6]]",
    difficulty: "Medium",
    topic: "Python Basics",
    starterCode: "def transpose(matrix):\n    # Your code here\n    pass",
    solution: "def transpose(matrix):\n    return [list(row) for row in zip(*matrix)]",
    explanation: "zip(*matrix) unpacks the matrix rows and zips them together, effectively transposing rows into columns.",
    testCases: ["transpose([[1,2,3],[4,5,6]]) → [[1,4],[2,5],[3,6]]"],
  },

  // ML Concepts
  {
    id: "mlc1",
    title: "Train-Test Split",
    description: "Implement a simple train-test split function that splits data into training and testing sets.\n\n**Example:**\n- Input: data = [1,2,3,4,5,6,7,8,9,10], ratio = 0.8\n- Output: train = [1..8], test = [9,10]",
    difficulty: "Medium",
    topic: "Machine Learning Concepts",
    starterCode: "def train_test_split(data, ratio=0.8):\n    # Your code here\n    pass",
    solution: "def train_test_split(data, ratio=0.8):\n    split_idx = int(len(data) * ratio)\n    return data[:split_idx], data[split_idx:]",
    explanation: "Calculate the split index based on the ratio and slice the data into two parts.",
    testCases: ["train_test_split([1,2,3,4,5], 0.8) → ([1,2,3,4], [5])"],
  },
  {
    id: "mlc2",
    title: "Calculate Accuracy",
    description: "Write a function to calculate the accuracy of predictions.\n\n**Example:**\n- Input: actual = [1,0,1,1,0], predicted = [1,0,0,1,0]\n- Output: 0.8 (80%)",
    difficulty: "Easy",
    topic: "Machine Learning Concepts",
    starterCode: "def accuracy(actual, predicted):\n    # Your code here\n    pass",
    solution: "def accuracy(actual, predicted):\n    correct = sum(1 for a, p in zip(actual, predicted) if a == p)\n    return correct / len(actual)",
    explanation: "Count the number of matching predictions and divide by total predictions.",
    testCases: ["accuracy([1,0,1,1,0], [1,0,0,1,0]) → 0.8"],
  },
];

export function getTopics(): string[] {
  return [...new Set(codingChallenges.map((c) => c.topic))].sort();
}

export function filterChallenges(
  topic?: string,
  difficulty?: "Easy" | "Medium" | "Hard"
): CodingChallenge[] {
  let filtered = [...codingChallenges];
  if (topic) filtered = filtered.filter((c) => c.topic === topic);
  if (difficulty) filtered = filtered.filter((c) => c.difficulty === difficulty);
  return filtered;
}
