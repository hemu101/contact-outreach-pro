import { useState, useCallback } from 'react';
import { Upload, FileText, X, CheckCircle, ArrowDownUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Contact } from '@/types/contact';
import { cn } from '@/lib/utils';
import { contactsToCsv, parseCsvTextToContacts } from '@/lib/contactCsv';

interface CSVUploaderProps {
  onUpload: (contacts: Contact[]) => void;
  contacts?: Contact[];
}

export function CSVUploader({ onUpload, contacts = [] }: CSVUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [preview, setPreview] = useState<Contact[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [detectedColumns, setDetectedColumns] = useState<string[]>([]);

  const handleFile = useCallback((file: File) => {
    setError(null);
    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const parsed = parseCsvTextToContacts(text);
        setDetectedColumns(parsed.detectedColumns);
        setPreview(parsed.contacts.slice(0, 5));
        onUpload(parsed.contacts);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to parse CSV');
        setPreview([]);
      }
    };
    reader.readAsText(file);
  }, [onUpload]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file && file.name.endsWith('.csv')) {
      handleFile(file);
    } else {
      setError('Please upload a CSV file');
    }
  }, [handleFile]);

  const handleExport = () => {
    const csv = contactsToCsv(contacts);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `leads_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-foreground">CSV import / export</p>
          <p className="text-xs text-muted-foreground">Auto-maps common headers and normalizes leads into the contact database.</p>
        </div>
        <Button variant="outline" size="sm" onClick={handleExport} disabled={contacts.length === 0}>
          <ArrowDownUp className="w-4 h-4 mr-2" />Export leads CSV
        </Button>
      </div>

      {/* Drop Zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={cn(
          "border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200",
          isDragging 
            ? "border-primary bg-primary/5" 
            : "border-border hover:border-primary/50",
          error && "border-destructive"
        )}
      >
        <input
          type="file"
          accept=".csv"
          onChange={handleFileInput}
          className="hidden"
          id="csv-upload"
        />
        
        <div className="flex flex-col items-center gap-4">
          {fileName ? (
            <>
              <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-success" />
              </div>
              <div>
                <p className="font-medium text-foreground">{fileName}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {preview.length > 0 ? `${preview.length}+ contacts found` : 'Processing...'}
                </p>
                {detectedColumns.length > 0 && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Mapped: {detectedColumns.join(', ')}
                  </p>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => { setFileName(null); setPreview([]); setError(null); setDetectedColumns([]); }}
              >
                <X className="w-4 h-4 mr-2" />
                Remove
              </Button>
            </>
          ) : (
            <>
              <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center">
                <Upload className="w-8 h-8 text-muted-foreground" />
              </div>
              <div>
                <p className="font-medium text-foreground">Drop your CSV file here</p>
                <p className="text-sm text-muted-foreground mt-1">or click to browse</p>
                <p className="text-xs text-muted-foreground mt-2">
                  Supports: First Name, Last Name, Business, Email, Phone, LinkedIn, City, State, Country, Job Title, Instagram, TikTok
                </p>
              </div>
              <label htmlFor="csv-upload">
                <Button variant="outline" asChild>
                  <span className="cursor-pointer">
                    <FileText className="w-4 h-4 mr-2" />
                    Select CSV
                  </span>
                </Button>
              </label>
            </>
          )}
        </div>

        {error && (
          <p className="text-sm text-destructive mt-4">{error}</p>
        )}
      </div>

      {/* Preview Table */}
      {preview.length > 0 && (
        <div className="glass-card rounded-xl p-4 animate-slide-up">
          <h4 className="font-medium text-foreground mb-3">Preview (first 5 contacts)</h4>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 px-3 text-muted-foreground font-medium">Name</th>
                  <th className="text-left py-2 px-3 text-muted-foreground font-medium">Business</th>
                  <th className="text-left py-2 px-3 text-muted-foreground font-medium">Email</th>
                  <th className="text-left py-2 px-3 text-muted-foreground font-medium">Location</th>
                  <th className="text-left py-2 px-3 text-muted-foreground font-medium">Social</th>
                </tr>
              </thead>
              <tbody>
                {preview.map((contact) => (
                  <tr key={contact.id} className="border-b border-border/50">
                    <td className="py-2 px-3 text-foreground">
                      {contact.firstName} {contact.lastName}
                      {contact.jobTitle && <span className="text-xs text-muted-foreground block">{contact.jobTitle}</span>}
                    </td>
                    <td className="py-2 px-3 text-foreground">{contact.businessName}</td>
                    <td className="py-2 px-3 text-muted-foreground">{contact.email}</td>
                    <td className="py-2 px-3 text-muted-foreground">
                      {[contact.city, contact.state, contact.country].filter(Boolean).join(', ') || contact.location || '-'}
                    </td>
                    <td className="py-2 px-3 text-muted-foreground">
                      {[
                        contact.instagram && 'IG',
                        contact.tiktok && 'TT',
                        contact.linkedin && 'LI'
                      ].filter(Boolean).join(', ') || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
