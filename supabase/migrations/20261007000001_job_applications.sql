-- Application Tracking & Resume Engine Schema

CREATE TABLE public.resume_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    job_id UUID REFERENCES public.raw_job_records(id) ON DELETE SET NULL,
    version_name TEXT NOT NULL,
    content JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE public.resume_versions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own resumes" ON public.resume_versions FOR ALL USING (auth.uid() = user_id);

CREATE TABLE public.applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    job_id UUID NOT NULL REFERENCES public.raw_job_records(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'SAVED',
    match_score NUMERIC,
    opportunity_score NUMERIC,
    trust_score NUMERIC,
    eligibility_status TEXT,
    readiness_score NUMERIC,
    resume_version_id UUID REFERENCES public.resume_versions(id) ON DELETE SET NULL,
    application_url TEXT,
    submitted_at TIMESTAMPTZ,
    submission_status TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own applications" ON public.applications FOR ALL USING (auth.uid() = user_id);
CREATE UNIQUE INDEX idx_unique_user_job_application ON public.applications(user_id, job_id);

CREATE TABLE public.application_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id UUID NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL,
    event_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    source TEXT NOT NULL,
    notes TEXT,
    metadata JSONB DEFAULT '{}'::jsonb
);
ALTER TABLE public.application_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view and create their own application events" ON public.application_events FOR ALL 
USING (
    application_id IN (SELECT id FROM public.applications WHERE user_id = auth.uid())
);

CREATE TABLE public.application_answers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id UUID NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
    question TEXT NOT NULL,
    suggested_answer TEXT,
    final_answer TEXT,
    approved BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE public.application_answers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own application answers" ON public.application_answers FOR ALL 
USING (
    application_id IN (SELECT id FROM public.applications WHERE user_id = auth.uid())
);

CREATE TABLE public.application_evidence (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id UUID NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
    evidence_type TEXT NOT NULL,
    source TEXT,
    confirmation_id TEXT,
    confirmation_text TEXT,
    application_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'::jsonb
);
ALTER TABLE public.application_evidence ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own application evidence" ON public.application_evidence FOR ALL 
USING (
    application_id IN (SELECT id FROM public.applications WHERE user_id = auth.uid())
);

CREATE TABLE public.application_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id UUID NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
    state TEXT NOT NULL DEFAULT 'NOT_STARTED',
    current_step TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    last_activity TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE public.application_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own application sessions" ON public.application_sessions FOR ALL 
USING (
    application_id IN (SELECT id FROM public.applications WHERE user_id = auth.uid())
);
