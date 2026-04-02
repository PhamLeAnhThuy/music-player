import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { getStoredUserId } from '../lib/api';
import AppTabs from './AppTabs';
import SignInScreen from '../screens/SignInScreen';

export type RootStackParamList = {
  SignIn: undefined;
  AppTabs: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  const [initialRouteName, setInitialRouteName] = useState<keyof RootStackParamList | null>(null);

  useEffect(() => {
    let mounted = true;
    async function bootstrap() {
      const userId = await getStoredUserId();
      if (!mounted) return;
      setInitialRouteName(userId ? 'AppTabs' : 'SignIn');
    }

    bootstrap();

    return () => {
      mounted = false;
    };
  }, []);

  if (!initialRouteName) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <Stack.Navigator initialRouteName={initialRouteName} screenOptions={{ headerShown: false }}>
      <Stack.Screen name="SignIn" component={SignInScreen} />
      <Stack.Screen name="AppTabs" component={AppTabs} />
    </Stack.Navigator>
  );
}
