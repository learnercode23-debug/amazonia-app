import { Redirect } from 'expo-router'
import { useAuth } from '@/contexts/AuthContext'
import { View, ActivityIndicator } from 'react-native'
import { COLORS } from '@/constants/theme'

export default function Index() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.primary }}>
        <ActivityIndicator color={COLORS.cta} size="large" />
      </View>
    )
  }

  return user ? <Redirect href="/(tabs)/" /> : <Redirect href="/(auth)/welcome" />
}
