#!/usr/bin/env bash
set -euo pipefail

APK_PATH="${1:?APK path required}"
OUT_DIR="${2:-artifacts/screenshots}"
mkdir -p "$OUT_DIR"
ADB="adb"
PACKAGE="com.empirerush.tycoon"

$ADB wait-for-device
$ADB install -r "$APK_PATH" >/dev/null
$ADB shell pm clear "$PACKAGE" >/dev/null || true
$ADB shell settings put global window_animation_scale 0
$ADB shell settings put global transition_animation_scale 0
$ADB shell settings put global animator_duration_scale 0
$ADB shell am force-stop "$PACKAGE"

launcher="$($ADB shell cmd package resolve-activity --brief -a android.intent.action.MAIN -c android.intent.category.LAUNCHER "$PACKAGE" | tr -d '\r' | tail -1)"
if [[ -z "$launcher" || "$launcher" == "No activity found" ]]; then
  echo "Unable to resolve launcher activity for $PACKAGE" >&2
  $ADB shell pm path "$PACKAGE" >&2 || true
  exit 1
fi
echo "Launching $launcher"
$ADB shell am start -W -n "$launcher" || $ADB shell monkey -p "$PACKAGE" -c android.intent.category.LAUNCHER 1

app_in_focus() {
  $ADB shell dumpsys activity activities 2>/dev/null | grep -E "mResumedActivity|mFocusedApp" | grep -q "$PACKAGE"
}

wait_for_app() {
  for _ in $(seq 1 60); do
    if app_in_focus; then return 0; fi
    sleep 1
  done
  echo "App did not reach foreground focus" >&2
  $ADB shell dumpsys activity activities | grep -E "mResumedActivity|mFocusedApp|$PACKAGE|topResumedActivity" | tail -50 >&2 || true
  $ADB logcat -d -t 500 > "$OUT_DIR/emulator-logcat.txt" || true
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
