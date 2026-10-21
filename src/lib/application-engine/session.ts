import { ApplicationSessionState } from './types';
import { supabase } from '@/integrations/supabase/client';

export class ApplicationSessionManager {
  private applicationId: string;
  private state: ApplicationSessionState;

  constructor(applicationId: string, initialState?: ApplicationSessionState) {
    this.applicationId = applicationId;
    this.state = initialState || {
      state: 'NOT_STARTED',
      currentStep: 0,
      missingFields: []
    };
  }

  getState() {
    return this.state;
  }

  async transitionTo(newState: ApplicationSessionState['state'], missingFields: string[] = []) {
    // Validations before transition could go here
    this.state.state = newState;
    this.state.missingFields = missingFields;
    await this.persist();
  }

  async persist() {
    const { error } = await supabase.from('application_sessions').upsert({
      application_id: this.applicationId,
      state: this.state.state,
      current_step: this.state.currentStep.toString(),
      metadata: { missingFields: this.state.missingFields },
      updated_at: new Date().toISOString()
    });

    if (error) {
      console.error('Failed to persist application session state:', error);
    }
  }

  async logEvent(eventType: string, source: string, notes?: string) {
    await supabase.from('application_events').insert({
      application_id: this.applicationId,
      event_type: eventType,
      source: source,
      notes: notes
    });
  }
}
