import { BlurView } from 'expo-blur';
import { SendHorizonal, UserRound } from 'lucide-react-native';
import { useState } from 'react';
import { ActivityIndicator, Image, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { useTheme } from '~/hooks/useTheme';
import { useComments } from '~/store/commentStore';
import { useProfile } from '~/store/profileStore';
import { useUI } from '~/store/uiStore';

interface PostCommentFormProps {
  mediaId: number;
  timestamp: number;
  season: number | null;
  episode: number | null;
}

export default function PostCommentForm({
  mediaId,
  timestamp,
  season,
  episode,
}: PostCommentFormProps) {
  const { profile } = useProfile();
  const { postComment } = useComments();
  const [commentText, setCommentText] = useState('');
  const [loading, setLoading] = useState(false);
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { setOverviewExpanded } = useUI();

  const handleSubmit = async () => {
    if (!commentText.trim() || commentText.trim().length < 15) {
      Toast.show({
        type: 'error',
        text1: 'Comment text must be at least 15 characters long.',
        visibilityTime: 4000,
        autoHide: true,
      });
      return;
    } else if (commentText.trim().length > 1000) {
      Toast.show({
        type: 'error',
        text1: 'Comment text must be at most 1000 characters long.',
        visibilityTime: 4000,
        autoHide: true,
      });
    }
    if (profile) {
      setLoading(true);
      Toast.show({
        type: 'info',
        text1: 'Posting your comment...',
        autoHide: true,
      });
      const result = await postComment({
        media_id: mediaId,
        content: commentText.trim(),
        is_spoiler: false,
        season_number: season,
        episode_number: episode,
        timestamp_seconds: timestamp,
        parent_comment_id: null,
      });
      if (result.success) {
        Toast.show({
          type: 'success',
          text1: 'Comment posted!',
          autoHide: true,
        });
      } else {
        Toast.show({
          type: 'error',
          text1: result.error || 'Failed to post your comment.',
          visibilityTime: 4000,
          autoHide: true,
        });
      }

      setCommentText('');
      setLoading(false);
    } else {
      Toast.show({
        type: 'error',
        text1: 'An unexpected error occurred while posting your comment.',
        visibilityTime: 4000,
        autoHide: true,
      });
    }
  };

  const formatTime = (seconds: number) => {
    if (seconds >= 3600) {
      const hrs = Math.floor(seconds / 3600);
      const mins = Math.floor((seconds % 3600) / 60);
      const secs = seconds % 60;
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  return (
    <View
      style={{
        paddingBottom: insets.bottom * 0.2,
      }}>
      <BlurView
        intensity={40}
        tint={theme.isDark ? 'systemThickMaterialDark' : 'systemThickMaterialLight'}
        className="overflow-hidden rounded-3xl border border-white/15"
        style={{
          shadowColor: '#000',
          shadowOpacity: 0.15,
          shadowRadius: 14,
          shadowOffset: { width: 0, height: 6 },
          elevation: 10,
        }}>
        <View className="flex-row items-end px-4 py-3">
          {/* Avatar */}
          {profile && profile.avatar_url ? (
            <Image source={{ uri: profile.avatar_url }} className="h-11 w-11 rounded-full" />
          ) : (
            <View className="h-11 w-11 items-center justify-center rounded-full bg-primary-200 dark:bg-primary-800">
              <UserRound size={16} color={theme.primary[900]} />
            </View>
          )}

          {/* Input */}
          <TextInput
            placeholder={`Leave a comment at ${formatTime(timestamp)}...`}
            value={commentText}
            onChangeText={setCommentText}
            multiline
            className="mx-4 max-h-28 flex-1 py-3 font-SpaceGrotesk-Light text-[15px] text-primary-950 dark:text-primary-200"
            cursorColor={theme.primary[700]}
            selectionColor={theme.primary[700]}
            placeholderTextColor={theme.primary[500]}
            maxLength={1000}
            returnKeyType="done"
            submitBehavior="blurAndSubmit"
            onFocus={() => setOverviewExpanded(false)}
            numberOfLines={2}
          />

          {/* Send Button */}
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={loading}
            className="h-11 w-11 items-center justify-center rounded-full">
            {loading ? (
              <ActivityIndicator size="small" color={theme.primary[950]} />
            ) : (
              <SendHorizonal size={20} strokeWidth={2} color={theme.primary[950]} />
            )}
          </TouchableOpacity>
        </View>
      </BlurView>
    </View>
  );
}
