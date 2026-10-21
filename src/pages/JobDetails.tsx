import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Briefcase, Building, MapPin, DollarSign, Clock, ShieldCheck, CheckCircle2, AlertTriangle, Rocket, Sparkles, Linkedin, ExternalLink } from "lucide-react";
import { calculateMatchScore, determineEligibility, calculateOpportunityPriority, extractRequirements } from "@/lib/application-engine/matching";
import { createApplication } from "@/lib/application-engine/api";
import { useAuth } from "@/lib/auth-context";
import { getDirectJobApplyLinks } from "@/lib/job-discovery";

export default function JobDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [matchDetails, setMatchDetails] = useState<any>(null);

  useEffect(() => {
    async function loadJob() {
      // For demo, we are querying the raw_jobs joined with cleaning and scores
      const { data, error } = await supabase
        .from("raw_job_records")
        .select(`
          *,
          job_cleaning_results(*),
          job_quality_scores(*)
        `)
        .eq("id", id)
        .single();
      
      if (data) {
        const cleaned = data.job_cleaning_results?.[0] || {};
        const score = data.job_quality_scores?.[0] || {};
        const trustedJob = {
          ...data,
          cleaned_title: cleaned.cleaned_title || data.title,
          cleaned_company: cleaned.cleaned_company || data.company,
          cleaned_location: cleaned.cleaned_location || data.location,
          cleaned_skills: cleaned.cleaned_skills || data.raw_skills || [],
          normalized_experience_min: cleaned.normalized_experience_min,
          trust_score: score.final_trust_score,
          verification_status: score.verification_status
        };
        setJob(trustedJob);

        // Simulate User Profile
        const userProfile = {
          skills: ["React", "TypeScript", "Node.js", "Python"],
          experienceYears: 3,
          educationLevel: "Bachelor",
          location: "Remote",
          workModePref: ["Remote"],
          target: {
            targetRole: "Data Scientist",
            preferredLocations: ["Remote"],
            experienceLevel: "Entry Level",
            workModes: ["Remote"],
            targetSkills: ["Python", "SQL"]
          }
        };

        const requirements = extractRequirements(trustedJob);
        const match = calculateMatchScore(trustedJob, userProfile);
        const eligibility = determineEligibility(requirements, userProfile);
        const priority = calculateOpportunityPriority(match.finalScore, trustedJob.trust_score, eligibility, true);

        setMatchDetails({ match, eligibility, priority, requirements });
      }
      setLoading(false);
    }
    if (id) loadJob();
  }, [id]);

  const handleApply = async () => {
    try {
      const app = await createApplication(job.id, matchDetails.match.finalScore, 90); // Hardcoded opp score for now
      navigate(`/application-workspace/${app.id}`);
    } catch (error) {
      console.error("Could not start application", error);
      // Fallback for demo
      navigate(`/application-workspace/demo-${job.id}`);
    }
  };

  if (loading) return <DashboardLayout><div className="p-8">Loading Job...</div></DashboardLayout>;
  if (!job) return <DashboardLayout><div className="p-8">Job Not Found</div></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="font-display text-3xl font-bold">{job.cleaned_title}</h1>
            <div className="flex items-center gap-4 text-muted-foreground mt-2">
              <span className="flex items-center gap-1"><Building className="h-4 w-4" /> {job.cleaned_company}</span>
              <span className="flex items-center gap-1"><MapPin className="h-4 w-4" /> {job.cleaned_location}</span>
              <span className="flex items-center gap-1"><Clock className="h-4 w-4" /> {job.normalized_experience_min ? `${job.normalized_experience_min}+ years` : 'Exp not specified'}</span>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <Badge variant={job.verification_status === 'VERIFIED' ? 'default' : 'secondary'} className="gap-1">
              <ShieldCheck className="h-3 w-3" /> Trust Score: {job.trust_score}
            </Badge>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                className="gap-1.5 border-[#0A66C2]/40 text-[#0A66C2] hover:bg-[#0A66C2]/10"
                onClick={() => {
                  const links = getDirectJobApplyLinks(
                    job.cleaned_title,
                    job.cleaned_company,
                    job.cleaned_location,
                    job.raw_payload?.url || job.url
                  );
                  window.open(links.linkedIn, "_blank");
                }}
              >
                <Linkedin className="h-4 w-4 fill-current" /> Apply on LinkedIn ↗
              </Button>
              <Button onClick={handleApply} className="gap-2 shadow-lg shadow-primary/20 bg-gradient-to-r from-primary to-primary/80">
                <Sparkles className="h-4 w-4" /> Assisted Apply
              </Button>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Job Description</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  {job.raw_payload?.description || "No description provided."}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            {matchDetails && (
              <Card className="border-2 border-primary/20">
                <CardHeader className="pb-2 bg-primary/5">
                  <CardTitle className="flex justify-between items-center text-lg">
                    Your Match
                    <span className="text-2xl font-bold text-primary">{matchDetails.match.finalScore}%</span>
                  </CardTitle>
                  <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">{matchDetails.priority.replace('_', ' ')}</p>
                </CardHeader>
                <CardContent className="pt-4 space-y-4">
                  <div>
                    <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" /> Strong Matches
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {job.cleaned_skills.slice(0, 3).map((s: string) => (
                        <Badge key={s} variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20">{s}</Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-yellow-500" /> Skill Gaps
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {job.cleaned_skills.slice(3).map((s: string) => (
                        <Badge key={s} variant="outline" className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20">{s}</Badge>
                      ))}
                    </div>
                  </div>
                  <div className="pt-3 border-t">
                     <p className="text-sm"><strong>Eligibility:</strong> {matchDetails.eligibility.replace('_', ' ')}</p>
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
