import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useMessages } from '../useMessages'

// ── Mock Firebase ────────────────────────────────────────────────
vi.mock('@/lib/firebase', () => ({ db: {} }))

// vi.hoisted ensures these are initialised before vi.mock() factories run
const { mockOnSnapshot, mockAddDoc } = vi.hoisted(() => ({
  mockOnSnapshot: vi.fn(),
  mockAddDoc:     vi.fn(),
}))

vi.mock('firebase/firestore', () => ({
  collection:   vi.fn(() => ({})),
  query:        vi.fn((q) => q),
  orderBy:      vi.fn(() => ({})),
  limitToLast:  vi.fn(() => ({})),
  onSnapshot:   mockOnSnapshot,
  addDoc:       mockAddDoc,
  serverTimestamp: vi.fn(() => 'SERVER_TS'),
}))

// ── Helpers ──────────────────────────────────────────────────────
function makeDoc(id: string, overrides = {}) {
  return {
    id,
    data: () => ({
      text:        'Hello',
      userId:      'user-a',
      displayName: 'Alice',
      sentAt:      { toMillis: () => 1000 },
      ...overrides,
    }),
  }
}

describe('useMessages', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Default: fire an empty snapshot immediately
    mockOnSnapshot.mockImplementation((_q, cb) => {
      cb({ docs: [] })
      return vi.fn() // unsubscribe
    })
  })

  it('starts with loading=true before the first snapshot', () => {
    // Never fire the callback → stays loading
    mockOnSnapshot.mockReturnValue(vi.fn())
    const { result } = renderHook(() => useMessages('ROOM01'))
    expect(result.current.loading).toBe(true)
  })

  it('sets loading=false once the first snapshot fires', () => {
    const { result } = renderHook(() => useMessages('ROOM01'))
    expect(result.current.loading).toBe(false)
  })

  it('starts with an empty messages array', () => {
    const { result } = renderHook(() => useMessages('ROOM01'))
    expect(result.current.messages).toEqual([])
  })

  it('maps Firestore docs to Message objects', () => {
    mockOnSnapshot.mockImplementation((_q, cb) => {
      cb({ docs: [makeDoc('msg-1')] })
      return vi.fn()
    })
    const { result } = renderHook(() => useMessages('ROOM01'))
    expect(result.current.messages).toHaveLength(1)
    expect(result.current.messages[0]).toMatchObject({
      id:          'msg-1',
      text:        'Hello',
      userId:      'user-a',
      displayName: 'Alice',
      sentAt:      1000,
    })
  })

  it('handles a missing sentAt by falling back to Date.now()', () => {
    mockOnSnapshot.mockImplementation((_q, cb) => {
      cb({ docs: [makeDoc('msg-1', { sentAt: null })] })
      return vi.fn()
    })
    const { result } = renderHook(() => useMessages('ROOM01'))
    expect(typeof result.current.messages[0].sentAt).toBe('number')
  })

  it('does not subscribe when roomCode is empty', () => {
    renderHook(() => useMessages(''))
    expect(mockOnSnapshot).not.toHaveBeenCalled()
  })

  it('calls the unsubscribe function on unmount', () => {
    const unsub = vi.fn()
    mockOnSnapshot.mockImplementation((_q, cb) => { cb({ docs: [] }); return unsub })
    const { unmount } = renderHook(() => useMessages('ROOM01'))
    unmount()
    expect(unsub).toHaveBeenCalledOnce()
  })

  // ── sendMessage ──────────────────────────────────────────────

  it('calls addDoc with trimmed text and metadata', async () => {
    const { result } = renderHook(() => useMessages('ROOM01'))
    await act(async () => {
      await result.current.sendMessage('  Hello  ', 'user-a', 'Alice')
    })
    expect(mockAddDoc).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ text: 'Hello', userId: 'user-a', displayName: 'Alice' }),
    )
  })

  it('does not call addDoc for a blank message', async () => {
    const { result } = renderHook(() => useMessages('ROOM01'))
    await act(async () => {
      await result.current.sendMessage('   ', 'user-a', 'Alice')
    })
    expect(mockAddDoc).not.toHaveBeenCalled()
  })

  it('does not call addDoc when roomCode is empty', async () => {
    const { result } = renderHook(() => useMessages(''))
    await act(async () => {
      await result.current.sendMessage('Hello', 'user-a', 'Alice')
    })
    expect(mockAddDoc).not.toHaveBeenCalled()
  })
})
