// Mock Public Pacers Data
import type { PublicPacer, PublicPacerCategory } from './types';

export const MOCK_PUBLIC_PACERS: PublicPacer[] = [
  // Celebrity / Verified Pacers
  {
    id: 'pub_1',
    name: 'Coach Mo',
    avatar: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=200&h=200&fit=crop&crop=face',
    isVerified: true,
    bio: 'Olympic track coach. 20+ years getting athletes across the finish line.',
    vibesOffered: ['fired_up', 'harsh_coach'],
    musicStyles: ['hip_hop', 'edm'],
    bestUseCase: 'Best for race day and PR attempts',
    totalRunsPaced: 45230,
    paceRecoveryScore: 94,
    aiVoiceEnabled: true,
    categories: ['celebrity_verified', 'top_fired_up', 'best_harsh_coach'],
  },
  {
    id: 'pub_2',
    name: 'Sarah Chen',
    avatar: 'https://images.unsplash.com/photo-1594381898411-846e7d193883?w=200&h=200&fit=crop&crop=face',
    isVerified: true,
    bio: 'Ultra-marathoner. Boston qualifier x5. Your calm in the storm.',
    vibesOffered: ['calm', 'cheerful'],
    musicStyles: ['indie', 'pop'],
    bestUseCase: 'Perfect for long runs and recovery pace',
    totalRunsPaced: 38450,
    paceRecoveryScore: 91,
    aiVoiceEnabled: true,
    categories: ['celebrity_verified', 'best_calm'],
  },
  {
    id: 'pub_3',
    name: 'DJ Runbeat',
    avatar: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=200&h=200&fit=crop&crop=face',
    isVerified: true,
    bio: 'Producer & runner. My playlists have soundtracked 1M+ miles.',
    vibesOffered: ['fired_up', 'cheerful'],
    musicStyles: ['edm', 'hip_hop', 'pop'],
    bestUseCase: 'When you need the perfect running playlist',
    totalRunsPaced: 67890,
    paceRecoveryScore: 88,
    aiVoiceEnabled: false,
    categories: ['celebrity_verified', 'music_first', 'top_fired_up'],
  },

  // Top Fired Up Pacers
  {
    id: 'pub_5',
    name: 'Elena Rodriguez',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&h=200&fit=crop&crop=face',
    isVerified: false,
    bio: 'CrossFit athlete & marathon finisher. Let\'s get it!',
    vibesOffered: ['fired_up', 'cheerful'],
    musicStyles: ['edm', 'pop'],
    bestUseCase: 'High energy tempo runs',
    totalRunsPaced: 8920,
    paceRecoveryScore: 89,
    aiVoiceEnabled: true,
    categories: ['top_fired_up'],
  },

  // Best Harsh Coach
  {
    id: 'pub_6',
    name: 'Coach Ironside',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=face',
    isVerified: false,
    bio: 'No excuses. No shortcuts. Just results.',
    vibesOffered: ['harsh_coach', 'angry'],
    musicStyles: ['rock', 'hip_hop'],
    bestUseCase: 'When you need someone to tell you the truth',
    totalRunsPaced: 15670,
    paceRecoveryScore: 93,
    aiVoiceEnabled: true,
    categories: ['best_harsh_coach'],
  },
  {
    id: 'pub_7',
    name: 'Sergeant Pace',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&crop=face',
    isVerified: false,
    bio: 'Military fitness instructor. Pain is temporary, quitting is forever.',
    vibesOffered: ['harsh_coach', 'fired_up'],
    musicStyles: ['rock', 'edm'],
    bestUseCase: 'Breaking through mental walls',
    totalRunsPaced: 9870,
    paceRecoveryScore: 95,
    aiVoiceEnabled: true,
    categories: ['best_harsh_coach', 'top_fired_up'],
  },

  // Best Calm Pacers
  {
    id: 'pub_8',
    name: 'Maya Wellness',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&h=200&fit=crop&crop=face',
    isVerified: false,
    bio: 'Yoga instructor & mindful runner. Every step is a meditation.',
    vibesOffered: ['calm', 'cheerful'],
    musicStyles: ['indie', 'classical'],
    bestUseCase: 'Recovery runs and mindful jogging',
    totalRunsPaced: 11230,
    paceRecoveryScore: 87,
    aiVoiceEnabled: true,
    categories: ['best_calm'],
  },
  {
    id: 'pub_9',
    name: 'Trail Zen',
    avatar: 'https://images.unsplash.com/photo-1552058544-f2b08422138a?w=200&h=200&fit=crop&crop=face',
    isVerified: false,
    bio: 'Trail runner & nature enthusiast. Find your flow.',
    vibesOffered: ['calm'],
    musicStyles: ['indie', 'mixed'],
    bestUseCase: 'Trail runs and easy miles',
    totalRunsPaced: 7650,
    paceRecoveryScore: 85,
    aiVoiceEnabled: false,
    categories: ['best_calm'],
  },

  // Music-First Pacers
  {
    id: 'pub_10',
    name: 'BPM Master',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&h=200&fit=crop&crop=face',
    isVerified: false,
    bio: 'Music producer who runs. 180 BPM = optimal cadence.',
    vibesOffered: ['fired_up', 'cheerful'],
    musicStyles: ['edm', 'pop', 'hip_hop'],
    bestUseCase: 'When the beat drives your pace',
    totalRunsPaced: 23450,
    paceRecoveryScore: 86,
    aiVoiceEnabled: false,
    categories: ['music_first'],
  },
  {
    id: 'pub_11',
    name: 'Indie Runner',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop&crop=face',
    isVerified: false,
    bio: 'Discovering new music one mile at a time.',
    vibesOffered: ['cheerful', 'calm'],
    musicStyles: ['indie', 'r_and_b'],
    bestUseCase: 'Chill runs with great music discovery',
    totalRunsPaced: 6780,
    paceRecoveryScore: 82,
    aiVoiceEnabled: true,
    categories: ['music_first', 'best_calm'],
  },
  {
    id: 'pub_12',
    name: 'Hip Hop Hustle',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&h=200&fit=crop&crop=face',
    isVerified: false,
    bio: 'Old school hip hop meets new school running.',
    vibesOffered: ['fired_up', 'angry'],
    musicStyles: ['hip_hop', 'r_and_b'],
    bestUseCase: 'When you need that hip hop energy',
    totalRunsPaced: 18900,
    paceRecoveryScore: 90,
    aiVoiceEnabled: true,
    categories: ['music_first', 'top_fired_up'],
  },
];

/**
 * Get public pacers by category
 */
export function getPublicPacersByCategory(category: PublicPacerCategory): PublicPacer[] {
  return MOCK_PUBLIC_PACERS
    .filter(p => p.categories.includes(category))
    .sort((a, b) => b.paceRecoveryScore - a.paceRecoveryScore);
}

/**
 * Get a single public pacer by ID
 */
export function getPublicPacerById(id: string): PublicPacer | undefined {
  return MOCK_PUBLIC_PACERS.find(p => p.id === id);
}

/**
 * Search public pacers by name
 */
export function searchPublicPacers(query: string): PublicPacer[] {
  const lowerQuery = query.toLowerCase();
  return MOCK_PUBLIC_PACERS.filter(p =>
    p.name.toLowerCase().includes(lowerQuery) ||
    p.bio?.toLowerCase().includes(lowerQuery)
  );
}

/**
 * Get featured pacers (top from each category)
 */
export function getFeaturedPacers(): PublicPacer[] {
  // Get verified pacers first, then top performers
  return MOCK_PUBLIC_PACERS
    .filter(p => p.isVerified)
    .sort((a, b) => b.paceRecoveryScore - a.paceRecoveryScore)
    .slice(0, 5);
}
