import { Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '~/hooks/useTheme';
import {
  X,
  UserRoundPen,
  Ban,
  LogOut,
  MessageSquare,
  Bug,
  Mail,
  Trash2,
} from 'lucide-react-native';
import { haptics } from '~/utils/haptics';
import BottomSheet from './BottomSheet';

interface MenuOverlayProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (operation: string) => void;
}

export default function AccountOverlay({ visible, onClose, onSubmit }: MenuOverlayProps) {
  const theme = useTheme();

  const accountOptions = [
    {
      id: 'edit_profile',
      title: 'Edit Profile',
      icon: UserRoundPen,
      onPress: () => onSubmit('edit_profile'),
    },
    {
      id: 'blocked_users',
      title: 'Blocked Users',
      icon: Ban,
      onPress: () => onSubmit('blocked_users'),
    },
    { id: 'sign_out', title: 'Sign Out', icon: LogOut, onPress: () => onSubmit('sign_out') },
  ];

  const supportOptions = [
    { id: 'feedback', title: 'Feedback', icon: MessageSquare, onPress: () => onSubmit('feedback') },
    { id: 'bug_report', title: 'Report A Bug', icon: Bug, onPress: () => onSubmit('bug_report') },
    { id: 'contact_us', title: 'Contact Us', icon: Mail, onPress: () => onSubmit('contact_us') },
  ];

  const destructiveOption = {
    id: 'delete_account',
    title: 'Delete Account',
    onPress: () => {
      haptics.warning();
      onSubmit('delete_account');
    },
  };

  const renderSquareTile = (option: (typeof accountOptions)[number]) => {
    const Icon = option.icon;
    return (
      <TouchableOpacity
        key={option.id}
        activeOpacity={0.8}
        onPressIn={() => haptics.action()}
        onPress={option.onPress}
        className="flex-1 justify-between rounded-2xl bg-primary-200 p-4 dark:bg-primary-800">
        <View className="mb-3 opacity-80">
          <Icon size={18} color={theme.primary[700]} />
        </View>
        <Text className="font-SpaceGrotesk-Medium text-sm leading-5 text-primary-950 dark:text-primary-50">
          {option.title}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderBarTile = (option: (typeof accountOptions)[number]) => {
    const Icon = option.icon;
    return (
      <TouchableOpacity
        key={option.id}
        activeOpacity={0.8}
        onPressIn={() => haptics.action()}
        onPress={option.onPress}
        className="flex-row items-center gap-3 rounded-2xl bg-primary-200 px-4 py-4 dark:bg-primary-800">
        <View className="opacity-80">
          <Icon size={18} color={theme.primary[700]} />
        </View>
        <Text className="font-SpaceGrotesk-Medium text-base leading-6 text-primary-950 dark:text-primary-50">
          {option.title}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <BottomSheet isVisible={visible} onClose={onClose}>
      <View className="flex-row items-center justify-between">
        <Text className="font-SpaceGrotesk-SemiBold text-xl text-primary-950 dark:text-primary-50">
          Settings
        </Text>
        <TouchableOpacity
          onPress={onClose}
          className="rounded-lg bg-primary-200 p-1  dark:bg-primary-800">
          <X size={20} color={theme.primary[950]} strokeWidth={2} />
        </TouchableOpacity>
      </View>

      <View className="mb-1">
        <Text className="mb-2 px-1 text-xs uppercase tracking-widest tracking-widest text-primary-400 dark:text-primary-400">
          Account
        </Text>
        <View className="mb-2 flex-row gap-3">
          {renderSquareTile(accountOptions[0])}
          {renderSquareTile(accountOptions[1])}
        </View>
        {renderBarTile(accountOptions[2])}
      </View>

      <View className="mb-1">
        <Text className="mb-2 px-1 text-xs uppercase tracking-widest tracking-widest text-primary-400 dark:text-primary-400">
          Help & Feedback
        </Text>
        <View className="mb-2 flex-row gap-3">
          {renderSquareTile(supportOptions[0])}
          {renderSquareTile(supportOptions[1])}
        </View>
        {renderBarTile(supportOptions[2])}
      </View>

      <View>
        <Text className="mb-2 px-1 text-xs uppercase tracking-widest tracking-widest text-red-600">
          Danger
        </Text>
        <View className="rounded-2xl border border-red-500/25 bg-primary-200 p-4 dark:bg-primary-800">
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={destructiveOption.onPress}
            className="flex-row items-center gap-3">
            <View className="rounded-xl border border-red-400 bg-red-500/20 p-2 dark:border-red-500 dark:bg-red-400/25">
              <Trash2 size={16} color="#ef4444" />
            </View>
            <Text className="font-SpaceGrotesk-SemiBold text-sm leading-5 text-red-700 dark:text-red-400">
              {destructiveOption.title}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </BottomSheet>
  );
}
