import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
  return (
    <>
      <Stack>
        {/* Our first screen will be the 'index' file */}
        <Stack.Screen 
          name="index" 
          options={{ title: 'Welcome' }} 
        />
        
        {/* This screen will be the 'register' file */}
        <Stack.Screen 
          name="register" 
          options={{ title: 'Register New User' }} 
        />

        <Stack.Screen 
          name="login" 
          options={{ title: 'Login with your Face' }} 
        />

        {/* We will add a 'login' screen here later */}

      </Stack>
      <StatusBar style="auto" />
    </>
  );
}