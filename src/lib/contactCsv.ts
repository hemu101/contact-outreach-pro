import type { Contact } from '@/types/contact';

const aliases: Record<string, string[]> = {
  firstName: ['first name', 'firstname', 'first', 'fname', 'given name', 'givenname'],
  lastName: ['last name', 'lastname', 'last', 'lname', 'surname', 'family name'],
  businessName: ['business', 'business name', 'company', 'company name', 'organization', 'org', 'brand'],
  email: ['email', 'e-mail', 'email address', 'work email', 'business email', 'mail'],
  phone: ['phone', 'phone number', 'telephone', 'mobile', 'mobile phone', 'cell', 'tel'],
  instagram: ['instagram', 'instagram handle', 'instagram username', 'ig', 'ig handle', 'insta'],
  tiktok: ['tiktok', 'tik tok', 'tiktok handle', 'tiktok username', 'tt'],
  linkedin: ['linkedin', 'linkedin profile', 'linkedin url', 'profile url'],
  location: ['location', 'address', 'full address'],
  jobTitle: ['job title', 'title', 'position', 'role', 'job'],
  city: ['city', 'town'],
  state: ['state', 'province', 'region'],
  country: ['country', 'nation'],
};

const exportColumns: Array<{ key: keyof Contact; label: string }> = [
  { key: 'firstName', label: 'First Name' },
  { key: 'lastName', label: 'Last Name' },
  { key: 'businessName', label: 'Business' },
  { key: 'email', label: 'Email' },
  { key: 'instagram', label: 'Instagram' },
  { key: 'tiktok', label: 'TikTok' },
  { key: 'phone', label: 'Phone' },
  { key: 'linkedin', label: 'LinkedIn' },
  { key: 'jobTitle', label: 'Job Title' },
  { key: 'location', label: 'Location' },
  { key: 'city', label: 'City' },
  { key: 'state', label: 'State' },
  { key: 'country', label: 'Country' },
];

function clean(value: unknown) {
  return String(value ?? '').replace(/[\u0000-\u001F]+/g, ' ').trim();
}

function normalizeHeader(header: string) {
  return clean(header).toLowerCase().replace(/[_-]+/g, ' ').replace(/\s+/g, ' ');
}

function normalizePhone(phone: string) {
  const raw = clean(phone);
  if (!raw) return undefined;
  const hasPlus = raw.startsWith('+');
  const digits = raw.replace(/[^\d]/g, '');
  if (!digits) return undefined;
  return `${hasPlus ? '+' : ''}${digits}`;
}

function normalizeSocial(value: string) {
  const raw = clean(value);
  if (!raw) return undefined;
  return raw
    .replace(/^https?:\/\/(www\.)?/i, '')
    .replace(/^instagram\.com\//i, '')
    .replace(/^tiktok\.com\//i, '')
    .replace(/^linkedin\.com\//i, 'linkedin.com/')
    .replace(/^@/, '')
    .replace(/\/$/, '');
}

function parseCsvRows(text: string) {
  const rows: string[][] = [];
  let field = '';
  let row: string[] = [];
  let inQuotes = false;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    const next = text[i + 1];

    if (char === '"') {
      if (inQuotes && next === '"') {
        field += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === ',' && !inQuotes) {
      row.push(field);
      field = '';
      continue;
    }

    if ((char === '\n' || char === '\r') && !inQuotes) {
      if (char === '\r' && next === '\n') i += 1;
      row.push(field);
      if (row.some((cell) => clean(cell))) rows.push(row);
      row = [];
      field = '';
      continue;
    }

    field += char;
  }

  if (field.length > 0 || row.length > 0) {
    row.push(field);
    if (row.some((cell) => clean(cell))) rows.push(row);
  }

  return rows;
}

function detectMapping(headers: string[]) {
  const normalizedHeaders = headers.map(normalizeHeader);
  const mapping = new Map<string, number>();

  Object.entries(aliases).forEach(([field, fieldAliases]) => {
    const index = normalizedHeaders.findIndex((header) =>
      fieldAliases.some((alias) => header === alias || header.includes(alias) || alias.includes(header))
    );
    if (index >= 0) mapping.set(field, index);
  });

  return mapping;
}

function toContact(getValue: (field: string) => string): Contact | null {
  const firstName = clean(getValue('firstName'));
  const lastName = clean(getValue('lastName'));
  const businessName = clean(getValue('businessName'));
  const email = clean(getValue('email')).toLowerCase();
  const instagram = normalizeSocial(getValue('instagram'));
  const tiktok = normalizeSocial(getValue('tiktok'));
  const phone = normalizePhone(getValue('phone'));
  const linkedin = clean(getValue('linkedin')) || undefined;
  const location = clean(getValue('location')) || undefined;
  const jobTitle = clean(getValue('jobTitle')) || undefined;
  const city = clean(getValue('city')) || undefined;
  const state = clean(getValue('state')) || undefined;
  const country = clean(getValue('country')) || undefined;

  if (!email && !instagram && !tiktok && !phone) return null;

  return {
    id: crypto.randomUUID(),
    firstName,
    lastName,
    businessName,
    email,
    instagram,
    tiktok,
    phone,
    linkedin,
    location,
    jobTitle,
    city,
    state,
    country,
    status: 'pending',
    createdAt: new Date(),
  };
}

export function parseCsvTextToContacts(text: string) {
  const rows = parseCsvRows(text);
  if (rows.length < 2) throw new Error('CSV must include a header row and at least one lead.');

  const headers = rows[0].map(clean);
  const mapping = detectMapping(headers);
  const detectedColumns = Array.from(mapping.keys());

  const contacts = rows.slice(1).map((row) => {
    const getValue = (field: string) => {
      const index = mapping.get(field);
      return index === undefined ? '' : row[index] ?? '';
    };
    return toContact(getValue);
  }).filter((contact): contact is Contact => Boolean(contact));

  return { contacts, detectedColumns, headers };
}

export function parseAirtableRecordsToContacts(records: Array<{ fields: Record<string, unknown> }>) {
  return records
    .map((record) => {
      const normalized = new Map<string, string>();
      Object.entries(record.fields || {}).forEach(([key, value]) => {
        normalized.set(normalizeHeader(key), Array.isArray(value) ? value.join(', ') : clean(value));
      });
      return toContact((field) => {
        const match = aliases[field]?.find((alias) => normalized.has(alias));
        return match ? normalized.get(match) || '' : '';
      });
    })
    .filter((contact): contact is Contact => Boolean(contact));
}

function escapeCsv(value: unknown) {
  return `"${String(value ?? '').replace(/"/g, '""')}"`;
}

export function contactsToCsv(contacts: Contact[]) {
  const headerRow = exportColumns.map((column) => column.label).join(',');
  const rows = contacts.map((contact) => exportColumns.map((column) => escapeCsv(contact[column] ?? '')).join(','));
  return [headerRow, ...rows].join('\n');
}