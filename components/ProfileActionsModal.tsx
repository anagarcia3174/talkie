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
  Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Profile } from '~/types/supabaseTypes';
import { Camera } from 'lucide-react-native';
import { useTheme } from '~/hooks/useTheme';
import * as ImageManipulator from 'expo-image-manipulator';

interface ProfileActionsModalProps {
  visible: boolean;
  onClose: () => void;
  avatar: string | undefined;
  displayName: string | undefined;
  bio: string | undefined;
  onUploadPicture: (image: ImagePicker.ImagePickerAsset) => Promise<void>;
  onUpdateProfile: (data: Partial<Profile>) => Promise<void>;
}

const MAX_MB = 6;

export default function ProfileActionsModal({
  visible,
  onClose,
  avatar,
  displayName,
  bio,
  onUploadPicture,
  onUpdateProfile,
}: ProfileActionsModalProps) {
  const [imageUri, setImageUri] = useState<string | null>(avatar ?? '');
  const [image, setImage] = useState<ImagePicker.ImagePickerAsset>();
  const [name, setName] = useState(displayName ?? '');
  const [userBio, setUserBio] = useState(bio ?? '');
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
      const manipulated = await ImageManipulator.manipulateAsync(
        asset.uri,
        [{ resize: { width: 512, height: 512 } }],
        {
          compress: 0.8,
          format: ImageManipulator.SaveFormat.JPEG,
        }
      );

      const sizeMB = await getImageSizeMB(manipulated.uri);
      console.log(`Processed avatar: ${sizeMB.toFixed(2)} MB`);

      if (sizeMB > MAX_MB) {
        Alert.alert('Image too large', `Please choose an image under ${MAX_MB} MB`);
        return;
      }

      setImage({
        ...asset,
        uri: manipulated.uri,
        mimeType: 'image/jpeg',
      });
      setImageUri(manipulated.uri);
    } catch (error) {
      console.error('Image processing error:', error);
      Alert.alert('Error', 'Failed to process image');
    }
  };

  const hasChanges =
    (imageUri !== (avatar ?? null) || name !== (displayName ?? '') || userBio !== (bio ?? '')) &&
    name.trim().length > 0;

  const handleSubmit = async () => {
    if (!name.trim()) {
      Alert.alert('Invalid Name', 'Display name cannot be empty');
      return;
    }

    if (image && imageUri && imageUri !== avatar) {
      await onUploadPicture(image);
    }

    const updates: Partial<Profile> = {};
    if (name !== displayName) updates.display_name = name;
    if (userBio !== bio) updates.bio = userBio;

    if (Object.keys(updates).length > 0) {
      await onUpdateProfile(updates);
    }

    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      {/* Overlay */}
      <TouchableWithoutFeedback onPress={onClose}>
        <View className="flex-1 bg-black/50" />
      </TouchableWithoutFeedback>

      {/* Floating Card */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="absolute inset-0 items-center justify-center p-6">
        <View className="w-full max-w-md rounded-2xl bg-primary-50 p-6 dark:bg-primary-950">
          <Text className="mb-4 font-SpaceGrotesk-Medium text-lg text-primary-950 dark:text-primary-50">
            Edit Profile
          </Text>

          {/* Avatar */}
          <Pressable className="mb-4 self-center" onPress={pickImage}>
            {imageUri ? (
              <Image source={{ uri: imageUri }} className="h-20 w-20 rounded-full" />
            ) : (
              <View className="h-20 w-20 items-center justify-center rounded-full bg-primary-200 dark:bg-primary-800">
                <Camera size={28} color="#6b7280" />
              </View>
            )}
          </Pressable>
          <TextInput
            className="text-md mb-4 rounded-xl border border-primary-300 bg-primary-50 px-4 py-2 font-SpaceGrotesk-Regular text-primary-950 focus:border-2 focus:border-primary-950 dark:border-primary-400 dark:bg-primary-900 dark:text-primary-200 focus:dark:border-primary-50"
            value={name}
            onChangeText={setName}
            cursorColor={theme.primary[700]}
            selectionColor={theme.primary[700]}
            placeholder="Display Name"
            placeholderTextColor={theme.primary[500]}
            maxLength={50}
          />
          <TextInput
            className="text-md mb-4 rounded-xl border border-primary-300 bg-primary-50 px-4 py-2 font-SpaceGrotesk-Regular text-primary-950 focus:border-2 focus:border-primary-950 dark:border-primary-700 dark:bg-primary-900 dark:text-primary-200 focus:dark:border-primary-50"
            value={userBio}
            onChangeText={setUserBio}
            cursorColor={theme.primary[700]}
            selectionColor={theme.primary[700]}
            placeholder="Bio"
            placeholderTextColor={theme.primary[500]}
            multiline
            maxLength={300}
          />

          {/* Button */}
          <Pressable
            disabled={!hasChanges}
            className={`rounded-xl px-4 py-3 ${
              hasChanges ? 'bg-green-700 dark:bg-green-800' : 'bg-gray-300 dark:bg-primary-800'
            }`}
            onPress={hasChanges ? handleSubmit : onClose}>
            <Text className="text-center font-SpaceGrotesk-Medium text-white">Save Changes</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
