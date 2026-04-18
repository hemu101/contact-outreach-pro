// Sends a 6-digit OTP code via Resend for custom email verification.
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function sha256(text: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

function genCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function emailHtml(code: string, purpose: string): string {
  const action = purpose === 'reset' ? 'reset your password' : purpose === 'login' ? 'log in' : 'verify your email';
  return `<!DOCTYPE html><html><body style="font-family:Arial,sans-serif;background:#f5f5f7;padding:40px 20px;margin:0">
  <div style="max-width:480px;margin:0 auto;background:#fff;border-radius:12px;padding:40px;box-shadow:0 2px 8px rgba(0,0,0,0.05)">
    <h1 style="color:#111;margin:0 0 8px;font-size:24px">OutreachAI verification</h1>
    <p style="color:#555;margin:0 0 24px;font-size:15px">Enter this code to ${action}. It expires in 10 minutes.</p>
    <div style="background:#f0f4ff;border-radius:8px;padding:20px;text-align:center;font-size:36px;font-weight:bold;letter-spacing:8px;color:#1a1a1a;margin:24px 0">${code}</div>
    <p style="color:#888;font-size:13px;margin:24px 0 0">If you didn't request this, you can safely ignore this email.</p>
  </div>
</body></html>`;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  try {
    const { email, purpose = 'signup' } = await req.json();
    if (!email || typeof email !== 'string') {
      return new Response(JSON.stringify({ error: 'Email required' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
    if (!RESEND_API_KEY) {
      return new Response(JSON.stringify({ error: 'Email service not configured' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
    const code = genCode();
    const codeHash = await sha256(code);

    // Invalidate previous codes
    await supabase.from('email_otp_codes').update({ consumed_at: new Date().toISOString() }).eq('email', email.toLowerCase()).is('consumed_at', null);

    const { error: insErr } = await supabase.from('email_otp_codes').insert({
      email: email.toLowerCase(),
      code_hash: codeHash,
      purpose,
      ip_address: req.headers.get('x-forwarded-for') ?? null,
      user_agent: req.headers.get('user-agent') ?? null,
    });
    if (insErr) throw insErr;

    const sendRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: 'OutreachAI <onboarding@resend.dev>',
        to: [email],
        subject: `Your verification code: ${code}`,
        html: emailHtml(code, purpose),
      }),
    });
    const sendData = await sendRes.json();
    if (!sendRes.ok) {
      return new Response(JSON.stringify({ error: 'Failed to send email', detail: sendData }), { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    return new Response(JSON.stringify({ success: true, message: 'Code sent' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String((e as Error).message) }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
