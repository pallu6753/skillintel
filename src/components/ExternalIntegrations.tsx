import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, Github, Linkedin, Code2, Trophy } from "lucide-react";

const integrations = [
  {
    name: "LinkedIn",
    description: "Auto-extract skills, certifications, and endorsements from your LinkedIn profile",
    icon: Linkedin,
    color: "text-[#0A66C2]",
    bgColor: "bg-[#0A66C2]/10",
    status: "coming_soon" as const,
    features: ["Skill extraction", "Endorsement analysis", "Profile strength score"],
  },
  {
    name: "GitHub",
    description: "Analyze repositories, contributions, and coding languages automatically",
    icon: Github,
    color: "text-foreground",
    bgColor: "bg-foreground/10",
    status: "coming_soon" as const,
    features: ["Repo analysis", "Language proficiency", "Contribution heatmap"],
  },
  {
    name: "HackerRank",
    description: "Import coding scores, badges, and problem-solving statistics",
    icon: Code2,
    color: "text-[#2EC866]",
    bgColor: "bg-[#2EC866]/10",
    status: "coming_soon" as const,
    features: ["Coding score sync", "Badge tracking", "Contest history"],
  },
  {
    name: "LeetCode",
    description: "Track DSA progress, contest ratings, and problem-solving streaks",
    icon: Trophy,
    color: "text-[#FFA116]",
    bgColor: "bg-[#FFA116]/10",
    status: "coming_soon" as const,
    features: ["Problem stats", "Contest rating", "Topic proficiency"],
  },
];

export function ExternalIntegrations() {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-display text-lg font-semibold flex items-center gap-2">
          <ExternalLink className="h-5 w-5 text-primary" /> Platform Integrations
        </h2>
        <p className="text-sm text-muted-foreground">
          Connect external platforms to automatically enrich your skill profile
        </p>
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        {integrations.map((integration) => (
          <Card key={integration.name} className="relative overflow-hidden">
            <div className="absolute top-3 right-3">
              <Badge variant="secondary" className="text-xs">
                Coming Soon
              </Badge>
            </div>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${integration.bgColor}`}>
                  <integration.icon className={`h-5 w-5 ${integration.color}`} />
                </div>
                {integration.name}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">{integration.description}</p>
              <div className="flex flex-wrap gap-1">
                {integration.features.map((f) => (
                  <Badge key={f} variant="outline" className="text-xs">
                    {f}
                  </Badge>
                ))}
              </div>
              <Button variant="outline" size="sm" className="w-full opacity-50 cursor-not-allowed" disabled>
                Connect {integration.name}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
