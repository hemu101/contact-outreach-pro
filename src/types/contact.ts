export interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  businessName: string;
  email: string;
  instagram?: string;
  tiktok?: string;
  phone?: string;
  linkedin?: string;
  location?: string;
  jobTitle?: string;
  city?: string;
  state?: string;
  country?: string;
  status: 'pending' | 'sent' | 'failed';
  emailSent?: boolean;
  dmSent?: boolean;
  voicemailSent?: boolean;
  createdAt: Date;
}

export interface Template {
  id: string;
  name: string;
  type: 'email' | 'instagram' | 'tiktok' | 'voicemail';
  subject?: string;
  body: string;
  createdAt: Date;
}

export interface Campaign {
  id: string;
  name: string;
  contacts: Contact[];
  templates: {
    email?: Template;
    instagram?: Template;
    tiktok?: Template;
    voicemail?: Template;
  };
  scheduledAt?: Date;
  status: 'draft' | 'scheduled' | 'running' | 'completed';
  stats: {
    total: number;
    sent: number;
    failed: number;
    opened?: number;
    clicked?: number;
  };
  createdAt: Date;
}

export interface CampaignContact {
  id: string;
  campaignId: string;
  contactId: string;
  status: 'pending' | 'sent' | 'failed';
  sentAt?: Date;
  openedAt?: Date;
  clickedAt?: Date;
  errorMessage?: string;
  contact?: Contact;
}

export interface ActivityLog {
  id: string;
  type: 'email' | 'instagram' | 'tiktok' | 'voicemail';
  contactName: string;
  status: 'success' | 'failed';
  message: string;
  timestamp: Date;
}

export interface EmailSettings {
  id?: string;
  smtpHost: string;
  smtpPort: string;
  smtpUser: string;
  smtpPassword: string;
  sendgridKey: string;
  brevoApiKey: string;
  twilioSid: string;
  twilioToken: string;
  twilioNumber: string;
}
