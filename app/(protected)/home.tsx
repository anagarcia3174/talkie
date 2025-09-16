import { SafeAreaView } from 'react-native-safe-area-context';
import { Pressable, Text } from 'react-native';
import { useAuth } from '~/context/AuthContext';
export default function Home() {
  const { signOut } = useAuth();

  return (
    <SafeAreaView className='flex-1 bg-primary-100 dark:bg-primary-950'>
      <Text> Home</Text>
      <Pressable onPress={async () => { await signOut()}}><Text>SignOut</Text></Pressable>
    </SafeAreaView>
  );
}
