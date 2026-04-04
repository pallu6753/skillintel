import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Brain, TrendingUp, Target, Zap, CheckCircle2, AlertTriangle } from "lucide-react";
import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  PieChart, Pie, Cell,
} from "recharts";

const modelMetrics = {
  accuracy: 87.3,
  precision: 84.6,
  recall: 89.1,
  f1Score: 86.8,
  auc: 91.2,
};

const confusionMatrix = {
  tp: 178, fp: 32, fn: 22, tn: 168,
};

const featureImportance = [
  { feature: "GPA", importance: 25 },
  { feature: "Skills Score", importance: 22 },
  { feature: "Coding Score", importance: 20 },
  { feature: "Projects", importance: 15 },
  { feature: "Resume Score", importance: 12 },
  { feature: "Internships", importance: 6 },
];

const classDistribution = [
  { name: "Ready", value: 340, color: "hsl(var(--success))" },
  { name: "Moderate", value: 420, color: "hsl(var(--warning))" },
  { name: "Not Ready", value: 240, color: "hsl(var(--destructive))" },
];

// Explainable AI example
const explainableExamples = [
  {
    name: "Rahul Sharma",
    score: 82,
    classification: "Ready",
    factors: [
      { label: "High GPA (8.5)", impact: +22, positive: true },
      { label: "Strong Python & ML skills", impact: +20, positive: true },
      { label: "3 Projects completed", impact: +18, positive: true },
      { label: "Good resume score", impact: +14, positive: true },
      { label: "1 Internship", impact: +8, positive: true },
    ],
  },
  {
    name: "Priya Patel",
    score: 54,
    classification: "Moderate",
    factors: [
      { label: "Average GPA (6.8)", impact: +12, positive: true },
      { label: "Strong communication", impact: +15, positive: true },
      { label: "Low coding score", impact: -18, positive: false },
      { label: "No internships", impact: -10, positive: false },
      { label: "1 Project only", impact: -5, positive: false },
    ],
  },
];

export default function ModelMetrics() {
  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-6xl mx-auto">
        <div>
          <h1 className="font-display text-2xl font-bold">Model Evaluation & Explainable AI</h1>
          <p className="text-muted-foreground text-sm mt-1">ML model performance metrics and prediction explanations</p>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {[
            { label: "Accuracy", value: modelMetrics.accuracy, icon: Target },
            { label: "Precision", value: modelMetrics.precision, icon: Zap },
            { label: "Recall", value: modelMetrics.recall, icon: TrendingUp },
            { label: "F1 Score", value: modelMetrics.f1Score, icon: Brain },
            { label: "AUC-ROC", value: modelMetrics.auc, icon: CheckCircle2 },
          ].map((m) => (
            <Card key={m.label}>
              <CardContent className="p-4 text-center space-y-2">
                <m.icon className="h-5 w-5 mx-auto text-primary" />
                <p className="text-2xl font-display font-bold">{m.value}%</p>
                <p className="text-xs text-muted-foreground">{m.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Feature Importance */}
          <Card>
            <CardHeader>
              <CardTitle className="font-display text-lg">Feature Importance</CardTitle>
              <CardDescription>Weight of each factor in placement prediction</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={featureImportance} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis type="number" tick={{ fontSize: 11 }} />
                  <YAxis dataKey="feature" type="category" width={90} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="importance" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Class Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="font-display text-lg">Prediction Distribution</CardTitle>
              <CardDescription>Student classification breakdown</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={classDistribution} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                    {classDistribution.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Confusion Matrix */}
          <Card>
            <CardHeader>
              <CardTitle className="font-display text-lg">Confusion Matrix</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2 max-w-xs mx-auto">
                <div className="bg-success/10 border border-success/20 rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-success">{confusionMatrix.tp}</p>
                  <p className="text-[10px] text-muted-foreground mt-1">True Positive</p>
                </div>
                <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-destructive">{confusionMatrix.fp}</p>
                  <p className="text-[10px] text-muted-foreground mt-1">False Positive</p>
                </div>
                <div className="bg-warning/10 border border-warning/20 rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-warning">{confusionMatrix.fn}</p>
                  <p className="text-[10px] text-muted-foreground mt-1">False Negative</p>
                </div>
                <div className="bg-success/10 border border-success/20 rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-success">{confusionMatrix.tn}</p>
                  <p className="text-[10px] text-muted-foreground mt-1">True Negative</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Model Info */}
          <Card>
            <CardHeader>
              <CardTitle className="font-display text-lg">Model Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              {[
                { label: "Algorithm", value: "Random Forest + Logistic Regression Ensemble" },
                { label: "Training Samples", value: "800 students" },
                { label: "Test Samples", value: "200 students" },
                { label: "Cross-Validation", value: "5-Fold Stratified" },
                { label: "Hyperparameter Tuning", value: "Grid Search CV" },
                { label: "Feature Scaling", value: "Min-Max Normalization" },
              ].map((info) => (
                <div key={info.label} className="flex justify-between items-center py-1 border-b border-border/50 last:border-0">
                  <span className="text-muted-foreground">{info.label}</span>
                  <span className="font-medium text-xs">{info.value}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Explainable AI */}
        <Card>
          <CardHeader>
            <CardTitle className="font-display text-lg flex items-center gap-2">
              <Brain className="h-5 w-5 text-primary" /> Explainable AI — Score Breakdown
            </CardTitle>
            <CardDescription>Understanding WHY a student received their placement score</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              {explainableExamples.map((student) => (
                <div key={student.name} className="border rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-display font-semibold">{student.name}</p>
                      <Badge variant={student.classification === "Ready" ? "default" : "secondary"}>
                        {student.classification}
                      </Badge>
                    </div>
                    <div className="text-right">
                      <p className="text-3xl font-display font-bold text-primary">{student.score}%</p>
                      <p className="text-[10px] text-muted-foreground">Placement Score</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {student.factors.map((f) => (
                      <div key={f.label} className="flex items-center gap-2">
                        {f.positive ? (
                          <CheckCircle2 className="h-3.5 w-3.5 text-success shrink-0" />
                        ) : (
                          <AlertTriangle className="h-3.5 w-3.5 text-destructive shrink-0" />
                        )}
                        <span className="text-sm flex-1">{f.label}</span>
                        <span className={`text-xs font-mono font-semibold ${f.positive ? "text-success" : "text-destructive"}`}>
                          {f.impact > 0 ? "+" : ""}{f.impact}
                        </span>
                      </div>
                    ))}
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
