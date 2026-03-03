import { BlurView } from 'expo-blur';
import { SendHorizonal, UserRound } from 'lucide-react-native';
import { useState } from 'react';
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { useTheme } from '~/hooks/useTheme';
import { useProfile } from '~/store/profileStore';

interface PostCommentFormProps {
  onSubmitComment: (content: string, isSpoiler: boolean) => Promise<void>;
}

export default function PostCommentForm({ onSubmitComment }: PostCommentFormProps) {
  const { profile } = useProfile();
  const [commentText, setCommentText] = useState('');
  const [loading, setLoading] = useState(false);
  const theme = useTheme();
  const insets = useSafeAreaInsets();

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
    setLoading(true);
    await onSubmitComment(commentText.trim(), false);

    setCommentText('');
    setLoading(false);
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <BlurView
        intensity={30}
        className="overflow-hidden px-4 pt-2"
        style={{ paddingBottom: insets.bottom * 0.6 }}>
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
            numberOfLines={3}
            className="text-md mx-3 max-h-24 flex-1 rounded-xl border border-primary-700 px-4 py-2 font-SpaceGrotesk-Light text-primary-950 focus:border-[1.5px] focus:border-primary-950 dark:border-primary-400 dark:text-primary-200 focus:dark:border-primary-50"
            cursorColor={theme.primary[700]}
            selectionColor={theme.primary[700]}
            placeholderTextColor={theme.primary[600]}
            maxLength={1000}
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
      </BlurView>
    </KeyboardAvoidingView>
  );
}
