import { View, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Plus } from 'lucide-react-native';
import { useTheme } from '~/hooks/useTheme';
import { useState } from 'react';
import { Media } from '~/types/supabaseTypes';
import ListSelectionModal from '~/components/ListSelectionModal';
import { useAuth } from '~/context/AuthContext';
import Toast from 'react-native-toast-message';
import MediaTabs from '~/components/MediaTabs';
import MediaHeader from '~/components/MediaHeader';
import { useList } from '~/store/listStore';
import PosterPreviewModal from '~/components/PosterPreviewModal';
import MediaCommentSection from '~/components/MediaCommentSection';
import MediaReviewSection from '~/components/MediaReviewSection';
import { haptics } from '~/utils/haptics';

const CONTENT_OPTIONS = ['Reviews', 'Comments'];

export default function MediaScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const params = useLocalSearchParams<{ id: string; mediaData: string }>();
  const media: Media = JSON.parse(params.mediaData as string);
  const theme = useTheme();

  const [selectedSegment, setSelectedSegment] = useState(0);
  const [listModalVisible, setListModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const { addItemToList } = useList();

  const handleAddToList = async (listIds: number[]) => {
    if (!listIds.length || !user?.id) return;
    setListModalVisible(false);
    setLoading(true);
    Toast.show({
      type: 'info',
      text1: 'Adding to list...',
      position: 'top',
      visibilityTime: 3000,
      autoHide: true,
      onPress: () => Toast.hide(),
    });

    const results = await Promise.all(listIds.map((id) => addItemToList(id, media.id)));
    const firstError = results.find((r) => !r.success);

    if (firstError) {
      haptics.error();
      Toast.show({
        type: 'error',
        text1: firstError.error || 'Failed to add item to your list',
        position: 'top',
        visibilityTime: 4000,
        autoHide: true,
        onPress: () => Toast.hide(),
      });
    } else {
      haptics.success();
      Toast.show({
        type: 'success',
        text1: listIds.length > 1 ? `Added to ${listIds.length} lists!` : 'Added to list!',
        position: 'top',
        visibilityTime: 3000,
        autoHide: true,
        onPress: () => Toast.hide(),
      });
    }
    setLoading(false);
  };

  return (
    <View className="flex-1 bg-primary-50 dark:bg-primary-950">
      <SafeAreaView className="flex-1" edges={['top']}>
        {/* Header Buttons */}
        <View className="mb-2 flex-row justify-between px-4">
          <TouchableOpacity
            className="rounded-md   bg-primary-100 p-1  dark:bg-primary-900"
            onPress={() => router.back()}>
            <ArrowLeft color={theme.primary[950]} size={20} strokeWidth={2} />
          </TouchableOpacity>
          <TouchableOpacity
            disabled={loading}
            onPress={() => {
              haptics.action();
              setListModalVisible(true);
            }}
            className="rounded-md bg-primary-100 p-1  dark:bg-primary-900">
            <Plus color={theme.primary[950]} size={20} strokeWidth={2} />
          </TouchableOpacity>
        </View>
        <View className="px-4">
          <MediaHeader
            media={media}
            onPosterPress={() => {
              setPreviewImage(`https://image.tmdb.org/t/p/w780${media.poster_path}`);
            }}
          />
          <MediaTabs
            selectedIndex={selectedSegment}
            onChange={setSelectedSegment}
            options={CONTENT_OPTIONS}
          />
        </View>
        <KeyboardAvoidingView
          className="flex-1 "
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          {selectedSegment === 0 && (
            <MediaReviewSection mediaId={media.id} releaseDate={media.release_date} />
          )}
          {selectedSegment === 1 && (
            <MediaCommentSection
              mediaType={media.media_type}
              mediaId={media.id}
              releaseDate={media.release_date}
            />
          )}
        </KeyboardAvoidingView>
        <ListSelectionModal
          visible={listModalVisible}
          onClose={() => setListModalVisible(false)}
          onConfirm={handleAddToList}
        />
        <PosterPreviewModal
          visible={!!previewImage}
          onClose={() => setPreviewImage(null)}
          imageUri={previewImage}
        />
      </SafeAreaView>
    </View>
  );
}
