-- Trust Engine Tables

CREATE TABLE public.data_sources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    url TEXT,
    reliability_score NUMERIC NOT NULL DEFAULT 50.0,
    type TEXT NOT NULL, -- e.g., 'official', 'government', 'established', 'user_submitted'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE public.raw_job_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_id UUID REFERENCES public.data_sources(id),
    raw_payload JSONB,
    title TEXT NOT NULL,
    company TEXT,
    location TEXT,
    source_url TEXT,
    salary_min NUMERIC,
    salary_max NUMERIC,
    currency TEXT,
    experience_min NUMERIC,
    experience_max NUMERIC,
    date_posted TIMESTAMP WITH TIME ZONE,
    collected_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    raw_skills TEXT[],
    ingestion_status TEXT DEFAULT 'PENDING'
);

CREATE TABLE public.job_validation_results (
    job_id UUID PRIMARY KEY REFERENCES public.raw_job_records(id) ON DELETE CASCADE,
    status TEXT NOT NULL, -- VALID, WARNING, INVALID
    issues JSONB, -- Array of validation issues
    validated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE public.job_cleaning_results (
    job_id UUID PRIMARY KEY REFERENCES public.raw_job_records(id) ON DELETE CASCADE,
    cleaned_title TEXT,
    cleaned_company TEXT,
    cleaned_location TEXT,
    cleaned_skills TEXT[],
    normalized_salary_min NUMERIC,
    normalized_salary_max NUMERIC,
    normalized_experience_min NUMERIC,
    normalized_experience_max NUMERIC,
    cleaned_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE public.skill_aliases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    canonical_name TEXT NOT NULL
);

CREATE TABLE public.job_duplicates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id_1 UUID REFERENCES public.raw_job_records(id) ON DELETE CASCADE,
    job_id_2 UUID REFERENCES public.raw_job_records(id) ON DELETE CASCADE,
    duplicate_score NUMERIC NOT NULL,
    status TEXT NOT NULL, -- UNIQUE, POSSIBLE_DUPLICATE, CONFIRMED_DUPLICATE
    resolved_canonical_id UUID REFERENCES public.raw_job_records(id) ON DELETE SET NULL,
    detected_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE public.job_evidence (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID REFERENCES public.raw_job_records(id) ON DELETE CASCADE,
    evidence_url TEXT,
    evidence_source TEXT,
    confidence_boost NUMERIC,
    found_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE public.job_anomalies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID REFERENCES public.raw_job_records(id) ON DELETE CASCADE,
    anomaly_type TEXT NOT NULL,
    metric_value NUMERIC,
    expected_range JSONB,
    severity TEXT NOT NULL,
    detected_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE public.job_quality_scores (
    job_id UUID PRIMARY KEY REFERENCES public.raw_job_records(id) ON DELETE CASCADE,
    source_score NUMERIC NOT NULL DEFAULT 0,
    evidence_score NUMERIC NOT NULL DEFAULT 0,
    completeness_score NUMERIC NOT NULL DEFAULT 0,
    consistency_score NUMERIC NOT NULL DEFAULT 0,
    freshness_score NUMERIC NOT NULL DEFAULT 0,
    duplicate_score NUMERIC NOT NULL DEFAULT 0,
    anomaly_score NUMERIC NOT NULL DEFAULT 0,
    final_trust_score NUMERIC NOT NULL DEFAULT 0,
    verification_status TEXT NOT NULL DEFAULT 'NEEDS_REVIEW', -- VERIFIED, NEEDS_REVIEW, REJECTED
    last_verified_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS Configuration
ALTER TABLE public.data_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.raw_job_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_validation_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_cleaning_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skill_aliases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_duplicates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_anomalies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_quality_scores ENABLE ROW LEVEL SECURITY;

-- Allow anonymous and authenticated read access
CREATE POLICY "Allow public read access on data_sources" ON public.data_sources FOR SELECT USING (true);
CREATE POLICY "Allow public read access on raw_job_records" ON public.raw_job_records FOR SELECT USING (true);
CREATE POLICY "Allow public read access on job_validation_results" ON public.job_validation_results FOR SELECT USING (true);
CREATE POLICY "Allow public read access on job_cleaning_results" ON public.job_cleaning_results FOR SELECT USING (true);
CREATE POLICY "Allow public read access on skill_aliases" ON public.skill_aliases FOR SELECT USING (true);
CREATE POLICY "Allow public read access on job_duplicates" ON public.job_duplicates FOR SELECT USING (true);
CREATE POLICY "Allow public read access on job_evidence" ON public.job_evidence FOR SELECT USING (true);
CREATE POLICY "Allow public read access on job_anomalies" ON public.job_anomalies FOR SELECT USING (true);
CREATE POLICY "Allow public read access on job_quality_scores" ON public.job_quality_scores FOR SELECT USING (true);

-- Allow authenticated users to insert/update (e.g. via edge functions or client logic)
CREATE POLICY "Allow auth all access on raw_job_records" ON public.raw_job_records FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow auth all access on job_validation_results" ON public.job_validation_results FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow auth all access on job_cleaning_results" ON public.job_cleaning_results FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow auth all access on skill_aliases" ON public.skill_aliases FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow auth all access on job_duplicates" ON public.job_duplicates FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow auth all access on job_evidence" ON public.job_evidence FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow auth all access on job_anomalies" ON public.job_anomalies FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow auth all access on job_quality_scores" ON public.job_quality_scores FOR ALL USING (auth.role() = 'authenticated');

-- Create a view for trusted analytics
CREATE OR REPLACE VIEW public.trusted_jobs AS
SELECT
    r.id,
    c.cleaned_title AS title,
    c.cleaned_company AS company,
    c.cleaned_location AS location,
    c.normalized_salary_min AS salary_min,
    c.normalized_salary_max AS salary_max,
    r.currency,
    c.normalized_experience_min AS experience_min,
    c.normalized_experience_max AS experience_max,
    c.cleaned_skills AS skills,
    q.final_trust_score AS trust_score,
    q.verification_status,
    r.date_posted,
    r.collected_at,
    q.last_verified_at,
    r.source_url,
    ds.name AS source_name
FROM public.raw_job_records r
JOIN public.job_cleaning_results c ON r.id = c.job_id
JOIN public.job_quality_scores q ON r.id = q.job_id
LEFT JOIN public.data_sources ds ON r.source_id = ds.id
WHERE q.verification_status != 'REJECTED'
  AND (
      NOT EXISTS (
          SELECT 1 FROM public.job_duplicates d
          WHERE d.job_id_1 = r.id AND d.status = 'CONFIRMED_DUPLICATE' AND d.resolved_canonical_id != r.id
      )
  )
  AND (
      NOT EXISTS (
          SELECT 1 FROM public.job_duplicates d
          WHERE d.job_id_2 = r.id AND d.status = 'CONFIRMED_DUPLICATE' AND d.resolved_canonical_id != r.id
      )
  );
