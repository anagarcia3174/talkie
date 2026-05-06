import { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  Pressable,
  TouchableWithoutFeedback,
  Image,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Profile } from '~/types/supabaseTypes';
import { Camera } from 'lucide-react-native';
import { useTheme } from '~/hooks/useTheme';
import Toast from 'react-native-toast-message';
import { SaveFormat, ImageManipulator } from 'expo-image-manipulator';
import { haptics } from '~/utils/haptics';

interface ProfileActionsModalProps {
  visible: boolean;
  onClose: () => void;
  avatar: string | null;
  displayName: string;
  bio: string | null;
  isPrivate: boolean;
  onUpdateProfile: (image?: ImagePicker.ImagePickerAsset, data?: Partial<Profile>) => Promise<void>;
}

const MAX_MB = 6;

export default function ProfileActionsModal({
  visible,
  onClose,
  avatar,
  displayName,
  bio,
  isPrivate,
  onUpdateProfile,
}: ProfileActionsModalProps) {
  const [imageUri, setImageUri] = useState<string | null>(avatar ?? '');
  const [image, setImage] = useState<ImagePicker.ImagePickerAsset>();
  const [name, setName] = useState(displayName ?? '');
  const [userBio, setUserBio] = useState(bio ?? '');
  const [userIsPrivate, setUserIsPrivate] = useState(isPrivate);
  const theme = useTheme();
  useEffect(() => {
    if (visible) {
      setImageUri(avatar ?? null);
      setName(displayName ?? '');
      setUserBio(bio ?? '');
    }
  }, [visible, avatar, displayName, bio]);

  const getImageSizeMB = async (uri: string) => {
    const blob = await fetch(uri).then((r) => r.blob());
    return blob.size / (1024 * 1024);
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: false,
      aspect: [1, 1],
      quality: 0.8,
      allowsMultipleSelection: false,
    });

    if (result.canceled || !result.assets?.length) return;
    const asset = result.assets[0];

    try {
      const context = ImageManipulator.manipulate(asset.uri);
      const renderedImage = await context.renderAsync();
      const result = await renderedImage.saveAsync({
        compress: 0.8,
        format: SaveFormat.JPEG,
      });

      const sizeMB = await getImageSizeMB(result.uri);

      if (sizeMB > MAX_MB) {
        Toast.show({
          type: 'error',
          text1: `The image chosen is too large. Please choose an image under ${MAX_MB} MB.`,
          position: 'top',
          visibilityTime: 4000,
          autoHide: true,
        });
        return;
      }

      setImage({
        ...asset,
        uri: result.uri,
        mimeType: 'image/jpeg',
      });
      setImageUri(result.uri);
    } catch {
      Toast.show({
        type: 'error',
        text1: 'There was an error proccessing your image.',
        position: 'top',
        visibilityTime: 4000,
        autoHide: true,
      });
    }
  };

  const hasChanges =
    (imageUri !== (avatar ?? null) ||
      name !== (displayName ?? '') ||
      userBio !== (bio ?? '') ||
      userIsPrivate !== isPrivate) &&
    name.trim().length > 0;

  const handleSubmit = async () => {
    if (!name.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Your display name cannot be empty',
        position: 'top',
        visibilityTime: 4000,
        autoHide: true,
      });
      return;
    }

    const updates: Partial<Profile> = {};

    if (name !== displayName) {
      updates.display_name = name;
    }
    const normalizedBio = userBio.trim() === '' ? null : userBio;

    if (normalizedBio !== bio) {
      updates.bio = normalizedBio;
    }

    if (userIsPrivate !== isPrivate) {
      updates.is_private = userIsPrivate;
    }

    const hasImage = image && imageUri && imageUri !== avatar;
    const hasUpdates = Object.keys(updates).length > 0;

    if (!hasImage && !hasUpdates) {
      onClose();
      return;
    }
    onClose();

    onUpdateProfile(hasImage ? image : undefined, hasUpdates ? updates : undefined);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent>
      {/* Overlay */}
      <TouchableWithoutFeedback onPress={onClose}>
        <View className="flex-1 bg-black/60 dark:bg-black/70" />
      </TouchableWithoutFeedback>

      {/* Floating Card */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        pointerEvents="box-none"
        className="absolute inset-0 items-center justify-center p-6">
        <View className="w-full max-w-md rounded-2xl bg-primary-100 p-6 dark:bg-primary-900">
          <Text className="mb-4 font-SpaceGrotesk-Medium text-lg text-primary-950 dark:text-primary-50">
            Edit Profile
          </Text>

          {/* Avatar */}
          <Pressable
            className="mb-4 self-center"
            onPress={() => {
              haptics.action();
              pickImage();
            }}>
            {imageUri ? (
              <Image source={{ uri: imageUri }} className="h-20 w-20 rounded-full" />
            ) : (
              <View className="h-20 w-20 items-center justify-center rounded-full bg-primary-200 dark:bg-primary-800">
                <Camera size={28} color="#6b7280" />
              </View>
            )}
          </Pressable>
          <View className="mb-2">
            <Text className="mb-1 text-sm text-primary-700 dark:text-primary-300">
              Display Name
            </Text>
            <TextInput
              className="text-md rounded-xl border border-primary-300 bg-primary-100 px-4 py-2 font-SpaceGrotesk-Regular text-primary-950 focus:border-2 focus:border-primary-950 dark:border-primary-400 dark:bg-primary-900 dark:text-primary-200 focus:dark:border-primary-50"
              value={name}
              onChangeText={setName}
              cursorColor={theme.primary[700]}
              selectionColor={theme.primary[700]}
              placeholder="Display Name"
              placeholderTextColor={theme.primary[500]}
              maxLength={50}
            />
            <Text className="mt-1 text-right text-xs text-primary-500">{name.length}/50</Text>
          </View>
          <View className="mb-2">
            <Text className="mb-1 text-sm text-primary-700 dark:text-primary-300">Bio</Text>
            <TextInput
              className="text-md rounded-xl border border-primary-300 bg-primary-100 px-4 py-2 font-SpaceGrotesk-Regular text-primary-950 focus:border-2 focus:border-primary-950 dark:border-primary-700 dark:bg-primary-900 dark:text-primary-200 focus:dark:border-primary-50"
              value={userBio}
              onChangeText={setUserBio}
              cursorColor={theme.primary[700]}
              selectionColor={theme.primary[700]}
              placeholder="Bio"
              placeholderTextColor={theme.primary[500]}
              multiline
              maxLength={300}
            />
            <Text className="mt-1 text-right text-xs text-primary-500">{userBio.length}/300</Text>
          </View>
          <View className="mb-6">
            <Text className="mb-2 text-sm text-primary-700 dark:text-primary-300">Visibility</Text>

            <View className="flex-row gap-2">
              {[true, false].map((option) => {
                const selected = userIsPrivate === option;

                return (
                  <Pressable
                    key={option ? 'private' : 'public'}
                    onPress={() => setUserIsPrivate(option)}
                    className={`flex-1 rounded-xl border px-3 py-2 ${
                      selected
                        ? 'border-primary-900 bg-primary-900 dark:border-primary-50 dark:bg-primary-50'
                        : 'border-primary-300 bg-primary-100 dark:border-primary-700 dark:bg-primary-900'
                    }`}>
                    <Text
                      className={`text-center capitalize ${
                        selected
                          ? 'font-SpaceGrotesk-SemiBold text-primary-50 dark:text-primary-900'
                          : 'text-primary-700 dark:text-primary-300'
                      }`}>
                      {option ? 'private' : 'public'}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* Button */}
          <Pressable
            disabled={!hasChanges}
            className={`rounded-xl px-4 py-3 ${
              hasChanges ? 'bg-green-700 dark:bg-green-800' : 'bg-gray-300 dark:bg-primary-800'
            }`}
            onPress={() => {
              haptics.action();
              handleSubmit();
            }}>
            <Text className="text-center font-SpaceGrotesk-Medium text-white">Save Changes</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
