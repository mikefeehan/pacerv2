# PACER

**Take your friends on a run with you.**

PACER is a running companion app that integrates with Strava. During a run, PACER plays motivational voice (real memos or AI-generated) in your friend's voice + music curated from their taste, triggered automatically when you struggle.

## Features

- **Real GPS Tracking**: Track your runs with accurate GPS location data
- **Strava Integration**: Upload runs as GPX files with map, splits, and PACER recap
- **Pacer System**: Invite friends to become your Pacers
- **Pacer Identity**: Choose your Pacer type (Cheerful, Fired Up, Harsh Coach, Calm)
- **Public Pacers**: Discover and add verified/curated public pacers
- **Multi-Pacer Support**: Select multiple pacers per run (e.g., "Ashley + Kevin")
- **Vibe System**: Choose a single vibe (tone) for the entire run
- **Voice Memos**: Record 3 core phrases + optional bonus memos
- **AI Voice**: Generate new motivational lines in your voice (with consent)
- **Music Sharing**: Share your Spotify playlists for runs
- **Struggle Detection**: Automatic detection of when you need a boost
- **Hype Events**: Voice + music triggered during tough moments
- **Haptic Feedback**: Vibe-specific haptic patterns during hype moments
- **Post-Run Recap**: Beautiful recap with map, stats, and Pacer motivational message

## Strava Integration

PACER integrates with Strava to upload your runs:

1. **Connect Strava**: OAuth flow to connect your Strava account
2. **Track Your Run**: Real GPS tracking records your route
3. **GPX Upload**: After your run, upload to Strava with:
   - Full route map with your path
   - Distance, duration, and pace stats
   - PACER recap with Pacer motivational message
   - Songs that carried you during the run

### Setting Up Strava (for real uploads)

To enable real Strava uploads, add these environment variables in the ENV tab:
- `EXPO_PUBLIC_STRAVA_CLIENT_ID` - Your Strava app client ID
- `EXPO_PUBLIC_STRAVA_CLIENT_SECRET` - Your Strava app client secret

Without these, the app runs in demo mode with simulated Strava connection.

## Becoming a Pacer

To become a Pacer (under 60 seconds):

1. **Choose Identity**: Select one Pacer type that defines how runners experience you
2. **Record Phrases**: Record 3 short phrases (2-4 seconds) matching your style
3. **Bonus Memos** (optional): Add up to 2 personal messages for special moments

| Pacer Type | Style | Example Phrases |
|------------|-------|-----------------|
| Cheerful | Positive, encouraging | "You've got this", "Nice work" |
| Fired Up | High energy, hype | "Let's go!", "Push through" |
| Harsh Coach | Tough love | "Push mode", "Earn it" |
| Calm | Grounded, steady | "Steady pace", "You're in control" |

**Bonus memos** are played sparingly during late-run or strong recovery moments.

## Public Pacers

Discover curated pacers from around the world. Public Pacers share their energy, not personal info:

| Category | Description |
|----------|-------------|
| Celebrity & Verified | Famous voices to pace you |
| Top Fired Up | High energy motivation |
| Best Harsh Coach | No excuses, tough love |
| Best Calm | Perfect for long runs |
| Music-First | Great playlists for runners |

**Privacy**: Public Pacers cannot see who uses their content or receive messages from runners.

## Vibes

Each run has a single "vibe" that controls voice style, intensity, and music selection:

| Vibe | Description | Haptic Pattern |
|------|-------------|----------------|
| Cheerful | Positive, upbeat, supportive | Light taps |
| Fired Up | High energy, intense motivation | Fast pulses |
| Angry | Challenging, confrontational | Sharp double-taps |
| Harsh Coach | No excuses, tough love | Strong buzz + hits |
| Calm | Controlled, steady encouragement | Slow steady pulses |

## Haptics Settings

- **Device**: iPhone Only / iPhone + Watch
- **Intensity**: Low / Medium / High
- **Beat Push**: Optional rhythm pulses after hype moment

## App Flow

1. **Splash** → Brand intro with animated logo
2. **Welcome** → Onboarding with "How it works" modal
3. **Strava Connect** → Required OAuth connection
4. **Onboarding** → 3-step Pacer setup (identity, phrases, bonus memos)
5. **Home** → Select your Pacers for today's run
6. **Pre-Run** → Configure pacers, vibe, voice mode, music, haptics
7. **Run Active** → Hands-free running with hype events + haptics
8. **Run Recap** → Post-run summary with stats
9. **Strava Post** → Share your PACER experience

## Screens

| Screen | Route | Description |
|--------|-------|-------------|
| Splash | `/` | Animated logo, auto-navigation |
| Welcome | `/welcome` | Main CTA to connect Strava |
| Strava Connect | `/strava-connect` | OAuth flow (mocked) |
| Onboarding | `/onboarding` | 3-step Pacer Pack creation |
| Home | `/home` | My Pacers list, start run CTA |
| Pre-Run | `/pre-run` | Run configuration (5 steps) |
| Run Active | `/run-active` | Minimal UI during run |
| Run Recap | `/run-recap` | Post-run summary |
| Strava Post | `/strava-post` | Editable post preview |
| Settings | `/settings` | App preferences |
| Invite Pacer | `/invite-pacer` | Invite friends |
| Public Pacers | `/public-pacers` | Discover public pacers |
| Public Pacer Profile | `/public-pacer-profile` | View pacer details |
| Category View | `/public-pacers-category` | Browse category |

## Tech Stack

- Expo SDK 53 + React Native
- Expo Router (file-based routing)
- Expo Location (GPS tracking)
- NativeWind + Tailwind CSS
- Zustand (state management)
- React Native Reanimated (animations)
- React Native Maps (route visualization)
- Expo Haptics (haptic feedback)
- Lucide Icons

## Run Tracking

During a run, PACER:
- Tracks your GPS location with high accuracy
- Calculates distance, pace, and duration in real-time
- Detects struggle moments (pace drops, stalls, late-run fatigue)
- Triggers hype events with Pacer voice + music
- Records your route for the post-run map

## Post-Run Recap

After your run, see:
- **Route Map**: Your GPS track visualized on a map
- **Stats**: Distance, duration, pace, estimated calories
- **Pacer Message**: Motivational text from your Pacer based on vibe
- **Songs**: The tracks that carried you through hype moments
- **Hype Timeline**: When your Pacers came through for you
- **Upload to Strava**: One-tap GPX upload with full recap

## Demo Mode

The app includes a simulated 25-minute run with struggle moments for demonstration. During hype events, pacers rotate evenly and haptics trigger 0.2s before voice plays.

## Data Models

- **User**: Authentication and Strava connection
- **PacerProfile**: Voice memos, AI consent, music settings
- **PacerRelationship**: Connection between runner and pacer
- **PublicPacer**: Public pacer profile with aggregate stats
- **RunSession**: Active/completed run data (supports multi-pacer)
- **HypeEvent**: Individual trigger events with pacer attribution
- **HapticSettings**: Haptic feedback configuration

## Stores

- `useAuthStore`: User authentication state
- `usePacerStore`: Pacers and relationships
- `useRunSettingsStore`: Pre-run configuration (incl. haptics)
- `useActiveRunStore`: Live run state and simulation
- `useAppSettingsStore`: App preferences
