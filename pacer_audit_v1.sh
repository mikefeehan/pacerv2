#!/usr/bin/env bash
set -euo pipefail

ROOT="${1:-.}"

echo "=============================================="
echo "PACER V1 AUDIT (repo: $ROOT)"
echo "=============================================="

need() { command -v "$1" >/dev/null 2>&1 || { echo "Missing command: $1"; exit 1; }; }
need grep
need find

RG="grep -rIn"

pass() { echo "✅ $1"; }
fail() { echo "❌ $1"; }
warn() { echo "⚠️  $1"; }

has_file() {
  local f="$1"
  if [ -f "$ROOT/$f" ]; then
    pass "File present: $f"
  else
    fail "Missing file: $f"
  fi
}

has_pattern() {
  local label="$1"; shift
  local pat="$1"; shift
  if eval "$RG \"$pat\" \"$ROOT\" >/dev/null 2>&1"; then
    pass "$label"
    eval "$RG \"$pat\" \"$ROOT\" 2>/dev/null | head -n 3" || true
  else
    fail "$label"
  fi
  echo ""
}

maybe_pattern() {
  local label="$1"; shift
  local pat="$1"; shift
  if eval "$RG \"$pat\" \"$ROOT\" >/dev/null 2>&1"; then
    warn "$label (found)"
    eval "$RG \"$pat\" \"$ROOT\" 2>/dev/null | head -n 3" || true
  else
    warn "$label (not found)"
  fi
  echo ""
}

echo "---- REQUIRED FILES (Checklist #25) ----"
has_file "src/lib/run-store.ts"
has_file "src/lib/strava-api.ts"
has_file "src/lib/audio/voice.ts"
has_file "src/lib/gps-tracking.ts"
has_file "src/lib/gpx-writer.ts"
has_file "src/lib/strava-title.ts"
has_file "src/lib/app-settings.ts"
has_file "src/app/run-active.tsx"
has_file "src/app/run-recap.tsx"
has_file "src/app/strava-connect.tsx"
has_file "src/app/settings.tsx"
echo ""

echo "---- ENV / STRAVA KEYS (Checklist #2, #27) ----"
maybe_pattern "EXPO_PUBLIC_STRAVA_CLIENT_ID usage" "EXPO_PUBLIC_STRAVA_CLIENT_ID"
maybe_pattern "EXPO_PUBLIC_STRAVA_CLIENT_SECRET usage" "EXPO_PUBLIC_STRAVA_CLIENT_SECRET"
has_pattern "Error shown when keys missing" "missing API keys|STRAVA.*unavailable|Strava.*not.*configured"
echo ""

echo "---- OAUTH FLOW / URL SCHEME PARSING (Checklist #3, #28) ----"
has_pattern "WebBrowser.openAuthSessionAsync used" "openAuthSessionAsync"
has_pattern "Custom scheme vibecode://strava-callback referenced" "vibecode://strava-callback"
has_pattern "Regex parsing of code from callback URL" "codeMatch|match.*code="
maybe_pattern "Problematic new URL() usage" "new URL.*result\.url"
has_pattern "OAuth callback URL logged for debugging" "console.log.*callback|console.log.*url.*OAuth"
has_pattern "Access token stored in AsyncStorage" "setItem.*access_token|storeTokens"
has_pattern "Connected state shown after success" "Connected|setConnected|isConnected"
echo ""

echo "---- TOKEN REFRESH (Checklist #4) ----"
has_pattern "Refresh token endpoint called" "oauth/token.*refresh_token|grant_type.*refresh_token"
has_pattern "Refreshed tokens saved to storage" "storeTokens|setItem.*refresh"
echo ""

echo "---- VOICE / AUDIO CONFIG (Checklist #5, #29) ----"
has_pattern "Audio.setAudioModeAsync present" "Audio.setAudioModeAsync"
has_pattern "InterruptionModeIOS.DuckOthers used" "InterruptionModeIOS.DuckOthers"
has_pattern "playsInSilentModeIOS: true set" "playsInSilentModeIOS.*true"
has_pattern "Volume explicitly set" "volume.*1(\\.0)?"
has_pattern "Text-to-speech Speech.speak used" "Speech.speak"
has_pattern "Test Voice button with PACER message" "PACER is ready to help you run"
has_pattern "Playing... UI state during speak" "Playing.*isTestingVoice"
has_pattern "Voice stops on overlay close" "Speech.stop|stopSpeaking"
echo ""

