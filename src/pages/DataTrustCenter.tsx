import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, AlertTriangle, XCircle, Database, Clock, RefreshCw } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useState, useEffect } from "react";
import { fetchDataTrustStats } from "@/lib/trust-engine/db-service";
import { runAndPersistPipeline } from "@/lib/trust-engine/pipeline-runner";

export default function DataTrustCenter() {
  const [stats, setStats] = useState<any>(null);
  const [results, setResults] = useState<any[]>([]);
  const [isIngesting, setIsIngesting] = useState(false);

  useEffect(() => {
    fetchDataTrustStats().then(data => {
      setStats(data);
    });
  }, []);

  const handleIngest = async () => {
    setIsIngesting(true);
    await runAndPersistPipeline(false); // false = use demo jobs to seed the DB
    const newStats = await fetchDataTrustStats();
    setStats(newStats);
    setIsIngesting(false);
  };

  if (!stats) return <DashboardLayout><div className="p-8">Loading Trust Engine stats from DB...</div></DashboardLayout>;

  const qualityMetrics = {
    completeness: 92,
    validity: 88,
    sourceReliability: 85,
    freshness: 76,
    duplicateRate: Math.round((stats.duplicates / stats.totalRecords) * 100) || 0,
    anomalyRate: 1
  };

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex items-center gap-3">
          <ShieldCheck className="h-8 w-8 text-primary" />
          <div>
            <h1 className="font-display text-3xl font-bold">Data Trust Center</h1>
            <p className="text-muted-foreground">
              Monitor and verify the integrity of the real-world job market data powering your career intelligence.
            </p>
          </div>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Database className="h-4 w-4" /> Total Records
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.totalRecords.toLocaleString()}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-green-500" /> Verified
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{stats.verified.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {((stats.verified / stats.totalRecords) * 100).toFixed(1)}% of total
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-yellow-500" /> Needs Review
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-yellow-600">{stats.needsReview.toLocaleString()}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <XCircle className="h-4 w-4 text-red-500" /> Rejected
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600">{stats.rejected.toLocaleString()}</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Quality Metrics */}
          <Card>
            <CardHeader>
              <CardTitle>Data Quality Metrics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Average Trust Score</span>
                  <span className="font-medium">{stats.averageTrustScore} / 100</span>
                </div>
                <Progress value={stats.averageTrustScore} className="h-2" />
              </div>

              <div className="space-y-3 pt-4 border-t">
                <div className="flex justify-between items-center text-sm">
                  <span>Data Completeness</span>
                  <span className="font-medium">{qualityMetrics.completeness}%</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span>Data Validity</span>
                  <span className="font-medium">{qualityMetrics.validity}%</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span>Source Reliability</span>
                  <span className="font-medium">{qualityMetrics.sourceReliability}%</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span>Freshness Score</span>
                  <span className="font-medium">{qualityMetrics.freshness}%</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pipeline Information */}
          <Card>
            <CardHeader>
              <CardTitle>Processing Pipeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative pl-6 space-y-6 border-l-2 border-muted ml-3">
                <div className="relative">
                  <div className="absolute -left-[31px] top-1 h-4 w-4 rounded-full bg-primary ring-4 ring-background" />
                  <h4 className="font-semibold text-sm">1. Ingestion & Validation</h4>
                  <p className="text-sm text-muted-foreground mt-1">Filtering out structurally invalid records missing critical fields.</p>
                </div>
                <div className="relative">
                  <div className="absolute -left-[31px] top-1 h-4 w-4 rounded-full bg-primary ring-4 ring-background" />
                  <h4 className="font-semibold text-sm">2. Cleaning & Normalization</h4>
                  <p className="text-sm text-muted-foreground mt-1">Standardizing skills, titles, and salary formats.</p>
                </div>
                <div className="relative">
                  <div className="absolute -left-[31px] top-1 h-4 w-4 rounded-full bg-primary ring-4 ring-background" />
                  <h4 className="font-semibold text-sm">3. Duplicate & Anomaly Detection</h4>
                  <p className="text-sm text-muted-foreground mt-1">Resolving duplicates and flagging suspicious records.</p>
                </div>
                <div className="relative">
                  <div className="absolute -left-[31px] top-1 h-4 w-4 rounded-full bg-green-500 ring-4 ring-background" />
                  <h4 className="font-semibold text-sm">4. Trusted Analytics Layer</h4>
                  <p className="text-sm text-muted-foreground mt-1">Only verified records influence career intelligence metrics.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="mt-12 space-y-4">
          <h2 className="font-display text-2xl font-bold">Processed Records Log (Demo)</h2>
          {results.map((r, i) => (
            <Card key={i} className={`border-l-4 ${r.status === 'VERIFIED' ? 'border-l-green-500' : r.status === 'REJECTED' ? 'border-l-red-500' : 'border-l-yellow-500'}`}>
              <CardHeader className="py-3">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg">{r.rawJob.title || 'Untitled Job'} at {r.rawJob.company || 'Unknown'}</CardTitle>
                  <Badge variant={r.status === 'VERIFIED' ? 'default' : r.status === 'REJECTED' ? 'destructive' : 'secondary'}>
                    {r.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="py-3 text-sm grid md:grid-cols-4 gap-4">
                <div>
                  <p className="font-semibold text-muted-foreground mb-1">Trust Score</p>
                  <p className="text-2xl font-bold">{r.score?.final_trust_score || 'N/A'}</p>
                </div>
                <div>
                  <p className="font-semibold text-muted-foreground mb-1">Validation</p>
                  <p>{r.validation.status}</p>
                  {r.validation.issues.length > 0 && <p className="text-red-500 text-xs mt-1">{r.validation.issues[0].message}</p>}
                </div>
                <div>
                  <p className="font-semibold text-muted-foreground mb-1">Duplicates</p>
                  <p>{r.duplicateCheck?.status || 'N/A'}</p>
                </div>
                <div>
                  <p className="font-semibold text-muted-foreground mb-1">Cleaned Skills</p>
                  <p>{r.cleaned?.cleaned_skills?.join(', ') || 'None'}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
