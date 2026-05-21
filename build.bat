@echo off
setlocal

rem TalentScreen Autofill Extension - Windows Build Script
rem Creates production-ready ZIP for Chrome Web Store

cd /d "%~dp0"

echo TalentScreen Autofill - Windows Build Script
echo ============================================

for /f "usebackq delims=" %%v in (`powershell -NoProfile -ExecutionPolicy Bypass -Command "(Get-Content -Raw manifest.json | ConvertFrom-Json).version"`) do set "VERSION=%%v"

if "%VERSION%"=="" (
  echo ERROR: Could not read version from manifest.json
  pause
  exit /b 1
)

echo Version: %VERSION%

if not exist dist mkdir dist

set "OUTPUT=dist\talentscreen-autofill-v%VERSION%.zip"

echo Cleaning old builds...
del /q "dist\*.zip" >nul 2>nul

echo Creating package...

powershell -NoProfile -ExecutionPolicy Bypass -Command ^
  "$ErrorActionPreference = 'Stop';" ^
  "$root = (Get-Location).Path;" ^
  "$output = Join-Path $root '%OUTPUT%';" ^
  "$temp = Join-Path $env:TEMP ('talentscreen-build-' + [guid]::NewGuid());" ^
  "$excludeDirs = @('.git', '.claude', 'docs', 'dist', 'node_modules');" ^
  "$excludeFiles = @('build.sh', 'build.bat');" ^
  "$excludeExtensions = @('.md', '.log', '.txt');" ^
  "New-Item -ItemType Directory -Path $temp | Out-Null;" ^
  "try {" ^
  "  Get-ChildItem -Path $root -Force | Where-Object { $excludeDirs -notcontains $_.Name } | ForEach-Object {" ^
  "    Copy-Item -Path $_.FullName -Destination $temp -Recurse -Force;" ^
  "  };" ^
  "  Get-ChildItem -Path $temp -Recurse -Force | Where-Object {" ^
  "    ($_.Name -like '*.DS_Store') -or" ^
  "    ($_.Name -like '*.git*') -or" ^
  "    ($excludeFiles -contains $_.Name) -or" ^
  "    ($_.Name -like 'package*.json') -or" ^
  "    ($_.Name -like '.env*') -or" ^
  "    ($excludeExtensions -contains $_.Extension)" ^
  "  } | Remove-Item -Recurse -Force;" ^
  "  Compress-Archive -Path (Join-Path $temp '*') -DestinationPath $output -Force;" ^
  "} finally {" ^
  "  Remove-Item -Path $temp -Recurse -Force -ErrorAction SilentlyContinue;" ^
  "}"

if errorlevel 1 (
  echo ERROR: Build failed.
  pause
  exit /b 1
)

echo Package created: %OUTPUT%

for %%A in ("%OUTPUT%") do echo Package size: %%~zA bytes

echo.
echo Build complete!
echo.
echo Next steps:
echo 1. Test: Load unpacked extension from current directory
echo 2. Upload: %OUTPUT% to Chrome Web Store
echo 3. Submit: Fill store listing and submit for review
echo.

pause
