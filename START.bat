@echo off
echo ============================================
echo   Amazonia App - Starting Development Server
echo ============================================
echo.
echo Step 1: Make sure backend is running at localhost:3002
echo         (cd product folder and run: npm run dev)
echo.
echo Step 2: Install Expo Go from Play Store on your Android phone
echo         Search: "Expo Go"
echo.
echo Step 3: This window will show a QR code - scan it with:
echo         - Android: Use Expo Go app
echo         - iPhone:  Use your Camera app
echo.
cd /d "%~dp0"
call npx expo start
pause
