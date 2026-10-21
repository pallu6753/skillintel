import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  getInterviewQuestions,
  evaluateAnswer,
  type InterviewQuestion,
  type EvaluationResult,
} from "@/lib/interview-questions";
import { useAuth } from "@/lib/auth-context";
import { cn } from "@/lib/utils";
import {
  Mic, Send, RotateCcw, CheckCircle2, AlertCircle, MessageSquare,
  Award, Brain, Briefcase, Code2, BarChart3, Clock, ChevronRight, HelpCircle, Sparkles, History
} from "lucide-react";
import { toast } from "sonner";

type InterviewType = "Technical" | "HR" | "Coding" | "Data Science";

interface AnswerResult extends EvaluationResult {
  question: InterviewQuestion;
  answer: string;
}

interface SavedSession {
  id: string;
  timestamp: string;
  type: InterviewType;
  overallScore: number;
  totalScore: number;
  maxTotal: number;
  results: AnswerResult[];
}

export default function InterviewSimulator() {
  const { user } = useAuth();
  const [interviewType, setInterviewType] = useState<InterviewType>("Technical");
  const [started, setStarted] = useState(false);
  const [questions, setQuestions] = useState<InterviewQuestion[]>([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [answer, setAnswer] = useState("");
  const [results, setResults] = useState<AnswerResult[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [activeTab, setActiveTab] = useState<"practice" | "history">("practice");
  const [savedSessions, setSavedSessions] = useState<SavedSession[]>([]);
  const [inspectingSession, setInspectingSession] = useState<SavedSession | null>(null);

  const storageKey = `skillintel_interview_sessions_${user?.id || "guest"}`;

  useEffect(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        setSavedSessions(JSON.parse(stored));
      }
    } catch (e) {
      console.warn("Could not load past sessions", e);
    }
  }, [storageKey]);

  const typeIcons: Record<InterviewType, React.ElementType> = {
    Technical: Brain,
    HR: Briefcase,
    Coding: Code2,
    "Data Science": BarChart3,
  };

  const startInterview = () => {
    const qs = getInterviewQuestions(interviewType, 4);
    if (qs.length === 0) {
      toast.error("No questions available for this category.");
      return;
    }
    setQuestions(qs);
    setCurrentQ(0);
    setAnswer("");
    setResults([]);
    setSubmitted(false);
    setStarted(true);
    setInspectingSession(null);
  };

  const submitAnswer = () => {
    if (!answer.trim() || answer.trim().length < 10) {
      toast.error("Please provide a more complete answer (at least 10 characters).");
      return;
    }
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
      // Persist session
      const tScore = newResults.reduce((sum, r) => sum + r.score, 0);
      const mScore = newResults.reduce((sum, r) => sum + r.maxScore, 0);
      const overall = mScore > 0 ? Math.round((tScore / mScore) * 100) : 0;
      const newSession: SavedSession = {
        id: `sess-${Date.now()}`,
        timestamp: new Date().toISOString(),
        type: interviewType,
        overallScore: overall,
        totalScore: tScore,
        maxTotal: mScore,
        results: newResults,
      };
      const updated = [newSession, ...savedSessions].slice(0, 20);
      setSavedSessions(updated);
      try {
        localStorage.setItem(storageKey, JSON.stringify(updated));
      } catch (e) {
        console.warn("Session storage failed", e);
      }
      toast.success("Practice session completed and saved to your history!");
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
    setInspectingSession(null);
  };

  // Inspecting a past session
  if (inspectingSession) {
    return (
      <DashboardLayout>
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <History className="h-6 w-6 text-primary" />
              <div>
                <h1 className="font-display text-2xl font-bold">Past Session Review</h1>
                <p className="text-muted-foreground text-sm">
                  {inspectingSession.type} Interview • {new Date(inspectingSession.timestamp).toLocaleDateString()}
                </p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={() => setInspectingSession(null)}>
              ← Back to Sessions
            </Button>
          </div>

          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Overall Performance</p>
                <p className="text-3xl font-display font-bold text-primary mt-1">
                  {inspectingSession.overallScore}%
                </p>
                <p className="text-xs text-muted-foreground">
                  Score: {inspectingSession.totalScore} / {inspectingSession.maxTotal} points
                </p>
              </div>
              <Badge className="text-sm px-3 py-1">
                {inspectingSession.overallScore >= 70 ? "Interview Ready" : "Developing"}
              </Badge>
            </CardContent>
          </Card>

          <div className="space-y-4">
            {inspectingSession.results.map((r, i) => (
              <Card key={r.question.id}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start gap-4">
                    <CardTitle className="text-base font-semibold">
                      Q{i + 1}: {r.question.question}
                    </CardTitle>
                    <Badge variant="outline" className="shrink-0 font-bold">
                      {r.score} / {r.maxScore}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="p-3 rounded bg-muted/30">
                    <p className="text-xs font-semibold text-muted-foreground mb-1">Your Submitted Answer:</p>
                    <p className="text-foreground">{r.answer}</p>
                  </div>
                  <p className="text-xs text-muted-foreground italic">{r.feedback}</p>
                  {r.strengths?.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-green-700 dark:text-green-400">Strengths:</p>
                      <ul className="list-disc pl-5 text-xs space-y-0.5 text-muted-foreground">
                        {r.strengths.map((s, idx) => <li key={idx}>{s}</li>)}
                      </ul>
                    </div>
                  )}
                  {r.improvements?.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-yellow-700 dark:text-yellow-400">Areas to Refine:</p>
                      <ul className="list-disc pl-5 text-xs space-y-0.5 text-muted-foreground">
                        {r.improvements.map((im, idx) => <li key={idx}>{im}</li>)}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Active Results screen
  if (submitted) {
    return (
      <DashboardLayout>
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Award className="h-6 w-6 text-primary" />
              <div>
                <h1 className="font-display text-2xl font-bold">Interview Results</h1>
                <p className="text-muted-foreground text-sm">Session evaluation grounded in explicit rubrics</p>
              </div>
            </div>
            <Button onClick={reset} className="gap-2">
              <RotateCcw className="h-4 w-4" /> Practice Another
            </Button>
          </div>

          <Card>
            <CardContent className="p-8 text-center space-y-4">
              <div className={cn(
                "inline-flex h-20 w-20 items-center justify-center rounded-full",
                overallPercentage >= 70 ? "bg-green-500/10 text-green-600" :
                overallPercentage >= 40 ? "bg-yellow-500/10 text-yellow-600" :
                "bg-destructive/10 text-destructive"
              )}>
                <span className="text-3xl font-display font-bold">
                  {overallPercentage}%
                </span>
              </div>
              <div>
                <h2 className="font-display text-xl font-bold">
                  {overallPercentage >= 70 ? "Ready for Placement!" : overallPercentage >= 40 ? "Good Foundations!" : "Keep Practicing!"}
                </h2>
                <p className="text-muted-foreground text-sm mt-1">
                  Total Score: {totalScore}/{maxTotal} ({interviewType} Interview)
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Detailed results */}
          <div className="space-y-4">
            {results.map((r, i) => (
              <Card key={r.question.id} className="border-border">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline">Q{i + 1}</Badge>
                        <Badge variant="secondary" className="text-xs">{r.question.type}</Badge>
                      </div>
                      <CardTitle className="text-base font-semibold">{r.question.question}</CardTitle>
                    </div>
                    <Badge className={cn(
                      "shrink-0 font-bold",
                      r.score >= 7 ? "bg-green-500/10 text-green-700 border border-green-500/20" :
                      r.score >= 4 ? "bg-yellow-500/10 text-yellow-700 border border-yellow-500/20" :
                      "bg-destructive/10 text-destructive border border-destructive/20"
                    )}>
                      {r.score}/{r.maxScore} pts
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4 text-sm">
                  <div className="bg-muted/40 p-3.5 rounded-lg border text-xs">
                    <p className="font-semibold text-foreground mb-1">Your Response:</p>
                    <p className="text-muted-foreground whitespace-pre-wrap">{r.answer}</p>
                  </div>

                  <p className="text-xs text-muted-foreground font-medium">{r.feedback}</p>

                  <div className="grid md:grid-cols-2 gap-3 text-xs">
                    <div className="p-3 rounded border bg-green-500/5 border-green-500/20">
                      <p className="font-semibold text-green-700 dark:text-green-400 mb-1 flex items-center gap-1.5">
                        <CheckCircle2 className="h-3.5 w-3.5" /> Strengths
                      </p>
                      <ul className="list-disc pl-4 space-y-1 text-muted-foreground">
                        {r.strengths.map((s, idx) => <li key={idx}>{s}</li>)}
                      </ul>
                    </div>
                    <div className="p-3 rounded border bg-yellow-500/5 border-yellow-500/20">
                      <p className="font-semibold text-yellow-700 dark:text-yellow-400 mb-1 flex items-center gap-1.5">
                        <AlertCircle className="h-3.5 w-3.5" /> Improvement Points
                      </p>
                      <ul className="list-disc pl-4 space-y-1 text-muted-foreground">
                        {r.improvements.map((im, idx) => <li key={idx}>{im}</li>)}
                      </ul>
                    </div>
                  </div>

                  {/* Suggested Answer Structure */}
                  <div className="p-3 rounded border bg-primary/5 border-primary/20 text-xs">
                    <p className="font-semibold text-primary mb-1 flex items-center gap-1.5">
                      <Sparkles className="h-3.5 w-3.5" /> Recommended Answer Structure
                    </p>
                    <p className="text-muted-foreground whitespace-pre-line">{r.suggestedStructure}</p>
                  </div>

                  {/* Follow-up question */}
                  <div className="p-3 rounded border bg-muted/20 text-xs">
                    <p className="font-semibold text-foreground mb-0.5 flex items-center gap-1.5">
                      <HelpCircle className="h-3.5 w-3.5 text-primary" /> Follow-Up Interview Question
                    </p>
                    <p className="text-muted-foreground">{r.followUpQuestion}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Question In-Progress Screen
  if (started && questions.length > 0) {
    const currentQuestion = questions[currentQ];
    const progressVal = Math.round(((currentQ + 1) / questions.length) * 100);

    return (
      <DashboardLayout>
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Mic className="h-6 w-6 text-primary" />
              <div>
                <h1 className="font-display text-xl font-bold">{interviewType} Interview Practice</h1>
                <p className="text-muted-foreground text-xs">
                  Question {currentQ + 1} of {questions.length}
                </p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={reset}>
              Exit Practice
            </Button>
          </div>

          <Progress value={progressVal} className="h-2" />

          <Card className="border-2 border-primary/20 shadow-sm">
            <CardHeader className="space-y-2">
              <div className="flex justify-between items-center">
                <Badge variant="outline">{currentQuestion.type}</Badge>
                <Badge variant="secondary" className="capitalize text-xs">
                  Difficulty: {currentQuestion.difficulty}
                </Badge>
              </div>
              <CardTitle className="text-lg font-semibold leading-relaxed">
                {currentQuestion.question}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="Type your response here. For HR questions, use the STAR format (Situation, Task, Action, Result). For technical questions, explain the concepts and trade-offs..."
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                className="min-h-[180px] text-sm resize-y"
              />
              <div className="flex justify-between items-center text-xs text-muted-foreground">
                <span>{answer.split(/\s+/).filter(Boolean).length} words</span>
                <span>Minimum 10 words recommended for accurate evaluation</span>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between border-t p-4 bg-muted/10">
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Brain className="h-3.5 w-3.5" /> Evaluated against explicit rubric
              </span>
              <Button onClick={submitAnswer} className="gap-2">
                {currentQ < questions.length - 1 ? (
                  <>Next Question <ChevronRight className="h-4 w-4" /></>
                ) : (
                  <>Submit & Finish <Send className="h-4 w-4" /></>
                )}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  // Default Start screen with tabs: "Practice" & "History"
  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
            <Mic className="h-5 w-5" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold tracking-tight">Interview Simulator</h1>
            <p className="text-muted-foreground text-sm">
              Practice role-specific interview questions with transparent rubric scoring & feedback
            </p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full">
          <TabsList className="grid w-full grid-cols-2 max-w-xs">
            <TabsTrigger value="practice" className="gap-2">
              <Mic className="h-4 w-4" /> Start Practice
            </TabsTrigger>
            <TabsTrigger value="history" className="gap-2">
              <History className="h-4 w-4" /> Past Sessions ({savedSessions.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="practice" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="font-display text-lg">Choose Your Interview Track</CardTitle>
                <CardDescription>Select the domain you want to practice today</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="grid sm:grid-cols-2 gap-3.5">
                  {(["Technical", "HR", "Coding", "Data Science"] as InterviewType[]).map((type) => {
                    const Icon = typeIcons[type];
                    return (
                      <button
                        key={type}
                        onClick={() => setInterviewType(type)}
                        className={cn(
                          "p-4 rounded-lg border-2 transition-all text-left flex flex-col justify-between",
                          interviewType === type
                            ? "border-primary bg-primary/5 shadow-sm"
                            : "border-border hover:border-primary/30"
                        )}
                      >
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <Icon className="h-5 w-5 text-primary" />
                            {interviewType === type && <CheckCircle2 className="h-4 w-4 text-primary" />}
                          </div>
                          <p className="font-semibold text-sm">{type} Track</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {type === "Technical" && "System design, ACID transactions, algorithms & data structures"}
                            {type === "HR" && "Behavioral scenarios, STAR format, strengths & leadership questions"}
                            {type === "Coding" && "Algorithmic problem-solving, O(n) complexities & edge cases"}
                            {type === "Data Science" && "Precision vs recall, class imbalance, ML pipelines & modeling"}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
                <Button onClick={startInterview} className="w-full gap-2" size="lg">
                  <MessageSquare className="h-4 w-4" /> Begin 4-Question {interviewType} Simulation
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="font-display text-lg">Your Practice History</CardTitle>
                <CardDescription>Review past answers, rubric evaluations, and score progression</CardDescription>
              </CardHeader>
              <CardContent>
                {savedSessions.length === 0 ? (
                  <div className="text-center py-10 text-muted-foreground">
                    <History className="h-10 w-10 mx-auto mb-2 opacity-50" />
                    <p className="text-sm font-medium">No practice sessions completed yet.</p>
                    <p className="text-xs mt-1">Select an interview track above and complete your first session to track progress.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {savedSessions.map((s) => (
                      <div
                        key={s.id}
                        onClick={() => setInspectingSession(s)}
                        className="p-4 rounded-lg border hover:border-primary/50 transition-all flex items-center justify-between cursor-pointer"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{s.type}</Badge>
                            <span className="font-semibold text-sm">{s.overallScore}% Score</span>
                            <Badge className={cn("text-[10px]", s.overallScore >= 70 ? "bg-green-500/10 text-green-700" : "bg-muted text-muted-foreground")}>
                              {s.overallScore >= 70 ? "Ready" : "In Progress"}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                            <Clock className="h-3 w-3" /> {new Date(s.timestamp).toLocaleString()} • {s.results.length} Questions Evaluated
                          </p>
                        </div>
                        <Button variant="ghost" size="sm" className="gap-1 text-xs">
                          Review Feedback <ChevronRight className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
