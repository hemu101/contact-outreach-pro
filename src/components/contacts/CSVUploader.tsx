import { useState, useCallback } from 'react';
import { Upload, FileText, X, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Contact } from '@/types/contact';
import { cn } from '@/lib/utils';

interface CSVUploaderProps {
  onUpload: (contacts: Contact[]) => void;
}

// Column mapping with multiple aliases for auto-detection
const columnMappings: Record<keyof Omit<Contact, 'id' | 'status' | 'createdAt' | 'emailSent' | 'dmSent' | 'voicemailSent'>, string[]> = {
  firstName: ['first name', 'firstname', 'first', 'fname', 'given name', 'givenname'],
  lastName: ['last name', 'lastname', 'last', 'lname', 'surname', 'family name'],
  businessName: ['business', 'company', 'business name', 'businessname', 'company name', 'organization', 'org'],
  email: ['email', 'e-mail', 'email address', 'emailaddress', 'mail'],
  phone: ['phone', 'telephone', 'mobile', 'cell', 'phone number', 'phonenumber', 'tel'],
  instagram: ['instagram', 'insta', 'ig', 'instagram handle', 'ig handle'],
  tiktok: ['tiktok', 'tik tok', 'tt', 'tiktok handle'],
  linkedin: ['linkedin', 'linked in', 'linkedin url', 'linkedin profile'],
  location: ['location', 'address', 'full address'],
  jobTitle: ['job title', 'jobtitle', 'title', 'position', 'role', 'job'],
  city: ['city', 'town'],
  state: ['state', 'province', 'region'],
  country: ['country', 'nation'],
};

export function CSVUploader({ onUpload }: CSVUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [preview, setPreview] = useState<Contact[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [detectedColumns, setDetectedColumns] = useState<string[]>([]);

  const parseCSV = (text: string): Contact[] => {
    const lines = text.trim().split('\n');
    if (lines.length < 2) throw new Error('CSV must have headers and at least one row');

    const headers = lines[0].toLowerCase().split(',').map(h => h.trim().replace(/["']/g, ''));
    const detected: string[] = [];
    
    // Find matching column indices
    const getColumnIndex = (field: keyof typeof columnMappings): number => {
      const aliases = columnMappings[field];
      for (const alias of aliases) {
        const idx = headers.findIndex(h => h === alias || h.includes(alias));
        if (idx !== -1) {
          if (!detected.includes(field)) detected.push(field);
          return idx;
        }
      }
      return -1;
    };

    const fieldIndices: Record<string, number> = {};
    for (const field of Object.keys(columnMappings)) {
      fieldIndices[field] = getColumnIndex(field as keyof typeof columnMappings);
    }

    setDetectedColumns(detected);
    
    const contacts: Contact[] = [];
    
    for (let i = 1; i < lines.length; i++) {
      // Handle CSV with quoted values
      const values = parseCSVLine(lines[i]);
      
      const getValue = (field: string): string => {
        const idx = fieldIndices[field];
        return idx !== -1 && values[idx] ? values[idx].trim() : '';
      };

      const contact: Contact = {
        id: crypto.randomUUID(),
        firstName: getValue('firstName'),
        lastName: getValue('lastName'),
        businessName: getValue('businessName'),
        email: getValue('email'),
        instagram: getValue('instagram') || undefined,
        tiktok: getValue('tiktok') || undefined,
        phone: getValue('phone') || undefined,
        linkedin: getValue('linkedin') || undefined,
        location: getValue('location') || undefined,
        jobTitle: getValue('jobTitle') || undefined,
        city: getValue('city') || undefined,
        state: getValue('state') || undefined,
        country: getValue('country') || undefined,
        status: 'pending',
        createdAt: new Date(),
      };

      // Only include contacts with at least one contact method
      if (contact.email || contact.instagram || contact.tiktok || contact.phone) {
        contacts.push(contact);
      }
    }

    return contacts;
  };

  // Parse a single CSV line handling quoted values
  const parseCSVLine = (line: string): string[] => {
    const values: string[] = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"' || char === "'") {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        values.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    values.push(current.trim());
    
    return values;
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
                {detectedColumns.length > 0 && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Detected: {detectedColumns.join(', ')}
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
