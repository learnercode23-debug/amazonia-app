import { useEffect } from 'react'
import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import * as SplashScreen from 'expo-splash-screen'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { AuthProvider, useAuth } from '@/contexts/AuthContext'
import { CartProvider } from '@/contexts/CartContext'

SplashScreen.preventAutoHideAsync()

function RootLayoutNav() {
  const { loading } = useAuth()

  useEffect(() => {
    if (!loading) SplashScreen.hideAsync()
  }, [loading])

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(auth)" options={{ animation: 'fade' }} />
      <Stack.Screen name="(tabs)" options={{ animation: 'fade' }} />
      <Stack.Screen
        name="product/[id]"
        options={{
          headerShown: true,
          headerTitle: '',
          headerBackTitle: 'Back',
          headerTintColor: '#7C3AED',
          headerStyle: { backgroundColor: '#F5F3FF' },
          animation: 'slide_from_right',
        }}
      />
    </Stack>
  )
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <CartProvider>
          <StatusBar style="light" backgroundColor="#1E1B4B" />
          <RootLayoutNav />
        </CartProvider>
      </AuthProvider>
    </GestureHandlerRootView>
  )
}
