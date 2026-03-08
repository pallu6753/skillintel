import { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { generateQuiz, getAvailableTopics, type QuizQuestion } from "@/lib/question-bank";
import { cn } from "@/lib/utils";
import { Brain, BookOpen, CheckCircle2, XCircle, RotateCcw, Timer, Shuffle, Lightbulb, Play } from "lucide-react";

export default function QuizPage() {
  const { type } = useParams<{ type: string }>();
  const isSkill = type === "skill";
  const category = isSkill ? "skill" : "academic";
  const topics = getAvailableTopics(category);

  // Setup state
  const [selectedTopic, setSelectedTopic] = useState<string>("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("all");
  const [questionCount, setQuestionCount] = useState(10);
  const [started, setStarted] = useState(false);

  // Quiz state
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);

  // Timer state
  const [timeLeft, setTimeLeft] = useState(0);
  const [timerEnabled, setTimerEnabled] = useState(true);
  const SECONDS_PER_QUESTION = 30;

  const startQuiz = () => {
    const topic = selectedTopic === "all" ? undefined : selectedTopic;
    const diff = selectedDifficulty === "all" ? undefined : (selectedDifficulty as "easy" | "medium" | "hard");
    const generated = generateQuiz(category, topic, questionCount, diff);
    if (generated.length === 0) return;
    setQuestions(generated);
    setAnswers(new Array(generated.length).fill(null));
    setCurrentQ(0);
    setSelectedOption(null);
    setSubmitted(false);
    setTimeLeft(generated.length * SECONDS_PER_QUESTION);
    setStarted(true);
  };

  // Timer countdown
  useEffect(() => {
    if (!started || submitted || !timerEnabled) return;
    if (timeLeft <= 0) {
      setSubmitted(true);
      return;
    }
    const interval = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(interval);
  }, [started, submitted, timeLeft, timerEnabled]);

  const formatTime = (s: number) => {
    const min = Math.floor(s / 60);
    const sec = s % 60;
    return `${min}:${sec.toString().padStart(2, "0")}`;
  };

  const handleAnswer = () => {
    if (selectedOption === null) return;
    const newAnswers = [...answers];
    newAnswers[currentQ] = selectedOption;
    setAnswers(newAnswers);
    if (currentQ < questions.length - 1) {
      setCurrentQ(currentQ + 1);
      setSelectedOption(null);
    } else {
      setSubmitted(true);
    }
  };

  const question = questions[currentQ];
  const progress = questions.length > 0 ? ((currentQ + 1) / questions.length) * 100 : 0;
  const score = submitted ? answers.filter((a, i) => questions[i] && a === questions[i].correctAnswer).length : 0;
  const percentage = questions.length > 0 ? Math.round((score / questions.length) * 100) : 0;

  const reset = () => {
    setStarted(false);
    setSubmitted(false);
    setQuestions([]);
    setAnswers([]);
    setCurrentQ(0);
    setSelectedOption(null);
  };

  // Setup screen
  if (!started) {
    return (
      <DashboardLayout>
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="flex items-center gap-3">
            {isSkill ? <Brain className="h-6 w-6 text-primary" /> : <BookOpen className="h-6 w-6 text-primary" />}
            <div>
              <h1 className="font-display text-2xl font-bold">{isSkill ? "Skill" : "Academic"} Quiz</h1>
              <p className="text-muted-foreground text-sm">Configure and start your randomized quiz</p>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shuffle className="h-5 w-5" /> Quiz Setup
              </CardTitle>
              <CardDescription>Questions are randomly selected each time</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Topic</label>
                  <Select value={selectedTopic} onValueChange={setSelectedTopic}>
                    <SelectTrigger><SelectValue placeholder="All topics" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Topics</SelectItem>
                      {topics.map((t) => (
                        <SelectItem key={t} value={t}>{t}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Difficulty</label>
                  <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
                    <SelectTrigger><SelectValue placeholder="All difficulties" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Levels</SelectItem>
                      <SelectItem value="easy">Easy</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="hard">Hard</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Questions</label>
                  <Select value={String(questionCount)} onValueChange={(v) => setQuestionCount(Number(v))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5 Questions</SelectItem>
                      <SelectItem value="10">10 Questions</SelectItem>
                      <SelectItem value="15">15 Questions</SelectItem>
                      <SelectItem value="20">20 Questions</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Timer</label>
                  <Button
                    variant={timerEnabled ? "default" : "outline"}
                    className="w-full"
                    onClick={() => setTimerEnabled(!timerEnabled)}
                  >
                    <Timer className="h-4 w-4 mr-2" />
                    {timerEnabled ? "Timer On (30s/Q)" : "Timer Off"}
                  </Button>
                </div>
              </div>
              <Button onClick={startQuiz} className="w-full" size="lg">
                <Play className="h-4 w-4 mr-2" /> Start Quiz
              </Button>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {isSkill ? <Brain className="h-6 w-6 text-primary" /> : <BookOpen className="h-6 w-6 text-primary" />}
            <h1 className="font-display text-2xl font-bold">{isSkill ? "Skill" : "Academic"} Quiz</h1>
          </div>
          {timerEnabled && !submitted && (
            <Badge variant={timeLeft < 30 ? "destructive" : "secondary"} className="text-sm px-3 py-1">
              <Timer className="h-3.5 w-3.5 mr-1" /> {formatTime(timeLeft)}
            </Badge>
          )}
        </div>

        {!submitted && question ? (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm text-muted-foreground">
                  Question {currentQ + 1} of {questions.length}
                </CardTitle>
                <div className="flex gap-2">
                  <Badge variant="outline">{question.topic}</Badge>
                  <Badge variant={question.difficulty === "easy" ? "secondary" : question.difficulty === "medium" ? "default" : "destructive"}>
                    {question.difficulty}
                  </Badge>
                </div>
              </div>
              <Progress value={progress} className="h-1.5 mt-3" />
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-lg font-medium">{question.question}</p>
              <div className="space-y-2">
                {question.options.map((opt, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedOption(i)}
                    className={cn(
                      "w-full text-left p-3 rounded-lg border-2 transition-all text-sm",
                      selectedOption === i
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/30"
                    )}
                  >
                    <span className="font-medium text-muted-foreground mr-2">{String.fromCharCode(65 + i)}.</span>
                    {opt}
                  </button>
                ))}
              </div>
              <Button onClick={handleAnswer} disabled={selectedOption === null} className="w-full">
                {currentQ < questions.length - 1 ? "Next Question" : "Submit Quiz"}
              </Button>
            </CardContent>
          </Card>
        ) : submitted ? (
          <Card>
            <CardContent className="p-8 text-center space-y-6">
              <div className={cn(
                "inline-flex h-20 w-20 items-center justify-center rounded-full",
                percentage >= 70 ? "bg-green-500/10" : percentage >= 40 ? "bg-yellow-500/10" : "bg-destructive/10"
              )}>
                <span className={cn(
                  "text-3xl font-display font-bold",
                  percentage >= 70 ? "text-green-600" : percentage >= 40 ? "text-yellow-600" : "text-destructive"
                )}>
                  {percentage}%
                </span>
              </div>
              <div>
                <h2 className="font-display text-2xl font-bold">Quiz Complete!</h2>
                <p className="text-muted-foreground mt-1">
                  You scored {score} out of {questions.length}
                </p>
              </div>
              <Badge variant={percentage >= 70 ? "default" : percentage >= 40 ? "secondary" : "destructive"} className="text-sm px-4 py-1">
                {percentage >= 70 ? "Proficient" : percentage >= 40 ? "Developing" : "Beginner"}
              </Badge>

              {/* Suggestions */}
              <Card className="text-left bg-muted/50">
                <CardContent className="p-4">
                  <h3 className="font-semibold text-sm flex items-center gap-2 mb-2">
                    <Lightbulb className="h-4 w-4 text-primary" /> Improvement Suggestions
                  </h3>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    {percentage < 70 && <li>• Review the topics where you got incorrect answers</li>}
                    {percentage < 50 && <li>• Start with easy difficulty and work your way up</li>}
                    {percentage >= 70 && <li>• Great job! Try harder difficulty questions next</li>}
                    <li>• Practice regularly with randomized quizzes for better retention</li>
                    <li>• Use the Skills Hub to find learning resources for weak areas</li>
                  </ul>
                </CardContent>
              </Card>

              {/* Review */}
              <div className="text-left space-y-3 mt-6">
                <h3 className="font-semibold">Detailed Review</h3>
                {questions.map((q, i) => {
                  const correct = answers[i] === q.correctAnswer;
                  return (
                    <div key={q.id} className={cn("p-3 rounded-lg border text-sm", correct ? "border-green-500/20 bg-green-500/5" : "border-destructive/20 bg-destructive/5")}>
                      <div className="flex items-start gap-2">
                        {correct ? <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0 mt-0.5" /> : <XCircle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />}
                        <div className="flex-1">
                          <p className="font-medium">{q.question}</p>
                          {!correct && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Correct: {q.options[q.correctAnswer]}
                            </p>
                          )}
                          <div className="mt-2 p-2 bg-background rounded text-xs text-muted-foreground">
                            <span className="font-medium text-foreground">Explanation:</span> {q.explanation}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex gap-3">
                <Button onClick={startQuiz} className="flex-1">
                  <Shuffle className="h-4 w-4 mr-2" /> New Random Quiz
                </Button>
                <Button onClick={reset} variant="outline" className="flex-1">
                  <RotateCcw className="h-4 w-4 mr-2" /> Change Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : null}
      </div>
    </DashboardLayout>
  );
}
