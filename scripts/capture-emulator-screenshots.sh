#!/usr/bin/env bash
set -euo pipefail

APK_PATH="${1:?APK path required}"
OUT_DIR="${2:-artifacts/screenshots}"
mkdir -p "$OUT_DIR"
ADB="adb"
PACKAGE="com.empirerush.tycoon"
ACTIVITY="$PACKAGE/.MainActivity"

$ADB install -r "$APK_PATH" >/dev/null
$ADB shell settings put global window_animation_scale 0
$ADB shell settings put global transition_animation_scale 0
$ADB shell settings put global animator_duration_scale 0
$ADB shell am force-stop "$PACKAGE"
$ADB shell am start -n "$ACTIVITY" >/dev/null

app_in_focus() {
  $ADB shell dumpsys window windows 2>/dev/null | grep -E "mCurrentFocus|mFocusedApp" | grep -q "$PACKAGE"
}

wait_for_app() {
  for _ in $(seq 1 45); do
    if app_in_focus; then return 0; fi
    $ADB shell input keyevent KEYCODE_BACK >/dev/null 2>&1 || true
    sleep 2
  done
  echo "App did not reach foreground focus" >&2
  $ADB shell dumpsys window windows | tail -80 >&2 || true
  exit 1
}

wait_for_app

size="$($ADB shell wm size | sed -n 's/.*Physical size: //p' | tr -d '\r')"
width="${size%x*}"
height="${size#*x}"
if [[ -z "$width" || -z "$height" || "$width" == "$size" ]]; then width=1080; height=1920; fi
nav_y=$((height - 120))

shot() {
  local name="$1"
  wait_for_app
  sleep 1
  $ADB exec-out screencap -p > "$OUT_DIR/$name.png"
  test -s "$OUT_DIR/$name.png"
}

tap_nav() {
  local index="$1"
  local x=$((width * (index * 2 + 1) / 10))
  $ADB shell input tap "$x" "$nav_y"
  sleep 2
  wait_for_app
}

shot home
tap_nav 1
shot business
$ADB shell input tap "$((width / 4))" "$((height / 3))"
sleep 2
shot retail
tap_nav 2
shot markets
tap_nav 3
shot lifestyle
tap_nav 0
$ADB shell input tap "$((width - 70))" 115
sleep 2
shot settings

for image in "$OUT_DIR"/*.png; do
  test "$(wc -c < "$image")" -gt 20000 || { echo "Screenshot too small: $image" >&2; exit 1; }
done
