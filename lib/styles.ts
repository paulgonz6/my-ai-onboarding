// Common style constants to maintain consistency across the app

// Gradient presets
export const gradients = {
  primary: 'from-emerald-500 to-teal-500',
  secondary: 'from-purple-500 to-pink-500',
  accent: 'from-orange-500 to-red-500',
  info: 'from-blue-500 to-cyan-500',
  success: 'from-green-500 to-emerald-500',
  warning: 'from-yellow-500 to-orange-500',
  danger: 'from-red-500 to-rose-500',
  
  // Full gradient classes
  primaryBg: 'bg-gradient-to-r from-emerald-500 to-teal-500',
  secondaryBg: 'bg-gradient-to-r from-purple-500 to-pink-500',
  accentBg: 'bg-gradient-to-r from-orange-500 to-red-500',
  
  // Subtle gradients for backgrounds
  primarySubtle: 'from-emerald-500/10 to-teal-500/10',
  secondarySubtle: 'from-purple-500/10 to-pink-500/10',
  accentSubtle: 'from-orange-500/10 to-red-500/10'
} as const

// Glass effect styles
export const glass = {
  card: 'bg-white/5 backdrop-blur-xl border border-white/10',
  cardHover: 'bg-white/5 backdrop-blur-xl border border-white/10 hover:border-white/20',
  button: 'bg-white/10 backdrop-blur border border-white/20',
  modal: 'bg-gray-900/95 backdrop-blur-xl border border-white/10'
} as const

// Common component styles
export const components = {
  // Input styles
  input: 'w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 focus:border-emerald-500 focus:outline-none transition',
  inputWithIcon: 'w-full pl-10 pr-4 py-3 bg-white/5 border border-white/20 rounded-lg focus:border-emerald-500 focus:outline-none transition',
  
  // Button styles
  primaryButton: 'px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg font-semibold hover:shadow-lg hover:shadow-emerald-500/25 transition',
  secondaryButton: 'px-4 py-2 bg-white/10 border border-white/20 rounded-lg hover:bg-white/20 transition',
  ghostButton: 'px-4 py-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition',
  
  // Badge styles
  badge: 'px-2 py-1 rounded-full text-xs font-medium',
  badgeSuccess: 'bg-green-500/20 text-green-400',
  badgeWarning: 'bg-yellow-500/20 text-yellow-400',
  badgeDanger: 'bg-red-500/20 text-red-400',
  badgeInfo: 'bg-blue-500/20 text-blue-400',
  
  // Section styles
  section: 'py-20 px-6',
  container: 'max-w-7xl mx-auto',
  
  // Typography
  heading1: 'text-4xl md:text-6xl font-display font-bold',
  heading2: 'text-3xl md:text-4xl font-display font-bold',
  heading3: 'text-2xl md:text-3xl font-display font-bold',
  heading4: 'text-xl md:text-2xl font-display font-bold',
  body: 'text-base font-sans text-gray-300',
  bodySmall: 'text-sm font-sans text-gray-400',
  
  // Loading states
  spinner: 'animate-spin rounded-full border-2 border-white border-t-transparent',
  skeleton: 'animate-pulse bg-white/10 rounded'
} as const

// Shadow presets
export const shadows = {
  sm: 'shadow-sm',
  md: 'shadow-md',
  lg: 'shadow-lg shadow-black/50',
  xl: 'shadow-xl shadow-black/50',
  glow: 'shadow-lg shadow-emerald-500/25',
  glowStrong: 'shadow-xl shadow-emerald-500/50'
} as const

// Border radius presets
export const radius = {
  sm: 'rounded',
  md: 'rounded-lg',
  lg: 'rounded-xl',
  xl: 'rounded-2xl',
  full: 'rounded-full'
} as const

// Spacing scale
export const spacing = {
  section: 'py-20',
  sectionLg: 'py-32',
  container: 'px-6',
  card: 'p-6',
  cardLg: 'p-8'
} as const

// Z-index scale
export const zIndex = {
  base: 0,
  dropdown: 10,
  sticky: 20,
  overlay: 30,
  modal: 40,
  popover: 50,
  toast: 60,
  tooltip: 70
} as const