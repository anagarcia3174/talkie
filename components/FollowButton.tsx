import { Pressable, Text, ActivityIndicator } from 'react-native';
import { useState, useMemo } from 'react';
import { useTheme } from '~/hooks/useTheme';
import { useFollow } from '~/store/followStore';
import { useAuth } from '~/context/AuthContext';
import { UserPlus, UserRoundCheck, UserCheck, Users } from 'lucide-react-native';

interface FollowButtonProps {
  targetUserId: string;
}

type FollowState = 'follow' | 'followBack' | 'following' | 'friends';

const STATES: Record<
  FollowState,
  {
    label: string;
    icon: React.ElementType;
    className: string;
    textClassName: string;
    iconColor: string; // resolved at render based on dark mode
  }
> = {
  follow: {
    label: 'Follow',
    icon: UserPlus,
    // Solid, high contrast — primary-900 on light, primary-100 on dark
    className:
      'bg-primary-900 dark:bg-primary-100 border border-primary-900 dark:border-primary-100',
    textClassName: 'text-primary-50 dark:text-primary-950',
    iconColor: '', // handled inline below
  },
  followBack: {
    label: 'Follow Back',
    icon: UserRoundCheck,
    // Ghost/outlined — draws attention without being as loud as Follow
    className: 'bg-transparent border border-primary-900 dark:border-primary-100',
    textClassName: 'text-primary-900 dark:text-primary-100',
    iconColor: '',
  },
  following: {
    label: 'Following',
    icon: UserCheck,
    // Muted fill — clearly pressed, passive state
    className:
      'bg-primary-200 dark:bg-primary-800 border border-primary-200 dark:border-primary-800',
    textClassName: 'text-primary-700 dark:text-primary-300',
    iconColor: '',
  },
  friends: {
    label: 'Friends',
    icon: Users,
    // Most muted — settled state, no action needed
    className:
      'bg-primary-150 dark:bg-primary-850 border border-primary-200 dark:border-primary-700',
    textClassName: 'text-primary-500 dark:text-primary-400',
    iconColor: '',
  },
};

export default function FollowButton({ targetUserId }: FollowButtonProps) {
  const theme = useTheme();
  const [loading, setLoading] = useState(false);

  const { followingIds, followerIds, follow, unfollow } = useFollow();

  const { user } = useAuth();

  if (!user) return null;

  const isFollowing = followingIds.has(targetUserId);
  const followsYou = followerIds.has(targetUserId);
  const isFriend = isFollowing && followsYou;

  const state: FollowState = useMemo(() => {
    if (isFriend) return 'friends';
    if (isFollowing) return 'following';
    if (followsYou) return 'followBack';
    return 'follow';
  }, [isFriend, isFollowing, followsYou]);

  const { label, icon: Icon, className, textClassName } = STATES[state];

  const iconColor = {
    follow: theme.primary[50], // primary-950 / primary-50
    followBack: theme.primary[900], // primary-100 / primary-900
    following: theme.primary[700], // primary-300 / primary-700
    friends: theme.primary[500], // primary-400 / primary-500
  }[state];

  const handlePress = async () => {
    if (loading) return;

    setLoading(true);

    if (isFollowing) {
      await unfollow(user.id, targetUserId);
    } else {
      await follow(user.id, targetUserId);
    }

    setLoading(false);
  };

  return (
    <Pressable
      onPress={handlePress}
      disabled={loading}
      className={`mt-2 flex-row items-center justify-center gap-1.5 rounded-lg px-4 py-2 active:opacity-70 ${className}`}
    >
      {loading ? (
        <ActivityIndicator color={iconColor} />
      ) : (
        <>
          <Icon size={15} color={iconColor} strokeWidth={2.2} />
          <Text className={`font-SpaceGrotesk-Bold text-sm ${textClassName}`}>
            {label}
          </Text>
        </>
      )}
    </Pressable>
  );
}
