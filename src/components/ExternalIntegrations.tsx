import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  ExternalLink,
  Github,
  Linkedin,
  Code2,
  Trophy,
  CheckCircle2,
  RefreshCw,
  AlertCircle,
  Unlink,
  Sparkles,
} from "lucide-react";
import {
  getIntegrations,
  syncGitHub,
  verifyLinkedInProfile,
  verifyHackerRankProfile,
  verifyLeetCodeProfile,
  disconnectIntegration,
  PlatformIntegrationState,
  PlatformType,
} from "@/lib/integrations/platform-integrations";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";

export function ExternalIntegrations() {
  const { user } = useAuth();
  const userId = user?.id || "current";

  const [integrations, setIntegrations] = useState<Record<PlatformType, PlatformIntegrationState>>(() =>
    getIntegrations(userId)
  );

  // Active Dialog state
  const [activeDialog, setActiveDialog] = useState<PlatformType | null>(null);
  const [loading, setLoading] = useState(false);

  // Form states
  // GitHub
  const [githubUsername, setGithubUsername] = useState("");
  // LinkedIn
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [linkedinHeadline, setLinkedinHeadline] = useState("");
  const [linkedinExperience, setLinkedinExperience] = useState<number>(1);
  const [linkedinSkills, setLinkedinSkills] = useState("");
  // HackerRank
  const [hrUsername, setHrUsername] = useState("");
  const [hrScore, setHrScore] = useState<number>(350);
  const [hrBadges, setHrBadges] = useState("Problem Solving:4, Python:5, SQL:3");
  // LeetCode
  const [lcUsername, setLcUsername] = useState("");
  const [lcEasy, setLcEasy] = useState<number>(45);
  const [lcMedium, setLcMedium] = useState<number>(30);
  const [lcHard, setLcHard] = useState<number>(5);
  const [lcRating, setLcRating] = useState<number>(1650);

  const refreshState = () => {
    setIntegrations(getIntegrations(userId));
  };

  useEffect(() => {
    refreshState();
    const handleUpdate = () => refreshState();
    window.addEventListener("skillintel_integrations_updated", handleUpdate);
    return () => window.removeEventListener("skillintel_integrations_updated", handleUpdate);
  }, [userId]);

  const openModal = (platform: PlatformType) => {
    const current = integrations[platform];
    if (platform === "github") {
      setGithubUsername(current.username || "");
    } else if (platform === "linkedin") {
      setLinkedinUrl(current.profileUrl || "");
      setLinkedinHeadline(current.stats?.headline || "Data Science & Machine Learning Student");
      setLinkedinExperience(current.stats?.experienceYears || 1);
      setLinkedinSkills(current.extractedSkills?.map((s) => s.name).join(", ") || "Python, SQL, Machine Learning");
    } else if (platform === "hackerrank") {
      setHrUsername(current.username || "");
      setHrScore(current.stats?.problemSolvingScore || 350);
    } else if (platform === "leetcode") {
      setLcUsername(current.username || "");
      setLcEasy(current.stats?.easySolved || 40);
      setLcMedium(current.stats?.mediumSolved || 25);
      setLcHard(current.stats?.hardSolved || 5);
      setLcRating(current.stats?.contestRating || 1620);
    }
    setActiveDialog(platform);
  };

  // 1. GitHub Sync
  const handleGitHubSync = async () => {
    if (!githubUsername.trim()) {
      toast.error("Please enter a valid GitHub username.");
      return;
    }
    setLoading(true);
    try {
      const updated = await syncGitHub(githubUsername, userId);
      toast.success(`GitHub profile linked! Identified ${updated.extractedSkills.length} verified technical skills.`);
      setActiveDialog(null);
      refreshState();
    } catch (err: any) {
      toast.error(err.message || "Failed to sync GitHub profile.");
    } finally {
      setLoading(false);
    }
  };

  // 2. LinkedIn Verify
  const handleLinkedInVerify = () => {
    try {
      const skillsArray = linkedinSkills
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      const updated = verifyLinkedInProfile(
        {
          profileUrl: linkedinUrl,
          headline: linkedinHeadline,
          experienceYears: Number(linkedinExperience),
          skills: skillsArray.length > 0 ? skillsArray : ["Python", "SQL"],
        },
        userId
      );
      toast.success(`LinkedIn profile verified manually! Added ${updated.extractedSkills.length} verified skills.`);
      setActiveDialog(null);
      refreshState();
    } catch (err: any) {
      toast.error(err.message || "Invalid LinkedIn profile details.");
    }
  };

  // 3. HackerRank Verify
  const handleHackerRankVerify = () => {
    try {
      const badgesArray = hrBadges
        .split(",")
        .map((b) => {
          const [name, stars] = b.split(":");
          return {
            name: (name || "Problem Solving").trim(),
            stars: parseInt(stars || "3", 10),
          };
        })
        .filter((b) => b.name);

      const updated = verifyHackerRankProfile(
        {
          username: hrUsername,
          problemSolvingScore: Number(hrScore),
          badges: badgesArray,
        },
        userId
      );
      toast.success(`HackerRank profile verified! Synced ${updated.extractedSkills.length} skill badges.`);
      setActiveDialog(null);
      refreshState();
    } catch (err: any) {
      toast.error(err.message || "Invalid HackerRank details.");
    }
  };

  // 4. LeetCode Verify
  const handleLeetCodeVerify = () => {
    try {
      const total = Number(lcEasy) + Number(lcMedium) + Number(lcHard);
      const updated = verifyLeetCodeProfile(
        {
          username: lcUsername,
          totalSolved: total,
          easySolved: Number(lcEasy),
          mediumSolved: Number(lcMedium),
          hardSolved: Number(lcHard),
          contestRating: Number(lcRating),
        },
        userId
      );
      toast.success(`LeetCode verified! ${total} problems recorded in your skill profile.`);
      setActiveDialog(null);
      refreshState();
    } catch (err: any) {
      toast.error(err.message || "Invalid LeetCode details.");
    }
  };

  // Disconnect handler
  const handleDisconnect = (platform: PlatformType) => {
    disconnectIntegration(platform, userId);
    toast.info(`Disconnected ${platform} integration.`);
    refreshState();
  };

  const platformsList = [
    {
      id: "github" as PlatformType,
      name: "GitHub",
      description: "Analyze public repositories, languages, and contribution evidence",
      icon: Github,
      color: "text-foreground",
      bgColor: "bg-foreground/10",
      state: integrations.github,
    },
    {
      id: "linkedin" as PlatformType,
      name: "LinkedIn",
      description: "Verified profile matching without scraping or unauthorized automation",
      icon: Linkedin,
      color: "text-[#0A66C2]",
      bgColor: "bg-[#0A66C2]/10",
      state: integrations.linkedin,
    },
    {
      id: "hackerrank" as PlatformType,
      name: "HackerRank",
      description: "Import certified problem solving scores, badges, and contest benchmarks",
      icon: Code2,
      color: "text-[#2EC866]",
      bgColor: "bg-[#2EC866]/10",
      state: integrations.hackerrank,
    },
    {
      id: "leetcode" as PlatformType,
      name: "LeetCode",
      description: "Track verified DSA progress, solved counts (E/M/H), and contest rating",
      icon: Trophy,
      color: "text-[#FFA116]",
      bgColor: "bg-[#FFA116]/10",
      state: integrations.leetcode,
    },
  ];

  // Aggregate verified skills for display
  const allVerifiedSkills = Object.values(integrations)
    .filter((i) => i.connected)
    .flatMap((i) => i.extractedSkills || []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="font-display text-lg font-semibold flex items-center gap-2">
            <ExternalLink className="h-5 w-5 text-primary" /> Verified Platform Integrations
          </h2>
          <p className="text-sm text-muted-foreground">
            Connect external developer and professional profiles to enrich your verifiable skill evidence
          </p>
        </div>
        {allVerifiedSkills.length > 0 && (
          <Badge variant="secondary" className="w-fit flex items-center gap-1.5 px-3 py-1">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            <span className="font-medium text-xs">{allVerifiedSkills.length} Verified Evidence Signals</span>
          </Badge>
        )}
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {platformsList.map((platform) => {
          const isConnected = platform.state.connected;

          return (
            <Card key={platform.id} className={`relative overflow-hidden transition-all ${isConnected ? "border-primary/40 bg-card" : "bg-card/70"}`}>
              <div className="absolute top-3 right-3 flex items-center gap-1.5">
                {isConnected ? (
                  <Badge variant="outline" className="border-green-500/40 text-green-600 bg-green-500/10 text-xs flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    Connected
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="text-xs">
                    Not Linked
                  </Badge>
                )}
              </div>

              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2.5">
                  <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${platform.bgColor}`}>
                    <platform.icon className={`h-5 w-5 ${platform.color}`} />
                  </div>
                  <div>
                    <div className="font-semibold text-sm leading-tight">{platform.name}</div>
                    <div className="text-[11px] text-muted-foreground font-normal">
                      {platform.state.verificationBadge}
                    </div>
                  </div>
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-3.5">
                <p className="text-xs text-muted-foreground leading-relaxed">{platform.description}</p>

                {/* Connected stats snippet */}
                {isConnected && (
                  <div className="p-2.5 rounded-lg bg-muted/50 border text-xs space-y-1.5">
                    <div className="flex items-center justify-between text-muted-foreground">
                      <span className="font-medium text-foreground">
                        {platform.id === "github" && `@${platform.state.username}`}
                        {platform.id === "linkedin" && (platform.state.stats?.headline || "Verified Profile")}
                        {platform.id === "hackerrank" && `User: ${platform.state.username}`}
                        {platform.id === "leetcode" && `User: ${platform.state.username}`}
                      </span>
                      {platform.state.lastSyncedAt && (
                        <span className="text-[10px]">
                          Synced {new Date(platform.state.lastSyncedAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>

                    {/* Quick metrics */}
                    <div className="flex flex-wrap gap-2 text-[11px] text-muted-foreground pt-1">
                      {platform.id === "github" && (
                        <>
                          <span>📁 {platform.state.stats?.publicRepos || 0} Repos</span>
                          <span>⭐ {platform.state.stats?.stars || 0} Stars</span>
                          <span>Top: {platform.state.stats?.topLanguages?.slice(0, 2).join(", ") || "Code"}</span>
                        </>
                      )}
                      {platform.id === "linkedin" && (
                        <>
                          <span>💼 {platform.state.stats?.experienceYears || 1} yr(s) exp</span>
                          <span>🔒 Manual Verified</span>
                        </>
                      )}
                      {platform.id === "hackerrank" && (
                        <>
                          <span>🎯 {platform.state.stats?.problemSolvingScore || 0} pts</span>
                          <span>🎖️ {platform.state.stats?.badges?.length || 0} Badges</span>
                        </>
                      )}
                      {platform.id === "leetcode" && (
                        <>
                          <span>⚡ {platform.state.stats?.totalSolved || 0} Solved</span>
                          <span>🏆 Rating: {platform.state.stats?.contestRating || "Unrated"}</span>
                        </>
                      )}
                    </div>

                    {/* Extracted skills pills */}
                    {platform.state.extractedSkills && platform.state.extractedSkills.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-1.5 border-t border-border/50">
                        {platform.state.extractedSkills.slice(0, 4).map((skill) => (
                          <Badge key={skill.name} variant="secondary" className="text-[10px] py-0 px-1.5">
                            {skill.name} ({skill.level})
                          </Badge>
                        ))}
                        {platform.state.extractedSkills.length > 4 && (
                          <span className="text-[10px] text-muted-foreground self-center">
                            +{platform.state.extractedSkills.length - 4} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Action buttons */}
                <div className="flex items-center gap-2 pt-1">
                  <Button
                    variant={isConnected ? "outline" : "default"}
                    size="sm"
                    className="w-full text-xs"
                    onClick={() => openModal(platform.id)}
                  >
                    {isConnected ? (
                      <>
                        <RefreshCw className="h-3.5 w-3.5 mr-1.5" /> Re-sync / Edit
                      </>
                    ) : (
                      <>Connect {platform.name}</>
                    )}
                  </Button>

                  {isConnected && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="px-2.5 text-xs text-destructive hover:bg-destructive/10"
                      title="Disconnect integration"
                      onClick={() => handleDisconnect(platform.id)}
                    >
                      <Unlink className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Aggregate Verified Evidence Summary */}
      {allVerifiedSkills.length > 0 && (
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader className="py-3 px-4">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-primary" /> Verified Cross-Platform Skills in Your Profile
            </CardTitle>
            <CardDescription className="text-xs">
              These verified competencies are automatically prioritized in SkillIntel Job Discovery & Career Intelligence.
            </CardDescription>
          </CardHeader>
          <CardContent className="py-2 px-4 pb-4">
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-2.5">
              {allVerifiedSkills.map((s, idx) => (
                <div key={idx} className="p-2 rounded bg-background/80 border text-xs space-y-0.5">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-foreground">{s.name}</span>
                    <Badge variant="outline" className="text-[9px] py-0 px-1">
                      {s.level}
                    </Badge>
                  </div>
                  <p className="text-[10px] text-muted-foreground truncate" title={s.evidence}>
                    {s.evidence}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 1. GITHUB DIALOG */}
      <Dialog open={activeDialog === "github"} onOpenChange={(open) => !open && setActiveDialog(null)}>
        <DialogContent className="sm:max-w-[440px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Github className="h-5 w-5" /> Connect GitHub Profile
            </DialogTitle>
            <DialogDescription className="text-xs">
              SkillIntel uses the public GitHub REST API to verify your public repositories, primary programming
              languages, and open-source contributions.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="gh-username" className="text-xs">
                GitHub Username
              </Label>
              <Input
                id="gh-username"
                placeholder="e.g. torvalds or your-github-handle"
                value={githubUsername}
                onChange={(e) => setGithubUsername(e.target.value)}
                disabled={loading}
              />
              <p className="text-[11px] text-muted-foreground">
                No passwords or OAuth tokens required. SkillIntel only inspects public repositories.
              </p>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" size="sm" onClick={() => setActiveDialog(null)} disabled={loading}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleGitHubSync} disabled={loading} className="gap-1.5">
              {loading && <RefreshCw className="h-3.5 w-3.5 animate-spin" />}
              {loading ? "Inspecting Repositories..." : "Fetch & Verify Skills"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 2. LINKEDIN DIALOG */}
      <Dialog open={activeDialog === "linkedin"} onOpenChange={(open) => !open && setActiveDialog(null)}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Linkedin className="h-5 w-5 text-[#0A66C2]" /> Verify LinkedIn Profile
            </DialogTitle>
            <DialogDescription className="text-xs">
              Manual verification protocol compliant with LinkedIn Terms of Service.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3.5 py-2">
            <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg text-xs space-y-1 text-amber-900 dark:text-amber-200">
              <div className="font-semibold flex items-center gap-1.5">
                <AlertCircle className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                API & Anti-Scraping Disclosure
              </div>
              <p className="text-[11px] leading-relaxed">
                Official LinkedIn Job Search / Profile APIs require active Enterprise Partner agreements.
                Web scraping or credential harvesting violates LinkedIn's User Agreement. SkillIntel uses
                authenticated manual verification to register your profile URL and declared skills.
              </p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="li-url" className="text-xs">
                LinkedIn Profile URL
              </Label>
              <Input
                id="li-url"
                placeholder="https://www.linkedin.com/in/username"
                value={linkedinUrl}
                onChange={(e) => setLinkedinUrl(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="li-headline" className="text-xs">
                Profile Headline
              </Label>
              <Input
                id="li-headline"
                placeholder="e.g. S6 Data Science Student | Python & ML Aspirant"
                value={linkedinHeadline}
                onChange={(e) => setLinkedinHeadline(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="li-exp" className="text-xs">
                  Years of Experience
                </Label>
                <Input
                  id="li-exp"
                  type="number"
                  min="0"
                  max="20"
                  value={linkedinExperience}
                  onChange={(e) => setLinkedinExperience(Number(e.target.value))}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="li-skills" className="text-xs">
                Verified Skills (Comma Separated)
              </Label>
              <Input
                id="li-skills"
                placeholder="Python, SQL, Machine Learning, Power BI"
                value={linkedinSkills}
                onChange={(e) => setLinkedinSkills(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" size="sm" onClick={() => setActiveDialog(null)}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleLinkedInVerify}>
              Save & Verify Profile
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 3. HACKERRANK DIALOG */}
      <Dialog open={activeDialog === "hackerrank"} onOpenChange={(open) => !open && setActiveDialog(null)}>
        <DialogContent className="sm:max-w-[440px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Code2 className="h-5 w-5 text-[#2EC866]" /> Link HackerRank Profile
            </DialogTitle>
            <DialogDescription className="text-xs">
              Verify your coding badges and problem-solving statistics from HackerRank.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3.5 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="hr-username" className="text-xs">
                HackerRank Username
              </Label>
              <Input
                id="hr-username"
                placeholder="e.g. coder_vtu"
                value={hrUsername}
                onChange={(e) => setHrUsername(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="hr-score" className="text-xs">
                Problem Solving Score
              </Label>
              <Input
                id="hr-score"
                type="number"
                placeholder="350"
                value={hrScore}
                onChange={(e) => setHrScore(Number(e.target.value))}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="hr-badges" className="text-xs">
                Earned Badges (Name:Stars format)
              </Label>
              <Input
                id="hr-badges"
                placeholder="Problem Solving:4, Python:5, SQL:3"
                value={hrBadges}
                onChange={(e) => setHrBadges(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" size="sm" onClick={() => setActiveDialog(null)}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleHackerRankVerify}>
              Verify HackerRank
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 4. LEETCODE DIALOG */}
      <Dialog open={activeDialog === "leetcode"} onOpenChange={(open) => !open && setActiveDialog(null)}>
        <DialogContent className="sm:max-w-[440px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-[#FFA116]" /> Link LeetCode Profile
            </DialogTitle>
            <DialogDescription className="text-xs">
              Record verified DSA problem-solving benchmarks and contest ratings.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3.5 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="lc-username" className="text-xs">
                LeetCode Username
              </Label>
              <Input
                id="lc-username"
                placeholder="e.g. leetcode_ninja"
                value={lcUsername}
                onChange={(e) => setLcUsername(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className="space-y-1">
                <Label htmlFor="lc-easy" className="text-[11px] text-green-600 font-semibold">
                  Easy Solved
                </Label>
                <Input
                  id="lc-easy"
                  type="number"
                  value={lcEasy}
                  onChange={(e) => setLcEasy(Number(e.target.value))}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="lc-med" className="text-[11px] text-amber-600 font-semibold">
                  Medium Solved
                </Label>
                <Input
                  id="lc-med"
                  type="number"
                  value={lcMedium}
                  onChange={(e) => setLcMedium(Number(e.target.value))}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="lc-hard" className="text-[11px] text-destructive font-semibold">
                  Hard Solved
                </Label>
                <Input
                  id="lc-hard"
                  type="number"
                  value={lcHard}
                  onChange={(e) => setLcHard(Number(e.target.value))}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="lc-rating" className="text-xs">
                Contest Rating
              </Label>
              <Input
                id="lc-rating"
                type="number"
                placeholder="1650"
                value={lcRating}
                onChange={(e) => setLcRating(Number(e.target.value))}
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" size="sm" onClick={() => setActiveDialog(null)}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleLeetCodeVerify}>
              Verify LeetCode
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
