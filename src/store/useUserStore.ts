// ─────────────────────────────────────────────
// useUserStore.ts — Zustand store for session
// Persists to sessionStorage so refresh works.
// ─────────────────────────────────────────────

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

interface UserState {
  uid:         string | null   // Firebase anonymous auth UID
  displayName: string | null   // Name the user chose in the lobby
  roomCode:    string | null   // Current room code

  setUid:         (uid: string)         => void
  setDisplayName: (name: string)        => void
  setRoomCode:    (code: string | null) => void
  clear:          ()                    => void
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      uid:         null,
      displayName: null,
      roomCode:    null,

      setUid:         (uid)  => set({ uid }),
      setDisplayName: (name) => set({ displayName: name }),
      setRoomCode:    (code) => set({ roomCode: code }),

      // Called when the user leaves a room or something goes wrong
      clear: () => set({ displayName: null, roomCode: null }),
    }),
    {
      name:    'monash-chat-session',            // sessionStorage key
      storage: createJSONStorage(() => sessionStorage),
      // Only persist uid — display name and room are restored from URL
      partialize: (state) => ({
        uid:         state.uid,
        displayName: state.displayName,
        roomCode:    state.roomCode,
      }),
    }
  )
)
