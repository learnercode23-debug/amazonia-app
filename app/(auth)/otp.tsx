import { useState, useRef, useEffect } from 'react'
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  KeyboardAvoidingView, Platform, Alert, ActivityIndicator
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { router, useLocalSearchParams } from 'expo-router'
import { useAuth } from '@/contexts/AuthContext'
import { COLORS, RADIUS } from '@/constants/theme'

export default function OtpScreen() {
  const { phone, devOtp } = useLocalSearchParams<{ phone: string; devOtp: string }>()
  const { sendOtp, verifyOtp } = useAuth()

  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [loading, setLoading] = useState(false)
  const [resendCountdown, setResendCountdown] = useState(60)
  const [resending, setResending] = useState(false)
  const inputRefs = useRef<(TextInput | null)[]>([])

  // Show dev OTP hint
  useEffect(() => {
    if (devOtp) {
      Alert.alert('Dev Mode', `OTP for testing: ${devOtp}`, [{ text: 'OK' }])
    }
  }, [devOtp])

  // Countdown timer
  useEffect(() => {
    if (resendCountdown <= 0) return
    const timer = setTimeout(() => setResendCountdown((p) => p - 1), 1000)
    return () => clearTimeout(timer)
  }, [resendCountdown])

  function handleDigit(value: string, index: number) {
    // Handle paste of full OTP
    if (value.length === 6 && /^\d{6}$/.test(value)) {
      const digits = value.split('')
      setOtp(digits)
      inputRefs.current[5]?.focus()
      return
    }

    const digit = value.replace(/\D/g, '').slice(-1)
    const newOtp = [...otp]
    newOtp[index] = digit
    setOtp(newOtp)

    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  function handleBackspace(index: number) {
    if (!otp[index] && index > 0) {
      const newOtp = [...otp]
      newOtp[index - 1] = ''
      setOtp(newOtp)
      inputRefs.current[index - 1]?.focus()
    } else {
      const newOtp = [...otp]
      newOtp[index] = ''
      setOtp(newOtp)
    }
  }

  async function handleVerify() {
    const code = otp.join('')
    if (code.length < 6) {
      Alert.alert('Incomplete', 'Please enter all 6 digits')
      return
    }

    setLoading(true)
    try {
      const { isNewUser } = await verifyOtp(phone, code)
      if (isNewUser) {
        router.replace('/(auth)/name')
      } else {
        router.replace('/(tabs)/')
      }
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error
      Alert.alert('Incorrect OTP', msg || 'Invalid code. Please try again.')
      setOtp(['', '', '', '', '', ''])
      inputRefs.current[0]?.focus()
    } finally {
      setLoading(false)
    }
  }

  async function handleResend() {
    if (resendCountdown > 0) return
    setResending(true)
    try {
      const result = await sendOtp(phone)
      if (result.devOtp) {
        Alert.alert('Dev Mode', `New OTP: ${result.devOtp}`)
      } else {
        Alert.alert('Sent!', 'A new OTP has been sent to your phone.')
      }
      setResendCountdown(60)
      setOtp(['', '', '', '', '', ''])
      inputRefs.current[0]?.focus()
    } catch {
      Alert.alert('Error', 'Failed to resend OTP.')
    } finally {
      setResending(false)
    }
  }

  const isComplete = otp.every((d) => d !== '')

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <LinearGradient colors={['#1E1B4B', '#312E81']} style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Verify your number</Text>
        <Text style={styles.subtitle}>
          Enter the 6-digit code sent to{'\n'}
          <Text style={{ color: COLORS.cta, fontWeight: '700' }}>{phone}</Text>
        </Text>
      </LinearGradient>

      <View style={styles.body}>
        {/* OTP boxes */}
        <View style={styles.otpRow}>
          {otp.map((digit, i) => (
            <TextInput
              key={i}
              ref={(ref) => { inputRefs.current[i] = ref }}
              style={[styles.otpBox, digit ? styles.otpBoxFilled : null]}
              value={digit}
              onChangeText={(v) => handleDigit(v, i)}
              onKeyPress={({ nativeEvent }) => {
                if (nativeEvent.key === 'Backspace') handleBackspace(i)
              }}
              keyboardType="number-pad"
              maxLength={6}
              textAlign="center"
              autoFocus={i === 0}
            />
          ))}
        </View>

        {/* Verify button */}
        <TouchableOpacity
          style={[styles.verifyBtn, (!isComplete || loading) && styles.disabledBtn]}
          onPress={handleVerify}
          disabled={!isComplete || loading}
          activeOpacity={0.85}
        >
          {loading
            ? <ActivityIndicator color={COLORS.gray900} />
            : <Text style={styles.verifyText}>Verify & Continue</Text>
          }
        </TouchableOpacity>

        {/* Resend */}
        <View style={styles.resendRow}>
          <Text style={styles.resendLabel}>Didn&apos;t receive the code? </Text>
          <TouchableOpacity
            onPress={handleResend}
            disabled={resendCountdown > 0 || resending}
          >
            {resending
              ? <ActivityIndicator size="small" color={COLORS.accent} />
              : <Text style={[styles.resendText, resendCountdown > 0 && styles.resendDisabled]}>
                {resendCountdown > 0 ? `Resend in ${resendCountdown}s` : 'Resend OTP'}
              </Text>
            }
          </TouchableOpacity>
        </View>

        <Text style={styles.secureNote}>🔒 Secure verification powered by Amazonia</Text>
      </View>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  header: { paddingTop: 60, paddingBottom: 32, paddingHorizontal: 24 },
  backBtn: { marginBottom: 20 },
  backText: { color: 'rgba(255,255,255,0.7)', fontSize: 15 },
  title: { fontSize: 28, fontWeight: '800', color: '#fff', marginBottom: 8 },
  subtitle: { color: 'rgba(255,255,255,0.65)', fontSize: 14, lineHeight: 22 },
  body: { flex: 1, backgroundColor: '#F5F3FF', padding: 24, alignItems: 'center', paddingTop: 40 },
  otpRow: { flexDirection: 'row', gap: 10, marginBottom: 36 },
  otpBox: {
    width: 48, height: 58, borderRadius: 12, backgroundColor: '#fff',
    borderWidth: 2, borderColor: '#DDD6FE', fontSize: 24, fontWeight: '800',
    color: COLORS.primary,
  },
  otpBoxFilled: { borderColor: COLORS.accent, backgroundColor: '#EDE9FE' },
  verifyBtn: {
    backgroundColor: COLORS.cta, borderRadius: RADIUS.full, paddingVertical: 16,
    width: '100%', alignItems: 'center',
    shadowColor: COLORS.cta, shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35, shadowRadius: 12, elevation: 7,
  },
  disabledBtn: { backgroundColor: '#DDD6FE', shadowOpacity: 0 },
  verifyText: { fontSize: 16, fontWeight: '800', color: COLORS.gray900 },
  resendRow: { flexDirection: 'row', alignItems: 'center', marginTop: 24 },
  resendLabel: { color: COLORS.gray600, fontSize: 14 },
  resendText: { color: COLORS.accent, fontSize: 14, fontWeight: '700' },
  resendDisabled: { color: COLORS.gray400 },
  secureNote: { position: 'absolute', bottom: 40, color: COLORS.gray400, fontSize: 12 },
})
