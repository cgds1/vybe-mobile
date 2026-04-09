import { Tabs } from 'expo-router';
import { AnimatedTabBar } from '@/shared/components/AnimatedTabBar';
import { useChatStore } from '@/features/chat/store/chatStore';

export default function TabsLayout() {
  const unreadCount = useChatStore((s) => s.unreadCount);

  return (
    <Tabs
      tabBar={(props) => <AnimatedTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tabs.Screen
        name="index"
        options={{ tabBarLabel: 'Descubrir' }}
      />
      <Tabs.Screen
        name="chats"
        options={{
          tabBarLabel: 'Mensajes',
          ...(unreadCount > 0 ? { tabBarBadge: unreadCount } : {}),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{ tabBarLabel: 'Perfil' }}
      />
    </Tabs>
  );
}
