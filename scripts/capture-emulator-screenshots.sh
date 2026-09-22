#!/usr/bin/env bash
set -euo pipefail

APK_PATH="${1:?APK path required}"
OUT_DIR="${2:-artifacts/screenshots}"
mkdir -p "$OUT_DIR"
ADB="adb"
PACKAGE="com.empirerush.tycoon"

$ADB install -r "$APK_PATH" >/dev/null
$ADB shell am force-stop "$PACKAGE"
$ADB shell monkey -p "$PACKAGE" 1 >/dev/null
sleep 3

size="$($ADB shell wm size | sed -n 's/.*Physical size: //p' | tr -d '\r')"
width="${size%x*}"
height="${size#*x}"
if [[ -z "$width" || -z "$height" || "$width" == "$size" ]]; then width=1080; height=1920; fi
nav_y=$((height - 120))
center_x=$((width / 2))

shot() {
  local name="$1"
  sleep 1
  $ADB exec-out screencap -p > "$OUT_DIR/$name.png"
}

tap_nav() {
  local index="$1"
  local x=$((width * (index * 2 + 1) / 10))
  $ADB shell input tap "$x" "$nav_y"
  sleep 2
}

shot home
# Business registry.
tap_nav 1
shot business
# Open the first unlocked retail card and capture operations.
$ADB shell input tap "$((width / 4))" "$((height / 3))"
sleep 2
shot retail
# Return to a top-level screen and capture markets.
tap_nav 2
shot markets
# Lifestyle tab.
tap_nav 3
shot lifestyle
# Home, then settings gear.
tap_nav 0
$ADB shell input tap "$((width - 70))" 115
sleep 2
shot settings
