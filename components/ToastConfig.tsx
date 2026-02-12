import { View, Text, Dimensions, TouchableOpacity } from 'react-native';
import { BaseToastProps } from 'react-native-toast-message';

const screenWidth = Dimensions.get('window').width;

export const toastConfig = {
  info: (props: BaseToastProps) => (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={props.onPress}
      className="mx-3 rounded-2xl bg-primary-800 px-5 py-3 shadow-lg dark:bg-primary-200"
      style={{
        width: screenWidth - 24,
        alignSelf: 'center',
      }}>
      <Text className="font-SpaceGrotesk-SemiBold text-lg text-primary-50 dark:text-primary-950">
        {props.text1}
      </Text>
      {props.text2 && (
        <Text className="mt-1 font-SpaceGrotesk-Regular text-base text-primary-50 opacity-90 dark:text-primary-950">
          {props.text2}
        </Text>
      )}
    </TouchableOpacity>
  ),

  success: (props: BaseToastProps) => (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={props.onPress}
      className="mx-3 rounded-2xl border border-green-400 bg-green-500 px-5 py-3 shadow-lg dark:border-green-500 dark:bg-green-600"
      style={{
        width: screenWidth - 24,
        alignSelf: 'center',
      }}>
      <Text className="font-SpaceGrotesk-SemiBold text-lg text-primary-50">{props.text1}</Text>
      {props.text2 && (
        <Text className="mt-1 font-SpaceGrotesk-Regular text-base text-primary-50 opacity-90">
          {props.text2}
        </Text>
      )}
    </TouchableOpacity>
  ),

  error: (props: BaseToastProps) => (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={props.onPress}
      className="mx-3 rounded-2xl border border-red-400 bg-red-500 px-5 py-3 shadow-lg dark:border-red-500 dark:bg-red-600"
      style={{
        width: screenWidth - 24,
        alignSelf: 'center',
      }}>
      <Text className="font-SpaceGrotesk-Bold text-lg text-primary-50">{props.text1}</Text>
      {props.text2 && (
        <Text className="mt-1 font-SpaceGrotesk-Regular text-base text-primary-50 opacity-90">
          {props.text2}
        </Text>
      )}
    </TouchableOpacity>
  ),
};
