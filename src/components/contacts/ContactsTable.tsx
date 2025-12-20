import { useState } from 'react';
import { Search, Mail, MessageCircle, Phone, CheckCircle, XCircle, Clock, Trash2 } from 'lucide-react';
import { Contact } from '@/types/contact';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { EditableField } from './EditableField';
import { cn } from '@/lib/utils';

interface ContactsTableProps {
  contacts: Contact[];
  onDeleteContacts?: (ids: string[]) => void;
  onUpdateContact?: (id: string, updates: Partial<Contact>) => void;
}

const statusConfig = {
  pending: { icon: Clock, color: 'text-warning', bg: 'bg-warning/10' },
  sent: { icon: CheckCircle, color: 'text-success', bg: 'bg-success/10' },
  failed: { icon: XCircle, color: 'text-destructive', bg: 'bg-destructive/10' },
};

export function ContactsTable({ contacts, onDeleteContacts, onUpdateContact }: ContactsTableProps) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const filtered = contacts.filter(c => {
    const matchesSearch = `${c.firstName} ${c.lastName} ${c.businessName} ${c.email}`
      .toLowerCase()
      .includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(filtered.map(c => c.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    const newSet = new Set(selectedIds);
    if (checked) {
      newSet.add(id);
    } else {
      newSet.delete(id);
    }
    setSelectedIds(newSet);
  };

  const handleBulkDelete = () => {
    if (selectedIds.size > 0 && onDeleteContacts) {
      onDeleteContacts(Array.from(selectedIds));
      setSelectedIds(new Set());
    }
  };

  const handleFieldUpdate = (contactId: string, field: keyof Contact, value: string) => {
    if (onUpdateContact) {
      onUpdateContact(contactId, { [field]: value });
    }
  };

  const allSelected = filtered.length > 0 && filtered.every(c => selectedIds.has(c.id));

  return (
    <div className="space-y-4">
      {/* Filters and Actions */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-1 gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Search contacts..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="sent">Sent</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {selectedIds.size > 0 && (
          <Button 
            variant="destructive" 
            size="sm" 
            onClick={handleBulkDelete}
            className="shrink-0"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete ({selectedIds.size})
          </Button>
        )}
      </div>

      {/* Inline Edit Tip */}
      {contacts.length > 0 && (
        <p className="text-sm text-muted-foreground">
          💡 Click on any field to edit it inline
        </p>
      )}

      {/* Table */}
      <div className="glass-card rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-secondary/30">
                <th className="py-4 px-4 w-12">
                  <Checkbox 
                    checked={allSelected}
                    onCheckedChange={handleSelectAll}
                    aria-label="Select all"
                  />
                </th>
                <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">Name</th>
                <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">Email</th>
                <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">Business</th>
                <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">Channels</th>
                <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-muted-foreground">
                    {contacts.length === 0 ? 'No contacts yet. Upload a CSV to get started.' : 'No contacts match your filters.'}
                  </td>
                </tr>
              ) : (
                filtered.map((contact, idx) => {
                  const StatusIcon = statusConfig[contact.status].icon;
                  return (
                    <tr 
                      key={contact.id} 
                      className={cn(
                        "border-b border-border/50 hover:bg-secondary/20 transition-colors animate-fade-in",
                        selectedIds.has(contact.id) && "bg-primary/5"
                      )}
                      style={{ animationDelay: `${idx * 50}ms` }}
                    >
                      <td className="py-4 px-4">
                        <Checkbox 
                          checked={selectedIds.has(contact.id)}
                          onCheckedChange={(checked) => handleSelectOne(contact.id, !!checked)}
                          aria-label={`Select ${contact.firstName}`}
                        />
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex gap-1">
                          <EditableField
                            value={contact.firstName}
                            onSave={(val) => handleFieldUpdate(contact.id, 'firstName', val)}
                            placeholder="First name"
                          />
                          <EditableField
                            value={contact.lastName}
                            onSave={(val) => handleFieldUpdate(contact.id, 'lastName', val)}
                            placeholder="Last name"
                          />
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <EditableField
                          value={contact.email}
                          onSave={(val) => handleFieldUpdate(contact.id, 'email', val)}
                          placeholder="Email"
                          type="email"
                        />
                      </td>
                      <td className="py-4 px-6">
                        <EditableField
                          value={contact.businessName}
                          onSave={(val) => handleFieldUpdate(contact.id, 'businessName', val)}
                          placeholder="Business name"
                        />
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          {contact.email && (
                            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center" title="Email">
                              <Mail className="w-4 h-4 text-primary" />
                            </div>
                          )}
                          {contact.instagram && (
                            <div className="w-8 h-8 rounded-lg bg-pink-500/10 flex items-center justify-center" title="Instagram">
                              <MessageCircle className="w-4 h-4 text-pink-500" />
                            </div>
                          )}
                          {contact.phone && (
                            <div className="w-8 h-8 rounded-lg bg-success/10 flex items-center justify-center" title="Phone">
                              <Phone className="w-4 h-4 text-success" />
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className={cn(
                          "inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm",
                          statusConfig[contact.status].bg
                        )}>
                          <StatusIcon className={cn("w-4 h-4", statusConfig[contact.status].color)} />
                          <span className={statusConfig[contact.status].color}>
                            {contact.status.charAt(0).toUpperCase() + contact.status.slice(1)}
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
