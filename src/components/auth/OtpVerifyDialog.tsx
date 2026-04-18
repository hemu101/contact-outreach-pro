import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Mail, RefreshCw } from 'lucide-react';

interface Props {
  open: boolean;
  email: string;
  onClose: () => void;
  onVerified: () => void;
  purpose?: 'signup' | 'login' | 'reset';
}

export function OtpVerifyDialog({ open, email, onClose, onVerified, purpose = 'signup' }: Props) {
  const [code, setCode] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    if (!open) { setCode(''); return; }
    setCooldown(60);
  }, [open]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const handleVerify = async () => {
    if (code.length !== 6) return;
    setVerifying(true);
    try {
      const { data, error } = await supabase.functions.invoke('verify-otp-code', { body: { email, code } });
      if (error) throw error;
      if (data?.success) {
        toast({ title: 'Email verified!', description: 'You can now sign in.' });
        onVerified();
      } else {
        toast({ title: 'Invalid code', description: data?.error || 'Try again', variant: 'destructive' });
      }
    } catch (e: any) {
      toast({ title: 'Verification failed', description: e.message, variant: 'destructive' });
    } finally {
      setVerifying(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    try {
      const { error } = await supabase.functions.invoke('send-otp-code', { body: { email, purpose } });
      if (error) throw error;
      toast({ title: 'New code sent', description: `Check ${email}` });
      setCooldown(60);
    } catch (e: any) {
      toast({ title: 'Could not resend', description: e.message, variant: 'destructive' });
    } finally {
      setResending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mx-auto mb-2">
            <Mail className="w-6 h-6 text-primary" />
          </div>
          <DialogTitle className="text-center">Verify your email</DialogTitle>
          <DialogDescription className="text-center">
            We sent a 6-digit code to <strong>{email}</strong>. Enter it below.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-center gap-6 py-4">
          <InputOTP maxLength={6} value={code} onChange={setCode}>
            <InputOTPGroup>
              {[0,1,2,3,4,5].map(i => <InputOTPSlot key={i} index={i} />)}
            </InputOTPGroup>
          </InputOTP>
          <Button onClick={handleVerify} disabled={code.length !== 6 || verifying} className="w-full">
            {verifying ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Verifying...</> : 'Verify'}
          </Button>
          <Button variant="ghost" size="sm" onClick={handleResend} disabled={cooldown > 0 || resending}>
            <RefreshCw className="w-3 h-3 mr-2" />
            {cooldown > 0 ? `Resend in ${cooldown}s` : resending ? 'Sending...' : 'Resend code'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
