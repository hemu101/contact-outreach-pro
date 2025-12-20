import { Contact } from '@/types/contact';
import { CSVUploader } from './CSVUploader';
import { ContactsTable } from './ContactsTable';

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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Contacts</h1>
          <p className="text-muted-foreground mt-1">Manage your outreach contacts</p>
        </div>
        <CSVUploader onUpload={onUpload} />
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
