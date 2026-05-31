# ============================================================
# Amazonia APK Builder — Run this in PowerShell as Administrator
# ============================================================

Write-Host ""
Write-Host "=== AMAZONIA APK BUILDER ===" -ForegroundColor Cyan
Write-Host ""

# Change to app directory
Set-Location "C:\Users\sah12\Documents\amazonia-app"

# Step 1: Check EAS CLI
Write-Host "[1/4] Checking EAS CLI..." -ForegroundColor Yellow
$easVersion = eas --version 2>&1
Write-Host "EAS version: $easVersion" -ForegroundColor Green

# Step 2: Login to Expo
Write-Host ""
Write-Host "[2/4] Login to Expo account..." -ForegroundColor Yellow
Write-Host "      (Create free account at https://expo.dev if you don't have one)" -ForegroundColor Gray
eas login

# Step 3: Configure project
Write-Host ""
Write-Host "[3/4] Configuring project..." -ForegroundColor Yellow
eas build:configure

# Step 4: Build APK
Write-Host ""
Write-Host "[4/4] Building APK (10-15 minutes)..." -ForegroundColor Yellow
Write-Host "      The APK download link will appear when done" -ForegroundColor Gray
eas build -p android --profile preview

Write-Host ""
Write-Host "=== BUILD COMPLETE ===" -ForegroundColor Green
Write-Host "Download your APK from the link above" -ForegroundColor White
Write-Host "Or visit: https://expo.dev/accounts/[your-username]/builds" -ForegroundColor Gray
