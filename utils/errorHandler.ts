export type ErrorContext = {
  operation?: string; // "create_list"
  table?: string; // "lists"
  rpc?: string; // "like_list"
  isWrite?: boolean; // insert/update/delete
};

const UNIQUE_CONSTRAINT_MESSAGES: Record<string, string> = {
  unique_list_media_pair: 'This media is already in the list.',
  unique_user_list_like: 'You already liked this list.',
  reviews_user_media_unique: 'You already reviewed this media.',
  user_media_unique: 'This media is already in your list.',
  unique_follow: 'You are already following this user.',
  unique_block: 'You have already blocked this user.',
  unique_comment_like: 'You already liked this comment.',
  unique_review_like: 'You already liked this review.',
  unique_user_list_name: 'You already have a list with this name.',
  media_tmdb_unique: 'This media already exists.',
};

const CHECK_CONSTRAINT_MESSAGES: Record<string, string> = {
  comments_content_check: 'Comments must be between 1 and 1000 characters.',
  comments_timestamp_seconds_check: 'Timestamp must be a positive value.',
  list_items_status_check: 'Invalid list status.',
  lists_list_type_check: 'Invalid list type.',
  lists_description_check: 'Description cannot exceed 500 characters.',
  profiles_display_name_check: 'Display name must be between 1 and 50 characters.',
  profiles_bio_check: 'Bio cannot exceed 300 characters.',
  reviews_content_check: 'Review cannot exceed 1000 characters.',
  reviews_rating_check: 'Rating must be between 0 and 10.',
  user_media_status_check: 'Invalid library status.'
};

const ACTION_FALLBACK_MESSAGES: Record<string, string> = {
  create_list: 'Could not create your list.',
  update_list: 'Could not update the list.',
  delete_list: 'Could not delete the list.',
  add_media: 'Could not add media to the list.',
  remove_media: 'Could not remove media from the list.',
  like_list: 'Could not like this list.',
  follow_user: 'Could not follow this user.',
  block_user: 'Could not block this user.',
  like_comment: 'Could not like this comment.',
  like_review: 'Could not like this review.',
  create_review: 'Could not submit your review.',
  add_to_library: 'Could not add this to your library.',
  update_profile: 'Could not update your profile.',
  upload_image: 'Could not upload the image.',
};

function extractConstraint(message?: string): string | null {
  if (!message) return null;

  const match = message.match(/constraint "([^"]+)"/i);
  return match ? match[1] : null;
}

export function getErrorMessage(error: any, context?: ErrorContext): string {
  if (!error) return 'An unexpected error occurred. Please try again.';

  const isWrite = context?.isWrite;

  // 🔐 Auth errors
  if (error.__isAuthError) {
    return 'There was a problem signing in. Please try again.';
  }

  // 🌐 HTTP status
  if (error.status === 401) return 'You must be signed in.';
  if (error.status === 403) return 'You don’t have permission to do this.';
  if (error.status === 404) return 'The requested item was not found.';
  if (error.status === 429) return 'You’re doing that too often. Please wait.';
  if (error.status === 500) return 'Our servers are having trouble. Please try again shortly.';
  if (error.status === 503) return 'Service is temporarily unavailable. Please try again shortly.';
  if (error.status >= 504) return 'Our servers are having trouble. Please try again shortly.';

  // 🧠 Postgres errors
  if (error.code) {
    const code = error.code;

    // UNIQUE
    if (code === '23505') {
      const constraint = extractConstraint(error.message);

      if (constraint && UNIQUE_CONSTRAINT_MESSAGES[constraint]) {
        return UNIQUE_CONSTRAINT_MESSAGES[constraint];
      }

      return 'This already exists.';
    }

    // CHECK
    if (code === '23514') {
      const constraint = extractConstraint(error.message);

      if (constraint && CHECK_CONSTRAINT_MESSAGES[constraint]) {
        return CHECK_CONSTRAINT_MESSAGES[constraint];
      }

      return 'Invalid data provided.';
    }

    // FK
    if (code === '23503') {
      return 'The item you’re referencing no longer exists.';
    }

    // NOT NULL
    if (code === '23502') {
      return 'Please fill in all required fields.';
    }

    // RLS / permission
    if (code === '42501') {
      return isWrite
        ? 'You don’t have permission to modify this.'
        : 'You don’t have permission to view this.';
    }

    // PostgREST .single() not found
    if (code === 'PGRST116') {
      return 'The requested item was not found.';
    }

    // Invalid input class
    if (code.startsWith('22')) {
      return 'Invalid input provided.';
    }
  }

  // Detect RLS via message fallback
  if (
    typeof error.message === 'string' &&
    error.message.toLowerCase().includes('row-level security')
  ) {
    return isWrite
      ? 'You don’t have permission to modify this.'
      : 'You don’t have permission to view this.';
  }

  // 🌍 Network
  const msg = error.message || '';
  if (/network|fetch|timeout|connection/i.test(msg)) {
    return 'Please check your internet connection.';
  }

  // 🎯 Context fallback
  if (context?.operation && ACTION_FALLBACK_MESSAGES[context.operation]) {
    return ACTION_FALLBACK_MESSAGES[context.operation] + ' Please try again.';
  }

  return 'Something went wrong. Please try again.';
}
