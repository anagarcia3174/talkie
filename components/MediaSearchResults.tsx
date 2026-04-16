import { View, Text, TouchableOpacity, Image, ScrollView, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ImageOff, Star } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { Media } from '~/types/supabaseTypes';
import { useTheme } from '~/hooks/useTheme';

const ROW_GAP = 16;
const SCREEN_WIDTH = Dimensions.get('window').width;
/** Content width under `px-4` (16 + 16) */
const MEDIA_CONTENT_WIDTH = SCREEN_WIDTH - 32;
/** TMDB poster aspect: width : height = 2 : 3 */
const POSTER_ASPECT = 3 / 2;

const GRADIENT_COLORS = ['transparent', 'rgba(17,17,17,0.50)', 'rgba(17,17,17,0.92)'] as const;
const GRADIENT_LOCATIONS = [0, 0.4, 1] as const;

function chunkMedia<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    out.push(arr.slice(i, i + size));
  }
  return out;
}

/** Poster first; backdrop only as fallback when no poster. */
function mediaImageUri(item: Media): string | null {
  if (item.poster_path) {
    return `https://image.tmdb.org/t/p/w500${item.poster_path}`;
  }
  if (item.backdrop_path) {
    return `https://image.tmdb.org/t/p/w780${item.backdrop_path}`;
  }
  return null;
}

type MediaSearchCardProps = {
  item: Media;
  width: number;
  height: number;
  variant: 'hero' | 'compact';
  onPress: () => void;
};

function MediaSearchCard({ item, width, height, variant, onPress }: MediaSearchCardProps) {
  const theme = useTheme();
  const gradientH = Math.round(height * 0.58);
  const uri = mediaImageUri(item);
  const year = item.release_date?.split('-')[0];
  const rating = item.vote_average != null ? item.vote_average.toFixed(1) : null;
  const iconSize = variant === 'hero' ? 14 : 12;
  const hasMeta = !!year || !!rating;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      className="overflow-hidden rounded-2xl border border-primary-200 bg-primary-200 dark:border-primary-800 dark:bg-primary-800"
      style={{ width, height }}>
      {uri ? (
        <Image source={{ uri }} style={{ width, height }} resizeMode="cover" />
      ) : (
        <View
          style={{ width, height }}
          className="items-center justify-center bg-primary-400 dark:bg-primary-800">
          <ImageOff size={variant === 'hero' ? 48 : 36} color={theme.primary[700]} />
        </View>
      )}
      <LinearGradient
        pointerEvents="none"
        colors={GRADIENT_COLORS}
        locations={GRADIENT_LOCATIONS}
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: gradientH,
        }}
      />
      {hasMeta && (
        <View
          className={`absolute bottom-0 left-0 right-0 flex-row items-center px-3 pb-2.5 ${
            variant === 'hero' ? 'pt-7' : 'pt-5'
          }`}
          style={{ gap: 6 }}
          pointerEvents="box-none">
          {!!year && (
            <Text className="font-SpaceGrotesk-Regular text-sm text-primary-300">{year}</Text>
          )}
          {!!year && !!rating && <Text className="text-xs text-primary-400">•</Text>}
          {!!rating && (
            <>
              <Star size={iconSize} color="#fbbf24" fill="#fbbf24" />
              <Text className="font-SpaceGrotesk-Regular text-sm text-primary-300">{rating}</Text>
            </>
          )}
        </View>
      )}
    </TouchableOpacity>
  );
}

export type MediaSearchBodyProps = {
  sortedMediaResults: Media[];
  bottomInset: number;
};

export function MediaSearchBody({ sortedMediaResults, bottomInset }: MediaSearchBodyProps) {
  const router = useRouter();

  const goMedia = (item: Media) => {
    router.push({
      pathname: '/media/[id]',
      params: {
        id: item.id.toString(),
        mediaData: JSON.stringify(item),
      },
    });
  };

  /** One horizontal gap between the two bento columns */
  const bentoInnerW = MEDIA_CONTENT_WIDTH - ROW_GAP;
  const heroW = (bentoInnerW * 2) / 3;
  const sideW = bentoInnerW / 3;
  const heroH = heroW * POSTER_ASPECT;
  const sidePosterH = sideW * POSTER_ASPECT;

  const bottomCellW = (MEDIA_CONTENT_WIDTH - 2 * ROW_GAP) / 3;
  const bottomCellH = bottomCellW * POSTER_ASPECT;

  const scrollContent = {
    gap: ROW_GAP,
    paddingBottom: bottomInset + 16,
  } as const;

  if (sortedMediaResults.length === 1) {
    const w = MEDIA_CONTENT_WIDTH;
    const h = w * POSTER_ASPECT;
    return (
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={scrollContent}>
        <MediaSearchCard
          item={sortedMediaResults[0]}
          width={w}
          height={h}
          variant="hero"
          onPress={() => goMedia(sortedMediaResults[0])}
        />
      </ScrollView>
    );
  }

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={scrollContent}>
      <View className="flex-row" style={{ gap: ROW_GAP, alignItems: 'flex-start' }}>
        <View style={{ width: heroW }}>
          <MediaSearchCard
            item={sortedMediaResults[0]}
            width={heroW}
            height={heroH}
            variant="hero"
            onPress={() => goMedia(sortedMediaResults[0])}
          />
        </View>
        <View style={{ width: sideW, gap: ROW_GAP }}>
          {sortedMediaResults.length === 2 ? (
            <MediaSearchCard
              item={sortedMediaResults[1]}
              width={sideW}
              height={sidePosterH}
              variant="compact"
              onPress={() => goMedia(sortedMediaResults[1])}
            />
          ) : (
            <>
              <MediaSearchCard
                item={sortedMediaResults[1]}
                width={sideW}
                height={sidePosterH}
                variant="compact"
                onPress={() => goMedia(sortedMediaResults[1])}
              />
              {sortedMediaResults[2] ? (
                <MediaSearchCard
                  item={sortedMediaResults[2]}
                  width={sideW}
                  height={sidePosterH}
                  variant="compact"
                  onPress={() => goMedia(sortedMediaResults[2])}
                />
              ) : null}
            </>
          )}
        </View>
      </View>

      {sortedMediaResults.length > 3 && (
        <View className="flex-row flex-wrap" style={{ gap: ROW_GAP }}>
          {sortedMediaResults.slice(3, 6).map((item) => (
            <View key={item.id} style={{ width: bottomCellW }}>
              <MediaSearchCard
                item={item}
                width={bottomCellW}
                height={bottomCellH}
                variant="compact"
                onPress={() => goMedia(item)}
              />
            </View>
          ))}
        </View>
      )}

      {sortedMediaResults.length > 6 &&
        chunkMedia(sortedMediaResults.slice(6), 3).map((row, rowIdx) => (
          <View key={rowIdx} className="flex-row flex-wrap" style={{ gap: ROW_GAP }}>
            {row.map((item) => (
              <View key={item.id} style={{ width: bottomCellW }}>
                <MediaSearchCard
                  item={item}
                  width={bottomCellW}
                  height={bottomCellH}
                  variant="compact"
                  onPress={() => goMedia(item)}
                />
              </View>
            ))}
          </View>
        ))}
    </ScrollView>
  );
}
