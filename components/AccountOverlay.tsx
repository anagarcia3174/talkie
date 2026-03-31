import { useRef, useEffect } from 'react';
import { Text, TouchableOpacity, Modal, Animated, View, Easing } from 'react-native';
import { BlurView } from 'expo-blur';
import { useTheme } from '~/hooks/useTheme';
import { X } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { haptics } from '~/utils/haptics';

interface MenuOverlayProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (operation: string) => void;
}

export default function AccountOverlay({ visible, onClose, onSubmit }: MenuOverlayProps) {
  const theme = useTheme();
  const translateY = useRef(new Animated.Value(50)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  const primaryOptions = [
    {
      id: 'edit_profile',
      title: 'Edit Profile',
      onPress: () => {
        onSubmit('edit_profile');
      },
    },
    {
      id: 'blocked_users',
      title: 'Blocked Users',
      onPress: () => {
        onSubmit('blocked_users');
      },
    },
    {
      id: 'sign_out',
      title: 'Sign Out',
      onPress: () => {
        onSubmit('sign_out');
      },
    },
  ];

  const destructiveOption = {
    id: 'delete_account',
    title: 'Delete Account',
    onPress: () => {
      haptics.warning();
      onSubmit('delete_account');
    },
  };

  useEffect(() => {
    if (visible) {
      translateY.setValue(40);
      opacity.setValue(0);

      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 0,
          duration: 220,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 40,
          duration: 180,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={onClose}>
        <BlurView
          intensity={theme.isDark ? 70 : 80}
          tint={theme.isDark ? 'dark' : 'light'}
          className="flex-1">
          <SafeAreaView className="flex-1 px-4">
            <View className='flex items-end'>
              <TouchableOpacity onPress={onClose} className="p-2">
                <X size={24} color={theme.primary[800]} />
              </TouchableOpacity>
            </View>
            <View className="flex-1 justify-end px-6 pb-10">
              <Animated.View
                style={{
                  opacity,
                  transform: [{ translateY }],
                }}
                className="w-full">
                {/* Primary actions */}
                {primaryOptions.map((option) => (
                  <TouchableOpacity
                    key={option.id}
                    onPress={option.onPress}
                    className="border-b border-neutral-200 py-4 dark:border-neutral-800">
                    <Text className="font-SpaceGrotesk-Regular text-xl text-primary-900 dark:text-primary-200">
                      {option.title}
                    </Text>
                  </TouchableOpacity>
                ))}

                {/* Spacer */}
                <View className="h-6" />

                {/* Delete Account */}
                <TouchableOpacity onPress={destructiveOption.onPress} className="py-4">
                  <Text className="font-SpaceGrotesk-Regular text-lg text-red-500">
                    {destructiveOption.title}
                  </Text>
                </TouchableOpacity>
              </Animated.View>
            </View>
          </SafeAreaView>
        </BlurView>
      </TouchableOpacity>
    </Modal>
  );
}
