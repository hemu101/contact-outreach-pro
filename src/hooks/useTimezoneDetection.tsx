import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface CountryTimezone {
  country_code: string;
  country_name: string;
  timezone: string;
  utc_offset: number;
}

// Common city to timezone mappings
const CITY_TIMEZONE_MAP: Record<string, string> = {
  'new york': 'America/New_York',
  'los angeles': 'America/Los_Angeles',
  'chicago': 'America/Chicago',
  'houston': 'America/Chicago',
  'phoenix': 'America/Phoenix',
  'san francisco': 'America/Los_Angeles',
  'seattle': 'America/Los_Angeles',
  'denver': 'America/Denver',
  'miami': 'America/New_York',
  'boston': 'America/New_York',
  'london': 'Europe/London',
  'paris': 'Europe/Paris',
  'berlin': 'Europe/Berlin',
  'tokyo': 'Asia/Tokyo',
  'sydney': 'Australia/Sydney',
  'melbourne': 'Australia/Melbourne',
  'toronto': 'America/Toronto',
  'vancouver': 'America/Vancouver',
  'dubai': 'Asia/Dubai',
  'singapore': 'Asia/Singapore',
  'hong kong': 'Asia/Hong_Kong',
  'mumbai': 'Asia/Kolkata',
  'delhi': 'Asia/Kolkata',
  'bangalore': 'Asia/Kolkata',
  'amsterdam': 'Europe/Amsterdam',
  'madrid': 'Europe/Madrid',
  'rome': 'Europe/Rome',
  'zurich': 'Europe/Zurich',
  'stockholm': 'Europe/Stockholm',
  'moscow': 'Europe/Moscow',
  'seoul': 'Asia/Seoul',
  'beijing': 'Asia/Shanghai',
  'shanghai': 'Asia/Shanghai',
  'sao paulo': 'America/Sao_Paulo',
  'mexico city': 'America/Mexico_City',
  'buenos aires': 'America/Argentina/Buenos_Aires',
  'cape town': 'Africa/Johannesburg',
  'johannesburg': 'Africa/Johannesburg',
  'auckland': 'Pacific/Auckland',
  'bangkok': 'Asia/Bangkok',
  'jakarta': 'Asia/Jakarta',
  'manila': 'Asia/Manila',
  'kuala lumpur': 'Asia/Kuala_Lumpur',
};

// US State to timezone mappings
const US_STATE_TIMEZONE_MAP: Record<string, string> = {
  'al': 'America/Chicago', 'alabama': 'America/Chicago',
  'ak': 'America/Anchorage', 'alaska': 'America/Anchorage',
  'az': 'America/Phoenix', 'arizona': 'America/Phoenix',
  'ar': 'America/Chicago', 'arkansas': 'America/Chicago',
  'ca': 'America/Los_Angeles', 'california': 'America/Los_Angeles',
  'co': 'America/Denver', 'colorado': 'America/Denver',
  'ct': 'America/New_York', 'connecticut': 'America/New_York',
  'de': 'America/New_York', 'delaware': 'America/New_York',
  'fl': 'America/New_York', 'florida': 'America/New_York',
  'ga': 'America/New_York', 'georgia': 'America/New_York',
  'hi': 'Pacific/Honolulu', 'hawaii': 'Pacific/Honolulu',
  'id': 'America/Boise', 'idaho': 'America/Boise',
  'il': 'America/Chicago', 'illinois': 'America/Chicago',
  'in': 'America/Indiana/Indianapolis', 'indiana': 'America/Indiana/Indianapolis',
  'ia': 'America/Chicago', 'iowa': 'America/Chicago',
  'ks': 'America/Chicago', 'kansas': 'America/Chicago',
  'ky': 'America/New_York', 'kentucky': 'America/New_York',
  'la': 'America/Chicago', 'louisiana': 'America/Chicago',
  'me': 'America/New_York', 'maine': 'America/New_York',
  'md': 'America/New_York', 'maryland': 'America/New_York',
  'ma': 'America/New_York', 'massachusetts': 'America/New_York',
  'mi': 'America/Detroit', 'michigan': 'America/Detroit',
  'mn': 'America/Chicago', 'minnesota': 'America/Chicago',
  'ms': 'America/Chicago', 'mississippi': 'America/Chicago',
  'mo': 'America/Chicago', 'missouri': 'America/Chicago',
  'mt': 'America/Denver', 'montana': 'America/Denver',
  'ne': 'America/Chicago', 'nebraska': 'America/Chicago',
  'nv': 'America/Los_Angeles', 'nevada': 'America/Los_Angeles',
  'nh': 'America/New_York', 'new hampshire': 'America/New_York',
  'nj': 'America/New_York', 'new jersey': 'America/New_York',
  'nm': 'America/Denver', 'new mexico': 'America/Denver',
  'ny': 'America/New_York', 'new york': 'America/New_York',
  'nc': 'America/New_York', 'north carolina': 'America/New_York',
  'nd': 'America/Chicago', 'north dakota': 'America/Chicago',
  'oh': 'America/New_York', 'ohio': 'America/New_York',
  'ok': 'America/Chicago', 'oklahoma': 'America/Chicago',
  'or': 'America/Los_Angeles', 'oregon': 'America/Los_Angeles',
  'pa': 'America/New_York', 'pennsylvania': 'America/New_York',
  'ri': 'America/New_York', 'rhode island': 'America/New_York',
  'sc': 'America/New_York', 'south carolina': 'America/New_York',
  'sd': 'America/Chicago', 'south dakota': 'America/Chicago',
  'tn': 'America/Chicago', 'tennessee': 'America/Chicago',
  'tx': 'America/Chicago', 'texas': 'America/Chicago',
  'ut': 'America/Denver', 'utah': 'America/Denver',
  'vt': 'America/New_York', 'vermont': 'America/New_York',
  'va': 'America/New_York', 'virginia': 'America/New_York',
  'wa': 'America/Los_Angeles', 'washington': 'America/Los_Angeles',
  'wv': 'America/New_York', 'west virginia': 'America/New_York',
  'wi': 'America/Chicago', 'wisconsin': 'America/Chicago',
  'wy': 'America/Denver', 'wyoming': 'America/Denver',
  'dc': 'America/New_York', 'district of columbia': 'America/New_York',
};

