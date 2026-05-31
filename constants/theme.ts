// ── Modern Purple Theme (matches web app) ─────────────────────────────────
export const COLORS = {
  // Brand purples
  primary:    '#1E1B4B',   // deep indigo-purple  — headers, nav bg
  secondary:  '#312E81',   // royal indigo         — secondary elements
  accent:     '#7C3AED',   // violet-600           — links, badges
  light:      '#A78BFA',   // violet-400           — light accents
  purple50:   '#F5F3FF',   // near-white purple    — page backgrounds
  purple100:  '#EDE9FE',   // very light violet    — card borders

  // CTA
  cta:        '#F59E0B',   // amber-500            — Add to Cart
  ctaDark:    '#D97706',   // amber-600            — pressed state

  // Status
  success:    '#10B981',   // emerald
  error:      '#EF4444',   // red
  warning:    '#F59E0B',   // amber

  // Neutral
  white:      '#FFFFFF',
  gray50:     '#F9FAFB',
  gray100:    '#F3F4F6',
  gray200:    '#E5E7EB',
  gray400:    '#9CA3AF',
  gray600:    '#4B5563',
  gray900:    '#111827',
  black:      '#000000',
}

export const FONTS = {
  regular:  'System',
  medium:   'System',
  bold:     'System',
  sizes: {
    xs:   11,
    sm:   13,
    base: 15,
    lg:   17,
    xl:   20,
    '2xl': 24,
    '3xl': 30,
  },
}

export const RADIUS = {
  sm:   6,
  md:   10,
  lg:   16,
  xl:   20,
  full: 999,
}

export const SHADOW = {
  sm: {
    shadowColor: '#6D28D9',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  md: {
    shadowColor: '#6D28D9',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
}
