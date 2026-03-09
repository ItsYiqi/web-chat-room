// ─────────────────────────────────────────────
// useTyping.ts
// Writes a typing flag to RTDB while the user
// is typing. Reads all other users' flags.
// ─────────────────────────────────────────────

import { useState, useEffect, useRef, useCallback } from 'react'
import { ref, onValue, set, remove } from 'firebase/database'
import { rtdb } from '../lib/firebase'

const TYPING_TIMEOUT_MS = 2500   // clear flag after 2.5s of inactivity

export function useTyping(roomCode: string, uid: string) {
  const [typingUsers, setTypingUsers] = useState<string[]>([])
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // ── Subscribe to other users' typing flags ──
  useEffect(() => {
    if (!roomCode || !uid) return

    const typingRef = ref(rtdb, `rooms/${roomCode}/typing`)

    const unsub = onValue(typingRef, (snapshot) => {
      const data = snapshot.val() ?? {}
      // Exclude self, collect display names of everyone else typing
      const others = Object.entries(data)
        .filter(([id, active]) => id !== uid && active === true)
        .map(([id]) => id)
      setTypingUsers(others)
    })

    return () => unsub()
  }, [roomCode, uid])

  // ── Call this on every keydown in the input ──
  const notifyTyping = useCallback(() => {
    if (!roomCode || !uid) return

    const myRef = ref(rtdb, `rooms/${roomCode}/typing/${uid}`)
    set(myRef, true)

    // Reset the inactivity timer
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(() => {
      remove(myRef)
    }, TYPING_TIMEOUT_MS)
  }, [roomCode, uid])

  // ── Clear flag when component unmounts (leave room / close tab) ──
  useEffect(() => {
    return () => {
      if (!roomCode || !uid) return
      remove(ref(rtdb, `rooms/${roomCode}/typing/${uid}`))
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [roomCode, uid])

  return { typingUsers, notifyTyping }
}
