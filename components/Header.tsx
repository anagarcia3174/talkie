import { View, Text, TouchableOpacity, Image } from "react-native";
import { MessageCircle, Star } from "lucide-react-native";

interface Props {
  onReviewsPress?: () => void;
  onCommentsPress?: () => void;
}

export function Header({ onReviewsPress, onCommentsPress }: Props) {


  return (
    <View className="flex-row items-center px-4">
      {/* Logo */}
      <View className="flex-row items-center">
        <Text className="font-SpaceGrotesk-Bold text-3xl text-primary-950 dark:text-primary-50">Noat</Text>
      </View>
    </View>
  );
}
