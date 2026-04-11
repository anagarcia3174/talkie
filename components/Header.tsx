import { View, Text, TouchableOpacity } from "react-native";
import {  Popcorn } from "lucide-react-native";
import { useTheme } from "~/hooks/useTheme";


export function Header() {
  const theme = useTheme();

  return (
    <View className="flex-row items-center justify-between px-4">
      <View className="flex-row items-center">
        <Text className="font-SpaceGrotesk-Bold text-3xl text-primary-950 dark:text-primary-50">Talkie</Text>
      </View>
      <View>
        <TouchableOpacity disabled={true}>
          <Popcorn color={theme.primary[900]} strokeWidth={1.5} size={24}/>
        </TouchableOpacity>
      </View>
    </View>
  );
}
