import { RawJobRecord } from '../types';

export async function fetchJobsFromAdzuna(appId: string, appKey: string, role: string): Promise<RawJobRecord[]> {
  try {
    const response = await fetch(`https://api.adzuna.com/v1/api/jobs/gb/search/1?app_id=${appId}&app_key=${appKey}&what=${encodeURIComponent(role)}`);
    const data = await response.json();

    return data.results.map((r: any) => ({
      id: String(r.id),
      title: r.title,
      company: r.company?.display_name || '',
      location: r.location?.display_name || '',
      source_url: r.redirect_url,
      salary_min: r.salary_min,
      salary_max: r.salary_max,
      collected_at: new Date().toISOString(),
      raw_payload: r,
      ingestion_status: 'PENDING',
    }));
  } catch (error) {
    console.error("Failed to fetch jobs from Adzuna:", error);
    return [];
  }
}

export function getDemoJobs(): RawJobRecord[] {
  // A small set of DEMO jobs explicitly marked to fulfill the "Real-World Data" requirement safely
  // when an API key is not available
  return [
    {
      id: "demo-1",
      title: "React Developer",
      company: "Tech Demo Corp",
      location: "Remote",
      source_url: "https://example.com/demo1",
      salary_min: 100000,
      salary_max: 150000,
      experience_min: 2,
      experience_max: 5,
      collected_at: new Date().toISOString(),
      raw_skills: ["React", "TypeScript", "Node.js"],
      raw_payload: { is_demo: true }
    },
    {
      id: "demo-2",
      title: "Data Scientist",
      company: "DataCorp",
      location: "New York",
      source_url: "https://example.com/demo2",
      salary_min: 120000,
      salary_max: 180000,
      experience_min: 3,
      experience_max: 7,
      collected_at: new Date().toISOString(),
      raw_skills: ["Python", "Machine Learning", "SQL", "Deep Learning"],
      raw_payload: { is_demo: true }
    },
    {
      id: "demo-3", // Invalid salary to test validation
      title: "Data Engineer",
      company: "DataCorp",
      location: "Remote",
      source_url: "https://example.com/demo3",
      salary_min: 180000,
      salary_max: 120000, // min > max
      experience_min: 3,
      experience_max: 7,
      collected_at: new Date().toISOString(),
      raw_skills: ["Python", "SQL", "Snowflake"],
      raw_payload: { is_demo: true }
    },
    {
      id: "demo-4", // Duplicate of demo-2
      title: "Data Scientist",
      company: "DataCorp",
      location: "New York",
      source_url: "https://example.com/demo4",
      salary_min: 120000,
      salary_max: 180000,
      experience_min: 3,
      experience_max: 7,
      collected_at: new Date().toISOString(),
      raw_skills: ["Python", "Machine Learning", "SQL"],
      raw_payload: { is_demo: true }
    },
    {
      id: "demo-5", // Missing title
      title: "",
      company: "Startup Inc",
      location: "San Francisco",
      source_url: "https://example.com/demo5",
      collected_at: new Date().toISOString(),
      raw_skills: ["React", "Node.js"],
      raw_payload: { is_demo: true }
    }
  ];
}
