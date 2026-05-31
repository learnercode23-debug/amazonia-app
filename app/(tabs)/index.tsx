import { useEffect, useState } from 'react'
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, FlatList, RefreshControl, Dimensions
} from 'react-native'
import { Image } from 'expo-image'
import { router } from 'expo-router'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
import { useAuth } from '@/contexts/AuthContext'
import { productsAPI, categoriesAPI } from '@/services/api'
import { COLORS, RADIUS, SHADOW } from '@/constants/theme'
import { CURRENCY } from '@/constants/config'

const { width } = Dimensions.get('window')

interface Product {
  _id: string; title: string; images: string[]; price: number;
  discountPrice?: number; discountPercent?: number; rating: number; reviewCount: number; brand: string
}

function ProductMini({ item }: { item: Product }) {
  const price = item.discountPrice || item.price
  return (
    <TouchableOpacity
      style={styles.productCard}
      onPress={() => router.push(`/product/${item._id}`)}
      activeOpacity={0.85}
    >
      <Image source={{ uri: item.images[0] }} style={styles.productImage} contentFit="contain" />
      {item.discountPercent && (
        <View style={styles.discountBadge}>
          <Text style={styles.discountText}>-{item.discountPercent}%</Text>
        </View>
      )}
      <View style={styles.productInfo}>
        <Text style={styles.productBrand}>{item.brand}</Text>
        <Text style={styles.productTitle} numberOfLines={2}>{item.title}</Text>
        <Text style={styles.productPrice}>{CURRENCY}{price.toFixed(0)}</Text>
        {item.discountPrice && (
          <Text style={styles.strikePrice}>{CURRENCY}{item.price.toFixed(0)}</Text>
        )}
      </View>
    </TouchableOpacity>
  )
}

