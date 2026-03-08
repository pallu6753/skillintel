import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { codingChallenges, getTopics, filterChallenges, type CodingChallenge } from "@/lib/coding-challenges";
import { cn } from "@/lib/utils";
import { Code2, Play, Eye, EyeOff, CheckCircle2, BookOpen, Filter, Trophy } from "lucide-react";

export default function CodingPractice() {
  const [topicFilter, setTopicFilter] = useState<string>("all");
  const [diffFilter, setDiffFilter] = useState<string>("all");
  const [selectedChallenge, setSelectedChallenge] = useState<CodingChallenge | null>(null);
  const [code, setCode] = useState("");
  const [showSolution, setShowSolution] = useState(false);
  const [solved, setSolved] = useState<Set<string>>(new Set());

  const topics = getTopics();
  const filtered = filterChallenges(
    topicFilter === "all" ? undefined : topicFilter,
    diffFilter === "all" ? undefined : (diffFilter as "Easy" | "Medium" | "Hard")
  );

  const openChallenge = (c: CodingChallenge) => {
    setSelectedChallenge(c);
    setCode(c.starterCode);
    setShowSolution(false);
  };

  const markSolved = () => {
    if (selectedChallenge) {
      setSolved((prev) => new Set(prev).add(selectedChallenge.id));
    }
  };

  const diffColor = (d: string) =>
    d === "Easy" ? "bg-green-500/10 text-green-700 border-green-500/20" :
    d === "Medium" ? "bg-yellow-500/10 text-yellow-700 border-yellow-500/20" :
    "bg-red-500/10 text-red-700 border-red-500/20";

  if (selectedChallenge) {
    return (
      <DashboardLayout>
        <div className="max-w-5xl mx-auto space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" onClick={() => setSelectedChallenge(null)}>← Back</Button>
              <h1 className="font-display text-xl font-bold">{selectedChallenge.title}</h1>
              <Badge className={cn("text-xs", diffColor(selectedChallenge.difficulty))}>
                {selectedChallenge.difficulty}
              </Badge>
              <Badge variant="outline" className="text-xs">{selectedChallenge.topic}</Badge>
            </div>
            {solved.has(selectedChallenge.id) && (
              <Badge className="bg-green-500/10 text-green-700">
                <CheckCircle2 className="h-3 w-3 mr-1" /> Solved
              </Badge>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Problem Description */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Problem Description</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="prose prose-sm dark:prose-invert max-w-none text-sm">
                  {selectedChallenge.description.split("\n").map((line, i) => (
                    <p key={i} className={line.startsWith("**") ? "font-semibold" : ""}>
                      {line.replace(/\*\*/g, "")}
                    </p>
                  ))}
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground">Test Cases:</p>
                  {selectedChallenge.testCases.map((tc, i) => (
                    <code key={i} className="block text-xs bg-muted p-1.5 rounded font-mono">{tc}</code>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Code Editor */}
            <div className="space-y-4">
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm">Your Code</CardTitle>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={markSolved}>
                        <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Mark Solved
                      </Button>
                      <Button
                        size="sm"
                        variant={showSolution ? "default" : "outline"}
                        onClick={() => setShowSolution(!showSolution)}
                      >
                        {showSolution ? <EyeOff className="h-3.5 w-3.5 mr-1" /> : <Eye className="h-3.5 w-3.5 mr-1" />}
                        {showSolution ? "Hide" : "Show"} Solution
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Textarea
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="font-mono text-sm min-h-[200px] bg-muted/50"
                    placeholder="Write your code here..."
                  />
                </CardContent>
              </Card>

              {showSolution && (
                <Card className="border-primary/20">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm text-primary">Solution</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <pre className="text-xs bg-muted p-3 rounded-lg overflow-x-auto font-mono">
                      {selectedChallenge.solution}
                    </pre>
                    <div className="p-3 bg-primary/5 rounded-lg">
                      <p className="text-xs font-medium text-primary mb-1">Explanation:</p>
                      <p className="text-xs text-muted-foreground">{selectedChallenge.explanation}</p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <Code2 className="h-6 w-6 text-primary" />
          <div>
            <h1 className="font-display text-2xl font-bold">Coding Practice</h1>
            <p className="text-muted-foreground text-sm">Solve coding challenges to sharpen your skills</p>
          </div>
          <Badge variant="secondary" className="ml-auto">
            <Trophy className="h-3 w-3 mr-1" /> {solved.size}/{codingChallenges.length} Solved
          </Badge>
        </div>

        {/* Filters */}
        <div className="flex gap-3 flex-wrap">
          <Select value={topicFilter} onValueChange={setTopicFilter}>
            <SelectTrigger className="w-[180px]">
              <Filter className="h-3.5 w-3.5 mr-2" />
              <SelectValue placeholder="Topic" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Topics</SelectItem>
              {topics.map((t) => (
                <SelectItem key={t} value={t}>{t}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={diffFilter} onValueChange={setDiffFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Difficulty" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Levels</SelectItem>
              <SelectItem value="Easy">Easy</SelectItem>
              <SelectItem value="Medium">Medium</SelectItem>
              <SelectItem value="Hard">Hard</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Challenge Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((c) => (
            <Card
              key={c.id}
              className={cn(
                "cursor-pointer hover:shadow-md transition-all hover:border-primary/30",
                solved.has(c.id) && "border-green-500/30 bg-green-500/5"
              )}
              onClick={() => openChallenge(c)}
            >
              <CardContent className="p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <h3 className="font-semibold text-sm">{c.title}</h3>
                  {solved.has(c.id) && <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />}
                </div>
                <div className="flex gap-2">
                  <Badge className={cn("text-xs", diffColor(c.difficulty))}>{c.difficulty}</Badge>
                  <Badge variant="outline" className="text-xs">{c.topic}</Badge>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {c.description.split("\n")[0].replace(/\*\*/g, "").replace(/`/g, "")}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <Code2 className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p>No challenges match your filters.</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
