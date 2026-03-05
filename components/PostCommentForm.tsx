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
        user_id: profile.id,
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

  return (
    <View className="overflow-hidden px-4 pt-2" style={{ paddingBottom: insets.bottom * 0.6 }}>
      <View className="flex-row items-center">
        {/* Profile Picture */}
        {profile && profile.avatar_url ? (
          <Image
            source={{ uri: profile.avatar_url || 'https://via.placeholder.com/50' }}
            className="h-10 w-10 rounded-full"
          />
        ) : (
          <View className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-200 dark:bg-primary-800">
            <UserRound size={12} color={theme.primary[900]} />
          </View>
        )}
        {/* Text Input */}
        <TextInput
          placeholder="Leave a comment..."
          value={commentText}
          onChangeText={setCommentText}
          multiline
          numberOfLines={2}
          className="text-md mx-3 max-h-24 flex-1 rounded-xl border border-primary-700 px-4 py-2 font-SpaceGrotesk-Light text-primary-950 focus:border-[1.5px] focus:border-primary-950 dark:border-primary-400 dark:text-primary-200 focus:dark:border-primary-50"
          cursorColor={theme.primary[700]}
          selectionColor={theme.primary[700]}
          placeholderTextColor={theme.primary[600]}
          maxLength={1000}
          returnKeyType="done"
          submitBehavior="blurAndSubmit"
          onFocus={() => setOverviewExpanded(false)}
        />

        {/* Submit Button */}
        <TouchableOpacity onPress={handleSubmit} disabled={loading} className="rounded-full">
          {loading ? (
            <ActivityIndicator color={theme.primary[950]} />
          ) : (
            <SendHorizonal color={theme.primary[950]} size={24} strokeWidth={1.5} />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}
