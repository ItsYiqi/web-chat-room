import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import { usePresence } from '../usePresence'

// ── Mock Firebase ────────────────────────────────────────────────
vi.mock('@/lib/firebase', () => ({ rtdb: {} }))

// vi.hoisted ensures these are initialised before vi.mock() factories run
const { mockOnValue, mockSet, mockRemove, mockRef, mockOnDisconnect } = vi.hoisted(() => ({
  mockOnValue:      vi.fn(),
  mockSet:          vi.fn(),
  mockRemove:       vi.fn(),
  mockRef:          vi.fn((_db: unknown, path: string) => path),
  mockOnDisconnect: vi.fn(),
}))

vi.mock('firebase/database', () => ({
  ref:         mockRef,
  onValue:     mockOnValue,
  set:         mockSet,
  remove:      mockRemove,
  onDisconnect: mockOnDisconnect,
}))

describe('usePresence', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockOnDisconnect.mockReturnValue({ remove: vi.fn(), cancel: vi.fn() })
    // Default: 1 user online
    mockOnValue.mockImplementation((_ref, cb) => {
      cb({ val: () => ({ 'user-a': { online: true } }) })
      return vi.fn()
    })
  })

  // ── Mount behaviour ──────────────────────────────────────────

  it('writes presence to RTDB on mount', () => {
    renderHook(() => usePresence('ROOM01', 'user-a', 'Alice'))
    expect(mockSet).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ displayName: 'Alice', online: true }),
    )
  })

  it('registers an onDisconnect removal handler', () => {
    renderHook(() => usePresence('ROOM01', 'user-a', 'Alice'))
    expect(mockOnDisconnect).toHaveBeenCalled()
    expect(mockOnDisconnect.mock.results[0].value.remove).toBeDefined()
  })

  it('subscribes to the room presence node', () => {
    renderHook(() => usePresence('ROOM01', 'user-a', 'Alice'))
    expect(mockOnValue).toHaveBeenCalled()
  })

  // ── Online count ─────────────────────────────────────────────

  it('counts the number of unique users from the snapshot', () => {
    mockOnValue.mockImplementation((_ref, cb) => {
      cb({ val: () => ({ 'user-a': {}, 'user-b': {}, 'user-c': {} }) })
      return vi.fn()
    })
    const { result } = renderHook(() => usePresence('ROOM01', 'user-a', 'Alice'))
    expect(result.current.onlineCount).toBe(3)
  })

  it('returns 0 when presence node is empty', () => {
    mockOnValue.mockImplementation((_ref, cb) => {
      cb({ val: () => ({}) })
      return vi.fn()
    })
    const { result } = renderHook(() => usePresence('ROOM01', 'user-a', 'Alice'))
    expect(result.current.onlineCount).toBe(0)
  })

  // ── Guard conditions ─────────────────────────────────────────

  it('does nothing when roomCode is empty', () => {
    renderHook(() => usePresence('', 'user-a', 'Alice'))
    expect(mockSet).not.toHaveBeenCalled()
    expect(mockOnValue).not.toHaveBeenCalled()
  })

  it('does nothing when uid is empty', () => {
    renderHook(() => usePresence('ROOM01', '', 'Alice'))
    expect(mockSet).not.toHaveBeenCalled()
  })

  it('does nothing when displayName is empty', () => {
    renderHook(() => usePresence('ROOM01', 'user-a', ''))
    expect(mockSet).not.toHaveBeenCalled()
  })

  // ── Cleanup ──────────────────────────────────────────────────

  it('removes presence entry on unmount', () => {
    const { unmount } = renderHook(() => usePresence('ROOM01', 'user-a', 'Alice'))
    mockRemove.mockClear()
    unmount()
    expect(mockRemove).toHaveBeenCalled()
  })

  it('cancels the onDisconnect handler on unmount', () => {
    const cancel = vi.fn()
    mockOnDisconnect.mockReturnValue({ remove: vi.fn(), cancel })
    const { unmount } = renderHook(() => usePresence('ROOM01', 'user-a', 'Alice'))
    unmount()
    expect(cancel).toHaveBeenCalled()
  })

  it('calls the onValue unsubscribe function on unmount', () => {
    const unsub = vi.fn()
    mockOnValue.mockImplementation((_ref, cb) => {
      cb({ val: () => ({}) })
      return unsub
    })
    const { unmount } = renderHook(() => usePresence('ROOM01', 'user-a', 'Alice'))
    unmount()
    expect(unsub).toHaveBeenCalled()
  })
})
