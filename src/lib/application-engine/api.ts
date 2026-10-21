import { supabase } from '@/integrations/supabase/client';
import { ApplicationSessionState } from './types';

export async function fetchApplications() {
  const { data, error } = await supabase
    .from('applications')
    .select(`
      *,
      raw_job_records(*),
      application_events(*),
      application_sessions(*)
    `)
    .order('updated_at', { ascending: false });

  if (error) {
    console.error('Error fetching applications:', error);
    return [];
  }
  return data;
}

export async function createApplication(jobId: string, matchScore: number, opportunityScore: number) {
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) throw new Error("Must be logged in");

  const { data, error } = await supabase
    .from('applications')
    .insert({
      user_id: user.user.id,
      job_id: jobId,
      status: 'SAVED',
      match_score: matchScore,
      opportunity_score: opportunityScore
    })
    .select()
    .single();
    
  if (error) throw error;

  // Initialize session
  await supabase.from('application_sessions').insert({
    application_id: data.id,
    state: 'NOT_STARTED',
    current_step: '0',
    metadata: {}
  });

  return data;
}

export async function updateApplicationStatus(appId: string, status: string) {
  const { error } = await supabase
    .from('applications')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', appId);
  
  if (error) throw error;
}

export async function logApplicationEvent(appId: string, eventType: string, notes?: string) {
  await supabase.from('application_events').insert({
    application_id: appId,
    event_type: eventType,
    source: 'system',
    notes
  });
}
