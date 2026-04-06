import { Tabs } from 'expo-router';
import { colors } from '@/theme';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.border.default },
        tabBarActiveTintColor: colors.coral,
        tabBarInactiveTintColor: colors.text.secondary,
      }}
    />
  );
}
