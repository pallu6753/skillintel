// Job discovery links for various career roles
export interface JobSearchLink {
  platform: string;
  icon: string;
  url: string;
  color: string;
}

export function getJobSearchLinks(role: string): JobSearchLink[] {
  const encoded = encodeURIComponent(role);
  return [
    {
      platform: "LinkedIn",
      icon: "💼",
      url: `https://www.linkedin.com/jobs/search/?keywords=${encoded}`,
      color: "bg-blue-600/10 text-blue-700 hover:bg-blue-600/20",
    },
    {
      platform: "Indeed",
      icon: "🔍",
      url: `https://www.indeed.com/jobs?q=${encoded.replace(/%20/g, "+")}`,
      color: "bg-purple-600/10 text-purple-700 hover:bg-purple-600/20",
    },
    {
      platform: "Glassdoor",
      icon: "🚪",
      url: `https://www.glassdoor.com/Job/jobs.htm?sc.keyword=${encoded.replace(/%20/g, "+")}`,
      color: "bg-green-600/10 text-green-700 hover:bg-green-600/20",
    },
    {
      platform: "Naukri",
      icon: "🇮🇳",
      url: `https://www.naukri.com/${role.toLowerCase().replace(/\s+/g, "-")}-jobs`,
      color: "bg-orange-600/10 text-orange-700 hover:bg-orange-600/20",
    },
  ];
}

export function isJobReady(readinessScore: number): boolean {
  return readinessScore >= 70;
}

export function getReadinessMessage(score: number): { message: string; status: "ready" | "almost" | "developing" } {
  if (score >= 70) {
    return { message: "You are ready to start applying for jobs! 🎉", status: "ready" };
  } else if (score >= 50) {
    return { message: "Almost there! Focus on building missing skills and projects.", status: "almost" };
  }
  return { message: "Keep developing your skills and gaining experience.", status: "developing" };
}
