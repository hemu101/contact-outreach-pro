export interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  businessName: string;
  email: string;
  instagram?: string;
  tiktok?: string;
  phone?: string;
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
  };
  createdAt: Date;
}

export interface ActivityLog {
  id: string;
  type: 'email' | 'instagram' | 'tiktok' | 'voicemail';
  contactName: string;
  status: 'success' | 'failed';
  message: string;
  timestamp: Date;
}
