import { useState } from "react";
import { useParams } from "react-router-dom";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { skillQuizQuestions, academicQuizQuestions, QuizQuestion } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { Brain, BookOpen, CheckCircle2, XCircle, RotateCcw } from "lucide-react";

export default function QuizPage() {
  const { type } = useParams<{ type: string }>();
  const isSkill = type === "skill";
  const questions: QuizQuestion[] = isSkill ? skillQuizQuestions : academicQuizQuestions;

  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>(new Array(questions.length).fill(null));
  const [submitted, setSubmitted] = useState(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);

  const question = questions[currentQ];
  const progress = ((currentQ + 1) / questions.length) * 100;

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

  const score = answers.filter((a, i) => a === questions[i].correctAnswer).length;
  const percentage = Math.round((score / questions.length) * 100);

  const reset = () => {
    setCurrentQ(0);
    setAnswers(new Array(questions.length).fill(null));
    setSubmitted(false);
    setSelectedOption(null);
  };

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          {isSkill ? <Brain className="h-6 w-6 text-primary" /> : <BookOpen className="h-6 w-6 text-primary" />}
          <div>
            <h1 className="font-display text-2xl font-bold">{isSkill ? "Skill" : "Academic"} Quiz</h1>
            <p className="text-muted-foreground text-sm">{isSkill ? "Test your technical skills" : "Test your academic knowledge"}</p>
          </div>
        </div>

        {!submitted ? (
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
        ) : (
          <Card>
            <CardContent className="p-8 text-center space-y-6">
              <div className={cn(
                "inline-flex h-20 w-20 items-center justify-center rounded-full",
                percentage >= 70 ? "bg-success/10" : percentage >= 40 ? "bg-warning/10" : "bg-destructive/10"
              )}>
                <span className={cn(
                  "text-3xl font-display font-bold",
                  percentage >= 70 ? "text-success" : percentage >= 40 ? "text-warning" : "text-destructive"
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

              {/* Review */}
              <div className="text-left space-y-3 mt-6">
                {questions.map((q, i) => {
                  const correct = answers[i] === q.correctAnswer;
                  return (
                    <div key={q.id} className={cn("p-3 rounded-lg border text-sm", correct ? "border-success/20 bg-success/5" : "border-destructive/20 bg-destructive/5")}>
                      <div className="flex items-start gap-2">
                        {correct ? <CheckCircle2 className="h-4 w-4 text-success shrink-0 mt-0.5" /> : <XCircle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />}
                        <div>
                          <p className="font-medium">{q.question}</p>
                          {!correct && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Correct: {q.options[q.correctAnswer]}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <Button onClick={reset} className="mt-4">
                <RotateCcw className="h-4 w-4 mr-2" /> Retake Quiz
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
