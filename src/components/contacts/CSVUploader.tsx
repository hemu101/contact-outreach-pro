import { useState, useCallback } from 'react';
import { Upload, FileText, X, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Contact } from '@/types/contact';
import { cn } from '@/lib/utils';

interface CSVUploaderProps {
  onUpload: (contacts: Contact[]) => void;
}

export function CSVUploader({ onUpload }: CSVUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [preview, setPreview] = useState<Contact[]>([]);
  const [error, setError] = useState<string | null>(null);

  const parseCSV = (text: string): Contact[] => {
    const lines = text.trim().split('\n');
    if (lines.length < 2) throw new Error('CSV must have headers and at least one row');

    const headers = lines[0].toLowerCase().split(',').map(h => h.trim());
    
    const contacts: Contact[] = [];
    
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      
      const getVal = (keys: string[]) => {
        for (const key of keys) {
          const idx = headers.findIndex(h => h.includes(key));
          if (idx !== -1 && values[idx]) return values[idx];
        }
        return '';
      };

      contacts.push({
        id: crypto.randomUUID(),
        firstName: getVal(['first name', 'firstname', 'first']),
        lastName: getVal(['last name', 'lastname', 'last']),
        businessName: getVal(['business', 'company', 'business name']),
        email: getVal(['email', 'e-mail']),
        instagram: getVal(['instagram', 'insta', 'ig']) || undefined,
        tiktok: getVal(['tiktok', 'tik tok', 'tt']) || undefined,
        phone: getVal(['phone', 'telephone', 'mobile', 'cell']) || undefined,
        status: 'pending',
        createdAt: new Date(),
      });
    }

    return contacts.filter(c => c.email || c.instagram || c.tiktok || c.phone);
  };

  const handleFile = useCallback((file: File) => {
    setError(null);
    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const contacts = parseCSV(text);
        setPreview(contacts.slice(0, 5));
        onUpload(contacts);
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

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  return (
    <div className="space-y-4">
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
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => { setFileName(null); setPreview([]); setError(null); }}
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
                  <th className="text-left py-2 px-3 text-muted-foreground font-medium">Social</th>
                </tr>
              </thead>
              <tbody>
                {preview.map((contact) => (
                  <tr key={contact.id} className="border-b border-border/50">
                    <td className="py-2 px-3 text-foreground">
                      {contact.firstName} {contact.lastName}
                    </td>
                    <td className="py-2 px-3 text-foreground">{contact.businessName}</td>
                    <td className="py-2 px-3 text-muted-foreground">{contact.email}</td>
                    <td className="py-2 px-3 text-muted-foreground">
                      {[contact.instagram && 'IG', contact.tiktok && 'TT'].filter(Boolean).join(', ') || '-'}
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
