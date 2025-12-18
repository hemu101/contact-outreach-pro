import { useState } from 'react';
import { Search, Mail, MessageCircle, Phone, MoreVertical, CheckCircle, XCircle, Clock } from 'lucide-react';
import { Contact } from '@/types/contact';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface ContactsTableProps {
  contacts: Contact[];
}

const statusConfig = {
  pending: { icon: Clock, color: 'text-warning', bg: 'bg-warning/10' },
  sent: { icon: CheckCircle, color: 'text-success', bg: 'bg-success/10' },
  failed: { icon: XCircle, color: 'text-destructive', bg: 'bg-destructive/10' },
};

export function ContactsTable({ contacts }: ContactsTableProps) {
  const [search, setSearch] = useState('');

  const filtered = contacts.filter(c => 
    `${c.firstName} ${c.lastName} ${c.businessName} ${c.email}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input
          placeholder="Search contacts..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Table */}
      <div className="glass-card rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-secondary/30">
                <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">Contact</th>
                <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">Business</th>
                <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">Channels</th>
                <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">Status</th>
                <th className="text-right py-4 px-6 text-sm font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-muted-foreground">
                    {contacts.length === 0 ? 'No contacts yet. Upload a CSV to get started.' : 'No contacts match your search.'}
                  </td>
                </tr>
              ) : (
                filtered.map((contact, idx) => {
                  const StatusIcon = statusConfig[contact.status].icon;
                  return (
                    <tr 
                      key={contact.id} 
                      className="border-b border-border/50 hover:bg-secondary/20 transition-colors animate-fade-in"
                      style={{ animationDelay: `${idx * 50}ms` }}
                    >
                      <td className="py-4 px-6">
                        <div>
                          <p className="font-medium text-foreground">
                            {contact.firstName} {contact.lastName}
                          </p>
                          <p className="text-sm text-muted-foreground">{contact.email}</p>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-foreground">
                        {contact.businessName || '-'}
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
                      <td className="py-4 px-6 text-right">
                        <button className="p-2 hover:bg-secondary rounded-lg transition-colors">
                          <MoreVertical className="w-5 h-5 text-muted-foreground" />
                        </button>
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
