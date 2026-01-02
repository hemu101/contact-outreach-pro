import { useState, useMemo } from 'react';
import { Filter, X, MapPin, Briefcase, Building2, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';

interface Contact {
  id: string;
  first_name?: string | null;
  last_name?: string | null;
  email?: string | null;
  business_name?: string | null;
  job_title?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  location?: string | null;
  instagram?: string | null;
  tiktok?: string | null;
  phone?: string | null;
}

interface ContactFilterProps {
  contacts: Contact[];
  onFilteredContactsChange: (filteredIds: string[]) => void;
  selectedIds: string[];
}

interface FilterState {
  search: string;
  cities: string[];
  states: string[];
  countries: string[];
  jobTitles: string[];
  hasEmail: boolean | null;
  hasPhone: boolean | null;
  hasInstagram: boolean | null;
  hasTiktok: boolean | null;
}

export function ContactFilter({ contacts, onFilteredContactsChange, selectedIds }: ContactFilterProps) {
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    cities: [],
    states: [],
    countries: [],
    jobTitles: [],
    hasEmail: null,
    hasPhone: null,
    hasInstagram: null,
    hasTiktok: null,
  });

  const uniqueValues = useMemo(() => {
    const cities = new Set<string>();
    const states = new Set<string>();
    const countries = new Set<string>();
    const jobTitles = new Set<string>();

    contacts.forEach(c => {
      if (c.city) cities.add(c.city);
      if (c.state) states.add(c.state);
      if (c.country) countries.add(c.country);
      if (c.job_title) jobTitles.add(c.job_title);
    });

    return {
      cities: Array.from(cities).sort(),
      states: Array.from(states).sort(),
      countries: Array.from(countries).sort(),
      jobTitles: Array.from(jobTitles).sort(),
    };
  }, [contacts]);

  const filteredContacts = useMemo(() => {
    return contacts.filter(contact => {
      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const fullName = `${contact.first_name || ''} ${contact.last_name || ''}`.toLowerCase();
        const email = (contact.email || '').toLowerCase();
        const business = (contact.business_name || '').toLowerCase();
        if (!fullName.includes(searchLower) && !email.includes(searchLower) && !business.includes(searchLower)) {
          return false;
        }
      }

      // Location filters
      if (filters.cities.length > 0 && (!contact.city || !filters.cities.includes(contact.city))) {
        return false;
      }
      if (filters.states.length > 0 && (!contact.state || !filters.states.includes(contact.state))) {
        return false;
      }
      if (filters.countries.length > 0 && (!contact.country || !filters.countries.includes(contact.country))) {
        return false;
      }

      // Job title filter
      if (filters.jobTitles.length > 0 && (!contact.job_title || !filters.jobTitles.includes(contact.job_title))) {
        return false;
      }

      // Channel availability filters
      if (filters.hasEmail === true && !contact.email) return false;
      if (filters.hasEmail === false && contact.email) return false;
      if (filters.hasPhone === true && !contact.phone) return false;
      if (filters.hasPhone === false && contact.phone) return false;
      if (filters.hasInstagram === true && !contact.instagram) return false;
      if (filters.hasInstagram === false && contact.instagram) return false;
      if (filters.hasTiktok === true && !contact.tiktok) return false;
      if (filters.hasTiktok === false && contact.tiktok) return false;

      return true;
    });
  }, [contacts, filters]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.search) count++;
    if (filters.cities.length > 0) count++;
    if (filters.states.length > 0) count++;
    if (filters.countries.length > 0) count++;
    if (filters.jobTitles.length > 0) count++;
    if (filters.hasEmail !== null) count++;
    if (filters.hasPhone !== null) count++;
    if (filters.hasInstagram !== null) count++;
    if (filters.hasTiktok !== null) count++;
    return count;
  }, [filters]);

  const handleSelectFiltered = () => {
    onFilteredContactsChange(filteredContacts.map(c => c.id));
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      cities: [],
      states: [],
      countries: [],
      jobTitles: [],
      hasEmail: null,
      hasPhone: null,
      hasInstagram: null,
      hasTiktok: null,
    });
  };

  const toggleArrayFilter = (key: 'cities' | 'states' | 'countries' | 'jobTitles', value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: prev[key].includes(value)
        ? prev[key].filter(v => v !== value)
        : [...prev[key], value],
    }));
  };

  const FilterSection = ({ 
    title, 
    icon: Icon, 
    items, 
    selected, 
    filterKey 
  }: { 
    title: string; 
    icon: React.ElementType; 
    items: string[]; 
    selected: string[]; 
    filterKey: 'cities' | 'states' | 'countries' | 'jobTitles';
  }) => (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-sm font-medium text-foreground">
        <Icon className="w-4 h-4" />
        {title}
      </div>
      {items.length > 0 ? (
        <ScrollArea className="h-32">
          <div className="space-y-1">
            {items.map(item => (
              <label
                key={item}
                className="flex items-center gap-2 px-2 py-1 rounded hover:bg-secondary cursor-pointer"
              >
                <Checkbox
                  checked={selected.includes(item)}
                  onCheckedChange={() => toggleArrayFilter(filterKey, item)}
                />
                <span className="text-sm truncate">{item}</span>
              </label>
            ))}
          </div>
        </ScrollArea>
      ) : (
        <p className="text-xs text-muted-foreground">No data available</p>
      )}
    </div>
  );

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Input
          placeholder="Search contacts..."
          value={filters.search}
          onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
          className="flex-1"
        />
        
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="icon" className="relative">
              <Filter className="w-4 h-4" />
              {activeFilterCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80" align="end">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Filter Contacts</h4>
                {activeFilterCount > 0 && (
                  <Button variant="ghost" size="sm" onClick={clearFilters}>
                    <X className="w-3 h-3 mr-1" />
                    Clear all
                  </Button>
                )}
              </div>

              <FilterSection
                title="City"
                icon={MapPin}
                items={uniqueValues.cities}
                selected={filters.cities}
                filterKey="cities"
              />

              <FilterSection
                title="State"
                icon={MapPin}
                items={uniqueValues.states}
                selected={filters.states}
                filterKey="states"
              />

              <FilterSection
                title="Country"
                icon={Globe}
                items={uniqueValues.countries}
                selected={filters.countries}
                filterKey="countries"
              />

              <FilterSection
                title="Job Title"
                icon={Briefcase}
                items={uniqueValues.jobTitles}
                selected={filters.jobTitles}
                filterKey="jobTitles"
              />

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <Building2 className="w-4 h-4" />
                  Channels
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {['hasEmail', 'hasPhone', 'hasInstagram', 'hasTiktok'].map(key => (
                    <label
                      key={key}
                      className="flex items-center gap-2 px-2 py-1 rounded hover:bg-secondary cursor-pointer"
                    >
                      <Checkbox
                        checked={filters[key as keyof FilterState] === true}
                        onCheckedChange={(checked) => 
                          setFilters(prev => ({ 
                            ...prev, 
                            [key]: checked ? true : null 
                          }))
                        }
                      />
                      <span className="text-sm capitalize">
                        {key.replace('has', 'Has ')}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Active filters display */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap gap-2">
          {filters.cities.map(city => (
            <Badge key={city} variant="secondary" className="gap-1">
              {city}
              <X 
                className="w-3 h-3 cursor-pointer" 
                onClick={() => toggleArrayFilter('cities', city)}
              />
            </Badge>
          ))}
          {filters.states.map(state => (
            <Badge key={state} variant="secondary" className="gap-1">
              {state}
              <X 
                className="w-3 h-3 cursor-pointer" 
                onClick={() => toggleArrayFilter('states', state)}
              />
            </Badge>
          ))}
          {filters.countries.map(country => (
            <Badge key={country} variant="secondary" className="gap-1">
              {country}
              <X 
                className="w-3 h-3 cursor-pointer" 
                onClick={() => toggleArrayFilter('countries', country)}
              />
            </Badge>
          ))}
          {filters.jobTitles.map(title => (
            <Badge key={title} variant="secondary" className="gap-1">
              {title}
              <X 
                className="w-3 h-3 cursor-pointer" 
                onClick={() => toggleArrayFilter('jobTitles', title)}
              />
            </Badge>
          ))}
        </div>
      )}

      {/* Results summary */}
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">
          {filteredContacts.length} of {contacts.length} contacts match
        </span>
        <Button variant="outline" size="sm" onClick={handleSelectFiltered}>
          Select {filteredContacts.length} contacts
        </Button>
      </div>
    </div>
  );
}