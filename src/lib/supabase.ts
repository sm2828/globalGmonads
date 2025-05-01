import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Location {
  id: string;
  latitude: number;
  longitude: number;
  created_at: string;
  location_name?: string;
  count: number;
}

export async function addLocation(latitude: number, longitude: number, location_name?: string) {
  const { data, error } = await supabase
    .from('locations')
    .upsert(
      { 
        latitude, 
        longitude, 
        location_name,
        count: 1
      },
      { 
        onConflict: 'latitude,longitude',
        ignoreDuplicates: false
      }
    )
    .select();
  
  if (error) throw error;
  return data[0];
}

export async function getLocations(): Promise<Location[]> {
  const { data, error } = await supabase
    .from('locations')
    .select('*');
  
  if (error) throw error;
  return data || [];
} 