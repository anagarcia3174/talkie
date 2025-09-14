import { isClerkAPIResponseError } from '@clerk/clerk-expo';

/**
 * Maps Clerk error codes to user-friendly messages
 * Focuses on the most common authentication errors users encounter
 */
export const getClerkErrorMessage = (error: any): string => {
  if (!isClerkAPIResponseError(error)) {
    return 'An unexpected error occurred. Please try again.';
  }
  
  const errorCode = error.errors[0]?.code;
  
  switch (errorCode) {
    // Most common authentication errors
    case 'form_identifier_not_found':
      return 'No account found with this email address.';
    case 'form_password_incorrect':
      return 'Incorrect password. Please try again.';
    case 'form_identifier_exists':
      return 'An account with this email already exists.';
    case 'form_code_incorrect':
      return 'Invalid verification code.';
    case 'form_param_format_invalid':
      return 'Please check your email format.';
    case 'form_param_nil':
      return 'Please fill in all required fields.';
    case 'form_password_pwned':
      return 'This password has been compromised. Please choose a different one.';
    case 'form_password_too_short':
      return 'Password is too short.';
    case 'form_password_validation_failed':
      return 'Password does not meet requirements.';
    
    // Account status errors
    case 'user_locked':
      return 'Your account has been locked. Please contact support.';
    case 'user_banned':
      return 'Your account has been suspended. Please contact support.';
    case 'user_not_found':
      return 'Account not found.';
    case 'signed_out':
      return 'Your session has expired. Please sign in again.';
    
    // Rate limiting and security
    case 'rate_limit_exceeded':
      return 'Too many attempts. Please wait a moment before trying again.';
    case 'verification_code_too_many_requests':
      return 'Too many verification attempts. Please wait before trying again.';
    case 'verification_expired':
      return 'Verification code has expired. Please request a new one.';
    
    // Network and technical errors
    case 'network_error':
      return 'Network connection issue. Please check your internet and try again.';
    case 'internal_clerk_error':
      return 'Service temporarily unavailable. Please try again in a moment.';
    case 'bad_request':
      return 'Invalid request. Please try again.';
    
    // Generic fallback for other errors
    default:
      return '';
  }
};
