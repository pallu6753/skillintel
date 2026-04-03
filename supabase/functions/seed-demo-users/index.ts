import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const DEMO_USERS = [
  { email: "student@test.com", password: "password123", role: "student", name: "Demo Student" },
  { email: "faculty@test.com", password: "password123", role: "faculty", name: "Demo Faculty" },
  { email: "admin@test.com", password: "password123", role: "admin", name: "Demo Admin" },
  { email: "placement@test.com", password: "password123", role: "placement", name: "Demo Placement" },
];

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    const results: string[] = [];

    for (const demo of DEMO_USERS) {
      // Check if user already exists
      const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
      const existing = existingUsers?.users?.find((u) => u.email === demo.email);

      let userId: string;

      if (existing) {
        userId = existing.id;
        // Update password
        await supabaseAdmin.auth.admin.updateUserById(userId, {
          password: demo.password,
          email_confirm: true,
        });
        results.push(`${demo.email}: updated password`);
      } else {
        // Create user
        const { data, error } = await supabaseAdmin.auth.admin.createUser({
          email: demo.email,
          password: demo.password,
          email_confirm: true,
          user_metadata: { full_name: demo.name },
        });
        if (error) {
          results.push(`${demo.email}: ERROR creating - ${error.message}`);
          continue;
        }
        userId = data.user.id;
        results.push(`${demo.email}: created`);
      }

      // Ensure profile exists
      const { data: profile } = await supabaseAdmin
        .from("profiles")
        .select("id")
        .eq("user_id", userId)
        .maybeSingle();

      if (!profile) {
        await supabaseAdmin.from("profiles").insert({
          user_id: userId,
          full_name: demo.name,
          email: demo.email,
          department: demo.role === "student" ? "Computer Science" : null,
        });
        results.push(`${demo.email}: profile created`);
      }

      // Ensure role exists
      const { data: roleData } = await supabaseAdmin
        .from("user_roles")
        .select("id")
        .eq("user_id", userId)
        .maybeSingle();

      if (!roleData) {
        await supabaseAdmin.from("user_roles").insert({
          user_id: userId,
          role: demo.role,
        });
        results.push(`${demo.email}: role '${demo.role}' assigned`);
      }
    }

    return new Response(JSON.stringify({ success: true, results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
