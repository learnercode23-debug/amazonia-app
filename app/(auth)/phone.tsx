import { useState } from 'react'
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  KeyboardAvoidingView, Platform, Alert, ActivityIndicator, ScrollView
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { router } from 'expo-router'
import { useAuth } from '@/contexts/AuthContext'
import { COLORS, RADIUS } from '@/constants/theme'

const COUNTRY_CODES = [
  { flag: '🇳🇵', code: '+977', label: 'Nepal' },
  { flag: '🇮🇳', code: '+91',  label: 'India' },
  { flag: '🇺🇸', code: '+1',   label: 'USA' },
  { flag: '🇬🇧', code: '+44',  label: 'UK' },
]

export default function PhoneScreen() {
  const { sendOtp } = useAuth()
  const [selectedCountry, setSelectedCountry] = useState(COUNTRY_CODES[0])
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [showCountryPicker, setShowCountryPicker] = useState(false)

  const fullPhone = selectedCountry.code + phone.replace(/\s/g, '')

  async function handleSendOtp() {
    const digits = phone.replace(/\D/g, '')
    if (digits.length < 7 || digits.length > 12) {
      Alert.alert('Invalid Number', 'Please enter a valid phone number (7–12 digits)')
      return
    }

    setLoading(true)
    try {
      const result = await sendOtp(fullPhone)
      // In dev, the OTP is returned in the response
      router.push({
        pathname: '/(auth)/otp',
        params: { phone: fullPhone, devOtp: result.devOtp || '' },
      })
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error
      Alert.alert('Error', msg || 'Failed to send OTP. Check your internet connection.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <LinearGradient colors={['#1E1B4B', '#312E81']} style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Enter your phone</Text>
        <Text style={styles.subtitle}>
          We&apos;ll send a 6-digit code to verify your number
        </Text>
      </LinearGradient>

      <ScrollView style={styles.body} keyboardShouldPersistTaps="handled">
        {/* Country picker */}
        <Text style={styles.label}>Country</Text>
        <TouchableOpacity
          style={styles.countryBtn}
          onPress={() => setShowCountryPicker(!showCountryPicker)}
        >
          <Text style={styles.countryText}>
            {selectedCountry.flag} {selectedCountry.label} ({selectedCountry.code})
          </Text>
          <Text style={{ color: COLORS.gray400 }}>{showCountryPicker ? '▲' : '▼'}</Text>
        </TouchableOpacity>

        {showCountryPicker && (
          <View style={styles.countryList}>
            {COUNTRY_CODES.map((c) => (
              <TouchableOpacity
                key={c.code}
                style={[styles.countryOption, selectedCountry.code === c.code && styles.selectedOption]}
                onPress={() => { setSelectedCountry(c); setShowCountryPicker(false) }}
              >
                <Text style={styles.countryText}>{c.flag} {c.label}</Text>
                <Text style={{ color: COLORS.gray600 }}>{c.code}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Phone input */}
        <Text style={[styles.label, { marginTop: 20 }]}>Phone Number</Text>
        <View style={styles.phoneRow}>
          <View style={styles.codeBox}>
            <Text style={styles.codeText}>{selectedCountry.code}</Text>
          </View>
          <TextInput
            style={styles.phoneInput}
            value={phone}
            onChangeText={setPhone}
            placeholder="98XXXXXXXX"
            placeholderTextColor={COLORS.gray400}
            keyboardType="phone-pad"
            maxLength={14}
            autoFocus
          />
        </View>

        <Text style={styles.hint}>
          Full number: <Text style={{ color: COLORS.accent, fontWeight: '700' }}>{fullPhone}</Text>
        </Text>

        {/* Send OTP */}
        <TouchableOpacity
          style={[styles.sendBtn, (loading || phone.length < 7) && styles.disabledBtn]}
          onPress={handleSendOtp}
          disabled={loading || phone.replace(/\D/g, '').length < 7}
          activeOpacity={0.85}
        >
          {loading
            ? <ActivityIndicator color={COLORS.gray900} />
            : <Text style={styles.sendText}>Send OTP →</Text>
          }
        </TouchableOpacity>

        <Text style={styles.disclaimer}>
          By continuing, you agree to our Terms of Service and Privacy Policy.
          Standard messaging rates may apply.
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  header: { paddingTop: 60, paddingBottom: 32, paddingHorizontal: 24 },
  backBtn: { marginBottom: 20 },
  backText: { color: 'rgba(255,255,255,0.7)', fontSize: 15 },
  title: { fontSize: 28, fontWeight: '800', color: '#fff', marginBottom: 8 },
  subtitle: { color: 'rgba(255,255,255,0.65)', fontSize: 14, lineHeight: 20 },
  body: { flex: 1, backgroundColor: '#F5F3FF', padding: 24 },
  label: { fontSize: 13, fontWeight: '600', color: COLORS.gray600, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.8 },
  countryBtn: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: '#fff', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14,
    borderWidth: 1.5, borderColor: '#DDD6FE',
  },
  countryText: { fontSize: 15, color: COLORS.gray900 },
  countryList: {
    backgroundColor: '#fff', borderRadius: 12, marginTop: 4,
    borderWidth: 1.5, borderColor: '#DDD6FE', overflow: 'hidden',
  },
  countryOption: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#F5F3FF' },
  selectedOption: { backgroundColor: '#EDE9FE' },
  phoneRow: { flexDirection: 'row', gap: 10 },
  codeBox: {
    backgroundColor: '#EDE9FE', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 14,
    justifyContent: 'center', borderWidth: 1.5, borderColor: '#DDD6FE',
  },
  codeText: { fontSize: 15, fontWeight: '700', color: COLORS.accent },
  phoneInput: {
    flex: 1, backgroundColor: '#fff', borderRadius: 12, paddingHorizontal: 16, fontSize: 20,
    borderWidth: 1.5, borderColor: '#DDD6FE', color: COLORS.gray900, fontWeight: '600',
  },
  hint: { marginTop: 8, fontSize: 12, color: COLORS.gray400 },
  sendBtn: {
    backgroundColor: COLORS.cta, borderRadius: 999, paddingVertical: 16,
    alignItems: 'center', marginTop: 28,
    shadowColor: COLORS.cta, shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35, shadowRadius: 12, elevation: 7,
  },
  disabledBtn: { backgroundColor: COLORS.gray200, shadowOpacity: 0 },
  sendText: { fontSize: 16, fontWeight: '800', color: COLORS.gray900 },
  disclaimer: { marginTop: 24, fontSize: 11, color: COLORS.gray400, textAlign: 'center', lineHeight: 16 },
})
