import { useEffect, useState } from 'react'
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Alert, ActivityIndicator, Dimensions
} from 'react-native'
import { Image } from 'expo-image'
import { router, useLocalSearchParams } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { productsAPI } from '@/services/api'
import { useCart } from '@/contexts/CartContext'
import { COLORS, RADIUS, SHADOW } from '@/constants/theme'
import { CURRENCY } from '@/constants/config'

const { width } = Dimensions.get('window')

interface Product {
  _id: string
  title: string
  description: string
  images: string[]
  price: number
  discountPrice?: number
  discountPercent?: number
  brand: string
  rating: number
  reviewCount: number
  stock: number
  category: string | { name: string }
  featureBullets?: string[]
  specifications?: Record<string, string>
  freeShipping?: boolean
  seller?: { name: string }
}

interface Review {
  _id: string
  user: { name: string }
  rating: number
  title: string
  comment: string
  verified: boolean
  createdAt: string
}

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const { addToCart, isInCart } = useCart()

  const [product, setProduct] = useState<Product | null>(null)
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [addingToCart, setAddingToCart] = useState(false)
  const [tab, setTab] = useState<'desc' | 'specs' | 'reviews'>('desc')

  useEffect(() => {
    Promise.all([
      productsAPI.getById(id),
      productsAPI.getReviews(id),
    ]).then(([pRes, rRes]) => {
      setProduct(pRes.data.data)
      setReviews(rRes.data.data || [])
    }).catch(() => Alert.alert('Error', 'Product not found'))
      .finally(() => setLoading(false))
  }, [id])

  async function handleAddToCart() {
    if (!product) return
    setAddingToCart(true)
    try {
      await addToCart(product._id, quantity)
      Alert.alert('Added! 🛒', `${product.title.slice(0, 40)} added to cart`, [
        { text: 'Continue Shopping' },
        { text: 'View Cart', onPress: () => router.push('/(tabs)/cart') },
      ])
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error
      Alert.alert('Error', msg || 'Failed to add to cart. Please log in first.')
    } finally {
      setAddingToCart(false)
    }
  }

  if (loading) {
    return <View style={styles.center}><ActivityIndicator color={COLORS.accent} size="large" /></View>
  }

  if (!product) {
    return <View style={styles.center}><Text>Product not found</Text></View>
  }

  const price = product.discountPrice || product.price
  const hasDiscount = product.discountPrice && product.discountPrice < product.price
  const inCart = isInCart(product._id)
  const sellerName = typeof product.seller === 'string' ? product.seller : product.seller?.name || 'Amazonia Store'
  const categoryName = typeof product.category === 'string' ? product.category : product.category?.name || ''

  const ratingDist = [5, 4, 3, 2, 1].map((r) => ({
    stars: r,
    pct: reviews.length ? Math.round((reviews.filter((rv) => rv.rating === r).length / reviews.length) * 100) : 0,
  }))

  return (
    <View style={{ flex: 1, backgroundColor: '#F5F3FF' }}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Image gallery */}
        <View style={styles.gallery}>
          <Image source={{ uri: product.images[selectedImage] || 'https://via.placeholder.com/400' }} style={styles.mainImage} contentFit="contain" />

          {product.images.length > 1 && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.thumbRow} contentContainerStyle={{ gap: 8, padding: 8 }}>
              {product.images.map((img, i) => (
                <TouchableOpacity
                  key={i}
                  onPress={() => setSelectedImage(i)}
                  style={[styles.thumb, i === selectedImage && styles.thumbActive]}
                >
                  <Image source={{ uri: img }} style={{ width: 50, height: 50 }} contentFit="contain" />
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>

        <View style={styles.info}>
          {/* Brand + category */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={styles.brand}>{product.brand}</Text>
            <Text style={styles.category}>{categoryName}</Text>
          </View>

          <Text style={styles.title}>{product.title}</Text>

          {/* Rating row */}
          <View style={styles.ratingRow}>
            {'★★★★★'.split('').map((star, i) => (
              <Text key={i} style={{ color: i < Math.round(product.rating) ? '#F59E0B' : '#DDD6FE', fontSize: 16 }}>★</Text>
            ))}
            <Text style={styles.ratingText}>{product.rating.toFixed(1)}</Text>
            <Text style={styles.reviewCount}>({product.reviewCount.toLocaleString()} reviews)</Text>
          </View>

          {/* Price */}
          <View style={styles.priceRow}>
            <Text style={styles.price}>{CURRENCY}{price.toFixed(2)}</Text>
            {hasDiscount && (
              <>
                <Text style={styles.strikePrice}>{CURRENCY}{product.price.toFixed(2)}</Text>
                <View style={styles.discountBadge}>
                  <Text style={styles.discountText}>-{product.discountPercent}%</Text>
                </View>
              </>
            )}
          </View>

          {/* Stock + shipping */}
          <Text style={[styles.stockText, product.stock === 0 && { color: COLORS.error }]}>
            {product.stock === 0 ? '❌ Out of Stock' : product.stock <= 5 ? `⚠️ Only ${product.stock} left!` : '✅ In Stock'}
          </Text>
          {product.freeShipping && <Text style={{ color: COLORS.success, fontSize: 12, fontWeight: '600' }}>🚚 Free Shipping</Text>}

          {/* Sold by */}
          <Text style={styles.soldBy}>Sold by: <Text style={{ color: COLORS.accent, fontWeight: '700' }}>{sellerName}</Text></Text>

          {/* Quantity */}
          {product.stock > 0 && (
            <View style={styles.qtyRow}>
              <Text style={styles.qtyLabel}>Quantity:</Text>
              <View style={styles.qtyControls}>
                <TouchableOpacity onPress={() => setQuantity(Math.max(1, quantity - 1))} style={styles.qtyBtn}>
                  <Ionicons name="remove" size={18} color={COLORS.primary} />
                </TouchableOpacity>
                <Text style={styles.qtyValue}>{quantity}</Text>
                <TouchableOpacity
                  onPress={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  style={styles.qtyBtn}
                  disabled={quantity >= product.stock}
                >
                  <Ionicons name="add" size={18} color={COLORS.primary} />
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Tabs */}
          <View style={styles.tabs}>
            {(['desc', 'specs', 'reviews'] as const).map((t) => (
              <TouchableOpacity
                key={t}
                style={[styles.tab, tab === t && styles.activeTab]}
                onPress={() => setTab(t)}
              >
                <Text style={[styles.tabText, tab === t && styles.activeTabText]}>
                  {t === 'desc' ? 'Description' : t === 'specs' ? 'Specs' : `Reviews (${reviews.length})`}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Tab content */}
          {tab === 'desc' && (
            <View style={styles.tabContent}>
              <Text style={styles.description}>{product.description}</Text>
              {product.featureBullets && product.featureBullets.length > 0 && (
                <View style={{ marginTop: 12, gap: 6 }}>
                  {product.featureBullets.map((b, i) => (
                    <View key={i} style={{ flexDirection: 'row', gap: 8, alignItems: 'flex-start' }}>
                      <Text style={{ color: COLORS.accent, marginTop: 1 }}>✓</Text>
                      <Text style={{ flex: 1, fontSize: 13, color: COLORS.gray600, lineHeight: 18 }}>{b}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          )}

          {tab === 'specs' && product.specifications && (
            <View style={styles.tabContent}>
              {Object.entries(product.specifications).map(([key, value]) => (
                <View key={key} style={styles.specRow}>
                  <Text style={styles.specKey}>{key}</Text>
                  <Text style={styles.specValue}>{value}</Text>
                </View>
              ))}
            </View>
          )}

          {tab === 'reviews' && (
            <View style={styles.tabContent}>
              {/* Rating summary */}
              <View style={styles.ratingSum}>
                <View style={{ alignItems: 'center' }}>
                  <Text style={styles.bigRating}>{product.rating.toFixed(1)}</Text>
                  <View style={{ flexDirection: 'row' }}>
                    {'★★★★★'.split('').map((s, i) => (
                      <Text key={i} style={{ color: i < Math.round(product.rating) ? '#F59E0B' : '#DDD6FE', fontSize: 14 }}>★</Text>
                    ))}
                  </View>
                  <Text style={{ fontSize: 11, color: COLORS.gray400, marginTop: 2 }}>{product.reviewCount} reviews</Text>
                </View>
                <View style={{ flex: 1, gap: 4, paddingLeft: 16 }}>
                  {ratingDist.map(({ stars, pct }) => (
                    <View key={stars} style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <Text style={{ fontSize: 11, color: COLORS.gray400, width: 10 }}>{stars}</Text>
                      <Text style={{ color: '#F59E0B', fontSize: 10 }}>★</Text>
                      <View style={{ flex: 1, height: 5, backgroundColor: '#EDE9FE', borderRadius: 3 }}>
                        <View style={{ width: `${pct}%`, height: 5, backgroundColor: '#F59E0B', borderRadius: 3 }} />
                      </View>
                      <Text style={{ fontSize: 10, color: COLORS.gray400, width: 28 }}>{pct}%</Text>
                    </View>
                  ))}
                </View>
              </View>

              {reviews.slice(0, 5).map((review) => (
                <View key={review._id} style={styles.reviewCard}>
                  <View style={styles.reviewHeader}>
                    <View style={styles.reviewAvatar}>
                      <Text style={{ color: '#fff', fontWeight: '800', fontSize: 12 }}>{review.user?.name?.charAt(0)}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontWeight: '700', fontSize: 13, color: COLORS.gray900 }}>{review.user?.name}</Text>
                      {review.verified && <Text style={{ color: COLORS.success, fontSize: 10, fontWeight: '600' }}>✓ Verified Purchase</Text>}
                    </View>
                    <View style={{ flexDirection: 'row' }}>
                      {'★★★★★'.split('').map((s, i) => (
                        <Text key={i} style={{ color: i < review.rating ? '#F59E0B' : '#DDD6FE', fontSize: 12 }}>★</Text>
                      ))}
                    </View>
                  </View>
                  <Text style={{ fontWeight: '700', fontSize: 13, color: COLORS.gray900, marginBottom: 4 }}>{review.title}</Text>
                  <Text style={{ fontSize: 12, color: COLORS.gray600, lineHeight: 17 }}>{review.comment}</Text>
                </View>
              ))}

              {reviews.length === 0 && (
                <Text style={{ color: COLORS.gray400, textAlign: 'center', marginTop: 16 }}>No reviews yet. Be the first!</Text>
              )}
            </View>
          )}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Bottom action bar */}
      <View style={styles.actionBar}>
        <TouchableOpacity
          onPress={() => router.push('/(tabs)/cart')}
          style={styles.cartIconBtn}
        >
          <Ionicons name="cart-outline" size={22} color={COLORS.primary} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.addBtn, (product.stock === 0 || addingToCart) && styles.disabledBtn]}
          onPress={handleAddToCart}
          disabled={product.stock === 0 || addingToCart}
          activeOpacity={0.85}
        >
          {addingToCart
            ? <ActivityIndicator color={COLORS.gray900} />
            : <Text style={styles.addBtnText}>
              {inCart ? '✓ Added to Cart' : product.stock === 0 ? 'Out of Stock' : '🛒 Add to Cart'}
            </Text>
          }
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F5F3FF' },
  gallery: { backgroundColor: '#fff' },
  mainImage: { width, height: width * 0.75, backgroundColor: '#F9FAFB' },
  thumbRow: { backgroundColor: '#fff' },
  thumb: { width: 66, height: 66, borderRadius: 10, borderWidth: 2, borderColor: '#EDE9FE', backgroundColor: '#F9FAFB', justifyContent: 'center', alignItems: 'center' },
  thumbActive: { borderColor: COLORS.accent },
  info: { padding: 16, gap: 8 },
  brand: { fontSize: 11, color: COLORS.accent, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  category: { fontSize: 11, color: COLORS.gray400, backgroundColor: '#EDE9FE', paddingHorizontal: 8, paddingVertical: 3, borderRadius: RADIUS.full },
  title: { fontSize: 18, fontWeight: '800', color: COLORS.gray900, lineHeight: 24 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  ratingText: { fontSize: 14, fontWeight: '700', color: COLORS.gray900, marginLeft: 4 },
  reviewCount: { fontSize: 12, color: COLORS.gray400 },
  priceRow: { flexDirection: 'row', alignItems: 'baseline', gap: 8 },
  price: { fontSize: 26, fontWeight: '900', color: COLORS.primary },
  strikePrice: { fontSize: 14, color: COLORS.gray400, textDecorationLine: 'line-through' },
  discountBadge: { backgroundColor: '#FEE2E2', borderRadius: RADIUS.full, paddingHorizontal: 8, paddingVertical: 3 },
  discountText: { color: COLORS.error, fontSize: 12, fontWeight: '800' },
  stockText: { fontSize: 13, fontWeight: '700', color: COLORS.success },
  soldBy: { fontSize: 12, color: COLORS.gray600 },
  qtyRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  qtyLabel: { fontSize: 14, fontWeight: '700', color: COLORS.gray900 },
  qtyControls: { flexDirection: 'row', alignItems: 'center', gap: 4, borderWidth: 1.5, borderColor: '#DDD6FE', borderRadius: RADIUS.lg, overflow: 'hidden' },
  qtyBtn: { padding: 8, backgroundColor: '#EDE9FE' },
  qtyValue: { fontSize: 16, fontWeight: '800', color: COLORS.primary, paddingHorizontal: 16 },
  tabs: { flexDirection: 'row', borderBottomWidth: 1.5, borderBottomColor: '#EDE9FE' },
  tab: { flex: 1, paddingVertical: 10, alignItems: 'center' },
  activeTab: { borderBottomWidth: 2, borderBottomColor: COLORS.accent },
  tabText: { fontSize: 12, fontWeight: '600', color: COLORS.gray400 },
  activeTabText: { color: COLORS.accent },
  tabContent: { paddingTop: 12 },
  description: { fontSize: 13, color: COLORS.gray600, lineHeight: 21 },
  specRow: { flexDirection: 'row', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#F5F3FF' },
  specKey: { width: 120, fontSize: 12, fontWeight: '700', color: COLORS.gray600 },
  specValue: { flex: 1, fontSize: 12, color: COLORS.gray900 },
  ratingSum: { flexDirection: 'row', alignItems: 'center', marginBottom: 16, backgroundColor: '#EDE9FE', borderRadius: RADIUS.lg, padding: 12 },
  bigRating: { fontSize: 40, fontWeight: '900', color: COLORS.primary },
  reviewCard: { backgroundColor: '#fff', borderRadius: RADIUS.lg, padding: 12, marginBottom: 10, borderWidth: 1.5, borderColor: '#EDE9FE', ...SHADOW.sm },
  reviewHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  reviewAvatar: { width: 32, height: 32, borderRadius: 16, backgroundColor: COLORS.accent, justifyContent: 'center', alignItems: 'center' },
  actionBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    flexDirection: 'row', gap: 12, padding: 16, paddingBottom: 28,
    backgroundColor: '#fff', borderTopWidth: 1.5, borderTopColor: '#EDE9FE',
    ...SHADOW.md,
  },
  cartIconBtn: {
    width: 50, height: 50, borderRadius: RADIUS.lg, borderWidth: 1.5, borderColor: '#DDD6FE',
    justifyContent: 'center', alignItems: 'center', backgroundColor: '#EDE9FE',
  },
  addBtn: {
    flex: 1, backgroundColor: COLORS.cta, borderRadius: RADIUS.full, height: 50,
    justifyContent: 'center', alignItems: 'center',
    shadowColor: COLORS.cta, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 8, elevation: 6,
  },
  disabledBtn: { backgroundColor: '#DDD6FE', shadowOpacity: 0 },
  addBtnText: { fontSize: 15, fontWeight: '800', color: COLORS.gray900 },
})
