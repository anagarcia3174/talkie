import { Pressable, Text, ActivityIndicator } from 'react-native';
import { useState, useMemo } from 'react';
import { useTheme } from '~/hooks/useTheme';
import { useFollow } from '~/store/followStore';
import { useAuth } from '~/context/AuthContext';
import { UserPlus, UserRoundCheck, UserCheck, Users } from 'lucide-react-native';
import Toast from 'react-native-toast-message';
import { haptics } from '~/utils/haptics';

interface FollowButtonProps {
  targetUserId: string;
  isSmall?: boolean;
}

type FollowState = 'follow' | 'followBack' | 'following' | 'friends';

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

  const styles = useMemo(() => {
    const base = isSmall
      ? {
          container: 'rounded-md px-3 py-1.5',
          textSize: 'text-xs',
          iconSize: 13,
          gap: 'gap-1',
        }
      : {
          container: 'rounded-lg px-4 py-2 mt-2',
          textSize: 'text-sm',
          iconSize: 15,
          gap: 'gap-1.5',
        };

    const variants = {
      follow: {
        label: 'Follow',
        Icon: UserPlus,
        buttonClassName:
          'bg-primary-900 border border-primary-900 dark:bg-primary-100 dark:border-primary-100',
        textClassName: 'text-primary-50 dark:text-primary-950',
        iconColor: theme.primary[50],
      },

      followBack: {
        label: 'Follow Back',
        Icon: UserRoundCheck,
        buttonClassName: isSmall
          ? 'bg-primary-100 border border-primary-300 dark:bg-primary-900 dark:border-primary-700'
          : 'bg-primary-100 border border-primary-200 dark:bg-primary-900 dark:border-primary-800',
        textClassName: 'text-primary-800 dark:text-primary-200',
        iconColor: theme.primary[800],
      },

      following: {
        label: 'Following',
        Icon: UserCheck,
        buttonClassName: isSmall
          ? 'bg-primary-300 border border-primary-400 dark:bg-primary-700 dark:border-primary-600'
          : 'bg-primary-100 border border-primary-200 dark:bg-primary-900 dark:border-primary-800',
        textClassName: 'text-primary-700 dark:text-primary-300',
        iconColor: theme.primary[700],
      },

      friends: {
        label: 'Friends',
        Icon: Users,
        buttonClassName: isSmall
          ? 'bg-transparent border border-primary-400 dark:border-primary-600'
          : 'bg-transparent border border-primary-200 dark:border-primary-800',
        textClassName: 'text-primary-600 dark:text-primary-400',
        iconColor: theme.primary[600],
      },
    };

    return {
      ...base,
      ...variants[state],
    };
  }, [isSmall, state, theme.primary]);

  const handlePress = async () => {
    if (loading) return;

    setLoading(true);
    if (isFollowing) {
      const result = await unfollow(user.id, targetUserId);
      if (!result.success) {
        haptics.error();
        Toast.show({
          type: 'error',
          text1: result.error,
        });
      }
    } else {
      const result = await follow(user.id, targetUserId);
      if (!result.success) {
        haptics.error();
        Toast.show({
          type: 'error',
          text1: result.error,
        });
      }
    }

    setLoading(false);
  };

  const { label, Icon, buttonClassName, textClassName, iconColor } = styles;

  return (
    <Pressable
      onPress={() => {
        if (loading) return;
        haptics.action();
        handlePress();
      }}
      disabled={loading}
      className={`flex-row items-center justify-center active:opacity-70 ${styles.gap} ${styles.container} ${buttonClassName}`}>
      {loading ? (
        <ActivityIndicator size="small" color={iconColor} />
      ) : (
        <>
          <Icon size={styles.iconSize} color={iconColor} strokeWidth={2} />
          <Text className={`font-SpaceGrotesk-Bold ${styles.textSize} ${textClassName}`}>
            {label}
          </Text>
        </>
      )}
    </Pressable>
  );
}
