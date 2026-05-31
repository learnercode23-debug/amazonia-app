import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { useAuth } from '@/contexts/AuthContext'
import { COLORS, RADIUS } from '@/constants/theme'

interface MenuItemProps {
  icon: keyof typeof Ionicons.glyphMap
  label: string
  subtitle?: string
  onPress: () => void
  danger?: boolean
  badge?: string
}

function MenuItem({ icon, label, subtitle, onPress, danger, badge }: MenuItemProps) {
  return (
    <TouchableOpacity style={styles.menuItem} onPress={onPress} activeOpacity={0.7}>
      <View style={[styles.menuIcon, danger && styles.dangerIcon]}>
        <Ionicons name={icon} size={20} color={danger ? COLORS.error : COLORS.accent} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[styles.menuLabel, danger && { color: COLORS.error }]}>{label}</Text>
        {subtitle && <Text style={styles.menuSubtitle}>{subtitle}</Text>}
      </View>
      {badge && (
        <View style={styles.badge}><Text style={styles.badgeText}>{badge}</Text></View>
      )}
      {!danger && <Ionicons name="chevron-forward" size={16} color={COLORS.gray400} />}
    </TouchableOpacity>
  )
}

export default function ProfileScreen() {
  const { user, logout } = useAuth()

  async function handleLogout() {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await logout()
          router.replace('/(auth)/welcome')
        },
      },
    ])
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Profile header */}
      <LinearGradient colors={['#1E1B4B', '#312E81']} style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {user?.name?.charAt(0).toUpperCase() || '?'}
          </Text>
        </View>
        <Text style={styles.userName}>{user?.name || 'Amazonia User'}</Text>
        <Text style={styles.userPhone}>{user?.phone || 'Phone not set'}</Text>
        <View style={[styles.roleBadge, user?.role === 'seller' && styles.sellerBadge]}>
          <Text style={styles.roleText}>
            {user?.role === 'seller' ? '🏪 Seller' : user?.role === 'admin' ? '🛡 Admin' : '🛍️ Customer'}
          </Text>
        </View>
      </LinearGradient>

      {/* Account section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        <View style={styles.menuCard}>
          <MenuItem
            icon="receipt-outline"
            label="My Orders"
            subtitle="Track and manage your orders"
            onPress={() => router.push('/(tabs)/orders')}
          />
          <MenuItem
            icon="heart-outline"
            label="Wishlist"
            subtitle="Your saved products"
            onPress={() => Alert.alert('Coming Soon', 'Wishlist coming in next update!')}
          />
          <MenuItem
            icon="location-outline"
            label="Saved Addresses"
            subtitle="Manage delivery addresses"
            onPress={() => Alert.alert('Coming Soon', 'Address management coming soon!')}
          />
        </View>
      </View>

      {/* Payments section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Payments</Text>
        <View style={styles.menuCard}>
          <MenuItem
            icon="card-outline"
            label="Payment Methods"
            subtitle="eSewa, Khalti, Cash on Delivery"
            onPress={() => Alert.alert('Payments', 'Supported: eSewa, Khalti, COD')}
          />
          <MenuItem
            icon="pricetag-outline"
            label="Coupons & Offers"
            subtitle="Available: SAVE10, FLAT20, NEWUSER"
            onPress={() => Alert.alert('Active Coupons', 'SAVE10 — 10% off\nFLAT20 — Rs.20 off\nNEWUSER — 15% off')}
          />
        </View>
      </View>

      {/* Support section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Support</Text>
        <View style={styles.menuCard}>
          <MenuItem
            icon="help-circle-outline"
            label="Help Center"
            onPress={() => Alert.alert('Help', 'Contact: support@amazonia.store')}
          />
          <MenuItem
            icon="shield-checkmark-outline"
            label="Privacy & Security"
            onPress={() => Alert.alert('Privacy', 'Your data is encrypted and secure.')}
          />
          <MenuItem
            icon="information-circle-outline"
            label="About Amazonia"
            subtitle="Version 1.0.0"
            onPress={() => Alert.alert('Amazonia', 'Version 1.0.0\nBuilt with ❤️ using React Native + Expo')}
          />
        </View>
      </View>

      {/* Sign out */}
      <View style={[styles.section, { marginBottom: 40 }]}>
        <View style={styles.menuCard}>
          <MenuItem
            icon="log-out-outline"
            label="Sign Out"
            onPress={handleLogout}
            danger
          />
        </View>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F3FF' },
  header: { paddingTop: 40, paddingBottom: 32, alignItems: 'center', gap: 8 },
  avatar: {
    width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(245,158,11,0.25)',
    justifyContent: 'center', alignItems: 'center', borderWidth: 3, borderColor: COLORS.cta,
  },
  avatarText: { fontSize: 34, fontWeight: '800', color: COLORS.cta },
  userName: { fontSize: 22, fontWeight: '800', color: '#fff' },
  userPhone: { fontSize: 14, color: 'rgba(255,255,255,0.6)' },
  roleBadge: { backgroundColor: 'rgba(245,158,11,0.2)', borderRadius: RADIUS.full, paddingHorizontal: 14, paddingVertical: 5 },
  sellerBadge: { backgroundColor: 'rgba(167,139,250,0.25)' },
  roleText: { color: '#fff', fontSize: 13, fontWeight: '700' },
  section: { paddingHorizontal: 16, paddingTop: 20 },
  sectionTitle: { fontSize: 13, fontWeight: '700', color: COLORS.gray600, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 10 },
  menuCard: { backgroundColor: '#fff', borderRadius: RADIUS.xl, borderWidth: 1.5, borderColor: '#EDE9FE', overflow: 'hidden' },
  menuItem: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#F5F3FF' },
  menuIcon: { width: 38, height: 38, borderRadius: 10, backgroundColor: '#EDE9FE', justifyContent: 'center', alignItems: 'center' },
  dangerIcon: { backgroundColor: '#FEE2E2' },
  menuLabel: { fontSize: 14, fontWeight: '700', color: COLORS.gray900 },
  menuSubtitle: { fontSize: 11, color: COLORS.gray400, marginTop: 1 },
  badge: { backgroundColor: COLORS.error, borderRadius: RADIUS.full, paddingHorizontal: 8, paddingVertical: 2, marginRight: 4 },
  badgeText: { color: '#fff', fontSize: 10, fontWeight: '800' },
})
