// import { BlurView } from 'expo-blur';
// import { Star } from 'lucide-react-native';
// import { Image, Text, View, Dimensions, TouchableOpacity } from 'react-native';
// import Carousel from 'react-native-reanimated-carousel';
// import { Review } from '~/types/supabaseTypes';

// const { width } = Dimensions.get('window');

// interface NotableReviewsSectionProps {
//   reviews: Review[];
// }

// export default function NotableReviewsSection({ reviews }: NotableReviewsSectionProps) {
//   const getAvatarUrl = (avatarPath: string | null) => {
//     if (!avatarPath) return null;
//     if (avatarPath.startsWith('/https://')) return avatarPath.substring(1);
//     return `https://image.tmdb.org/t/p/w200${avatarPath}`;
//   };

//   const truncateContent = (content: string, maxLength: number = 120) => {
//     if (content.length <= maxLength) return content;
//     return content.substring(0, maxLength).trim() + '...';
//   };

//   return (
//     <View className="px-4">
//       <Text className="mb-3 font-SpaceGrotesk-SemiBold text-2xl text-primary-950 dark:text-primary-50">
//         Notable Reviews
//       </Text>

//       <Carousel
//         width={width}
//         height={160}
//         style={{ alignSelf: 'center' }}
//         data={reviews}
//         loop
//         autoPlay
//         autoPlayInterval={6000}
//         scrollAnimationDuration={600}
//         mode="vertical-stack"
//         modeConfig={{
//             snapDirection: 'left',
//           stackInterval: 18,
//           opacityInterval: 1, // 👈 this removes fade on side cards
//           scaleInterval: 0,
//         }}
//         pagingEnabled
//         renderItem={({ item }) => (
//           <TouchableOpacity activeOpacity={0.9} className="mx-4">
//             <BlurView
//               intensity={60}
//               tint="systemMaterialDark"
//               className="h-full overflow-hidden rounded-2xl shadow-lg">
//               <View className="flex-1 flex-row bg-primary-100/90 dark:bg-primary-900/90">
//                 {/* Poster (smaller, cleaner) */}
//                 {item.movie?.poster_path && (
//                   <Image
//                     source={{ uri: `https://image.tmdb.org/t/p/w200${item.movie.poster_path}` }}
//                     className="h-full w-24 rounded-l-2xl"
//                     resizeMode="cover"
//                   />
//                 )}

//                 {/* Content */}
//                 <View className="flex-1 p-3">
//                   {/* Header */}
//                   <View className="mb-2 flex-row items-center gap-x-3">
//                     {getAvatarUrl(item.author_details.avatar_path) ? (
//                       <Image
//                         source={{ uri: getAvatarUrl(item.author_details.avatar_path)! }}
//                         className="h-10 w-10 rounded-full"
//                         resizeMode="cover"
//                       />
//                     ) : (
//                       <View className="h-10 w-10 items-center justify-center rounded-full bg-primary-600 dark:bg-primary-500">
//                         <Text className="font-SpaceGrotesk-Bold text-base text-primary-50">
//                           {item.author_details.name?.[0] ||
//                             item.author_details.username?.[0] ||
//                             '?'}
//                         </Text>
//                       </View>
//                     )}

//                     <View className="flex-1">
//                       <Text
//                         className="font-SpaceGrotesk-SemiBold text-sm text-primary-950 dark:text-primary-50"
//                         numberOfLines={1}
//                         ellipsizeMode="tail">
//                         {item.author_details.name || item.author_details.username}
//                       </Text>
//                       <Text
//                         className="font-SpaceGrotesk-Regular text-xs text-primary-700 dark:text-primary-300"
//                         numberOfLines={1}
//                         ellipsizeMode="tail">
//                         reviewed {item.movie?.title}
//                       </Text>
//                     </View>

//                     {item.author_details.rating && (
//                       <View className="flex-row items-center gap-x-1 rounded-md bg-primary-200 px-2 py-0.5 dark:bg-primary-700">
//                         <Star size={12} color="gold" fill="gold" />
//                         <Text className="font-SpaceGrotesk-SemiBold text-xs text-primary-950 dark:text-primary-50">
//                           {item.author_details.rating.toFixed(1)}
//                         </Text>
//                       </View>
//                     )}
//                   </View>

//                   {/* Review Content */}
//                   <Text
//                     className="font-SpaceGrotesk-Regular text-sm leading-5 text-primary-800 dark:text-primary-200"
//                     numberOfLines={4}
//                     ellipsizeMode="tail">
//                     {truncateContent(item.content, 140)}
//                   </Text>
//                 </View>
//               </View>
//             </BlurView>
//           </TouchableOpacity>
//         )}
//       />
//     </View>
//   );
// }
