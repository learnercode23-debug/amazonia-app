import { useEffect, useState, useCallback } from 'react'
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  TextInput, ActivityIndicator, RefreshControl
} from 'react-native'
import { Image } from 'expo-image'
import { router, useLocalSearchParams } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { productsAPI } from '@/services/api'
import { COLORS, RADIUS, SHADOW } from '@/constants/theme'
import { CURRENCY } from '@/constants/config'

interface Product {
  _id: string; title: string; images: string[]; price: number;
  discountPrice?: number; discountPercent?: number; rating: number; reviewCount: number; brand: string; stock: number
}

const SORT_OPTIONS = [
  { label: 'Relevance', sort: 'createdAt', order: 'desc' },
  { label: 'Price ↑', sort: 'price', order: 'asc' },
  { label: 'Price ↓', sort: 'price', order: 'desc' },
  { label: 'Rating', sort: 'rating', order: 'desc' },
]

function ProductRow({ item }: { item: Product }) {
  const price = item.discountPrice || item.price
  return (
    <TouchableOpacity
      style={styles.row}
      onPress={() => router.push(`/product/${item._id}`)}
      activeOpacity={0.85}
    >
      <Image source={{ uri: item.images[0] }} style={styles.rowImage} contentFit="contain" />
      <View style={{ flex: 1 }}>
        <Text style={styles.brand}>{item.brand}</Text>
        <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 }}>
          <Text style={styles.star}>★</Text>
          <Text style={styles.rating}>{item.rating.toFixed(1)}</Text>
          <Text style={styles.reviewCount}>({item.reviewCount.toLocaleString()})</Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 6, marginTop: 6 }}>
          <Text style={styles.price}>{CURRENCY}{price.toFixed(0)}</Text>
          {item.discountPrice && (
            <>
              <Text style={styles.strike}>{CURRENCY}{item.price.toFixed(0)}</Text>
              <Text style={styles.discount}>-{item.discountPercent}%</Text>
            </>
          )}
        </View>
        {item.stock === 0 && <Text style={{ color: COLORS.error, fontSize: 11, marginTop: 3 }}>Out of stock</Text>}
      </View>
      <Ionicons name="chevron-forward" size={18} color={COLORS.gray400} />
    </TouchableOpacity>
  )
}

export default function ProductsScreen() {
  const params = useLocalSearchParams<{ search?: string; category?: string; dealOfDay?: string }>()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [search, setSearch] = useState(params.search || '')
  const [activeSort, setActiveSort] = useState(0)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [loadingMore, setLoadingMore] = useState(false)

  const fetchProducts = useCallback(async (resetPage = true) => {
    try {
      const currentPage = resetPage ? 1 : page
      if (resetPage) setLoading(true)
      else setLoadingMore(true)

      const sortOpt = SORT_OPTIONS[activeSort]
      const res = await productsAPI.list({
        search: search || undefined,
        category: params.category || undefined,
        dealOfDay: params.dealOfDay === 'true' ? true : undefined,
        sort: sortOpt.sort,
        order: sortOpt.order,
        page: currentPage,
        limit: 15,
      })

      if (resetPage) {
        setProducts(res.data.data || [])
        setPage(2)
      } else {
        setProducts((p) => [...p, ...(res.data.data || [])])
        setPage((p) => p + 1)
      }
      setTotal(res.data.total || 0)
    } catch {} finally {
      setLoading(false)
      setLoadingMore(false)
      setRefreshing(false)
    }
  }, [search, params.category, params.dealOfDay, activeSort, page])

  useEffect(() => { fetchProducts(true) }, [search, params.category, activeSort])

  return (
    <View style={styles.container}>
      {/* Search bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={16} color={COLORS.gray400} style={{ marginLeft: 12 }} />
        <TextInput
          style={styles.searchInput}
          value={search}
          onChangeText={setSearch}
          placeholder="Search products, brands…"
          placeholderTextColor={COLORS.gray400}
          returnKeyType="search"
          onSubmitEditing={() => fetchProducts(true)}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')} style={{ paddingRight: 12 }}>
            <Ionicons name="close-circle" size={18} color={COLORS.gray400} />
          </TouchableOpacity>
        )}
      </View>

      {/* Sort chips */}
      <View style={styles.sortRow}>
        {SORT_OPTIONS.map((opt, i) => (
          <TouchableOpacity
            key={opt.label}
            style={[styles.sortChip, i === activeSort && styles.activeSortChip]}
            onPress={() => setActiveSort(i)}
          >
            <Text style={[styles.sortText, i === activeSort && styles.activeSortText]}>{opt.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <View style={styles.center}><ActivityIndicator color={COLORS.accent} size="large" /></View>
      ) : products.length === 0 ? (
        <View style={styles.center}>
          <Text style={{ fontSize: 48 }}>🔍</Text>
          <Text style={styles.emptyTitle}>No products found</Text>
          <Text style={styles.emptySubtitle}>Try adjusting your search or filters</Text>
        </View>
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => <ProductRow item={item} />}
          contentContainerStyle={{ paddingVertical: 8, paddingHorizontal: 12, gap: 10 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchProducts(true) }} tintColor={COLORS.accent} />
          }
          onEndReached={() => { if (products.length < total && !loadingMore) fetchProducts(false) }}
          onEndReachedThreshold={0.4}
          ListHeaderComponent={
            <Text style={styles.totalText}>{total.toLocaleString()} result{total !== 1 ? 's' : ''}</Text>
          }
          ListFooterComponent={loadingMore ? <ActivityIndicator color={COLORS.accent} style={{ marginVertical: 16 }} /> : null}
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F3FF' },
  searchContainer: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff',
    margin: 12, borderRadius: RADIUS.full, borderWidth: 1.5, borderColor: '#DDD6FE',
  },
  searchInput: { flex: 1, paddingHorizontal: 10, paddingVertical: 11, fontSize: 14, color: COLORS.gray900 },
  sortRow: { flexDirection: 'row', paddingHorizontal: 12, gap: 8, marginBottom: 4 },
  sortChip: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: RADIUS.full, backgroundColor: '#fff', borderWidth: 1.5, borderColor: '#DDD6FE' },
  activeSortChip: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  sortText: { fontSize: 12, fontWeight: '600', color: COLORS.gray600 },
  activeSortText: { color: '#fff' },
  totalText: { fontSize: 12, color: COLORS.gray400, marginBottom: 8 },
  row: {
    flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#fff',
    borderRadius: RADIUS.lg, padding: 12, borderWidth: 1.5, borderColor: '#EDE9FE', ...SHADOW.sm,
  },
  rowImage: { width: 80, height: 80, borderRadius: RADIUS.md, backgroundColor: '#F9FAFB' },
  brand: { fontSize: 10, color: COLORS.gray400, fontWeight: '600', textTransform: 'uppercase' },
  title: { fontSize: 13, fontWeight: '700', color: COLORS.gray900, lineHeight: 18, marginTop: 2 },
  star: { color: COLORS.cta, fontSize: 12 },
  rating: { fontSize: 12, color: COLORS.gray600, fontWeight: '700' },
  reviewCount: { fontSize: 11, color: COLORS.gray400 },
  price: { fontSize: 16, fontWeight: '800', color: COLORS.primary },
  strike: { fontSize: 12, color: COLORS.gray400, textDecorationLine: 'line-through' },
  discount: { fontSize: 11, color: COLORS.error, fontWeight: '700' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 8 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: COLORS.gray900 },
  emptySubtitle: { fontSize: 13, color: COLORS.gray400 },
})
