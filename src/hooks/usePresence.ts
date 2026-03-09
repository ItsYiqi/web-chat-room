// ─────────────────────────────────────────────
// usePresence.ts
// Marks the user as online in RTDB.
// - Same uid (same Firebase Auth session) always
//   maps to the same RTDB key → no duplicates
//   across refreshes or multiple tabs.
// - onDisconnect() handles unexpected closes.
// - beforeunload removes presence on intentional
//   page closes / navigations away.
// ─────────────────────────────────────────────

import { useState, useEffect } from 'react';
import { ref, onValue, onDisconnect, set, remove } from 'firebase/database';
import { rtdb } from '../lib/firebase';

export function usePresence(
  roomCode: string,
  uid: string,
  displayName: string,
) {
  const [onlineCount, setOnlineCount] = useState(0);

  useEffect(() => {
    if (!roomCode || !uid || !displayName) return;

    // The RTDB path uses uid as the key.
    // Same Firebase Auth uid = same key = naturally deduplicated.
    // Refreshing the page gives back the same uid from localStorage,
    // so the user is always treated as the same person.
    const myPresenceRef = ref(rtdb, `rooms/${roomCode}/presence/${uid}`);

    // Write presence — overwrites any stale entry from a previous session
    set(myPresenceRef, {
      displayName,
      online: true,
      updatedAt: Date.now(),
    });

    // Server-side cleanup: if the connection drops unexpectedly
    // (crash, network loss, forced close), Firebase removes the entry
    onDisconnect(myPresenceRef).remove();

    // Client-side cleanup on intentional navigation / tab close
    const handleUnload = () => remove(myPresenceRef);
    window.addEventListener('beforeunload', handleUnload);

    // Listen to the whole presence node to build the online count
    const unsub = onValue(
      ref(rtdb, `rooms/${roomCode}/presence`),
      (snapshot) => {
        const data = snapshot.val() ?? {};
        // Count unique uids (keys) — same uid in multiple tabs = 1 person
        setOnlineCount(Object.keys(data).length);
      },
    );

    return () => {
      unsub();
      window.removeEventListener('beforeunload', handleUnload);
      // Cancel the onDisconnect handler so it doesn't fire after we
      // manually remove (e.g. user clicks "Leave room" button)
      onDisconnect(myPresenceRef).cancel();
      remove(myPresenceRef);
    };
  }, [roomCode, uid, displayName]);

  return { onlineCount };
}
