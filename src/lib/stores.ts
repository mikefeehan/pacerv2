import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type {
  User,
  PacerProfile,
  PacerRelationship,
  AppSettings,
  ToneType,
  VoiceMode,
  IntensityLevel
} from './types';

// Auth Store
interface AuthState {
  user: User | null;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  updateUser: (updates: Partial<User>) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isLoading: true,
      setUser: (user) => set({ user, isLoading: false }),
      updateUser: (updates) => set((state) => ({
        user: state.user ? { ...state.user, ...updates } : null
      })),
      logout: () => set({ user: null }),
    }),
    {
      name: 'pacer-auth',
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => {
        if (state) state.isLoading = false;
      },
    }
  )
);

// Pacer Store
interface PacerState {
  myPacerProfile: PacerProfile | null;
  pacers: PacerRelationship[];
  selectedPacerId: string | null;
  setMyPacerProfile: (profile: PacerProfile | null) => void;
  updateMyPacerProfile: (updates: Partial<PacerProfile>) => void;
  setPacers: (pacers: PacerRelationship[]) => void;
  addPacer: (pacer: PacerRelationship) => void;
  updatePacer: (pacerUserId: string, updates: Partial<PacerRelationship>) => void;
  removePacer: (pacerUserId: string) => void;
  setSelectedPacerId: (id: string | null) => void;
}

export const usePacerStore = create<PacerState>()(
  persist(
    (set) => ({
      myPacerProfile: null,
      pacers: [],
      selectedPacerId: null,
      setMyPacerProfile: (profile) => set({ myPacerProfile: profile }),
      updateMyPacerProfile: (updates) => set((state) => ({
        myPacerProfile: state.myPacerProfile
          ? { ...state.myPacerProfile, ...updates }
          : null
      })),
      setPacers: (pacers) => set({ pacers }),
      addPacer: (pacer) => set((state) => ({
        pacers: [...state.pacers, pacer]
      })),
      updatePacer: (pacerUserId, updates) => set((state) => ({
        pacers: state.pacers.map((p) =>
          p.pacerUserId === pacerUserId ? { ...p, ...updates } : p
        )
      })),
      removePacer: (pacerUserId) => set((state) => ({
        pacers: state.pacers.filter((p) => p.pacerUserId !== pacerUserId)
      })),
      setSelectedPacerId: (id) => set({ selectedPacerId: id }),
    }),
    {
      name: 'pacer-pacers',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

// Run Settings Store (pre-run configuration)
interface RunSettingsState {
  selectedPacerId: string | null;
  voiceMode: VoiceMode;
  tone: ToneType;
  intensity: IntensityLevel;
  musicEnabled: boolean;
  setSelectedPacer: (id: string | null) => void;
  setVoiceMode: (mode: VoiceMode) => void;
  setTone: (tone: ToneType) => void;
  setIntensity: (intensity: IntensityLevel) => void;
  setMusicEnabled: (enabled: boolean) => void;
  resetSettings: () => void;
}

const defaultRunSettings = {
  selectedPacerId: null,
  voiceMode: 'mix' as VoiceMode,
  tone: 'fired_up' as ToneType,
  intensity: 'medium' as IntensityLevel,
  musicEnabled: true,
};

export const useRunSettingsStore = create<RunSettingsState>()(
  persist(
    (set) => ({
      ...defaultRunSettings,
      setSelectedPacer: (id) => set({ selectedPacerId: id }),
      setVoiceMode: (mode) => set({ voiceMode: mode }),
      setTone: (tone) => set({ tone }),
      setIntensity: (intensity) => set({ intensity }),
      setMusicEnabled: (enabled) => set({ musicEnabled: enabled }),
      resetSettings: () => set(defaultRunSettings),
    }),
    {
      name: 'pacer-run-settings',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

// App Settings Store
interface AppSettingsState extends AppSettings {
  setPlaybackMode: (mode: AppSettings['playbackMode']) => void;
  setDuckAmount: (amount: AppSettings['duckAmount']) => void;
  setHypeFrequency: (freq: IntensityLevel) => void;
  setShowStravaPostPreview: (show: boolean) => void;
}

export const useAppSettingsStore = create<AppSettingsState>()(
  persist(
    (set) => ({
      playbackMode: 'duck_voice',
      duckAmount: 'medium',
      hypeFrequency: 'medium',
      showStravaPostPreview: true,
      setPlaybackMode: (mode) => set({ playbackMode: mode }),
      setDuckAmount: (amount) => set({ duckAmount: amount }),
      setHypeFrequency: (freq) => set({ hypeFrequency: freq }),
      setShowStravaPostPreview: (show) => set({ showStravaPostPreview: show }),
    }),
    {
      name: 'pacer-app-settings',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

// Onboarding Store (ephemeral - not persisted)
interface OnboardingState {
  currentStep: number;
  voiceMemoCount: number;
  aiVoiceConsent: boolean;
  spotifyConnected: boolean;
  setCurrentStep: (step: number) => void;
  setVoiceMemoCount: (count: number) => void;
  setAiVoiceConsent: (consent: boolean) => void;
  setSpotifyConnected: (connected: boolean) => void;
  resetOnboarding: () => void;
}

export const useOnboardingStore = create<OnboardingState>((set) => ({
  currentStep: 0,
  voiceMemoCount: 0,
  aiVoiceConsent: false,
  spotifyConnected: false,
  setCurrentStep: (step) => set({ currentStep: step }),
  setVoiceMemoCount: (count) => set({ voiceMemoCount: count }),
  setAiVoiceConsent: (consent) => set({ aiVoiceConsent: consent }),
  setSpotifyConnected: (connected) => set({ spotifyConnected: connected }),
  resetOnboarding: () => set({
    currentStep: 0,
    voiceMemoCount: 0,
    aiVoiceConsent: false,
    spotifyConnected: false,
  }),
}));
