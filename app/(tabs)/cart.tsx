import { useState } from 'react'
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  Alert, ActivityIndicator, TextInput, ScrollView
} from 'react-native'
import { Image } from 'expo-image'
import { router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { useCart } from '@/contexts/CartContext'
import { useAuth } from '@/contexts/AuthContext'
import { ordersAPI, couponsAPI } from '@/services/api'
import { COLORS, RADIUS, SHADOW } from '@/constants/theme'
import { CURRENCY } from '@/constants/config'

export default function CartScreen() {
  const { user } = useAuth()
  const { items, subtotal, itemCount, removeFromCart, updateQuantity, clearCart } = useCart()
  const [couponCode, setCouponCode] = useState('')
  const [discount, setDiscount] = useState(0)
  const [couponApplied, setCouponApplied] = useState('')
  const [placingOrder, setPlacingOrder] = useState(false)
  const [validatingCoupon, setValidatingCoupon] = useState(false)

  const shippingCost = subtotal > 50 ? 0 : 9.99
  const total = subtotal + shippingCost - discount

  async function applyCoupon() {
    if (!couponCode.trim()) return
    setValidatingCoupon(true)
    try {
      const res = await couponsAPI.validate(couponCode.toUpperCase(), subtotal)
      setDiscount(res.data.data.discount)
      setCouponApplied(couponCode.toUpperCase())
      Alert.alert('🎉 Coupon Applied!', `You save ${CURRENCY}${res.data.data.discount.toFixed(2)}`)
    } catch (err: unknown) {
      Alert.alert('Invalid Coupon', (err as { response?: { data?: { error?: string } } })?.response?.data?.error || 'Coupon not valid')
    } finally {
      setValidatingCoupon(false)
    }
  }

  async function placeOrder() {
    if (!user) { router.push('/(auth)/welcome'); return }
    if (items.length === 0) return

    // Simple COD flow — in a real app you'd show an address form first
    Alert.alert(
      'Place Order',
      `Confirm Cash on Delivery order for ${CURRENCY}${total.toFixed(2)}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: async () => {
            setPlacingOrder(true)
            try {
              const defaultAddress = {
                name: user.name || 'Customer',
                street: 'Please update in profile',
                city: 'Kathmandu',
                state: 'Bagmati',
                zipCode: '44600',
                country: 'NP',
                phone: user.phone || '',
              }
              const res = await ordersAPI.placeCOD(defaultAddress, couponApplied || undefined)
              Alert.alert('✅ Order Placed!', `Order #${res.data.data.orderNumber} confirmed. Pay on delivery.`,
                [{ text: 'View Orders', onPress: () => router.push('/(tabs)/orders') }]
              )
            } catch (err: unknown) {
              Alert.alert('Error', (err as { response?: { data?: { error?: string } } })?.response?.data?.error || 'Failed to place order')
            } finally {
              setPlacingOrder(false)
            }
          },
        },
      ]
    )
  }

  if (items.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={{ fontSize: 72, marginBottom: 16 }}>🛒</Text>
        <Text style={styles.emptyTitle}>Your cart is empty</Text>
        <Text style={styles.emptySub}>Add items to get started</Text>
        <TouchableOpacity style={styles.browseBtn} onPress={() => router.push('/(tabs)/products')}>
          <Text style={styles.browseBtnText}>Browse Products →</Text>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#F5F3FF' }}>
      <FlatList
        data={items}
        keyExtractor={(item) => item.product._id}
        contentContainerStyle={{ padding: 12, gap: 10 }}
        renderItem={({ item }) => {
          const price = item.product.discountPrice || item.product.price
          return (
            <View style={styles.cartItem}>
              <TouchableOpacity onPress={() => router.push(`/product/${item.product._id}`)}>
                <Image source={{ uri: item.product.images[0] }} style={styles.itemImg} contentFit="contain" />
              </TouchableOpacity>
              <View style={{ flex: 1 }}>
                <Text style={styles.itemTitle} numberOfLines={2}>{item.product.title}</Text>
                <Text style={styles.itemBrand}>{item.product.brand}</Text>
                <Text style={styles.itemPrice}>{CURRENCY}{price.toFixed(2)}</Text>

                {/* Qty controls */}
                <View style={styles.qtyRow}>
                  <TouchableOpacity
                    onPress={() => updateQuantity(item.product._id, item.quantity - 1)}
                    style={styles.qtyBtn}
                  >
                    <Ionicons name="remove" size={16} color={COLORS.primary} />
                  </TouchableOpacity>
                  <Text style={styles.qtyText}>{item.quantity}</Text>
                  <TouchableOpacity
                    onPress={() => updateQuantity(item.product._id, item.quantity + 1)}
                    style={styles.qtyBtn}
                    disabled={item.quantity >= item.product.stock}
                  >
                    <Ionicons name="add" size={16} color={COLORS.primary} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => removeFromCart(item.product._id)}
                    style={[styles.qtyBtn, { marginLeft: 8, borderColor: '#FECACA' }]}
                  >
                    <Ionicons name="trash-outline" size={16} color={COLORS.error} />
                  </TouchableOpacity>
                </View>
              </View>
              <Text style={styles.lineTotal}>{CURRENCY}{(price * item.quantity).toFixed(2)}</Text>
            </View>
          )
        }}
        ListFooterComponent={
          <View style={{ gap: 10 }}>
            {/* Coupon */}
            <View style={styles.couponRow}>
              <TextInput
                style={styles.couponInput}
                value={couponCode}
                onChangeText={setCouponCode}
                placeholder="Coupon code (SAVE10, FLAT20)"
                placeholderTextColor={COLORS.gray400}
                autoCapitalize="characters"
              />
              <TouchableOpacity style={styles.applyBtn} onPress={applyCoupon} disabled={validatingCoupon}>
                {validatingCoupon ? <ActivityIndicator size="small" color="#fff" /> : <Text style={styles.applyText}>Apply</Text>}
              </TouchableOpacity>
            </View>

            {/* Summary */}
            <View style={styles.summary}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Subtotal ({itemCount} items)</Text>
                <Text style={styles.summaryValue}>{CURRENCY}{subtotal.toFixed(2)}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Shipping</Text>
                <Text style={[styles.summaryValue, subtotal > 50 && { color: COLORS.success }]}>
                  {subtotal > 50 ? 'FREE' : `${CURRENCY}${shippingCost.toFixed(2)}`}
                </Text>
              </View>
              {discount > 0 && (
                <View style={styles.summaryRow}>
                  <Text style={[styles.summaryLabel, { color: COLORS.success }]}>Coupon ({couponApplied})</Text>
                  <Text style={{ color: COLORS.success, fontWeight: '700' }}>-{CURRENCY}{discount.toFixed(2)}</Text>
                </View>
              )}
              <View style={[styles.summaryRow, { borderTopWidth: 1, borderTopColor: '#EDE9FE', marginTop: 8, paddingTop: 8 }]}>
                <Text style={{ fontSize: 16, fontWeight: '800', color: COLORS.primary }}>Total</Text>
                <Text style={{ fontSize: 18, fontWeight: '800', color: COLORS.primary }}>{CURRENCY}{total.toFixed(2)}</Text>
              </View>
            </View>
          </View>
        }
      />

      {/* Checkout button */}
      <View style={styles.checkoutBar}>
        <View>
          <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 11 }}>Total ({itemCount} items)</Text>
          <Text style={{ color: '#fff', fontSize: 18, fontWeight: '800' }}>{CURRENCY}{total.toFixed(2)}</Text>
        </View>
        <TouchableOpacity
          style={styles.checkoutBtn}
          onPress={placeOrder}
          disabled={placingOrder}
          activeOpacity={0.85}
        >
          {placingOrder
            ? <ActivityIndicator color={COLORS.gray900} />
            : <Text style={styles.checkoutText}>Place Order →</Text>
          }
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F5F3FF', gap: 8 },
  emptyTitle: { fontSize: 20, fontWeight: '800', color: COLORS.gray900 },
  emptySub: { fontSize: 14, color: COLORS.gray400 },
  browseBtn: { marginTop: 12, backgroundColor: COLORS.cta, borderRadius: RADIUS.full, paddingHorizontal: 24, paddingVertical: 12 },
  browseBtnText: { fontWeight: '800', color: COLORS.gray900 },
  cartItem: { flexDirection: 'row', gap: 12, backgroundColor: '#fff', borderRadius: RADIUS.lg, padding: 12, borderWidth: 1.5, borderColor: '#EDE9FE', ...SHADOW.sm },
  itemImg: { width: 80, height: 80, borderRadius: RADIUS.md, backgroundColor: '#F9FAFB' },
  itemTitle: { fontSize: 13, fontWeight: '700', color: COLORS.gray900, lineHeight: 18 },
  itemBrand: { fontSize: 10, color: COLORS.gray400, fontWeight: '600', marginTop: 2, textTransform: 'uppercase' },
  itemPrice: { fontSize: 14, fontWeight: '800', color: COLORS.primary, marginTop: 4 },
  qtyRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8 },
  qtyBtn: { width: 30, height: 30, borderRadius: 8, borderWidth: 1.5, borderColor: '#DDD6FE', justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  qtyText: { fontSize: 15, fontWeight: '800', color: COLORS.primary, minWidth: 24, textAlign: 'center' },
  lineTotal: { fontSize: 14, fontWeight: '800', color: COLORS.primary, alignSelf: 'flex-start' },
  couponRow: { flexDirection: 'row', gap: 8 },
  couponInput: { flex: 1, backgroundColor: '#fff', borderRadius: RADIUS.lg, paddingHorizontal: 14, paddingVertical: 11, borderWidth: 1.5, borderColor: '#DDD6FE', fontSize: 13, color: COLORS.gray900 },
  applyBtn: { backgroundColor: COLORS.primary, borderRadius: RADIUS.lg, paddingHorizontal: 16, justifyContent: 'center' },
  applyText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  summary: { backgroundColor: '#fff', borderRadius: RADIUS.lg, padding: 16, borderWidth: 1.5, borderColor: '#EDE9FE', gap: 8 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  summaryLabel: { fontSize: 13, color: COLORS.gray600 },
  summaryValue: { fontSize: 13, fontWeight: '700', color: COLORS.gray900 },
  checkoutBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: COLORS.primary, paddingHorizontal: 20, paddingVertical: 14,
    paddingBottom: 28, borderTopLeftRadius: 20, borderTopRightRadius: 20,
  },
  checkoutBtn: {
    backgroundColor: COLORS.cta, borderRadius: RADIUS.full, paddingHorizontal: 24, paddingVertical: 12,
    shadowColor: COLORS.cta, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 8, elevation: 6,
  },
  checkoutText: { fontWeight: '800', color: COLORS.gray900, fontSize: 15 },
})
