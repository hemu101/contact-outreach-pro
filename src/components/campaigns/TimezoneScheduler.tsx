import { useState } from 'react';
import { Globe, Clock, Users, Zap } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface TimezoneSchedulerProps {
  useRecipientTimezone: boolean;
  onUseRecipientTimezoneChange: (value: boolean) => void;
  optimalSendHour: number;
  onOptimalSendHourChange: (hour: number) => void;
  contactCount: number;
  timezoneBreakdown?: Record<string, number>;
}

const COMMON_TIMEZONES = [
  { value: 'UTC', label: 'UTC', offset: 0 },
  { value: 'America/New_York', label: 'Eastern (ET)', offset: -5 },
  { value: 'America/Chicago', label: 'Central (CT)', offset: -6 },
  { value: 'America/Denver', label: 'Mountain (MT)', offset: -7 },
  { value: 'America/Los_Angeles', label: 'Pacific (PT)', offset: -8 },
  { value: 'Europe/London', label: 'London (GMT)', offset: 0 },
  { value: 'Europe/Paris', label: 'Paris (CET)', offset: 1 },
  { value: 'Asia/Tokyo', label: 'Tokyo (JST)', offset: 9 },
  { value: 'Asia/Shanghai', label: 'Shanghai (CST)', offset: 8 },
  { value: 'Australia/Sydney', label: 'Sydney (AEST)', offset: 10 },
];

const SEND_HOURS = [
  { value: 6, label: '6:00 AM - Early Morning' },
  { value: 8, label: '8:00 AM - Morning' },
  { value: 9, label: '9:00 AM - Business Start' },
  { value: 10, label: '10:00 AM - Mid-Morning' },
  { value: 12, label: '12:00 PM - Lunch Time' },
  { value: 14, label: '2:00 PM - Afternoon' },
  { value: 16, label: '4:00 PM - Late Afternoon' },
  { value: 18, label: '6:00 PM - Evening' },
];

export function TimezoneScheduler({
  useRecipientTimezone,
  onUseRecipientTimezoneChange,
  optimalSendHour,
  onOptimalSendHourChange,
  contactCount,
  timezoneBreakdown = {},
}: TimezoneSchedulerProps) {
  const timezoneCount = Object.keys(timezoneBreakdown).length || 1;

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="w-5 h-5 text-primary" />
          Timezone-Optimized Sending
        </CardTitle>
        <CardDescription>
          Send emails at the optimal time in each recipient's local timezone
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Toggle for recipient timezone */}
        <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/50">
          <div className="space-y-0.5">
            <Label htmlFor="use-timezone" className="text-base font-medium">
              Use Recipient's Timezone
            </Label>
            <p className="text-sm text-muted-foreground">
              Emails arrive at the same local time for each contact
            </p>
          </div>
          <Switch
            id="use-timezone"
            checked={useRecipientTimezone}
            onCheckedChange={onUseRecipientTimezoneChange}
          />
        </div>

        {/* Optimal send hour */}
        <div className="space-y-3">
          <Label className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Optimal Send Time
          </Label>
          <Select
            value={optimalSendHour.toString()}
            onValueChange={(v) => onOptimalSendHourChange(parseInt(v))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select send time" />
            </SelectTrigger>
            <SelectContent>
              {SEND_HOURS.map((hour) => (
                <SelectItem key={hour.value} value={hour.value.toString()}>
                  {hour.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            {useRecipientTimezone
              ? 'Each contact will receive the email at this time in their local timezone'
              : 'All emails will be sent at this time in your timezone'}
          </p>
        </div>

        {/* Stats */}
        {useRecipientTimezone && (
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-primary/10">
              <Users className="w-5 h-5 text-primary" />
              <div>
                <p className="text-sm font-medium text-foreground">{contactCount}</p>
                <p className="text-xs text-muted-foreground">Recipients</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-accent/10">
              <Globe className="w-5 h-5 text-accent" />
              <div>
                <p className="text-sm font-medium text-foreground">{timezoneCount}</p>
                <p className="text-xs text-muted-foreground">Timezones</p>
              </div>
            </div>
          </div>
        )}

        {/* Smart scheduling tip */}
        {useRecipientTimezone && (
          <div className="flex items-start gap-3 p-3 rounded-lg bg-success/10 border border-success/20">
            <Zap className="w-5 h-5 text-success mt-0.5" />
            <div>
              <p className="text-sm font-medium text-success">Smart Scheduling Active</p>
              <p className="text-xs text-muted-foreground">
                Emails will be queued and sent over ~24 hours to reach everyone at {optimalSendHour}:00 local time
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