export function useTimezoneDetection() {
  // Fetch country timezone mappings from database
  const { data: countryTimezones = [] } = useQuery({
    queryKey: ['country-timezones'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('country_timezones')
        .select('*');
      if (error) throw error;
      return data as CountryTimezone[];
    },
    staleTime: 1000 * 60 * 60, // Cache for 1 hour
  });

  /**
   * Detect timezone from location data
   * Priority: City > State (US) > Country
   */
  const detectTimezone = (contact: {
    city?: string | null;
    state?: string | null;
    country?: string | null;
    location?: string | null;
  }): string | null => {
    // 1. Try to match city
    if (contact.city) {
      const cityLower = contact.city.toLowerCase().trim();
      if (CITY_TIMEZONE_MAP[cityLower]) {
        return CITY_TIMEZONE_MAP[cityLower];
      }
    }

    // 2. Try to extract city from location field
    if (contact.location) {
      const locationLower = contact.location.toLowerCase();
      for (const [city, tz] of Object.entries(CITY_TIMEZONE_MAP)) {
        if (locationLower.includes(city)) {
          return tz;
        }
      }
    }

    // 3. Try US state mapping
    if (contact.state) {
      const stateLower = contact.state.toLowerCase().trim();
      if (US_STATE_TIMEZONE_MAP[stateLower]) {
        return US_STATE_TIMEZONE_MAP[stateLower];
      }
    }

    // 4. Try to extract state from location
    if (contact.location) {
      const locationLower = contact.location.toLowerCase();
      for (const [state, tz] of Object.entries(US_STATE_TIMEZONE_MAP)) {
        if (locationLower.includes(state) && state.length > 2) {
          return tz;
        }
      }
    }

    // 5. Try country mapping from database
    if (contact.country) {
      const countryMatch = countryTimezones.find(
        ct => ct.country_code.toLowerCase() === contact.country?.toLowerCase() ||
              ct.country_name.toLowerCase() === contact.country?.toLowerCase()
      );
      if (countryMatch) {
        return countryMatch.timezone;
      }
    }

    // 6. Try to extract country from location
    if (contact.location) {
      const locationLower = contact.location.toLowerCase();
      for (const ct of countryTimezones) {
        if (locationLower.includes(ct.country_name.toLowerCase())) {
          return ct.timezone;
        }
      }
    }

    return null;
  };

  /**
   * Batch detect timezones for multiple contacts
   */
  const detectTimezones = (contacts: Array<{
    id: string;
    city?: string | null;
    state?: string | null;
    country?: string | null;
    location?: string | null;
    timezone?: string | null;
  }>): Map<string, string> => {
    const results = new Map<string, string>();
    
    for (const contact of contacts) {
      // Skip if already has timezone
      if (contact.timezone) {
        results.set(contact.id, contact.timezone);
        continue;
      }
      
      const detected = detectTimezone(contact);
      if (detected) {
        results.set(contact.id, detected);
      }
    }
    
    return results;
  };

  /**
   * Get timezone breakdown statistics
   */
  const getTimezoneBreakdown = (contacts: Array<{
    timezone?: string | null;
  }>): { timezone: string; count: number }[] => {
    const counts: Record<string, number> = {};
    
    for (const contact of contacts) {
      const tz = contact.timezone || 'Unknown';
      counts[tz] = (counts[tz] || 0) + 1;
    }
    
    return Object.entries(counts)
      .map(([timezone, count]) => ({ timezone, count }))
      .sort((a, b) => b.count - a.count);
  };

  /**
   * Calculate optimal send time for a timezone
   */
  const getOptimalSendTime = (timezone: string, preferredHour: number = 10): Date => {
    const now = new Date();
    const targetDate = new Date(now);
    
    // Set to preferred hour
    targetDate.setHours(preferredHour, 0, 0, 0);
    
    // If the time has passed today, schedule for tomorrow
    if (targetDate < now) {
      targetDate.setDate(targetDate.getDate() + 1);
    }
    
    return targetDate;
  };

  return {
    detectTimezone,
    detectTimezones,
    getTimezoneBreakdown,
    getOptimalSendTime,
    countryTimezones,
  };
}
