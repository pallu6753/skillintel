import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useDataset } from "@/hooks/use-dataset";
import { predictJobReadiness } from "@/lib/career-engine";
import { Skeleton } from "@/components/ui/skeleton";
import { Trophy, Medal, Award, TrendingUp, Brain, BookOpen, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

type SortKey = "readiness" | "gpa" | "skills" | "quiz";

const sortLabels: Record<SortKey, string> = {
  readiness: "Job Readiness",
  gpa: "GPA",
  skills: "Skill Count",
  quiz: "Quiz Score",
};

export default function LeaderboardPage() {
  const { data, isLoading } = useDataset();
  const navigate = useNavigate();
  const [sortBy, setSortBy] = useState<SortKey>("readiness");
  const [department, setDepartment] = useState("all");

  if (isLoading || !data) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-96" />
        </div>
      </DashboardLayout>
    );
  }

  const { students, departments } = data;

  const filtered = department === "all"
    ? students
    : students.filter((s) => s.department === department);

  const ranked = [...filtered]
    .map((s) => ({
      ...s,
      readinessScore: predictJobReadiness(s).score,
    }))
    .sort((a, b) => {
      switch (sortBy) {
        case "readiness": return b.readinessScore - a.readinessScore;
        case "gpa": return b.gpa - a.gpa;
        case "skills": return b.skills.length - a.skills.length;
        case "quiz": return b.quizScore - a.quizScore;
      }
    })
    .slice(0, 50);

  const rankIcons = [
    <Trophy className="h-6 w-6 text-yellow-500" />,
    <Medal className="h-6 w-6 text-gray-400" />,
    <Award className="h-6 w-6 text-amber-700" />,
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-4xl mx-auto">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Trophy className="h-6 w-6 text-yellow-500" />
            <div>
              <h1 className="font-display text-2xl font-bold">Leaderboard</h1>
              <p className="text-muted-foreground text-sm">Top {ranked.length} students ranked by {sortLabels[sortBy]}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortKey)}>
              <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="readiness">Job Readiness</SelectItem>
                <SelectItem value="gpa">GPA</SelectItem>
                <SelectItem value="skills">Skill Count</SelectItem>
                <SelectItem value="quiz">Quiz Score</SelectItem>
              </SelectContent>
            </Select>
            <Select value={department} onValueChange={setDepartment}>
              <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Depts</SelectItem>
                {departments.map((d) => (
                  <SelectItem key={d} value={d}>{d}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Top 3 podium */}
        {ranked.length >= 3 && (
          <div className="grid grid-cols-3 gap-4">
            {[1, 0, 2].map((idx) => {
              const s = ranked[idx];
              const isFirst = idx === 0;
              return (
                <Card
                  key={s.id}
                  className={`cursor-pointer transition-transform hover:scale-[1.02] ${isFirst ? "border-yellow-500/50 bg-yellow-500/5 row-span-1" : ""}`}
                  onClick={() => navigate(`/student/${s.id}`)}
                >
                  <CardContent className="p-4 text-center">
                    <div className="flex justify-center mb-2">{rankIcons[idx]}</div>
                    <div className="flex h-12 w-12 mx-auto items-center justify-center rounded-full bg-primary/10 text-primary text-lg font-bold mb-2">
                      {s.name.charAt(0)}
                    </div>
                    <p className="font-display font-semibold text-sm truncate">{s.name}</p>
                    <p className="text-xs text-muted-foreground">{s.department}</p>
                    <div className="mt-2">
                      <p className="text-xl font-display font-bold text-primary">
                        {sortBy === "readiness" ? `${s.readinessScore}%` :
                         sortBy === "gpa" ? s.gpa.toFixed(2) :
                         sortBy === "skills" ? s.skills.length :
                         `${s.quizScore.toFixed(0)}%`}
                      </p>
                      <p className="text-xs text-muted-foreground">{sortLabels[sortBy]}</p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Full ranking */}
        <Card>
          <CardHeader>
            <CardTitle className="font-display text-lg">Full Rankings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {ranked.map((s, i) => (
                <div
                  key={s.id}
                  onClick={() => navigate(`/student/${s.id}`)}
                  className="flex items-center gap-4 p-3 rounded-lg border cursor-pointer hover:bg-muted/50 transition-colors"
                >
                  <span className={`w-8 text-center font-display font-bold text-sm ${i < 3 ? "text-primary" : "text-muted-foreground"}`}>
                    #{i + 1}
                  </span>
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-bold shrink-0">
                    {s.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{s.name}</p>
                    <p className="text-xs text-muted-foreground">{s.department}</p>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <div className="text-center hidden sm:block">
                      <p className="font-bold">{s.gpa.toFixed(2)}</p>
                      <p className="text-xs text-muted-foreground">GPA</p>
                    </div>
                    <div className="text-center hidden sm:block">
                      <p className="font-bold">{s.skills.length}</p>
                      <p className="text-xs text-muted-foreground">Skills</p>
                    </div>
                    <div className="text-center">
                      <p className="font-bold text-primary">{s.readinessScore}%</p>
                      <p className="text-xs text-muted-foreground">Ready</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
