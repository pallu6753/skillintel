import { supabase } from "@/integrations/supabase/client";

/**
 * Audit-friendly logging for security-sensitive actions.
 * Never store resume text, emails, or other private content here —
 * only the action, the resource touched, and non-identifying metadata.
 */
export type AuditAction =
  | "auth.login"
  | "auth.logout"
  | "auth.signup"
  | "resume.analyzed"
  | "resume.saved"
  | "progress.milestone_created"
  | "progress.milestone_updated"
  | "profile.updated"
  | "data.export";

const SAFE_KEYS = /^[a-z_]{1,32}$/;

function sanitize(meta: Record<string, unknown> = {}) {
  const out: Record<string, string | number | boolean> = {};
  for (const [k, v] of Object.entries(meta)) {
    if (!SAFE_KEYS.test(k)) continue;
    if (typeof v === "string") out[k] = v.slice(0, 120);
    else if (typeof v === "number" || typeof v === "boolean") out[k] = v;
  }
  return out;
}

export async function logAudit(
  action: AuditAction,
  opts: { resource?: string; role?: string; metadata?: Record<string, unknown> } = {}
): Promise<void> {
  try {
    const { data } = await supabase.auth.getUser();
    const uid = data.user?.id;
    if (!uid) return; // anonymous actions are not logged
    await supabase.from("security_audit_log").insert({
      user_id: uid,
      actor_role: opts.role ?? null,
      action,
      resource: opts.resource ?? null,
      metadata: sanitize(opts.metadata),
    });
  } catch {
    // logging must never break a user flow
  }
}
