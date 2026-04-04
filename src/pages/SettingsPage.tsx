import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/integrations/supabase/client";
import { Settings, Save, CheckCircle2 } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useToast } from "@/hooks/use-toast";

export default function SettingsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [name, setName] = useState(user?.name || "");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!user?.profileId) return;
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({ full_name: name })
      .eq("id", user.profileId);
    setSaving(false);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Saved", description: "Profile updated successfully" });
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <Settings className="h-6 w-6 text-primary" />
          <div>
            <h1 className="font-display text-2xl font-bold">Settings</h1>
            <p className="text-muted-foreground text-sm">Manage your account and system preferences</p>
          </div>
        </div>

        <Card>
          <CardHeader><CardTitle className="font-display text-lg">Edit Profile</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Full Name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label className="text-muted-foreground text-xs">Email</Label>
                <p className="font-medium text-sm mt-1">{user?.email}</p>
              </div>
              <div>
                <Label className="text-muted-foreground text-xs">Role</Label>
                <p className="font-medium text-sm mt-1 capitalize">{user?.role}</p>
              </div>
            </div>
            <Button onClick={handleSave} disabled={saving} className="gap-2">
              {saving ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" /> : <Save className="h-4 w-4" />}
              Save Changes
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="font-display text-lg">Appearance</CardTitle></CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Dark / Light Mode</p>
                <p className="text-xs text-muted-foreground">Toggle the application theme</p>
              </div>
              <ThemeToggle />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="font-display text-lg">System Info</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p><span className="text-muted-foreground">Platform:</span> SkillIntel v2.0</p>
            <p><span className="text-muted-foreground">Backend:</span> Lovable Cloud (PostgreSQL + Edge Functions)</p>
            <p><span className="text-muted-foreground">Tables:</span> 11 normalized tables with RLS</p>
            <p><span className="text-muted-foreground">Auth:</span> JWT + RBAC (4 roles)</p>
            <p><span className="text-muted-foreground">Last Updated:</span> {new Date().toLocaleDateString()}</p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
