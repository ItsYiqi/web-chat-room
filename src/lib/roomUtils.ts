// ─────────────────────────────────────────────
// roomUtils.ts
// Helpers for creating and validating rooms.
// ─────────────────────────────────────────────

import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';

const CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no O/0, I/1 confusion

// Generate a random 6-character room code
export function generateRoomCode(): string {
  return Array.from(
    { length: 6 },
    () => CHARS[Math.floor(Math.random() * CHARS.length)],
  ).join('');
}

// Create a new room in Firestore
export async function createRoom(uid: string): Promise<string> {
  let code = generateRoomCode();

  // Retry if the code already exists (very unlikely but safe)
  while (await roomExists(code)) {
    code = generateRoomCode();
  }

  await setDoc(doc(db, 'rooms', code), {
    code,
    createdAt: serverTimestamp(),
    createdBy: uid,
  });

  return code;
}

// Check if a room exists (used for join validation)
export async function roomExists(code: string): Promise<boolean> {
  const snap = await getDoc(doc(db, 'rooms', code.toUpperCase()));
  return snap.exists();
}
