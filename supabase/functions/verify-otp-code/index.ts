// Verifies a 6-digit OTP. Returns success if matched & not expired.
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function sha256(text: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  try {
    const { email, code } = await req.json();
    if (!email || !code) {
      return new Response(JSON.stringify({ error: 'Email and code required' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
    const codeHash = await sha256(String(code).trim());

    const { data: rows, error } = await supabase
      .from('email_otp_codes')
      .select('*')
      .eq('email', email.toLowerCase())
      .is('consumed_at', null)
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1);
    if (error) throw error;

    const row = rows?.[0];
    if (!row) {
      return new Response(JSON.stringify({ success: false, error: 'No active code. Request a new one.' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    if (row.attempts >= row.max_attempts) {
      return new Response(JSON.stringify({ success: false, error: 'Too many attempts. Request a new code.' }), { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    if (row.code_hash !== codeHash) {
      await supabase.from('email_otp_codes').update({ attempts: row.attempts + 1 }).eq('id', row.id);
      return new Response(JSON.stringify({ success: false, error: 'Invalid code' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    await supabase.from('email_otp_codes').update({ consumed_at: new Date().toISOString() }).eq('id', row.id);

    // Auto-confirm the user's email in Supabase Auth so they can log in
    const { data: userList } = await supabase.auth.admin.listUsers();
    const user = userList?.users?.find((u) => u.email?.toLowerCase() === email.toLowerCase());
    if (user && !user.email_confirmed_at) {
      await supabase.auth.admin.updateUserById(user.id, { email_confirm: true });
    }

    return new Response(JSON.stringify({ success: true, verified: true }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (e) {
    return new Response(JSON.stringify({ error: String((e as Error).message) }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
