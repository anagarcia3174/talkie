import { LinearGradient } from 'expo-linear-gradient';
import { Star } from 'lucide-react-native';
import { Image, Text, View, Dimensions, TouchableOpacity, ActivityIndicator } from 'react-native';
import Carousel from 'react-native-reanimated-carousel';
import { Media } from '~/types/supabaseTypes';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { haptics } from '~/utils/haptics';

const SCREEN_WIDTH = Dimensions.get('window').width;
/** Full width under `px-4` (16 + 16) */
const ITEM_STRIDE = SCREEN_WIDTH - 32;
/** Horizontal gap between card edges while scrolling */
const SLIDE_GAP = 2;
const CARD_WIDTH = ITEM_STRIDE - SLIDE_GAP;
const CARD_HEIGHT = 232;
const GRADIENT_HEIGHT = Math.round(CARD_HEIGHT * 0.58);

interface TrendingSectionProps {
  movies: Media[];
  onAddToLibrary: (mediaId: number) => Promise<void>;
  title: string;
}

export default function TrendingSection({
  movies,
  onAddToLibrary,
  title,
}: TrendingSectionProps) {
  const router = useRouter();
  const [isScrolling, setIsScrolling] = useState(false);
  const [loadingId, setLoadingId] = useState<number | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const movieIdsKey = movies.map((m) => m.id).join(',');
  useEffect(() => {
    setActiveIndex(0);
  }, [movieIdsKey]);

  const showPager = movies.length > 1;

  return (
    <View className="px-4">
      <Text className="mb-2 font-SpaceGrotesk-SemiBold text-sm uppercase tracking-wide text-primary-500 dark:text-primary-400">
        {title}
      </Text>

      <View>
        <Carousel
          width={ITEM_STRIDE}
          height={CARD_HEIGHT}
          style={{ width: ITEM_STRIDE, alignSelf: 'center' }}
          data={movies}
          loop
          autoPlay={showPager}
          autoPlayInterval={3000}
          scrollAnimationDuration={600}
          onSnapToItem={setActiveIndex}
          onScrollStart={() => setIsScrolling(true)}
          onScrollEnd={() => setIsScrolling(false)}
          renderItem={({ item }) => (
            <View style={{ width: ITEM_STRIDE, alignItems: 'center' }}>
              <TouchableOpacity
                activeOpacity={0.7}
                disabled={isScrolling || loadingId === item.id}
                onPress={() => {
                  if (isScrolling) return;
                  router.push({
                    pathname: '/media/[id]',
                    params: {
                      id: item.id.toString(),
                      mediaData: JSON.stringify(item),
                    },
                  });
                }}
                className="rounded-2xl border border-primary-200 bg-primary-100 dark:border-primary-800 dark:bg-primary-900"
                style={{ width: CARD_WIDTH, height: CARD_HEIGHT, overflow: 'hidden' }}>
                <Image
                  source={{ uri: `https://image.tmdb.org/t/p/w500${item.backdrop_path}` }}
                  style={{ width: CARD_WIDTH, height: CARD_HEIGHT }}
                  className="bg-primary-200 dark:bg-primary-800"
                  resizeMode="cover"
                />

                <LinearGradient
                  pointerEvents="none"
                  colors={['transparent', 'rgba(17,17,17,0.50)', 'rgba(17,17,17,0.92)']}
                  locations={[0, 0.4, 1]}
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: GRADIENT_HEIGHT,
                  }}
                />

                <View
                  className="absolute bottom-0 left-0 right-0 flex-row items-end justify-between px-4 pb-3.5 pt-10"
                  pointerEvents="box-none">
                  <View className="min-w-0 flex-1 pr-3" style={{ maxWidth: '68%' }}>
                    <Text
                      className="font-SpaceGrotesk-SemiBold text-lg text-primary-50"
                      numberOfLines={1}
                      ellipsizeMode="tail">
                      {item.title}
                    </Text>

                    <View className="mt-1 flex-row flex-wrap items-center gap-x-2 gap-y-0.5">
                      <Text className="font-SpaceGrotesk-Regular text-sm text-primary-300">
                        {item.release_date?.split('-')[0]}
                      </Text>
                      <Star size={14} color="#fbbf24" fill="#fbbf24" />
                      <Text className="font-SpaceGrotesk-Regular text-sm text-primary-300">
                        {item.vote_average?.toFixed(1)}
                      </Text>
                    </View>
                  </View>

                  <TouchableOpacity
                    disabled={loadingId === item.id}
                    onPress={async () => {
                      haptics.action();
                      setLoadingId(item.id);
                      await onAddToLibrary(item.id);
                      setLoadingId(null);
                    }}
                    className="shrink-0 rounded-lg border border-primary-50/20 bg-primary-950/45 px-3 py-1">
                    {loadingId === item.id ? (
                      <ActivityIndicator size="small" color="#fafafa" />
                    ) : (
                      <Text className="font-SpaceGrotesk-SemiBold text-sm text-primary-50">+ Add</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            </View>
          )}
        />

        {showPager && (
          <View className="mt-1 flex-row items-center justify-center gap-1">
            {movies.map((m, i) => (
              <View
                key={m.id}
                className={`h-1 rounded-full ${
                  i === activeIndex
                    ? 'w-4 bg-primary-600 dark:bg-primary-400'
                    : 'w-1.5 bg-primary-300 dark:bg-primary-600'
                }`}
              />
            ))}
          </View>
        )}
      </View>
    </View>
  );
}
