import { Tabs } from 'expo-router';
import { Bell, Home, Library, Search, User } from 'lucide-react-native';
import { useTheme } from '~/hooks/useTheme';


export default function Layout() {
  const theme = useTheme();
  
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarActiveTintColor: theme.primary[900],
        tabBarInactiveTintColor: theme.primaryOpacity[700],
        tabBarStyle: {
          backgroundColor: theme.primary[50],
          position: 'absolute',
          borderTopWidth: 0,
          elevation: 0,
          height: 70,
        },
      }}>
      <Tabs.Screen
        name="home"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <Home color={color} strokeWidth={focused ? 2 : 1.5} />
          ),
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <Search color={color} strokeWidth={focused ? 2 : 1.5} />
          ),
        }}
      />
      <Tabs.Screen
        name="library"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <Library color={color} strokeWidth={focused ? 2 : 1.5} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <User color={color} strokeWidth={focused ? 2 : 1.5} />
          ),
        }}
      />
    </Tabs>
  );
}
