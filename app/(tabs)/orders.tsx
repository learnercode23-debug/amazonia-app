import { useEffect, useState } from 'react'
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  RefreshControl, ActivityIndicator
} from 'react-native'
import { Image } from 'expo-image'
import { router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { ordersAPI } from '@/services/api'
import { COLORS, RADIUS, SHADOW } from '@/constants/theme'
import { CURRENCY } from '@/constants/config'

interface Order {
  _id: string
  orderNumber: string
  status: string
  paymentStatus: string
  totalAmount: number
  createdAt: string
  items: Array<{ title: string; image: string; price: number; quantity: number }>
}

const STATUS_CONFIG: Record<string, { color: string; bg: string; icon: string }> = {
  pending:    { color: '#92400E', bg: '#FEF3C7', icon: '⏳' },
  confirmed:  { color: '#1D4ED8', bg: '#DBEAFE', icon: '✅' },
  processing: { color: '#5B21B6', bg: '#EDE9FE', icon: '⚙️' },
  packed:     { color: '#1E40AF', bg: '#DBEAFE', icon: '📦' },
  shipped:    { color: '#6D28D9', bg: '#EDE9FE', icon: '🚚' },
  delivered:  { color: '#065F46', bg: '#D1FAE5', icon: '✅' },
  cancelled:  { color: '#991B1B', bg: '#FEE2E2', icon: '❌' },
}

export default function OrdersScreen() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  async function load() {
    try {
      const res = await ordersAPI.list()
      setOrders(res.data.data || [])
    } catch {} finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => { load() }, [])

  if (loading) {
    return <View style={styles.center}><ActivityIndicator color={COLORS.accent} size="large" /></View>
  }

  if (orders.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={{ fontSize: 64, marginBottom: 12 }}>📋</Text>
        <Text style={styles.emptyTitle}>No orders yet</Text>
        <Text style={styles.emptySub}>Your order history will appear here</Text>
        <TouchableOpacity style={styles.shopBtn} onPress={() => router.push('/(tabs)/products')}>
          <Text style={styles.shopBtnText}>Start Shopping →</Text>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <FlatList
      style={{ backgroundColor: '#F5F3FF' }}
      data={orders}
      keyExtractor={(o) => o._id}
      contentContainerStyle={{ padding: 12, gap: 10 }}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load() }} tintColor={COLORS.accent} />
      }
      renderItem={({ item: order }) => {
        const cfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending
        const date = new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

        return (
          <View style={styles.orderCard}>
            {/* Header */}
            <View style={styles.orderHeader}>
              <View>
                <Text style={styles.orderNumber}>{order.orderNumber}</Text>
                <Text style={styles.orderDate}>{date}</Text>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: cfg.bg }]}>
                <Text style={[styles.statusText, { color: cfg.color }]}>
                  {cfg.icon} {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </Text>
              </View>
            </View>

            {/* First item preview */}
            {order.items[0] && (
              <View style={styles.itemPreview}>
                <Image source={{ uri: order.items[0].image }} style={styles.itemImg} contentFit="contain" />
                <View style={{ flex: 1 }}>
                  <Text style={styles.itemTitle} numberOfLines={2}>{order.items[0].title}</Text>
                  <Text style={styles.itemQty}>Qty: {order.items[0].quantity}</Text>
                  {order.items.length > 1 && (
                    <Text style={styles.moreItems}>+{order.items.length - 1} more item{order.items.length > 2 ? 's' : ''}</Text>
                  )}
                </View>
                <Text style={styles.total}>{CURRENCY}{order.totalAmount.toFixed(0)}</Text>
              </View>
            )}

            {/* Actions */}
            <View style={styles.orderActions}>
              <Text style={[styles.payStatus, { color: order.paymentStatus === 'paid' ? COLORS.success : COLORS.warning }]}>
                {order.paymentStatus === 'paid' ? '✓ Paid' : '💵 Pay on delivery'}
              </Text>
              <TouchableOpacity
                style={styles.detailBtn}
                onPress={() => router.push(`/order/${order._id}` as never)}
              >
                <Text style={styles.detailText}>Details</Text>
                <Ionicons name="chevron-forward" size={14} color={COLORS.accent} />
              </TouchableOpacity>
            </View>
          </View>
        )
      }}
    />
  )
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F5F3FF', gap: 8 },
  emptyTitle: { fontSize: 18, fontWeight: '800', color: COLORS.gray900 },
  emptySub: { fontSize: 13, color: COLORS.gray400 },
  shopBtn: { marginTop: 12, backgroundColor: COLORS.cta, borderRadius: RADIUS.full, paddingHorizontal: 24, paddingVertical: 12 },
  shopBtnText: { fontWeight: '800', color: COLORS.gray900 },
  orderCard: { backgroundColor: '#fff', borderRadius: RADIUS.lg, padding: 14, borderWidth: 1.5, borderColor: '#EDE9FE', ...SHADOW.sm, gap: 12 },
  orderHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  orderNumber: { fontSize: 13, fontWeight: '800', color: COLORS.primary, fontVariant: ['tabular-nums'] },
  orderDate: { fontSize: 11, color: COLORS.gray400, marginTop: 2 },
  statusBadge: { borderRadius: RADIUS.full, paddingHorizontal: 10, paddingVertical: 4 },
  statusText: { fontSize: 11, fontWeight: '700' },
  itemPreview: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  itemImg: { width: 56, height: 56, borderRadius: RADIUS.md, backgroundColor: '#F9FAFB' },
  itemTitle: { fontSize: 12, fontWeight: '700', color: COLORS.gray900, lineHeight: 17 },
  itemQty: { fontSize: 11, color: COLORS.gray400, marginTop: 2 },
  moreItems: { fontSize: 11, color: COLORS.accent, marginTop: 2, fontWeight: '600' },
  total: { fontSize: 15, fontWeight: '800', color: COLORS.primary, alignSelf: 'flex-start' },
  orderActions: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#F5F3FF', paddingTop: 10 },
  payStatus: { fontSize: 12, fontWeight: '700' },
  detailBtn: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  detailText: { fontSize: 13, color: COLORS.accent, fontWeight: '700' },
})
