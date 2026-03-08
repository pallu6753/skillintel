import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth-context";
import { usePlacementStore } from "@/lib/placement-store";
import { useApplicationStore } from "@/lib/application-store";
import { Briefcase, Plus, Building2, Calendar, IndianRupee, Users } from "lucide-react";
import { toast } from "sonner";

export default function PlacementDrives() {
  const { user } = useAuth();
  const { drives, addDrive, closeDrive } = usePlacementStore();
  const { apply, hasApplied } = useApplicationStore();
  const [showForm, setShowForm] = useState(false);
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [pkg, setPkg] = useState("");
  const [eligibility, setEligibility] = useState("");
  const [deadline, setDeadline] = useState("");
  const [description, setDescription] = useState("");

  const canManage = user?.role === "placement" || user?.role === "admin";
  const openDrives = drives.filter((d) => d.status === "open");
  const closedDrives = drives.filter((d) => d.status === "closed");

  const handleCreate = () => {
    if (!company.trim() || !role.trim()) {
      toast.error("Company and Role are required");
      return;
    }
    addDrive({
      company: company.trim(),
      role: role.trim(),
      package: pkg.trim() || "Not disclosed",
      eligibility: eligibility.trim() || "Open to all",
      deadline: deadline || "TBD",
      description: description.trim(),
      createdBy: user?.name || "Unknown",
    });
    setCompany(""); setRole(""); setPkg(""); setEligibility(""); setDeadline(""); setDescription("");
    setShowForm(false);
    toast.success("Placement drive created!");
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Briefcase className="h-6 w-6 text-primary" />
            <div>
              <h1 className="font-display text-2xl font-bold">Placement Drives</h1>
              <p className="text-muted-foreground text-sm">{openDrives.length} active drives</p>
            </div>
          </div>
          {canManage && (
            <Button onClick={() => setShowForm(!showForm)} variant={showForm ? "secondary" : "default"}>
              <Plus className="h-4 w-4 mr-2" /> {showForm ? "Cancel" : "Create Drive"}
            </Button>
          )}
        </div>

        {/* Create Form */}
        {showForm && canManage && (
          <Card>
            <CardHeader><CardTitle className="font-display text-lg">New Placement Drive</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div><Label>Company *</Label><Input value={company} onChange={(e) => setCompany(e.target.value)} placeholder="e.g. Google" /></div>
                <div><Label>Role *</Label><Input value={role} onChange={(e) => setRole(e.target.value)} placeholder="e.g. Data Analyst" /></div>
                <div><Label>Package</Label><Input value={pkg} onChange={(e) => setPkg(e.target.value)} placeholder="e.g. 12 LPA" /></div>
                <div><Label>Deadline</Label><Input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} /></div>
              </div>
              <div><Label>Eligibility</Label><Input value={eligibility} onChange={(e) => setEligibility(e.target.value)} placeholder="e.g. GPA > 3.5" /></div>
              <div><Label>Description</Label><Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} placeholder="Drive details..." /></div>
              <Button onClick={handleCreate}>Create Drive</Button>
            </CardContent>
          </Card>
        )}

        {/* Open Drives */}
        <div className="space-y-4">
          <h2 className="font-display text-lg font-semibold">Active Drives</h2>
          {openDrives.length === 0 ? (
            <p className="text-sm text-muted-foreground">No active drives.</p>
          ) : (
            openDrives.map((d) => (
              <Card key={d.id} className="border-primary/20">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 shrink-0">
                        <Building2 className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-display font-semibold text-lg">{d.company}</h3>
                        <p className="text-sm text-muted-foreground">{d.role}</p>
                        {d.description && <p className="text-sm mt-2">{d.description}</p>}
                        <div className="flex flex-wrap gap-3 mt-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1"><IndianRupee className="h-3 w-3" /> {d.package}</span>
                          <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> Deadline: {d.deadline}</span>
                          <span className="flex items-center gap-1"><Users className="h-3 w-3" /> {d.eligibility}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Badge variant="default">Open</Badge>
                      {canManage && (
                        <Button variant="outline" size="sm" onClick={() => closeDrive(d.id)}>Close</Button>
                      )}
                      {user?.role === "student" && (
                        <Button
                          size="sm"
                          disabled={hasApplied(d.id)}
                          onClick={() => {
                            apply(d.id, d.company, d.role);
                            toast.success(`Applied to ${d.company}!`);
                          }}
                        >
                          {hasApplied(d.id) ? "Applied ✓" : "Apply"}
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Closed Drives */}
        {closedDrives.length > 0 && (
          <div className="space-y-4">
            <h2 className="font-display text-lg font-semibold text-muted-foreground">Closed Drives</h2>
            {closedDrives.map((d) => (
              <Card key={d.id} className="opacity-60">
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <span className="font-medium">{d.company}</span>
                    <span className="text-muted-foreground text-sm ml-2">— {d.role}</span>
                  </div>
                  <Badge variant="secondary">Closed</Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
