import { useState } from 'react';
import { Sheet, Table, Link2, Loader2, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Contact } from '@/types/contact';
import { parseAirtableRecordsToContacts, parseCsvTextToContacts } from '@/lib/contactCsv';

interface ExternalImporterProps {
  onImport: (contacts: Contact[]) => void;
}

export function ExternalImporter({ onImport }: ExternalImporterProps) {
  const [sheetsUrl, setSheetsUrl] = useState('');
  const [airtableUrl, setAirtableUrl] = useState('');
  const [airtableKey, setAirtableKey] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [importedCount, setImportedCount] = useState<number | null>(null);
  const { toast } = useToast();

  const extractGoogleSheetId = (url: string): string | null => {
    const match = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
    return match ? match[1] : null;
  };

  const extractAirtableInfo = (url: string): { baseId: string; tableId: string } | null => {
    // Format: https://airtable.com/app.../tbl.../...
    const match = url.match(/airtable\.com\/(app[a-zA-Z0-9]+)\/?(tbl[a-zA-Z0-9]+)?/);
    if (match) {
      return { baseId: match[1], tableId: match[2] || '' };
    }
    return null;
  };

  const handleGoogleSheetsImport = async () => {
    const sheetId = extractGoogleSheetId(sheetsUrl);
    if (!sheetId) {
      toast({
        title: 'Invalid URL',
        description: 'Please enter a valid Google Sheets URL',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      // Use Google Sheets API public export (CSV format)
      const exportUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv`;
      
      const response = await fetch(exportUrl);
      if (!response.ok) {
        throw new Error('Failed to fetch spreadsheet. Make sure the sheet is publicly accessible (Anyone with link can view).');
      }
      
      const csvText = await response.text();
      const contacts = parseCSVToContacts(csvText);
      
      if (contacts.length === 0) {
        throw new Error('No valid contacts found in the spreadsheet');
      }

      onImport(contacts);
      setImportedCount(contacts.length);
      toast({
        title: 'Import successful',
        description: `Imported ${contacts.length} contacts from Google Sheets`,
      });
    } catch (error) {
      toast({
        title: 'Import failed',
        description: error instanceof Error ? error.message : 'Failed to import from Google Sheets',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAirtableImport = async () => {
    const info = extractAirtableInfo(airtableUrl);
    if (!info || !airtableKey) {
      toast({
        title: 'Missing information',
        description: 'Please enter a valid Airtable URL and API key',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      // Airtable API requires personal access token
      const response = await fetch(
        `https://api.airtable.com/v0/${info.baseId}/${info.tableId || 'Contacts'}`,
        {
          headers: {
            Authorization: `Bearer ${airtableKey}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch from Airtable. Check your API key and table permissions.');
      }

      const data = await response.json();
      const contacts = parseAirtableToContacts(data.records);

      if (contacts.length === 0) {
        throw new Error('No valid contacts found in Airtable');
      }

      onImport(contacts);
      setImportedCount(contacts.length);
      toast({
        title: 'Import successful',
        description: `Imported ${contacts.length} contacts from Airtable`,
      });
    } catch (error) {
      toast({
        title: 'Import failed',
        description: error instanceof Error ? error.message : 'Failed to import from Airtable',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const parseCSVToContacts = (csv: string): Contact[] => parseCsvTextToContacts(csv).contacts;
  const parseAirtableToContacts = (records: any[]): Contact[] => parseAirtableRecordsToContacts(records);

  return (
    <div className="glass-card rounded-xl p-6">
      <div className="flex items-center gap-2 mb-4">
        <Link2 className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold text-foreground">Import from External Sources</h3>
      </div>

      <Tabs defaultValue="sheets" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="sheets" className="flex items-center gap-2">
            <Sheet className="w-4 h-4" />
            Google Sheets
          </TabsTrigger>
          <TabsTrigger value="airtable" className="flex items-center gap-2">
            <Table className="w-4 h-4" />
            Airtable
          </TabsTrigger>
        </TabsList>

        <TabsContent value="sheets" className="mt-4 space-y-4">
          <div>
            <label className="text-sm text-muted-foreground mb-2 block">
              Google Sheets URL
            </label>
            <Input
              placeholder="https://docs.google.com/spreadsheets/d/..."
              value={sheetsUrl}
              onChange={(e) => setSheetsUrl(e.target.value)}
            />
            <p className="text-xs text-muted-foreground mt-2">
              Make sure your sheet is set to "Anyone with the link can view"
            </p>
          </div>
          <Button 
            onClick={handleGoogleSheetsImport} 
            disabled={!sheetsUrl || isLoading}
            className="w-full"
          >
            {isLoading ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Importing...</>
            ) : importedCount !== null ? (
              <><Check className="w-4 h-4 mr-2" /> Imported {importedCount} contacts</>
            ) : (
              'Import from Google Sheets'
            )}
          </Button>
        </TabsContent>

        <TabsContent value="airtable" className="mt-4 space-y-4">
          <div>
            <label className="text-sm text-muted-foreground mb-2 block">
              Airtable URL
            </label>
            <Input
              placeholder="https://airtable.com/app.../tbl..."
              value={airtableUrl}
              onChange={(e) => setAirtableUrl(e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm text-muted-foreground mb-2 block">
              Airtable Personal Access Token
            </label>
            <Input
              type="password"
              placeholder="pat..."
              value={airtableKey}
              onChange={(e) => setAirtableKey(e.target.value)}
            />
            <p className="text-xs text-muted-foreground mt-2">
              Get your token from{' '}
              <a 
                href="https://airtable.com/create/tokens" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                airtable.com/create/tokens
              </a>
            </p>
          </div>
          <Button 
            onClick={handleAirtableImport} 
            disabled={!airtableUrl || !airtableKey || isLoading}
            className="w-full"
          >
            {isLoading ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Importing...</>
            ) : (
              'Import from Airtable'
            )}
          </Button>
        </TabsContent>
      </Tabs>
    </div>
  );
}
