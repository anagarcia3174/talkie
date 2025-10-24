import type { PostgrestError } from "@supabase/supabase-js";


const DATABASE_ERROR_MESSAGES: Record<string, string> = {
  '23505': 'This item already exists. Please use a different value.',
  '23503': 'The item you\'re trying to reference doesn\'t exist.',
  '23502': 'Please fill in all required fields.',
  '42501': 'You don\'t have permission to perform this action.',
  'PGRST116': 'You don\'t have permission to access this data.',
  'PGRST301': 'There was a problem with your request. Please try again.',
  'PGRST204': 'No data found.',
};

const STORAGE_ERROR_MESSAGES: Record<string, string> = {
  'InvalidBucketName': 'There was a problem with file storage. Please try again.',
  'ObjectNotFound': 'The requested file could not be found.',
  'BucketNotFound': 'There was a problem accessing file storage. Please try again.',
  'PayloadTooLarge': 'The file you\'re trying to upload is too large.',
  'InvalidKey': 'Invalid file path. Please try again.',
  'BucketAlreadyExists': 'Storage location already exists.',
  'BucketNotEmpty': 'Cannot delete storage location that contains files.',
};

const AUTH_ERROR_MESSAGES: Record<string, string> = {
  'session_not_found': 'Your session has expired. Please sign in again.',
  'invalid_grant': 'There was a problem with your Apple sign-in. Please try again.',
  'provider_email_needs_verification': 'Please verify your email address.',
};

export function getErrorMessage(error: any): string {
  if (!error) return 'An unexpected error occurred. Please try again.';

  // Auth
  if (error.__isAuthError) {
    const code = error.message?.toLowerCase().replace(/\s+/g, '_') || '';
    return AUTH_ERROR_MESSAGES[code] || 'There was a problem signing in. Please try again.';
  }

  // Explicit status codes
  if (error.status === 401) return 'You must be signed in to continue.';
  if (error.status === 403) return 'You don’t have access to this resource.';
  if (error.status === 429) return 'You’re doing that too often. Please wait a moment.';
  if (error.status >= 500 && error.status < 600) {
    return 'Our servers are having trouble. Please try again shortly.';
  }

  // Database errors
  if (error.code && typeof error.code === 'string') {
    const code = error.code.toUpperCase();
    return DATABASE_ERROR_MESSAGES[code] || 'There was a problem with your request. Please try again.';
  }

  // Storage errors
  if (error.error && typeof error.error === 'string') {
    const code = error.error;
    return STORAGE_ERROR_MESSAGES[code] || 'There was a problem with file storage. Please try again.';
  }

  // Network
  const msg = error.message || String(error);
  if (/network|fetch|connection|timeout|ECONNREFUSED|ENOTFOUND/i.test(msg)) {
    return 'Please check your internet connection and try again.';
  }

  // Fallback
  return 'Something went wrong. Please try again.';
}
