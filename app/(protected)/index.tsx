import { SafeAreaView } from 'react-native-safe-area-context';
import { Pressable, Text } from 'react-native';
import { useClerk } from '@clerk/clerk-expo';
export default function Home() {
  const { signOut } = useClerk();

  return (
    <SafeAreaView>
      <Text> Home</Text>
      <Pressable
        onPress={async () => {
          await signOut();
        }}
        className="bg-black p-2">
        <Text className="text-white">Sign Out</Text>
      </Pressable>
    </SafeAreaView>
  );
}
