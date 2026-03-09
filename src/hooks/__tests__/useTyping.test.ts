import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useTyping } from '../useTyping'

// ── Mock Firebase ────────────────────────────────────────────────
vi.mock('@/lib/firebase', () => ({ rtdb: {} }))

// vi.hoisted ensures these are initialised before vi.mock() factories run
const { mockOnValue, mockSet, mockRemove, mockRef } = vi.hoisted(() => ({
  mockOnValue: vi.fn(),
  mockSet:     vi.fn(),
  mockRemove:  vi.fn(),
  mockRef:     vi.fn((_db: unknown, path: string) => path),
}))

vi.mock('firebase/database', () => ({
  ref:     mockRef,
  onValue: mockOnValue,
  set:     mockSet,
  remove:  mockRemove,
}))

describe('useTyping', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
    // Default: fire empty snapshot immediately
    mockOnValue.mockImplementation((_ref, cb) => {
      cb({ val: () => null })
      return vi.fn()
    })
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  // ── Initial state ────────────────────────────────────────────

  it('starts with an empty typingUsers array', () => {
    const { result } = renderHook(() => useTyping('ROOM01', 'user-a'))
    expect(result.current.typingUsers).toEqual([])
  })

  it('does not subscribe when roomCode is empty', () => {
    renderHook(() => useTyping('', 'user-a'))
    expect(mockOnValue).not.toHaveBeenCalled()
  })

  it('does not subscribe when uid is empty', () => {
    renderHook(() => useTyping('ROOM01', ''))
    expect(mockOnValue).not.toHaveBeenCalled()
  })

  // ── Snapshot handling ────────────────────────────────────────

  it('excludes the current user from typingUsers', () => {
    mockOnValue.mockImplementation((_ref, cb) => {
      cb({ val: () => ({ 'user-a': true, 'user-b': true }) })
      return vi.fn()
    })
    const { result } = renderHook(() => useTyping('ROOM01', 'user-a'))
    expect(result.current.typingUsers).toEqual(['user-b'])
    expect(result.current.typingUsers).not.toContain('user-a')
  })

  it('excludes users whose flag is false', () => {
    mockOnValue.mockImplementation((_ref, cb) => {
      cb({ val: () => ({ 'user-b': false, 'user-c': true }) })
      return vi.fn()
    })
    const { result } = renderHook(() => useTyping('ROOM01', 'user-a'))
    expect(result.current.typingUsers).toEqual(['user-c'])
  })

  it('returns empty array when no one is typing', () => {
    mockOnValue.mockImplementation((_ref, cb) => {
      cb({ val: () => ({}) })
      return vi.fn()
    })
    const { result } = renderHook(() => useTyping('ROOM01', 'user-a'))
    expect(result.current.typingUsers).toEqual([])
  })

  // ── notifyTyping ─────────────────────────────────────────────

  it('notifyTyping calls set(ref, true)', () => {
    const { result } = renderHook(() => useTyping('ROOM01', 'user-a'))
    act(() => { result.current.notifyTyping() })
    expect(mockSet).toHaveBeenCalledWith(
      expect.anything(),
      true,
    )
  })

  it('notifyTyping removes the flag after the 2.5s inactivity timeout', () => {
    const { result } = renderHook(() => useTyping('ROOM01', 'user-a'))
    act(() => { result.current.notifyTyping() })
    act(() => { vi.advanceTimersByTime(2500) })
    expect(mockRemove).toHaveBeenCalled()
  })

  it('resets the inactivity timer on consecutive notifyTyping calls', () => {
    const { result } = renderHook(() => useTyping('ROOM01', 'user-a'))
    act(() => { result.current.notifyTyping() })
    act(() => { vi.advanceTimersByTime(2000) })
    act(() => { result.current.notifyTyping() }) // reset timer
    act(() => { vi.advanceTimersByTime(2000) })
    // Still within the new 2.5s window — remove should NOT have been called yet
    expect(mockRemove).not.toHaveBeenCalled()
  })

  it('cleans up the typing flag on unmount', () => {
    const { unmount } = renderHook(() => useTyping('ROOM01', 'user-a'))
    unmount()
    expect(mockRemove).toHaveBeenCalled()
  })

  it('calls the onValue unsubscribe on unmount', () => {
    const unsub = vi.fn()
    mockOnValue.mockImplementation((_ref, cb) => { cb({ val: () => null }); return unsub })
    const { unmount } = renderHook(() => useTyping('ROOM01', 'user-a'))
    unmount()
    expect(unsub).toHaveBeenCalled()
  })
})
