import { describe, it, expect, beforeEach } from 'vitest'
import { useUserStore } from '../useUserStore'

describe('useUserStore', () => {
  // Reset store and sessionStorage between each test
  beforeEach(() => {
    sessionStorage.clear()
    useUserStore.setState({ uid: null, displayName: null, roomCode: null })
  })

  it('sets uid', () => {
    useUserStore.getState().setUid('user-123')
    expect(useUserStore.getState().uid).toBe('user-123')
  })

  it('sets displayName', () => {
    useUserStore.getState().setDisplayName('Wendy')
    expect(useUserStore.getState().displayName).toBe('Wendy')
  })

  it('sets roomCode', () => {
    useUserStore.getState().setRoomCode('ABC123')
    expect(useUserStore.getState().roomCode).toBe('ABC123')
  })

  it('clear() resets displayName and roomCode but keeps uid', () => {
    useUserStore.setState({ uid: 'user-123', displayName: 'Wendy', roomCode: 'ABC123' })
    useUserStore.getState().clear()
    expect(useUserStore.getState().uid).toBe('user-123')
    expect(useUserStore.getState().displayName).toBeNull()
    expect(useUserStore.getState().roomCode).toBeNull()
  })

  it('setRoomCode(null) clears the room', () => {
    useUserStore.setState({ roomCode: 'XYZ999' })
    useUserStore.getState().setRoomCode(null)
    expect(useUserStore.getState().roomCode).toBeNull()
  })

  it('persists state to sessionStorage', () => {
    useUserStore.getState().setDisplayName('Wendy')
    useUserStore.getState().setRoomCode('ROOM01')
    const stored = JSON.parse(sessionStorage.getItem('monash-chat-session') ?? '{}')
    expect(stored.state.displayName).toBe('Wendy')
    expect(stored.state.roomCode).toBe('ROOM01')
  })
})
