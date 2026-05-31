import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Image } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { router } from 'expo-router'
import { COLORS, FONTS, RADIUS } from '@/constants/theme'

const { width, height } = Dimensions.get('window')

export default function WelcomeScreen() {
  return (
    <LinearGradient
      colors={['#1E1B4B', '#312E81', '#4C1D95']}
      style={styles.container}
    >
      {/* Decorative circles */}
      <View style={[styles.orb, { top: -60, right: -60, width: 200, height: 200, backgroundColor: 'rgba(167,139,250,0.15)' }]} />
      <View style={[styles.orb, { bottom: 120, left: -80, width: 250, height: 250, backgroundColor: 'rgba(109,40,217,0.15)' }]} />

      <View style={styles.content}>
        {/* Logo */}
        <View style={styles.logoContainer}>
          <Text style={styles.logoText}>amazonia</Text>
          <Text style={styles.logoDot}>.</Text>
        </View>
        <Text style={styles.tagline}>Shop Everything, Everywhere</Text>

        {/* Feature list */}
        <View style={styles.features}>
          {[
            { icon: '🛍️', text: 'Thousands of products' },
            { icon: '🚀', text: 'Fast delivery across Nepal' },
            { icon: '💳', text: 'Pay with eSewa, Khalti or Cash' },
            { icon: '🔒', text: 'Secure phone verification' },
          ].map((item, i) => (
            <View key={i} style={styles.featureRow}>
              <Text style={styles.featureIcon}>{item.icon}</Text>
              <Text style={styles.featureText}>{item.text}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* CTA */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.ctaButton}
          onPress={() => router.push('/(auth)/phone')}
          activeOpacity={0.85}
        >
          <Text style={styles.ctaText}>Get Started →</Text>
        </TouchableOpacity>
        <Text style={styles.footerNote}>
          Sign in with your phone number — no password needed
        </Text>
      </View>
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  orb: { position: 'absolute', borderRadius: 999 },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingTop: 80,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 8,
  },
  logoText: {
    fontSize: 42,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -1,
  },
  logoDot: {
    fontSize: 52,
    fontWeight: '900',
    color: COLORS.cta,
    lineHeight: 52,
    marginBottom: -4,
  },
  tagline: {
    color: 'rgba(255,255,255,0.65)',
    fontSize: 15,
    marginBottom: 48,
    letterSpacing: 0.3,
  },
  features: { width: '100%', gap: 16 },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  featureIcon: { fontSize: 22 },
  featureText: { color: 'rgba(255,255,255,0.85)', fontSize: 15 },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 48,
    alignItems: 'center',
    gap: 12,
  },
  ctaButton: {
    backgroundColor: COLORS.cta,
    width: '100%',
    paddingVertical: 16,
    borderRadius: RADIUS.full,
    alignItems: 'center',
    shadowColor: COLORS.cta,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  ctaText: {
    color: COLORS.gray900,
    fontSize: 16,
    fontWeight: '800',
  },
  footerNote: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 12,
    textAlign: 'center',
  },
})
