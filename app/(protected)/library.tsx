import { SafeAreaView } from "react-native-safe-area-context";
import { Text } from "react-native";
export default function Library() {
    return (
        <SafeAreaView className='flex-1 bg-primary-50 dark:bg-primary-950'> 
            <Text>Search</Text>
        </SafeAreaView>
    )
}