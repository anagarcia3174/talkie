import { Pressable, Text, ActivityIndicator } from 'react-native';
import { useState, useMemo } from 'react';
import { useTheme } from '~/hooks/useTheme';
import { useFollow } from '~/store/followStore';
import { useAuth } from '~/context/AuthContext';
import { UserPlus, UserRoundCheck, UserCheck, Users } from 'lucide-react-native';

interface FollowButtonProps {
  targetUserId: string;
  isSmall?: boolean;
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

export default function FollowButton({ targetUserId, isSmall = false }: FollowButtonProps) {
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

  const sizeStyles = isSmall
    ? {
        container: 'rounded-md px-3 py-1.5',
        text: 'text-xs',
        iconSize: 13,
        gap: 'gap-1',
      }
    : {
        container: 'rounded-lg px-4 py-2 mt-2',
        text: 'text-sm',
        iconSize: 15,
        gap: 'gap-1.5',
      };

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
      className={`flex-row items-center justify-center ${sizeStyles.gap} active:opacity-70 ${sizeStyles.container} ${className}`}>
      {loading ? (
        <ActivityIndicator size={isSmall ? 'small' : 'small'} color={iconColor} />
      ) : (
        <>
          <Icon size={sizeStyles.iconSize} color={iconColor} strokeWidth={2.2} />
          <Text className={`font-SpaceGrotesk-Bold ${sizeStyles.text} ${textClassName}`}>
            {label}
          </Text>
        </>
      )}
    </Pressable>
  );
}
