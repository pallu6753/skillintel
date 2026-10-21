import { getDemoJobs, fetchJobsFromAdzuna } from './source/adapter';
import { processJobRecord } from './pipeline';
import { persistRawJob, persistProcessingResult } from './db-service';
import { RawJobRecord } from './types';

/**
 * Executes the full Trust Engine pipeline and PERSISTS all stages to Supabase.
 * This is the real pipeline replacing the in-memory demo.
 */
export async function runAndPersistPipeline(useLiveApi: boolean = false) {
  let rawJobs: RawJobRecord[] = [];
  
  if (useLiveApi) {
    // Attempt to fetch real jobs (requires valid Adzuna API keys in env)
    // If keys are missing, fallback to demo data
    const appId = import.meta.env.VITE_ADZUNA_APP_ID;
    const appKey = import.meta.env.VITE_ADZUNA_APP_KEY;
    if (appId && appKey) {
        rawJobs = await fetchJobsFromAdzuna(appId, appKey, 'Data Scientist');
    } else {
        console.warn("No Adzuna API keys found. Falling back to explicitly marked demo data.");
        rawJobs = getDemoJobs();
    }
  } else {
    rawJobs = getDemoJobs();
  }

  // 1. Ingestion Phase - Save RAW payload
  for (const job of rawJobs) {
    await persistRawJob(job);
  }

  // 2. Processing Phase
  const existingJobs: any[] = []; // In a real backend, we'd query existing canonical jobs from DB here
  
  let processedCount = 0;
  for (const rawJob of rawJobs) {
    const result = await processJobRecord(rawJob, existingJobs, 80, 50, 0);
    
    // 3. Persistence Phase - Save all pipeline results to DB (Lineage)
    await persistProcessingResult(rawJob.id, result);

    if (result.status !== 'REJECTED') {
      existingJobs.push(result.cleaned);
    }
    processedCount++;
  }

  return {
    processedCount,
    message: `Successfully ingested and processed ${processedCount} records to Supabase.`
  };
}
