import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const INDUSTRIES = ['Technology', 'Finance', 'Healthcare', 'Retail', 'Food & Beverage', 'Manufacturing', 'Education', 'Real Estate', 'Marketing', 'Consulting', 'E-commerce', 'SaaS', 'Agency', 'Other'];
const SIZES = ['1-10', '11-50', '51-200', '201-500', '501-1000', '1001-5000', '5000+'];

interface Props {
  open: boolean;
  onClose: () => void;
  form: Record<string, string>;
  setForm: (f: Record<string, string>) => void;
  onSave: () => void;
  isEdit: boolean;
}

export function CompanyFormDialog({ open, onClose, form, setForm, onSave, isEdit }: Props) {
  const set = (key: string, val: string) => setForm({ ...form, [key]: val });

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="max-w-2xl max-h-[85vh]">
        <DialogHeader><DialogTitle>{isEdit ? 'Edit Company' : 'Add Company'}</DialogTitle></DialogHeader>
        <Tabs defaultValue="basic">
          <TabsList className="grid grid-cols-4 w-full">
            <TabsTrigger value="basic">Basic</TabsTrigger>
            <TabsTrigger value="contact">Contact</TabsTrigger>
            <TabsTrigger value="social">Social & Web</TabsTrigger>
            <TabsTrigger value="advanced">Advanced</TabsTrigger>
          </TabsList>

          <ScrollArea className="max-h-[55vh] mt-4 pr-4">
            <TabsContent value="basic" className="grid grid-cols-2 gap-3 mt-0">
              <div className="col-span-2"><Label className="text-xs">Company Name *</Label><Input value={form.name || ''} onChange={e => set('name', e.target.value)} placeholder="Acme Corp" /></div>
              <div><Label className="text-xs">Display Name for Emails</Label><Input value={form.company_name_for_emails || ''} onChange={e => set('company_name_for_emails', e.target.value)} /></div>
              <div>
                <Label className="text-xs">Industry</Label>
                <Select value={form.industry || ''} onValueChange={v => set('industry', v)}>
                  <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                  <SelectContent>{INDUSTRIES.map(i => <SelectItem key={i} value={i}>{i}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Company Size</Label>
                <Select value={form.size || ''} onValueChange={v => set('size', v)}>
                  <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                  <SelectContent>{SIZES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label className="text-xs">Annual Revenue</Label><Input value={form.annual_revenue || ''} onChange={e => set('annual_revenue', e.target.value)} /></div>
              <div><Label className="text-xs">Headquarters</Label><Input value={form.headquarters || ''} onChange={e => set('headquarters', e.target.value)} /></div>
              <div><Label className="text-xs">Founded</Label><Input value={form.founded || ''} onChange={e => set('founded', e.target.value)} /></div>
              <div className="col-span-2"><Label className="text-xs">Short Description</Label><Textarea value={form.short_description || ''} onChange={e => set('short_description', e.target.value)} rows={2} /></div>
              <div className="col-span-2"><Label className="text-xs">Description</Label><Textarea value={form.description || ''} onChange={e => set('description', e.target.value)} rows={3} /></div>
            </TabsContent>

            <TabsContent value="contact" className="grid grid-cols-2 gap-3 mt-0">
              <div><Label className="text-xs">Email</Label><Input value={form.email || ''} onChange={e => set('email', e.target.value)} /></div>
              <div><Label className="text-xs">Phone</Label><Input value={form.phone || ''} onChange={e => set('phone', e.target.value)} /></div>
              <div><Label className="text-xs">Company Phone</Label><Input value={form.company_phone || ''} onChange={e => set('company_phone', e.target.value)} /></div>
              <div><Label className="text-xs">Phone from Website</Label><Input value={form.phone_from_website || ''} onChange={e => set('phone_from_website', e.target.value)} /></div>
              <div><Label className="text-xs">Company Address</Label><Input value={form.company_address || ''} onChange={e => set('company_address', e.target.value)} /></div>
              <div><Label className="text-xs">Company City</Label><Input value={form.company_city || ''} onChange={e => set('company_city', e.target.value)} /></div>
              <div><Label className="text-xs">Company State</Label><Input value={form.company_state || ''} onChange={e => set('company_state', e.target.value)} /></div>
              <div><Label className="text-xs">Company Country</Label><Input value={form.company_country || ''} onChange={e => set('company_country', e.target.value)} /></div>
            </TabsContent>

            <TabsContent value="social" className="grid grid-cols-2 gap-3 mt-0">
              <div><Label className="text-xs">Website</Label><Input value={form.website || ''} onChange={e => set('website', e.target.value)} /></div>
              <div><Label className="text-xs">Website Status</Label><Input value={form.website_status || ''} onChange={e => set('website_status', e.target.value)} /></div>
              <div><Label className="text-xs">LinkedIn URL</Label><Input value={form.linkedin_url || ''} onChange={e => set('linkedin_url', e.target.value)} /></div>
              <div><Label className="text-xs">Company LinkedIn</Label><Input value={form.company_linkedin_url || ''} onChange={e => set('company_linkedin_url', e.target.value)} /></div>
              <div><Label className="text-xs">Instagram URL</Label><Input value={form.instagram_url || ''} onChange={e => set('instagram_url', e.target.value)} /></div>
              <div><Label className="text-xs">IG Username</Label><Input value={form.ig_username || ''} onChange={e => set('ig_username', e.target.value)} /></div>
              <div><Label className="text-xs">Facebook URL</Label><Input value={form.facebook_url || ''} onChange={e => set('facebook_url', e.target.value)} /></div>
              <div><Label className="text-xs">Twitter URL</Label><Input value={form.twitter_url || ''} onChange={e => set('twitter_url', e.target.value)} /></div>
              <div><Label className="text-xs">Pinterest URL</Label><Input value={form.pinterest_url || ''} onChange={e => set('pinterest_url', e.target.value)} /></div>
              <div><Label className="text-xs">IG Followers</Label><Input value={form.ig_followers_count || ''} onChange={e => set('ig_followers_count', e.target.value)} /></div>
              <div><Label className="text-xs">IG Bio</Label><Input value={form.ig_bio || ''} onChange={e => set('ig_bio', e.target.value)} /></div>
              <div><Label className="text-xs">Average ER</Label><Input value={form.average_er || ''} onChange={e => set('average_er', e.target.value)} /></div>
            </TabsContent>

            <TabsContent value="advanced" className="grid grid-cols-2 gap-3 mt-0">
              <div><Label className="text-xs">Technologies</Label><Input value={form.technologies || ''} onChange={e => set('technologies', e.target.value)} /></div>
              <div><Label className="text-xs">Keywords</Label><Input value={form.keywords || ''} onChange={e => set('keywords', e.target.value)} /></div>
              <div><Label className="text-xs">Total Funding</Label><Input value={form.total_funding || ''} onChange={e => set('total_funding', e.target.value)} /></div>
              <div><Label className="text-xs">Latest Funding</Label><Input value={form.latest_funding || ''} onChange={e => set('latest_funding', e.target.value)} /></div>
              <div><Label className="text-xs">Latest Funding Amount</Label><Input value={form.latest_funding_amount || ''} onChange={e => set('latest_funding_amount', e.target.value)} /></div>
              <div><Label className="text-xs">Subsidiary Of</Label><Input value={form.subsidiary_of || ''} onChange={e => set('subsidiary_of', e.target.value)} /></div>
              <div><Label className="text-xs">D2C Presence</Label><Input value={form.d2c_presence || ''} onChange={e => set('d2c_presence', e.target.value)} /></div>
              <div><Label className="text-xs">E-commerce Presence</Label><Input value={form.e_commerce_presence || ''} onChange={e => set('e_commerce_presence', e.target.value)} /></div>
              <div><Label className="text-xs">Firmographic Score</Label><Input value={form.firmographic_score || ''} onChange={e => set('firmographic_score', e.target.value)} /></div>
              <div><Label className="text-xs">Engagement Score</Label><Input value={form.engagement_score || ''} onChange={e => set('engagement_score', e.target.value)} /></div>
              <div><Label className="text-xs">Segmentation</Label><Input value={form.segmentation || ''} onChange={e => set('segmentation', e.target.value)} /></div>
              <div><Label className="text-xs">Ad Library Proof</Label><Input value={form.ad_library_proof || ''} onChange={e => set('ad_library_proof', e.target.value)} /></div>
              <div><Label className="text-xs">Retail Locations</Label><Input value={form.number_of_retail_locations || ''} onChange={e => set('number_of_retail_locations', e.target.value)} /></div>
              <div><Label className="text-xs">Extracted From</Label><Input value={form.extracted_from || ''} onChange={e => set('extracted_from', e.target.value)} /></div>
            </TabsContent>
          </ScrollArea>
        </Tabs>

        <Button onClick={onSave} disabled={!form.name?.trim()} className="w-full mt-2">
          {isEdit ? 'Update Company' : 'Add Company'}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
