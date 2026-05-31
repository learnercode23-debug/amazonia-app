import { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { router } from 'expo-router'
import { useAuth } from '@/contexts/AuthContext'
import { authAPI } from '@/services/api'
import { COLORS, RADIUS } from '@/constants/theme'

export default function NameScreen() {
  const { updateUser } = useAuth()
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleContinue() {
    if (name.trim().length < 2) {
      Alert.alert('Enter your name', 'Please enter at least 2 characters')
      return
    }
    setLoading(true)
    try {
      const res = await authAPI.updateProfile({ name: name.trim() })
      updateUser({ name: res.data.data.name })
      router.replace('/(tabs)/')
    } catch {
      router.replace('/(tabs)/')
    } finally {
      setLoading(false)
    }
  }

  return (
    <LinearGradient colors={['#1E1B4B', '#312E81', '#F5F3FF']} style={styles.container} locations={[0, 0.4, 0.4]}>
      <View style={styles.header}>
        <Text style={styles.emoji}>👋</Text>
        <Text style={styles.title}>Welcome to Amazonia!</Text>
        <Text style={styles.subtitle}>What should we call you?</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Your Name</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="e.g. Hari Sharma"
          placeholderTextColor={COLORS.gray400}
          autoFocus
          autoCapitalize="words"
          returnKeyType="done"
          onSubmitEditing={handleContinue}
        />

        <TouchableOpacity
          style={[styles.btn, (name.trim().length < 2 || loading) && styles.disabledBtn]}
          onPress={handleContinue}
          disabled={name.trim().length < 2 || loading}
          activeOpacity={0.85}
        >
          {loading
            ? <ActivityIndicator color={COLORS.gray900} />
            : <Text style={styles.btnText}>Start Shopping →</Text>
          }
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.replace('/(tabs)/')} style={styles.skipBtn}>
          <Text style={styles.skipText}>Skip for now</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingTop: 80, paddingBottom: 32, paddingHorizontal: 24, alignItems: 'center' },
  emoji: { fontSize: 56, marginBottom: 16 },
  title: { fontSize: 26, fontWeight: '800', color: '#fff', textAlign: 'center', marginBottom: 8 },
  subtitle: { fontSize: 14, color: 'rgba(255,255,255,0.65)', textAlign: 'center' },
  card: {
    flex: 1, backgroundColor: '#F5F3FF', borderTopLeftRadius: 0,
    paddingHorizontal: 24, paddingTop: 36,
  },
  label: { fontSize: 13, fontWeight: '600', color: COLORS.gray600, marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.8 },
  input: {
    backgroundColor: '#fff', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 16,
    fontSize: 18, fontWeight: '600', color: COLORS.gray900,
    borderWidth: 1.5, borderColor: '#DDD6FE', marginBottom: 24,
  },
  btn: {
    backgroundColor: COLORS.cta, borderRadius: RADIUS.full, paddingVertical: 16, alignItems: 'center',
    shadowColor: COLORS.cta, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.35, shadowRadius: 12, elevation: 7,
  },
  disabledBtn: { backgroundColor: '#DDD6FE', shadowOpacity: 0 },
  btnText: { fontSize: 16, fontWeight: '800', color: COLORS.gray900 },
  skipBtn: { alignItems: 'center', marginTop: 16 },
  skipText: { color: COLORS.gray400, fontSize: 14 },
})
