import { Profile } from '~/types/supabaseTypes';
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;

export function getPublicUrl(path: string | null): string {
  if (!path) return '';
  if(path.includes(`${SUPABASE_URL}`)) return path;
  return `${SUPABASE_URL}/storage/v1${path}`;
}

export function withPublicUrl(profile: Profile): Profile {
  return {
    ...profile,
    avatar_url: profile.avatar_url ? `${SUPABASE_URL}/storage/v1${profile.avatar_url}` : null,
  };
}
