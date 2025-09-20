import { Profile } from "~/types/supabaseTypes";
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL

export function getPublicUrl(path: string | null): string  {
  if (!path) return '';
  return `${SUPABASE_URL}/storage/v1${path}`;
}

export function withPublicUrl(profile: Profile | null): Profile | null {
  if (!profile) return null;

  return {
    ...profile,
    avatar_url: profile.avatar_url
      ? `${SUPABASE_URL}/storage/v1${profile.avatar_url}`
      : '',
  };
}