# Amazonia Android App

React Native (Expo) app for the Amazonia e-commerce platform.
Phone OTP authentication — no password needed.

---

## Screens

| Screen | Description |
|--------|-------------|
| Welcome | Splash / intro screen |
| Phone   | Enter country code + phone number |
| OTP     | Enter 6-digit verification code |
| Name    | First-time users set their name |
| Home    | Banner, categories, deals, featured products |
| Browse  | Search, sort, filter all products |
| Product | Detail page with images, reviews, add to cart |
| Cart    | Quantity controls, coupon, COD checkout |
| Orders  | Order history with status tracking |
| Profile | Account info, settings, logout |

---

## Prerequisites

```
Node.js 18+
npm or yarn
Expo CLI  (npm install -g expo-cli)
EAS CLI   (npm install -g eas-cli)
```

---

## Step 1 — Start the backend first

```bash
cd c:\Users\sah12\Documents\product
npm run dev      # starts on http://localhost:3002
```

Seed the database (run once):
```
POST http://localhost:3002/api/seed
```

---

## Step 2 — Install app dependencies

```bash
cd c:\Users\sah12\Documents\amazonia-app
npm install
```

---

## Step 3 — Configure API URL

Edit `constants/config.ts`:

```ts
// For Android Emulator:
export const API_BASE_URL = 'http://10.0.2.2:3002'

// For physical device (same WiFi as your computer):
export const API_BASE_URL = 'http://192.168.1.X:3002'   // your PC's local IP

// For production:
export const API_BASE_URL = 'https://your-domain.com'
```

Find your PC's local IP:
- Windows: run `ipconfig` → look for IPv4 Address

---

## Step 4 — Run on Android Emulator

```bash
# Start the app in Expo Go
npx expo start

# Press 'a' to open on Android emulator
# OR scan the QR code with Expo Go app on your phone
```

**OTP in dev mode:** The 6-digit OTP is printed in the server console
AND returned in the API response (shown as an Alert popup in the app).

---

## Step 5 — Build APK

### Option A: EAS Build (Recommended — no Android Studio needed)

```bash
# 1. Create a free Expo account at expo.dev
# 2. Login
eas login

# 3. Configure the project (first time only)
eas build:configure

# 4. Build APK for testing
eas build -p android --profile preview

# 5. Download the APK from the link printed in terminal
#    (also available at expo.dev/accounts/YOUR_USERNAME/builds)
```

### Option B: Local build (requires Android Studio)

```bash
# Generate native Android project
npx expo prebuild --platform android

# Build debug APK
cd android
./gradlew assembleDebug

# APK location:
# android/app/build/outputs/apk/debug/app-debug.apk

# Copy to your phone via USB and install
```

### Option C: Expo Go (fastest for testing, no APK needed)

```bash
npx expo start
# Scan QR code with Expo Go (Android) or Camera (iOS)
```

---

## Environment Variables

Add to `.env` in the app root:

```env
EXPO_PUBLIC_API_URL=http://10.0.2.2:3002
```

Backend `.env.local` — for SMS support (optional):
```env
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=+1234567890
```

Without Twilio, the OTP appears in the server console:
```
[OTP] +9779801234567 → Your Amazonia verification code is: 123456
```

---

## Test Credentials (after seeding)

| Flow | Credentials |
|------|-------------|
| Phone OTP | Any valid phone number, OTP appears in server console |
| Demo coupon | SAVE10, FLAT20, NEWUSER |
| Web admin | admin@amazonia.com / admin123 |

---

## Project Structure

```
amazonia-app/
├── app/
│   ├── _layout.tsx          Root layout (providers)
│   ├── index.tsx            Redirect to auth or tabs
│   ├── (auth)/
│   │   ├── welcome.tsx      Intro / get started
│   │   ├── phone.tsx        Phone number input
│   │   ├── otp.tsx          6-digit OTP verification
│   │   └── name.tsx         First-time name setup
│   ├── (tabs)/
│   │   ├── index.tsx        Home feed
│   │   ├── products.tsx     Browse & search
│   │   ├── cart.tsx         Cart + checkout
│   │   ├── orders.tsx       Order history
│   │   └── profile.tsx      Account settings
│   └── product/[id].tsx     Product detail
├── contexts/
│   ├── AuthContext.tsx       Phone OTP auth + JWT storage
│   └── CartContext.tsx       Cart state management
├── services/
│   └── api.ts               All backend API calls
├── constants/
│   ├── theme.ts             Colors, fonts, shadows
│   └── config.ts            API URL, app config
├── app.json                 Expo configuration
├── eas.json                 EAS Build configuration
└── package.json
```

---

## APK Install on Android Phone

1. Build the APK using one of the methods above
2. Transfer APK to your phone (USB, Google Drive, WhatsApp, etc.)
3. On your phone: Settings → Security → **Allow unknown sources**
4. Open the APK file and tap **Install**
5. Open **Amazonia** and enter your phone number

---

## Backend Changes Made

Two new endpoints added to the Next.js backend:

```
POST /api/auth/otp/send
  Body: { phone: "+9779801234567" }
  → Generates OTP, sends SMS (or logs to console)
  → Rate limited: 3 per phone per 10 minutes

POST /api/auth/otp/verify
  Body: { phone, otp, name? }
  → Verifies OTP, creates/finds user
  → Returns JWT token in response body (for mobile storage)
```

New MongoDB model: `PhoneOtp` (auto-expires after 5 minutes via TTL index)
