import { useState, useEffect } from 'react';
import {
  View,
  Text,
  Pressable,
  Image,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Profile } from '~/types/supabaseTypes';
import { Camera, Globe, Pencil, X } from 'lucide-react-native';
import { useTheme } from '~/hooks/useTheme';
import Toast from 'react-native-toast-message';
import { SaveFormat, ImageManipulator } from 'expo-image-manipulator';
import { haptics } from '~/utils/haptics';
import BottomSheet from './BottomSheet';

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
    <BottomSheet isVisible={visible} onClose={onClose}>
      <View className="flex-row items-center justify-between">
        <Text className="font-SpaceGrotesk-SemiBold text-xl text-primary-950 dark:text-primary-50">
          Edit Profile
        </Text>
        <TouchableOpacity
          onPress={onClose}
          className="rounded-lg bg-primary-200 p-1  dark:bg-primary-800">
          <X size={20} color={theme.primary[950]} strokeWidth={2} />
        </TouchableOpacity>
      </View>

      <Pressable
        className="mb-4 self-center"
        onPress={() => {
          haptics.action();
          pickImage();
        }}>
        <View className="relative">
          {imageUri ? (
            <Image
              source={{ uri: imageUri }}
              className={`h-20 w-20 rounded-full ${imageUri !== (avatar ?? null) ? 'border-2 border-primary-700' : ''}`}
            />
          ) : (
            <View className="h-20 w-20 items-center justify-center rounded-full bg-primary-200 dark:bg-primary-800">
              <Pencil size={28} color={theme.primary[500]} />
            </View>
          )}
          {imageUri && (
            <View className="absolute bottom-0 right-0 h-6 w-6 items-center justify-center rounded-full bg-primary-900 dark:bg-primary-100">
              <Pencil size={11} color={theme.primary[100]} />
            </View>
          )}
        </View>
      </Pressable>
      <View>
        <Text className="mb-1 font-SpaceGrotesk-Medium text-sm uppercase text-primary-700 dark:text-primary-300">
          Display Name
        </Text>
        <TextInput
          className="rounded-xl bg-primary-200 px-4 py-3 font-SpaceGrotesk-Regular text-primary-950 dark:bg-primary-800 dark:text-primary-50"
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
      <View>
        <Text className="mb-1 font-SpaceGrotesk-Medium text-sm uppercase text-primary-700 dark:text-primary-300">
          Bio
        </Text>
        <TextInput
          className="min-h-[60px] rounded-xl bg-primary-200 px-4 py-3 font-SpaceGrotesk-Regular text-primary-950 dark:bg-primary-800 dark:text-primary-50"
          value={userBio}
          onChangeText={setUserBio}
          cursorColor={theme.primary[700]}
          selectionColor={theme.primary[700]}
          placeholder="Bio"
          placeholderTextColor={theme.primary[500]}
          multiline
          numberOfLines={3}
          maxLength={300}
        />
        <Text className="mt-1 text-right text-xs text-primary-500">{userBio.length}/300</Text>
      </View>
      <View className="mb-6">
        <Text className="mb-1 font-SpaceGrotesk-Medium text-sm uppercase text-primary-700 dark:text-primary-300">
          Visibility
        </Text>

        <View className="flex-row gap-2">
          {[true, false].map((option) => {
            const selected = userIsPrivate === option;

            return (
              <TouchableOpacity
                key={option ? 'private' : 'public'}
                onPress={() => setUserIsPrivate(option)}
                className={`flex-1 flex-row items-center justify-between rounded-xl px-3 py-3 ${
                  userIsPrivate === option
                    ? 'bg-primary-900 dark:bg-primary-100 '
                    : 'bg-primary-200 dark:bg-primary-800'
                }`}>
                <View className="flex-row items-center gap-x-1">
                  <Globe
                    size={15}
                    color={userIsPrivate === option ? theme.primary[100] : theme.primary[500]}
                  />
                  <Text
                    className={`font-SpaceGrotesk-Medium text-sm ${
                      userIsPrivate === option
                        ? 'text-primary-100 dark:text-primary-900'
                        : 'text-primary-500'
                    }`}>
                    {option ? 'Private' : 'Public'}
                  </Text>
                </View>
                {userIsPrivate === option && (
                  <View className="m-1 h-1.5 w-1.5 rounded-full bg-primary-100 p-1 dark:bg-primary-900" />
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Button */}
      <Pressable
        disabled={!hasChanges}
        className={`rounded-xl px-4 py-3 ${
          hasChanges ? 'bg-primary-950 dark:bg-primary-50' : 'bg-gray-300 dark:bg-primary-800'
        }`}
        onPress={() => {
          haptics.action();
          handleSubmit();
        }}>
        <Text className="text-center font-SpaceGrotesk-Medium text-primary-50 dark:text-primary-900">
          Save Changes
        </Text>
      </Pressable>
    </BottomSheet>
  );
}
