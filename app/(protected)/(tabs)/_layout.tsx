import { Tabs } from 'expo-router';
import { Home, Library, Search, User } from 'lucide-react-native';
import { useTheme } from '~/hooks/useTheme';

export default function Layout() {
  const theme = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: true,
        tabBarActiveTintColor: theme.primary[900],
        tabBarInactiveTintColor: theme.primaryOpacity[700],
        tabBarStyle: {
          backgroundColor: theme.primary[50],
          position: 'absolute',
          borderTopWidth: 0,
          elevation: 0,
          height: 70,
        },
        tabBarIconStyle: {
          marginTop: 2,
        },
      }}>
      <Tabs.Screen
        name="Home"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <Home color={color} strokeWidth={focused ? 2 : 1.5} />
          ),
        }}
      />
      <Tabs.Screen
        name="Search"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <Search color={color} strokeWidth={focused ? 2 : 1.5} />
          ),
        }}
      />
      <Tabs.Screen
        name="Lists"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <Library color={color} strokeWidth={focused ? 2 : 1.5} />
          ),
        }}
      />
      <Tabs.Screen
        name="Profile"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <User color={color} strokeWidth={focused ? 2 : 1.5} />
          ),
        }}
      />
    </Tabs>
  );
}
