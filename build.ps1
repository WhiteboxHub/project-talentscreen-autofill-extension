$ErrorActionPreference = "Stop"

# TalentScreen Autofill Extension - Windows Build Script
# Creates production-ready ZIP for Chrome Web Store

Set-Location -Path $PSScriptRoot

Write-Host "TalentScreen Autofill - PowerShell Build Script"
Write-Host "================================================"

$manifest = Get-Content -Raw -Path "manifest.json" | ConvertFrom-Json
$version = $manifest.version

if ([string]::IsNullOrWhiteSpace($version)) {
    Write-Host "ERROR: Could not read version from manifest.json"
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host "Version: $version"

$distPath = Join-Path $PSScriptRoot "dist"
$output = Join-Path $distPath "talentscreen-autofill-v$version.zip"

New-Item -ItemType Directory -Path $distPath -Force | Out-Null

Write-Host "Cleaning old builds..."
Remove-Item -Path (Join-Path $distPath "*.zip") -Force -ErrorAction SilentlyContinue

Write-Host "Creating package..."

$tempPath = Join-Path ([System.IO.Path]::GetTempPath()) "talentscreen-build-$([guid]::NewGuid())"
$excludeDirs = @(".git", ".claude", "docs", "dist", "node_modules")
$excludeFiles = @("build.sh", "build.ps1")
$excludeExtensions = @(".md", ".log", ".txt")

New-Item -ItemType Directory -Path $tempPath -Force | Out-Null

try {
    Get-ChildItem -Path $PSScriptRoot -Force |
        Where-Object { $excludeDirs -notcontains $_.Name } |
        ForEach-Object {
            Copy-Item -Path $_.FullName -Destination $tempPath -Recurse -Force
        }

    Get-ChildItem -Path $tempPath -Recurse -Force |
        Where-Object {
            ($_.Name -like "*.DS_Store") -or
            ($_.Name -like "*.git*") -or
            ($excludeFiles -contains $_.Name) -or
            ($_.Name -like "package*.json") -or
            ($_.Name -like ".env*") -or
            ($excludeExtensions -contains $_.Extension)
        } |
        Remove-Item -Recurse -Force

    Compress-Archive -Path (Join-Path $tempPath "*") -DestinationPath $output -Force
}
finally {
    Remove-Item -Path $tempPath -Recurse -Force -ErrorAction SilentlyContinue
}

Write-Host "Package created: $output"
$size = (Get-Item $output).Length
Write-Host "Package size: $size bytes"

Write-Host ""
Write-Host "Build complete!"
Write-Host ""
Write-Host "Next steps:"
Write-Host "1. Test: Load unpacked extension from current directory"
Write-Host "2. Upload: $output to Chrome Web Store"
Write-Host "3. Submit: Fill store listing and submit for review"
Write-Host ""

Read-Host "Press Enter to exit"
