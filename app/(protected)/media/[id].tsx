import { View, Text, TouchableOpacity, ImageBackground, Image, ScrollView } from 'react-native';
import { BlurView } from 'expo-blur';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, Star, ChevronDown, ChevronUp, Plus } from 'lucide-react-native';
import { useTheme } from '~/hooks/useTheme';
import { useState } from 'react';
import SegmentedControl from '@react-native-segmented-control/segmented-control';
import { Media } from '~/types/supabaseTypes';
import ListSelectionModal from '~/components/ListSelectionModal';
import { useAuth } from '~/context/AuthContext';

const CONTENT_OPTIONS = ['Reviews', 'Comments'];

export default function MediaScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const params = useLocalSearchParams<{ id: string; mediaData: string }>();
  const media: Media = JSON.parse(params.mediaData as string);
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const [isOverviewExpanded, setIsOverviewExpanded] = useState(false);
  const [selectedSegment, setSelectedSegment] = useState(0);
  const [listModalVisible, setListModalVisible] = useState(false);
  const year = (media.release_date)?.slice(0, 4);
  const rating = media.vote_average?.toFixed(1);
  const backdrop = media.backdrop_path
    ? `https://image.tmdb.org/t/p/w780${media.backdrop_path}`
    : null;
  const poster = media.poster_path ? `https://image.tmdb.org/t/p/w500${media.poster_path}` : null;

  const overviewLength = media.synopsis?.length || 0;
  const isOverviewLong = overviewLength > 200;
  


  return (
    <View className="flex-1 bg-primary-50 dark:bg-primary-950">
      <ImageBackground
        source={{ uri: backdrop || poster || '' }}
        resizeMode="cover"
        className="h-full w-full">
        <BlurView
          intensity={theme.isDark ? 90 : 80}
          tint={theme.isDark ? 'systemThickMaterialDark' : 'systemThickMaterialLight'}
          className="flex-1 bg-primary-50/30 dark:bg-primary-950/40">
          <SafeAreaView className="flex-1" edges={['top']}>
            {/* Header Buttons */}
            <View className="flex-row justify-between px-4 pb-4 pt-2">
              <TouchableOpacity
                className="rounded-full bg-primary-900/40 dark:bg-primary-100/40 p-2"
                onPress={() => router.back()}>
                <ArrowLeft className="text-primary-50 dark:text-primary-950" size={24} />
              </TouchableOpacity>

              <TouchableOpacity onPress={() => setListModalVisible(true)} className="rounded-full bg-primary-900/40 dark:bg-primary-100/40 p-2">
                <Plus className="text-primary-50 dark:text-primary-950" size={24} />
              </TouchableOpacity>
            </View>

            <ScrollView
              className="flex-1"
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}>
              <View className="items-center px-4">
                {/* Poster */}
                {poster && (
                  <Image
                    source={{ uri: poster }}
                    className="mb-4 h-64 w-44 rounded-2xl"
                    resizeMode="cover"
                  />
                )}

                <Text className="mb-3 text-center font-SpaceGrotesk-SemiBold text-2xl text-primary-900 dark:text-primary-50">
                  {media.title}
                </Text>
                <View className="mb-2 flex-row items-center">
                  {year && (
                    <>
                      <Text className="font-SpaceGrotesk-Medium text-lg text-primary-800 dark:text-primary-100">
                        {year}
                      </Text>
                      <View className="mx-4 h-1 w-1 rounded-full bg-primary-700 dark:bg-primary-200" />
                    </>
                  )}
                  <Star size={16} color="#fbbf24" fill="#fbbf24" />
                  <Text className="ml-1 font-SpaceGrotesk-Medium text-lg text-primary-900 dark:text-primary-50">
                    {rating}
                  </Text>
                </View>

                {media.synopsis && (
                  <View className="mb-6 w-full">
                    <Text className="font-SpaceGrotesk-SemiBold text-xl text-primary-900 dark:text-primary-50">
                      Overview
                    </Text>
                    <Text
                      className="font-SpaceGrotesk-Regular text-primary-700 dark:text-primary-200"
                      numberOfLines={isOverviewLong && !isOverviewExpanded ? 2 : undefined}>
                      {media.synopsis}
                    </Text>
                    {isOverviewLong && (
                      <TouchableOpacity
                        className="mt-2 flex-row items-center justify-center"
                        onPress={() => setIsOverviewExpanded(!isOverviewExpanded)}>
                        <Text className="font-SpaceGrotesk-Medium text-sm text-primary-600 dark:text-primary-300">
                          {isOverviewExpanded ? 'Show Less' : 'Show More'}
                        </Text>
                        {isOverviewExpanded ? (
                          <ChevronUp
                            color={theme.isDark ? theme.primary[300] : theme.primary[600]}
                            size={16}
                            style={{ marginLeft: 4 }}
                          />
                        ) : (
                          <ChevronDown
                            color={theme.isDark ? theme.primary[300] : theme.primary[600]}
                            size={16}
                            style={{ marginLeft: 4 }}
                          />
                        )}
                      </TouchableOpacity>
                    )}
                  </View>
                )}
                <View className="mb-4 w-full">
                  <SegmentedControl
                    values={CONTENT_OPTIONS}
                    selectedIndex={selectedSegment}
                    onChange={(event) => {
                      setSelectedSegment(event.nativeEvent.selectedSegmentIndex);
                    }}
                    tintColor={theme.primaryOpacity[950]}
                    fontStyle={{
                      color: theme.primary[600],
                      fontSize: 15,
                      fontFamily: 'SpaceGrotesk-Light',
                    }}
                    activeFontStyle={{
                      color: theme.primary[950],
                      fontSize: 15,
                      fontFamily: 'SpaceGrotesk-Medium',
                    }}
                  />
                </View>
              </View>
            </ScrollView>
            <ListSelectionModal visible={listModalVisible} onClose={() => setListModalVisible(false)} mediaId={media.id} userId={user?.id}/>
          </SafeAreaView>
        </BlurView>
      </ImageBackground>
    </View>
  );
}