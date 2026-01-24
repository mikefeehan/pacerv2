import * as FileSystem from 'expo-file-system';
import { isSupabaseConfigured, getSupabaseCredentials } from './client';
import type { VoiceMemoRecord } from './types';
import type { VoiceMemo } from '@/lib/types';

const BUCKET_NAME = 'voice-memos';

/**
 * Upload a voice memo to Supabase storage
 * Returns the public URL if successful, null if Supabase not configured
 */
export async function uploadVoiceMemo(
  localUri: string,
  pacerUserId: string,
  memo: Omit<VoiceMemo, 'url'>
): Promise<string | null> {
  const credentials = getSupabaseCredentials();

  if (!credentials) {
    console.log('Supabase not configured - voice memo saved locally only');
    return null;
  }

  try {
    // Read the file as base64
    const base64 = await FileSystem.readAsStringAsync(localUri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    // Generate a unique filename
    const filename = `${pacerUserId}/${memo.id}.m4a`;

    // Upload to Supabase Storage
    const uploadUrl = `${credentials.url}/storage/v1/object/${BUCKET_NAME}/${filename}`;

    const response = await fetch(uploadUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${credentials.anonKey}`,
        'Content-Type': 'audio/m4a',
        'x-upsert': 'true',
      },
      body: Uint8Array.from(atob(base64), c => c.charCodeAt(0)),
    });

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.status}`);
    }

    // Get the public URL
    const publicUrl = `${credentials.url}/storage/v1/object/public/${BUCKET_NAME}/${filename}`;

    // Save metadata to database
    await saveVoiceMemoMetadata(credentials, {
      id: memo.id,
      pacer_user_id: pacerUserId,
      pacer_name: '', // Will be set by caller
      storage_url: publicUrl,
      duration: memo.duration,
      vibe_tag: memo.vibeTag ?? null,
      is_bonus: memo.isBonus ?? false,
      name: memo.name ?? 'Voice memo',
      created_at: memo.createdAt ?? new Date().toISOString(),
    });

    console.log('Voice memo uploaded:', publicUrl);
    return publicUrl;
  } catch (error) {
    console.error('Failed to upload voice memo:', error);
    return null;
  }
}

/**
 * Save voice memo metadata to database
 */
async function saveVoiceMemoMetadata(
  credentials: { url: string; anonKey: string },
  memo: VoiceMemoRecord
): Promise<void> {
  const response = await fetch(`${credentials.url}/rest/v1/voice_memos`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${credentials.anonKey}`,
      'apikey': credentials.anonKey,
      'Content-Type': 'application/json',
      'Prefer': 'return=minimal',
    },
    body: JSON.stringify(memo),
  });

  if (!response.ok) {
    throw new Error(`Failed to save metadata: ${response.status}`);
  }
}

/**
 * Fetch all voice memos for a pacer
 */
export async function fetchVoiceMemosForPacer(
  pacerUserId: string
): Promise<VoiceMemo[]> {
  const credentials = getSupabaseCredentials();

  if (!credentials) {
    console.log('Supabase not configured - returning empty array');
    return [];
  }

  try {
    const response = await fetch(
      `${credentials.url}/rest/v1/voice_memos?pacer_user_id=eq.${pacerUserId}&order=created_at.desc`,
      {
        headers: {
          'Authorization': `Bearer ${credentials.anonKey}`,
          'apikey': credentials.anonKey,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch memos: ${response.status}`);
    }

    const records: VoiceMemoRecord[] = await response.json();

    // Convert to app's VoiceMemo type
    return records.map((record) => ({
      id: record.id,
      url: record.storage_url,
      duration: record.duration,
      vibeTag: record.vibe_tag as VoiceMemo['vibeTag'],
      isBonus: record.is_bonus,
      name: record.name,
      createdAt: record.created_at,
    }));
  } catch (error) {
    console.error('Failed to fetch voice memos:', error);
    return [];
  }
}

/**
 * Delete a voice memo from storage and database
 */
export async function deleteVoiceMemo(
  memoId: string,
  pacerUserId: string
): Promise<boolean> {
  const credentials = getSupabaseCredentials();

  if (!credentials) {
    return false;
  }

  try {
    // Delete from storage
    const filename = `${pacerUserId}/${memoId}.m4a`;
    await fetch(
      `${credentials.url}/storage/v1/object/${BUCKET_NAME}/${filename}`,
      {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${credentials.anonKey}`,
        },
      }
    );

    // Delete from database
    await fetch(
      `${credentials.url}/rest/v1/voice_memos?id=eq.${memoId}`,
      {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${credentials.anonKey}`,
          'apikey': credentials.anonKey,
        },
      }
    );

    return true;
  } catch (error) {
    console.error('Failed to delete voice memo:', error);
    return false;
  }
}
