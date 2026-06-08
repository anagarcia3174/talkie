import PostHog from 'posthog-react-native';
import * as Sentry from '@sentry/react-native';

export const posthog = new PostHog(process.env.EXPO_PUBLIC_POSTHOG_KEY!, {
  host: 'https://us.i.posthog.com',
});

export function identifyUser(id: string, email?: string) {
  Sentry.setUser({ id, email });
  posthog.identify(id, email ? { email } : {});
}

export function resetUser() {
  Sentry.setUser(null);
  posthog.reset();
}

export const analytics = {
  // Auth
  userSignedIn: () => posthog.capture('user_signed_in'),
  userSignedOut: () => posthog.capture('user_signed_out'),
  accountDeleted: () => posthog.capture('account_deleted'),

  // Media
  mediaViewed: (props: { media_id: number; media_type: string; media_title: string }) =>
    posthog.capture('media_viewed', props),

  // Reviews
  reviewCreated: (props: { media_id: number; rating: number | null }) =>
    posthog.capture('review_created', props),
  reviewUpdated: (props: { media_id: number }) => posthog.capture('review_updated', props),
  reviewDeleted: (props: { media_id: number }) => posthog.capture('review_deleted', props),

  // Comments
  commentCreated: (props: { media_id: number }) => posthog.capture('comment_created', props),
  commentDeleted: () => posthog.capture('comment_deleted'),

  // Lists
  listCreated: (props: { is_private: boolean }) => posthog.capture('list_created', props),
  listUpdated: () => posthog.capture('list_updated'),
  listDeleted: () => posthog.capture('list_deleted'),
  listItemAdded: (props: { media_type: string }) => posthog.capture('list_item_added', props),
  listItemRemoved: () => posthog.capture('list_item_removed'),
  listLiked: () => posthog.capture('list_liked'),
  listUnliked: () => posthog.capture('list_unliked'),
  listViewed: (props: { list_id: string; is_own: boolean }) =>
    posthog.capture('list_viewed', props),

  // Social
  userFollowed: () => posthog.capture('user_followed'),
  userUnfollowed: () => posthog.capture('user_unfollowed'),
  profileViewed: (props: { profile_id: string; is_own: boolean }) =>
    posthog.capture('profile_viewed', props),

  // Search
  searchPerformed: (props: { query: string; result_count: number }) =>
    posthog.capture('search_performed', props),
};
