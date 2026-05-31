import { Tabs, Redirect } from 'expo-router'
import { View, Text, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useAuth } from '@/contexts/AuthContext'
import { useCart } from '@/contexts/CartContext'
import { COLORS } from '@/constants/theme'

function CartTabIcon({ color, size }: { color: string; size: number }) {
  const { itemCount } = useCart()
  return (
    <View>
      <Ionicons name="cart-outline" size={size} color={color} />
      {itemCount > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{itemCount > 9 ? '9+' : itemCount}</Text>
        </View>
      )}
    </View>
  )
}

export default function TabsLayout() {
  const { user } = useAuth()
  if (!user) return <Redirect href="/(auth)/welcome" />

  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: COLORS.primary },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: '800', fontSize: 18 },
        tabBarStyle: {
          backgroundColor: COLORS.primary,
          borderTopColor: 'rgba(167,139,250,0.2)',
          paddingBottom: 6,
          paddingTop: 6,
          height: 62,
        },
        tabBarActiveTintColor: COLORS.cta,
        tabBarInactiveTintColor: 'rgba(255,255,255,0.45)',
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          headerTitle: () => (
            <View style={{ flexDirection: 'row', alignItems: 'flex-end' }}>
              <Text style={{ color: '#fff', fontSize: 20, fontWeight: '800' }}>amazonia</Text>
              <Text style={{ color: COLORS.cta, fontSize: 26, fontWeight: '900', lineHeight: 28 }}>.</Text>
            </View>
          ),
          tabBarIcon: ({ color, size }) => <Ionicons name="home-outline" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="products"
        options={{
          title: 'Browse',
          headerTitle: 'Browse Products',
          tabBarIcon: ({ color, size }) => <Ionicons name="search-outline" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="cart"
        options={{
          title: 'Cart',
          headerTitle: 'My Cart',
          tabBarIcon: ({ color, size }) => <CartTabIcon color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="orders"
        options={{
          title: 'Orders',
          headerTitle: 'My Orders',
          tabBarIcon: ({ color, size }) => <Ionicons name="receipt-outline" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          headerTitle: 'My Account',
          tabBarIcon: ({ color, size }) => <Ionicons name="person-outline" size={size} color={color} />,
        }}
      />
    </Tabs>
  )
}

const styles = StyleSheet.create({
  badge: {
    position: 'absolute', top: -5, right: -8,
    backgroundColor: COLORS.error, borderRadius: 999,
    minWidth: 17, height: 17, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 3,
  },
  badgeText: { color: '#fff', fontSize: 10, fontWeight: '800' },
})
