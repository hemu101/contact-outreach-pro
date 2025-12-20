import { Contact } from '@/types/contact';
import { CSVUploader } from './CSVUploader';
import { ContactsTable } from './ContactsTable';
import { Button } from '@/components/ui/button';
import { Download, UserPlus } from 'lucide-react';

interface ContactsPageProps {
  contacts: Contact[];
  onUpload: (contacts: Contact[]) => void;
  onDeleteContacts?: (ids: string[]) => void;
}

export function ContactsPage({ contacts, onUpload, onDeleteContacts }: ContactsPageProps) {
  const handleExport = () => {
    const headers = ['First Name', 'Last Name', 'Business Name', 'Email', 'Instagram', 'TikTok', 'Phone', 'Status'];
    const rows = contacts.map(c => [
      c.firstName, c.lastName, c.businessName, c.email, 
      c.instagram || '', c.tiktok || '', c.phone || '', c.status
    ]);
    
    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = 'contacts-export.csv';
    a.click();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Contacts</h1>
          <p className="text-muted-foreground mt-1">
            {contacts.length} contact{contacts.length !== 1 ? 's' : ''} in your list
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={handleExport} disabled={contacts.length === 0}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button variant="gradient">
            <UserPlus className="w-4 h-4 mr-2" />
            Add Contact
          </Button>
        </div>
      </div>

      {/* CSV Uploader */}
      <div className="glass-card rounded-xl p-6 animate-slide-up">
        <h3 className="text-lg font-semibold text-foreground mb-4">Import Contacts</h3>
        <CSVUploader onUpload={onUpload} />
      </div>

      {/* Contacts Table */}
      <ContactsTable contacts={contacts} onDeleteContacts={onDeleteContacts} />
    </div>
  );
}
