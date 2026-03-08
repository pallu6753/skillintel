import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  getInterviewQuestions,
  evaluateAnswer,
  type InterviewQuestion,
} from "@/lib/interview-questions";
import { cn } from "@/lib/utils";
import { Mic, Send, RotateCcw, CheckCircle2, XCircle, MessageSquare, Award, Brain, Briefcase, Code2, BarChart3 } from "lucide-react";

type InterviewType = "Technical" | "HR" | "Coding" | "Data Science";

interface AnswerResult {
  question: InterviewQuestion;
  answer: string;
  score: number;
  maxScore: number;
  feedback: string;
  matchedKeywords: string[];
  missedKeywords: string[];
}

export default function InterviewSimulator() {
  const [interviewType, setInterviewType] = useState<InterviewType>("Technical");
  const [started, setStarted] = useState(false);
  const [questions, setQuestions] = useState<InterviewQuestion[]>([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [answer, setAnswer] = useState("");
  const [results, setResults] = useState<AnswerResult[]>([]);
  const [submitted, setSubmitted] = useState(false);

  const typeIcons: Record<InterviewType, React.ElementType> = {
    Technical: Brain,
    HR: Briefcase,
    Coding: Code2,
    "Data Science": BarChart3,
  };

  const startInterview = () => {
    const qs = getInterviewQuestions(interviewType, 5);
    setQuestions(qs);
    setCurrentQ(0);
    setAnswer("");
    setResults([]);
    setSubmitted(false);
    setStarted(true);
  };

  const submitAnswer = () => {
    if (!answer.trim()) return;
    const q = questions[currentQ];
    const evaluation = evaluateAnswer(q, answer);
    const result: AnswerResult = { question: q, answer, ...evaluation };
    const newResults = [...results, result];
    setResults(newResults);

    if (currentQ < questions.length - 1) {
      setCurrentQ(currentQ + 1);
      setAnswer("");
    } else {
      setSubmitted(true);
    }
  };

  const totalScore = results.reduce((sum, r) => sum + r.score, 0);
  const maxTotal = results.reduce((sum, r) => sum + r.maxScore, 0);
  const overallPercentage = maxTotal > 0 ? Math.round((totalScore / maxTotal) * 100) : 0;

  const reset = () => {
    setStarted(false);
    setSubmitted(false);
    setQuestions([]);
    setResults([]);
    setCurrentQ(0);
    setAnswer("");
  };

  // Start screen
  if (!started) {
    return (
      <DashboardLayout>
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="flex items-center gap-3">
            <Mic className="h-6 w-6 text-primary" />
            <div>
              <h1 className="font-display text-2xl font-bold">Interview Simulator</h1>
              <p className="text-muted-foreground text-sm">Practice with AI-evaluated interview questions</p>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Choose Interview Type</CardTitle>
              <CardDescription>Select the type of interview you want to practice</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {(["Technical", "HR", "Coding", "Data Science"] as InterviewType[]).map((type) => {
                  const Icon = typeIcons[type];
                  return (
                    <button
                      key={type}
                      onClick={() => setInterviewType(type)}
                      className={cn(
                        "p-4 rounded-lg border-2 transition-all text-left",
                        interviewType === type
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/30"
                      )}
                    >
                      <Icon className="h-5 w-5 text-primary mb-2" />
                      <p className="font-semibold text-sm">{type}</p>
                      <p className="text-xs text-muted-foreground">
                        {type === "Technical" && "System design, algorithms, concepts"}
                        {type === "HR" && "Behavioral & situational questions"}
                        {type === "Coding" && "Problem solving & data structures"}
                        {type === "Data Science" && "ML, statistics, data analysis"}
                      </p>
                    </button>
                  );
                })}
              </div>
              <Button onClick={startInterview} className="w-full" size="lg">
                <MessageSquare className="h-4 w-4 mr-2" /> Start {interviewType} Interview
              </Button>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  // Results screen
  if (submitted) {
    return (
      <DashboardLayout>
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="flex items-center gap-3">
            <Award className="h-6 w-6 text-primary" />
            <h1 className="font-display text-2xl font-bold">Interview Results</h1>
          </div>

          <Card>
            <CardContent className="p-8 text-center space-y-4">
              <div className={cn(
                "inline-flex h-20 w-20 items-center justify-center rounded-full",
                overallPercentage >= 70 ? "bg-green-500/10" : overallPercentage >= 40 ? "bg-yellow-500/10" : "bg-destructive/10"
              )}>
                <span className={cn(
                  "text-3xl font-display font-bold",
                  overallPercentage >= 70 ? "text-green-600" : overallPercentage >= 40 ? "text-yellow-600" : "text-destructive"
                )}>
                  {overallPercentage}%
                </span>
              </div>
              <div>
                <h2 className="font-display text-xl font-bold">
                  {overallPercentage >= 70 ? "Great Performance!" : overallPercentage >= 40 ? "Good Effort!" : "Keep Practicing!"}
                </h2>
                <p className="text-muted-foreground text-sm">
                  Total Score: {totalScore}/{maxTotal} ({interviewType} Interview)
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Detailed results */}
          <div className="space-y-4">
            {results.map((r, i) => (
              <Card key={r.question.id}>
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-2">
                      <Badge variant="outline" className="shrink-0">Q{i + 1}</Badge>
                      <p className="font-medium text-sm">{r.question.question}</p>
                    </div>
                    <Badge className={cn(
                      "shrink-0",
                      r.score >= 7 ? "bg-green-500/10 text-green-700" : r.score >= 4 ? "bg-yellow-500/10 text-yellow-700" : "bg-destructive/10 text-destructive"
                    )}>
                      {r.score}/{r.maxScore}
                    </Badge>
                  </div>

                  <div className="bg-muted/50 p-3 rounded text-xs">
                    <p className="font-medium text-foreground mb-1">Your Answer:</p>
                    <p className="text-muted-foreground">{r.answer}</p>
                  </div>

                  <p className="text-xs text-muted-foreground">{r.feedback}</p>

                  <div className="flex flex-wrap gap-1">
                    {r.matchedKeywords.map((k) => (
                      <Badge key={k} variant="secondary" className="text-[10px] bg-green-500/10 text-green-700">
                        <CheckCircle2 className="h-2.5 w-2.5 mr-0.5" /> {k}
                      </Badge>
                    ))}
                    {r.missedKeywords.slice(0, 4).map((k) => (
                      <Badge key={k} variant="secondary" className="text-[10px] bg-destructive/10 text-destructive">
                        <XCircle className="h-2.5 w-2.5 mr-0.5" /> {k}
                      </Badge>
                    ))}
                  </div>

                  <details className="text-xs">
                    <summary className="cursor-pointer text-primary font-medium">View Sample Answer</summary>
                    <p className="mt-2 p-2 bg-primary/5 rounded text-muted-foreground">{r.question.sampleAnswer}</p>
                  </details>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="flex gap-3">
            <Button onClick={startInterview} className="flex-1">
              <RotateCcw className="h-4 w-4 mr-2" /> Retry {interviewType}
            </Button>
            <Button onClick={reset} variant="outline" className="flex-1">
              Change Type
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Active interview
  const question = questions[currentQ];
  const progress = ((currentQ + 1) / questions.length) * 100;

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Mic className="h-6 w-6 text-primary" />
            <h1 className="font-display text-xl font-bold">{interviewType} Interview</h1>
          </div>
          <Badge variant="secondary">Q {currentQ + 1}/{questions.length}</Badge>
        </div>

        <Progress value={progress} className="h-1.5" />

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <Badge variant="outline">{question.type}</Badge>
              <Badge variant={question.difficulty === "easy" ? "secondary" : question.difficulty === "medium" ? "default" : "destructive"}>
                {question.difficulty}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-lg font-medium">{question.question}</p>
            <Textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Type your answer here... Be detailed and include relevant concepts, examples, and explanations."
              className="min-h-[150px]"
            />
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                {answer.length} characters • Aim for 100+ for best scores
              </p>
              <Button onClick={submitAnswer} disabled={!answer.trim()}>
                <Send className="h-4 w-4 mr-2" />
                {currentQ < questions.length - 1 ? "Next Question" : "Finish Interview"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
