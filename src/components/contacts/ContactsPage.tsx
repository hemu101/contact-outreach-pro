import { Contact } from '@/types/contact';
import { CSVUploader } from './CSVUploader';
import { ContactsTable } from './ContactsTable';
import { ExternalImporter } from './ExternalImporter';

interface ContactsPageProps {
  contacts: Contact[];
  onUpload: (contacts: Contact[]) => void;
  onDeleteContacts?: (ids: string[]) => void;
  onUpdateContact?: (id: string, updates: Partial<Contact>) => void;
}

export function ContactsPage({ contacts, onUpload, onDeleteContacts, onUpdateContact }: ContactsPageProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Contacts</h1>
        <p className="text-muted-foreground mt-1">Manage your outreach contacts</p>
      </div>

      {/* Import Options */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground">Upload CSV</h3>
          <CSVUploader onUpload={onUpload} contacts={contacts} />
        </div>
        <ExternalImporter onImport={onUpload} />
      </div>

      <div className="glass-card rounded-xl p-4">
        <p className="text-sm text-muted-foreground">
          Common headers are auto-mapped for <span className="text-foreground font-medium">First Name</span>, <span className="text-foreground font-medium">Business</span>, <span className="text-foreground font-medium">Email</span>, <span className="text-foreground font-medium">Instagram</span>, <span className="text-foreground font-medium">TikTok</span>, and <span className="text-foreground font-medium">Phone</span> before import.
        </p>
      </div>

      {/* Table */}
      <ContactsTable 
        contacts={contacts} 
        onDeleteContacts={onDeleteContacts} 
        onUpdateContact={onUpdateContact}
      />
    </div>
  );
}
