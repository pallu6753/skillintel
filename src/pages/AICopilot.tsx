import { useState, useRef, useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useDataset } from "@/hooks/use-dataset";
import { useAuth } from "@/lib/auth-context";
import { generateResponse, CopilotMessage } from "@/lib/copilot-engine";
import { Skeleton } from "@/components/ui/skeleton";
import { Bot, Send, User, Sparkles, Brain, Target, BookOpen, FileText, TrendingUp, Search, Mic, Code2 } from "lucide-react";
import ReactMarkdown from "react-markdown";

const quickPrompts = [
  { label: "Career guidance", prompt: "What career should I pursue?", icon: Target },
  { label: "Skill gaps", prompt: "What skills am I missing?", icon: Brain },
  { label: "Find jobs", prompt: "Find jobs for me", icon: Search },
  { label: "Learning path", prompt: "Make me a personalized learning path", icon: BookOpen },
  { label: "Readiness check", prompt: "Am I ready for placement?", icon: TrendingUp },
  { label: "Interview prep", prompt: "Help me prepare for interviews", icon: Mic },
  { label: "Coding practice", prompt: "Suggest coding challenges for me", icon: Code2 },
  { label: "Resume tips", prompt: "Give me resume improvement tips", icon: FileText },
  { label: "Learn Python", prompt: "Where can I learn Python?", icon: Sparkles },
];

export default function AICopilot() {
  const { user } = useAuth();
  const { data, isLoading } = useDataset();
  const [messages, setMessages] = useState<CopilotMessage[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  if (isLoading || !data) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-[600px]" />
        </div>
      </DashboardLayout>
    );
  }

  const student = data.students[0];

  if (!student) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-3">
          <Bot className="h-10 w-10 text-primary" />
          <h2 className="font-display text-xl font-semibold">No student profile available</h2>
          <p className="text-muted-foreground text-sm max-w-md">
            AI Copilot needs a student profile to analyze. Sign in as a student or add student data to get started.
          </p>
        </div>
      </DashboardLayout>
    );
  }

  const handleSend = (text?: string) => {
    const msg = (text || input).trim();
    if (!msg) return;

    const userMsg: CopilotMessage = {
      id: `msg-${Date.now()}`,
      role: "user",
      content: msg,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    // Simulate typing delay
    setTimeout(() => {
      const response = generateResponse(msg, student, data.skills);
      const assistantMsg: CopilotMessage = {
        id: `msg-${Date.now()}-resp`,
        role: "assistant",
        content: response,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMsg]);
      setIsTyping(false);
    }, 600 + Math.random() * 800);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col h-[calc(100vh-4rem)] max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <Bot className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold">SkillIntel AI Copilot</h1>
            <p className="text-muted-foreground text-sm">
              Your personalized career & academic advisor • Analyzing {student.name}'s profile
            </p>
          </div>
          <Badge variant="secondary" className="ml-auto">
            <Sparkles className="h-3 w-3 mr-1" /> AI Powered
          </Badge>
        </div>

        {/* Chat Area */}
        <Card className="flex-1 flex flex-col overflow-hidden">
          <ScrollArea className="flex-1 p-4" ref={scrollRef}>
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full py-12">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-4">
                  <Bot className="h-8 w-8 text-primary" />
                </div>
                <h2 className="font-display text-xl font-semibold mb-2">Welcome, {user?.name}!</h2>
                <p className="text-muted-foreground text-center max-w-md mb-6">
                  I'm your AI Copilot. I analyze your academic data, skills, and career goals to give personalized recommendations.
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-w-lg">
                  {quickPrompts.map((qp) => (
                    <Button
                      key={qp.label}
                      variant="outline"
                      size="sm"
                      className="justify-start gap-2 h-auto py-2 text-xs"
                      onClick={() => handleSend(qp.prompt)}
                    >
                      <qp.icon className="h-3.5 w-3.5 shrink-0 text-primary" />
                      {qp.label}
                    </Button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    {msg.role === "assistant" && (
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 shrink-0 mt-1">
                        <Bot className="h-4 w-4 text-primary" />
                      </div>
                    )}
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                        msg.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted"
                      }`}
                    >
                      {msg.role === "assistant" ? (
                        <div className="prose prose-sm dark:prose-invert max-w-none [&_a]:text-primary [&_a]:underline [&_table]:text-xs">
                          <ReactMarkdown>{msg.content}</ReactMarkdown>
                        </div>
                      ) : (
                        <p className="text-sm">{msg.content}</p>
                      )}
                    </div>
                    {msg.role === "user" && (
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground shrink-0 mt-1 text-xs font-bold">
                        {user?.name?.charAt(0) || "U"}
                      </div>
                    )}
                  </div>
                ))}
                {isTyping && (
                  <div className="flex gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 shrink-0">
                      <Bot className="h-4 w-4 text-primary" />
                    </div>
                    <div className="bg-muted rounded-2xl px-4 py-3">
                      <div className="flex gap-1">
                        <span className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                        <span className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                        <span className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </ScrollArea>

          {/* Quick prompts when conversation is active */}
          {messages.length > 0 && (
            <div className="flex gap-2 px-4 py-2 overflow-x-auto border-t border-border">
              {quickPrompts.slice(0, 4).map((qp) => (
                <Button
                  key={qp.label}
                  variant="ghost"
                  size="sm"
                  className="shrink-0 text-xs h-7"
                  onClick={() => handleSend(qp.prompt)}
                >
                  {qp.label}
                </Button>
              ))}
            </div>
          )}

          {/* Input */}
          <CardContent className="p-3 border-t border-border">
            <div className="flex gap-2">
              <Input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about careers, skills, academics..."
                className="flex-1"
                disabled={isTyping}
              />
              <Button onClick={() => handleSend()} disabled={!input.trim() || isTyping} size="icon">
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