export default function HomeScreen() {
  const { user } = useAuth()
  const [deals, setDeals] = useState<Product[]>([])
  const [featured, setFeatured] = useState<Product[]>([])
  const [categories, setCategories] = useState<Array<{ _id: string; name: string; icon?: string }>>([])
  const [search, setSearch] = useState('')
  const [refreshing, setRefreshing] = useState(false)

  async function load() {
    try {
      const [dealsRes, featuredRes, catRes] = await Promise.all([
        productsAPI.list({ dealOfDay: true, limit: 6 }),
        productsAPI.list({ featured: true, limit: 8 }),
        categoriesAPI.list(),
      ])
      setDeals(dealsRes.data.data || [])
      setFeatured(featuredRes.data.data || [])
      setCategories((catRes.data.data || []).filter((_: unknown, i: number) => i < 8))
    } catch {}
  }

  useEffect(() => { load() }, [])

  async function onRefresh() {
    setRefreshing(true)
    await load()
    setRefreshing(false)
  }

  function handleSearch() {
    if (search.trim()) {
      router.push({ pathname: '/(tabs)/products', params: { search: search.trim() } })
      setSearch('')
    }
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.accent} />}
      showsVerticalScrollIndicator={false}
    >
      {/* Hero banner */}
      <LinearGradient colors={['#1E1B4B', '#4C1D95']} style={styles.hero}>
        <Text style={styles.greeting}>Hello, {user?.name?.split(' ')[0] || 'there'} 👋</Text>
        <Text style={styles.heroTitle}>What are you{'\n'}shopping for today?</Text>

        {/* Search bar */}
        <TouchableOpacity style={styles.searchBar} onPress={() => router.push('/(tabs)/products')} activeOpacity={0.9}>
          <Ionicons name="search" size={18} color={COLORS.gray400} />
          <Text style={styles.searchPlaceholder}>Search products, brands…</Text>
        </TouchableOpacity>
      </LinearGradient>

      {/* Categories */}
      {categories.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Categories</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10 }}>
            {categories.map((cat: { _id: string; name: string; icon?: string }) => (
              <TouchableOpacity
                key={cat._id}
                style={styles.catChip}
                onPress={() => router.push({ pathname: '/(tabs)/products', params: { category: cat.name } })}
              >
                <Text style={styles.catIcon}>{cat.icon || '📦'}</Text>
                <Text style={styles.catName}>{cat.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Today's Deals */}
      {deals.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Text style={styles.dealEmoji}>🔥</Text>
              <Text style={styles.sectionTitle}>Today&apos;s Deals</Text>
            </View>
            <TouchableOpacity onPress={() => router.push({ pathname: '/(tabs)/products', params: { dealOfDay: 'true' } })}>
              <Text style={styles.seeAll}>See all →</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={deals}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item._id}
            contentContainerStyle={{ gap: 12 }}
            renderItem={({ item }) => <ProductMini item={item} />}
          />
        </View>
      )}

      {/* Featured */}
      {featured.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Featured Products</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/products')}>
              <Text style={styles.seeAll}>See all →</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.grid}>
            {featured.slice(0, 4).map((item) => <ProductMini key={item._id} item={item} />)}
          </View>
        </View>
      )}

      {/* Sell CTA */}
      <LinearGradient colors={['#1E1B4B', '#4C1D95']} style={styles.sellBanner}>
        <Text style={styles.sellTitle}>Start Selling on Amazonia</Text>
        <Text style={styles.sellSub}>Reach millions of customers</Text>
        <TouchableOpacity style={styles.sellBtn} onPress={() => router.push('/(tabs)/profile')}>
          <Text style={styles.sellBtnText}>Learn More →</Text>
        </TouchableOpacity>
      </LinearGradient>

      <View style={{ height: 24 }} />
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F3FF' },
  hero: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 32 },
  greeting: { color: 'rgba(255,255,255,0.6)', fontSize: 14, marginBottom: 4 },
  heroTitle: { color: '#fff', fontSize: 26, fontWeight: '800', lineHeight: 32, marginBottom: 20 },
  searchBar: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: '#fff', borderRadius: RADIUS.full, paddingHorizontal: 16, paddingVertical: 12,
  },
  searchPlaceholder: { color: COLORS.gray400, fontSize: 14 },
  section: { paddingHorizontal: 16, paddingTop: 20 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 17, fontWeight: '800', color: COLORS.primary },
  dealEmoji: { fontSize: 18 },
  seeAll: { color: COLORS.accent, fontSize: 13, fontWeight: '700' },
  catChip: {
    backgroundColor: '#fff', borderRadius: RADIUS.xl, paddingVertical: 10, paddingHorizontal: 14,
    alignItems: 'center', gap: 4, borderWidth: 1.5, borderColor: '#DDD6FE',
    minWidth: 74,
  },
  catIcon: { fontSize: 22 },
  catName: { fontSize: 10, fontWeight: '700', color: COLORS.primary, textAlign: 'center' },
  productCard: {
    backgroundColor: '#fff', borderRadius: RADIUS.lg, width: 150,
    borderWidth: 1.5, borderColor: '#EDE9FE', overflow: 'hidden', ...SHADOW.sm,
  },
  productImage: { width: '100%', height: 120, backgroundColor: '#F9FAFB' },
  discountBadge: {
    position: 'absolute', top: 8, left: 8, backgroundColor: COLORS.error,
    borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2,
  },
  discountText: { color: '#fff', fontSize: 10, fontWeight: '800' },
  productInfo: { padding: 10 },
  productBrand: { fontSize: 10, color: COLORS.gray400, fontWeight: '600', textTransform: 'uppercase' },
  productTitle: { fontSize: 12, fontWeight: '700', color: COLORS.gray900, marginTop: 2, lineHeight: 16 },
  productPrice: { fontSize: 14, fontWeight: '800', color: COLORS.primary, marginTop: 6 },
  strikePrice: { fontSize: 11, color: COLORS.gray400, textDecorationLine: 'line-through' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  sellBanner: {
    margin: 16, borderRadius: RADIUS.xl, padding: 20, alignItems: 'center',
    ...SHADOW.md,
  },
  sellTitle: { color: '#fff', fontSize: 18, fontWeight: '800', marginBottom: 4 },
  sellSub: { color: 'rgba(255,255,255,0.65)', fontSize: 13, marginBottom: 14 },
  sellBtn: {
    backgroundColor: COLORS.cta, borderRadius: RADIUS.full, paddingHorizontal: 24, paddingVertical: 10,
  },
  sellBtnText: { color: COLORS.gray900, fontWeight: '800', fontSize: 13 },
})
