import {
  View,
  TouchableOpacity,
  ImageBackground,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, Plus, X } from 'lucide-react-native';
import { useTheme } from '~/hooks/useTheme';
import { useEffect, useState } from 'react';
import { Media } from '~/types/supabaseTypes';
import ListSelectionModal from '~/components/ListSelectionModal';
import { useAuth } from '~/context/AuthContext';
import Toast from 'react-native-toast-message';
import MediaTabs from '~/components/MediaTabs';
import MediaHeader from '~/components/MediaHeader';
import { useLists } from '~/store/listStore';
import { useMedia } from '~/store/mediaStore';
import PosterPreviewModal from '~/components/PosterPreviewModal';
import MediaCommentSection from '~/components/MediaCommentSection';
import MediaReviewSection from '~/components/MediaReviewSection';

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
  const backdrop = media.backdrop_path
    ? `https://image.tmdb.org/t/p/w780${media.backdrop_path}`
    : null;
  const poster = media.poster_path ? `https://image.tmdb.org/t/p/w500${media.poster_path}` : null;
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const { addItemToList } = useLists();

  const handleAddToList = async (listId: number) => {
    if (!listId || !user?.id) return;
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

    const result = await addItemToList(listId, media.id, user.id);

    if (!result.success) {
      Toast.show({
        type: 'error',
        text1: result.error || 'Failed to add item to your list',
        position: 'top',
        visibilityTime: 4000,
        autoHide: true,
        onPress: () => Toast.hide(),
      });
    } else {
      Toast.show({
        type: 'success',
        text1: 'Item was added to your list!',
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
      <ImageBackground
        source={{ uri: backdrop || poster || undefined }}
        resizeMode="cover"
        className="h-full w-full">
        <BlurView
          intensity={theme.isDark ? 90 : 80}
          tint={theme.isDark ? 'systemThickMaterialDark' : 'systemThickMaterialLight'}
          className="flex-1 bg-primary-50/30 dark:bg-primary-950/40">
          <SafeAreaView className="flex-1" edges={['top']}>
            {/* Header Buttons */}
            <View className="flex-row justify-between px-4">
              <TouchableOpacity className="p-2" onPress={() => router.back()}>
                <ArrowLeft color={theme.primary[950]} size={24} />
              </TouchableOpacity>
              <TouchableOpacity
                disabled={loading}
                onPress={() => setListModalVisible(true)}
                className="p-2">
                <Plus color={theme.primary[950]} size={24} />
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
              className="flex-1 px-2"
              behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
              {selectedSegment === 0 && <MediaReviewSection mediaId={media.id} />}
              {selectedSegment === 1 && (
                <MediaCommentSection mediaType={media.media_type} mediaId={media.id} />
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
        </BlurView>
      </ImageBackground>
    </View>
  );
}
