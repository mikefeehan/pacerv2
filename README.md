# PACER

**Take your friends on a run with you.**

PACER is a running companion app that integrates with Strava. During a run, PACER plays motivational voice (real memos or AI-generated) in your friend's voice + music curated from their taste, triggered automatically when you struggle.

## Features

- **Strava Integration**: Connect your Strava account to track runs
- **Pacer System**: Invite friends to become your Pacers
- **Voice Memos**: Record motivational messages for friends
- **AI Voice**: Generate new motivational lines in your voice (with consent)
- **Music Sharing**: Share your Spotify playlists for runs
- **Struggle Detection**: Automatic detection of when you need a boost
- **Hype Events**: Voice + music triggered during tough moments

## App Flow

1. **Splash** → Brand intro with animated logo
2. **Welcome** → Onboarding with "How it works" modal
3. **Strava Connect** → Required OAuth connection
4. **Onboarding** → Create your Pacer Pack (voice memos, AI consent, music)
5. **Home** → Select your Pacer for today's run
6. **Pre-Run** → Configure voice mode, tone, intensity, music
7. **Run Active** → Hands-free running with hype events
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
| Pre-Run | `/pre-run` | Run configuration |
| Run Active | `/run-active` | Minimal UI during run |
| Run Recap | `/run-recap` | Post-run summary |
| Strava Post | `/strava-post` | Editable post preview |
| Settings | `/settings` | App preferences |
| Invite Pacer | `/invite-pacer` | Invite friends |

## Tech Stack

- Expo SDK 53 + React Native
- Expo Router (file-based routing)
- NativeWind + Tailwind CSS
- Zustand (state management)
- React Native Reanimated (animations)
- Lucide Icons

## Demo Mode

The app includes a simulated 25-minute run with 4 struggle moments for demonstration. This triggers automatically during the "Run Active" screen.

## Data Models

- **User**: Authentication and Strava connection
- **PacerProfile**: Voice memos, AI consent, music settings
- **PacerRelationship**: Connection between runner and pacer
- **RunSession**: Active/completed run data
- **HypeEvent**: Individual trigger events during runs

## Stores

- `useAuthStore`: User authentication state
- `usePacerStore`: Pacers and relationships
- `useRunSettingsStore`: Pre-run configuration
- `useActiveRunStore`: Live run state and simulation
- `useAppSettingsStore`: App preferences
