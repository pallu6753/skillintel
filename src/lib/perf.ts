/**
 * Skill Intel — client-side performance instrumentation.
 *
 * Records REAL measured durations for key operations (login, dashboard load,
 * API/database calls, resume analysis, skill matching, recommendations).
 * Nothing here is simulated — every sample comes from performance.now().
 */

export type PerfCategory =
  | "auth"
  | "dashboard"
  | "database"
  | "analysis"
  | "recommendation"
  | "realtime";

export interface PerfSample {
  id: string;
  name: string;
  category: PerfCategory;
  duration: number; // ms
  ok: boolean;
  at: number; // epoch ms
}

const STORAGE_KEY = "skillintel.perf.samples";
const MAX_SAMPLES = 300;

let samples: PerfSample[] = load();
const listeners = new Set<(s: PerfSample[]) => void>();

function load(): PerfSample[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as PerfSample[]) : [];
  } catch {
    return [];
  }
}

function persist() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(samples.slice(0, MAX_SAMPLES)));
  } catch {
    /* storage full / unavailable — metrics stay in memory */
  }
}

function emit() {
  persist();
  listeners.forEach((l) => l(samples));
}

export function recordSample(
  name: string,
  category: PerfCategory,
  duration: number,
  ok = true
) {
  samples = [
    {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      name,
      category,
      duration: Math.round(duration * 100) / 100,
      ok,
      at: Date.now(),
    },
    ...samples,
  ].slice(0, MAX_SAMPLES);
  emit();
}

/** Wrap an async operation and record how long it actually took. */
export async function measure<T>(
  name: string,
  category: PerfCategory,
  fn: () => Promise<T>
): Promise<T> {
  const start = performance.now();
  try {
    const result = await fn();
    recordSample(name, category, performance.now() - start, true);
    return result;
  } catch (err) {
    recordSample(name, category, performance.now() - start, false);
    throw err;
  }
}

/** Measure a synchronous operation. */
export function measureSync<T>(name: string, category: PerfCategory, fn: () => T): T {
  const start = performance.now();
  try {
    const result = fn();
    recordSample(name, category, performance.now() - start, true);
    return result;
  } catch (err) {
    recordSample(name, category, performance.now() - start, false);
    throw err;
  }
}

export function getSamples(): PerfSample[] {
  return samples;
}

export function clearSamples() {
  samples = [];
  emit();
}

export function subscribePerf(fn: (s: PerfSample[]) => void): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export interface PerfSummaryRow {
  name: string;
  category: PerfCategory;
  count: number;
  avg: number;
  min: number;
  max: number;
  p95: number;
  failures: number;
  status: "fast" | "acceptable" | "slow";
}

function statusFor(avg: number): PerfSummaryRow["status"] {
  if (avg < 300) return "fast";
  if (avg < 1200) return "acceptable";
  return "slow";
}

export function summarize(all: PerfSample[] = samples): PerfSummaryRow[] {
  const byName = new Map<string, PerfSample[]>();
  all.forEach((s) => {
    if (!byName.has(s.name)) byName.set(s.name, []);
    byName.get(s.name)!.push(s);
  });

  return [...byName.entries()]
    .map(([name, list]) => {
      const durations = list.map((s) => s.duration).sort((a, b) => a - b);
      const sum = durations.reduce((a, b) => a + b, 0);
      const avg = sum / durations.length;
      const p95 = durations[Math.min(durations.length - 1, Math.floor(durations.length * 0.95))];
      return {
        name,
        category: list[0].category,
        count: list.length,
        avg: Math.round(avg * 100) / 100,
        min: durations[0],
        max: durations[durations.length - 1],
        p95,
        failures: list.filter((s) => !s.ok).length,
        status: statusFor(avg),
      };
    })
    .sort((a, b) => b.avg - a.avg);
}
