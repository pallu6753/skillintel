import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import {
  Activity, Gauge, RefreshCw, Trash2, ShieldCheck,
} from "lucide-react";
import {
  subscribePerf, summarize, clearSamples, getSamples, type PerfSample,
} from "@/lib/perf";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const statusVariant: Record<string, "default" | "secondary" | "destructive"> = {
  fast: "default",
  acceptable: "secondary",
  slow: "destructive",
};

export default function PerformancePage() {
  const { user } = useAuth();
  const [samples, setSamples] = useState<PerfSample[]>(() => getSamples());

  useEffect(() => subscribePerf(setSamples), []);

  const summary = summarize(samples);
  const last24h = samples.filter((s) => s.at > Date.now() - 24 * 3600_000);
  const failures = samples.filter((s) => !s.ok).length;
  const slow = summary.filter((s) => s.status === "slow").length;

  const isAuthorized = user?.role === "admin" || user?.role === "faculty" || user?.role === "placement";
  if (!isAuthorized) {
    return (
      <DashboardLayout>
        <Card>
          <CardContent className="p-8 text-center space-y-2">
            <ShieldCheck className="h-10 w-10 mx-auto text-muted-foreground" />
            <h2 className="font-display text-lg font-semibold">Performance report is restricted</h2>
            <p className="text-sm text-muted-foreground">
              Measured performance reporting is available to faculty, placement, and administrator accounts.
            </p>
          </CardContent>
        </Card>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-5xl mx-auto">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <Gauge className="h-6 w-6 text-primary" />
            <div>
              <h1 className="font-display text-2xl font-bold">Performance Monitor</h1>
              <p className="text-muted-foreground text-sm">
                Actual measured timings from this browser session — no estimated values.
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setSamples([...getSamples()])}>
              <RefreshCw className="h-4 w-4 mr-1" /> Refresh
            </Button>
            <Button variant="outline" size="sm" onClick={() => { clearSamples(); setSamples([]); }}>
              <Trash2 className="h-4 w-4 mr-1" /> Clear
            </Button>
          </div>
        </div>

        <div className="grid sm:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-3xl font-display font-bold text-primary">{samples.length}</p>
              <p className="text-sm text-muted-foreground mt-1">Measured operations</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-3xl font-display font-bold">{failures}</p>
              <p className="text-sm text-muted-foreground mt-1">Failed operations</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-3xl font-display font-bold">{slow}</p>
              <p className="text-sm text-muted-foreground mt-1">Operations averaging &gt; 1.2s</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="font-display text-lg flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" /> Measured operations
            </CardTitle>
          </CardHeader>
          <CardContent>
            {summary.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No measurements yet. Use sign-in, dashboards, and the resume analyzer, then refresh this page.
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Operation</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead className="text-right">Runs</TableHead>
                    <TableHead className="text-right">Avg</TableHead>
                    <TableHead className="text-right">p95</TableHead>
                    <TableHead className="text-right">Max</TableHead>
                    <TableHead className="text-right">Failures</TableHead>
                    <TableHead className="text-right">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {summary.map((row) => (
                    <TableRow key={row.name}>
                      <TableCell className="font-medium">{row.name}</TableCell>
                      <TableCell className="capitalize text-muted-foreground">{row.category}</TableCell>
                      <TableCell className="text-right">{row.count}</TableCell>
                      <TableCell className="text-right">{row.avg} ms</TableCell>
                      <TableCell className="text-right">{row.p95} ms</TableCell>
                      <TableCell className="text-right">{row.max} ms</TableCell>
                      <TableCell className="text-right">{row.failures}</TableCell>
                      <TableCell className="text-right">
                        <Badge variant={statusVariant[row.status]}>{row.status}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
            <p className="text-xs text-muted-foreground mt-3">
              Showing {last24h.length} measurements from the last 24 hours. Timings are recorded locally in this
              browser and contain no personal data.
            </p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
