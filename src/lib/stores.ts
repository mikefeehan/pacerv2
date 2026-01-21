import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type {
  User,
  PacerProfile,
  PacerRelationship,
  AppSettings,
  VibeType,
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
  setMyPacerProfile: (profile: PacerProfile | null) => void;
  updateMyPacerProfile: (updates: Partial<PacerProfile>) => void;
  setPacers: (pacers: PacerRelationship[]) => void;
  addPacer: (pacer: PacerRelationship) => void;
  updatePacer: (pacerUserId: string, updates: Partial<PacerRelationship>) => void;
  removePacer: (pacerUserId: string) => void;
}

export const usePacerStore = create<PacerState>()(
  persist(
    (set) => ({
      myPacerProfile: null,
      pacers: [],
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
    }),
    {
      name: 'pacer-pacers',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

// Run Settings Store (pre-run configuration) - MULTI-PACER SUPPORT
interface RunSettingsState {
  selectedPacerIds: string[]; // Multi-pacer selection
  voiceMode: VoiceMode;
  vibe: VibeType; // Single vibe for entire run
  musicEnabled: boolean;
  // Actions
  togglePacer: (id: string) => void;
  setSelectedPacers: (ids: string[]) => void;
  setVoiceMode: (mode: VoiceMode) => void;
  setVibe: (vibe: VibeType) => void;
  setMusicEnabled: (enabled: boolean) => void;
  resetSettings: () => void;
}

const defaultRunSettings = {
  selectedPacerIds: [] as string[],
  voiceMode: 'mix' as VoiceMode,
  vibe: 'fired_up' as VibeType,
  musicEnabled: true,
};

export const useRunSettingsStore = create<RunSettingsState>()(
  persist(
    (set) => ({
      ...defaultRunSettings,
      togglePacer: (id) => set((state) => {
        const isSelected = state.selectedPacerIds.includes(id);
        if (isSelected) {
          return { selectedPacerIds: state.selectedPacerIds.filter(p => p !== id) };
        } else {
          return { selectedPacerIds: [...state.selectedPacerIds, id] };
        }
      }),
      setSelectedPacers: (ids) => set({ selectedPacerIds: ids }),
      setVoiceMode: (mode) => set({ voiceMode: mode }),
      setVibe: (vibe) => set({ vibe }),
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
