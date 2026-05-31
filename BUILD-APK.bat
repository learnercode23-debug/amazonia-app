@echo off
echo ============================================
echo   Amazonia App - Build APK File
echo ============================================
echo.
echo This will build a REAL .apk file you can install on any Android device.
echo Requirements: Free account at https://expo.dev
echo.
cd /d "%~dp0"

echo [1/3] Logging into Expo (opens browser)...
call npx eas-cli login

echo.
echo [2/3] Configuring build (first time only)...
call npx eas-cli build:configure

echo.
echo [3/3] Building APK (takes about 10-15 minutes in cloud)...
call npx eas-cli build -p android --profile preview

echo.
echo ============================================
echo  APK download link printed above ^
echo  Also available at: https://expo.dev/accounts/YOUR_USERNAME/builds
echo ============================================
pause