echo "---- GPS TRACKING (Checklist #8-10, #30) ----"
has_pattern "Location permission request" "requestForegroundPermissionsAsync|requestLocationPermissions"
has_pattern "Error handling for denied permissions" "status.*denied|permission.*not granted|GPS.*error"
has_pattern "watchPositionAsync used" "watchPositionAsync"
has_pattern "Time/distance intervals set correctly" "timeInterval.*1000|distanceInterval.*[25]"
has_pattern "Haversine formula for distance" "calculateDistance|calculateTotalDistance|Haversine"
has_pattern "Local ref accumulates points" "localGpsPointsRef|useRef.*GPSPoint"
maybe_pattern "Ignores 0-speed points" "speed.*0|speed <= 0"
echo ""

echo "---- LIVE MAP (Checklist #10) ----"
has_pattern "MapView component used" "MapView"
has_pattern "Polyline for route visualization" "Polyline"
has_pattern "Current position marker shown" "Marker.*currentPosition"
echo ""

echo "---- HYPE ENGINE (Checklist #11-13) ----"
has_pattern "6 minute warmup before triggers" "360|6.*min|MIN_TIME_SECONDS"
has_pattern "Baseline pace calculated at 6 min" "baselineRef|baselinePace"
has_pattern "Pace drop detection 7%+" "0.07|1.07|PACE_DROP_THRESHOLD"
has_pattern "Cooldown 90 seconds" "90.*1000|COOLDOWN_SECONDS.*90|cooldown.*90"
has_pattern "Max 6 events per run" "MAX_EVENTS.*6|<= 6|hypeEventCount.*6"
has_pattern "Overlay auto-closes" "setTimeout.*4000|4s|6000"
has_pattern "triggerHypeEvent function exists" "triggerHypeEvent"
echo ""

echo "---- RUN STORE / PIPELINE (Checklist #14-15, #22-23) ----"
has_pattern "Zustand store used" "create<|zustand"
has_pattern "startRun creates session" "startRun.*session|session.*startedAt"
has_pattern "addGPSPoint appends to gpsPoints" "addGPSPoint|gpsPoints.*push|gpsPoints.*concat"
has_pattern "addHypeEvent adds to hypeEvents" "addHypeEvent|hypeEvents.*push"
has_pattern "endRun finalizes totals" "endRun|totalDistance|totalDuration"
has_pattern "Recap reads from store.session" "store.*session|useActiveRunStore.*session"
echo ""

echo "---- GPX GENERATION & STRAVA UPLOAD (Checklist #16-18) ----"
has_pattern "buildGpx function exists" "buildGpx|gpx-writer"
has_pattern "GPX XML structure present" "<gpx|<trkseg|<trkpt"
has_pattern "Throws error if < 5 points" "points.length < 5|points.*Cannot"
has_pattern "Uploads to Strava /api/v3/uploads" "strava.com/api/v3/uploads"
has_pattern "data_type: gpx set" 'data_type.*gpx'
has_pattern "Polls uploads/:id for activity_id" "pollForActivityId|uploads.*id|activity_id"
has_pattern "Personalized title format" "distance.*mi.*pace.*mi.*pacer|{distance}.*{pace}"
echo ""

echo "---- AUTO-UPLOAD TOGGLE (Checklist #19-21) ----"
has_pattern "getStravaAutoUpload from SecureStore" "getStravaAutoUpload"
has_pattern "setStravaAutoUpload writes to SecureStore" "setStravaAutoUpload"
has_pattern "Default true" "true.*default|default.*true"
has_pattern "Toggle visible in Settings/Strava" "Auto-upload|stravaAutoUpload"
has_pattern "Toggle disabled if not connected" "disabled.*!connected|disabled.*!strava"
has_pattern "Auto-upload on run end when enabled" "if.*stravaAutoUpload.*upload|handleEndRun.*upload"
has_pattern "Manual upload button shown when disabled" "Upload to Strava|handleUploadToStrava"
echo ""

echo "---- TYPESCRIPT BUILD (Checklist #24) ----"
if bun run tsc --noEmit >/dev/null 2>&1; then
  pass "TypeScript compiles without errors"
else
  fail "TypeScript has compilation errors"
fi
echo ""

echo "DONE."
