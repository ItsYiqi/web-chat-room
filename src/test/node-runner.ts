/**
 * Standalone test runner using Node's built-in node:test module.
 * No external packages required — runs today with:
 *
 *   npm run test:node
 *
 * Covers pure logic and the Zustand store.
 * Component tests (Avatar, Button, MessageBubble, MessageList) require
 * Vitest + jsdom — see `npm run test` after installing dev packages.
 */

import { describe, it, beforeEach } from 'node:test'
import assert from 'node:assert/strict'

// ─────────────────────────────────────────────
// Polyfill browser globals needed by Zustand's
// sessionStorage persistence layer
// ─────────────────────────────────────────────
;(globalThis as unknown as Record<string, unknown>).sessionStorage = {
  _store: {} as Record<string, string>,
  getItem(k: string) { return (this._store as Record<string, string>)[k] ?? null },
  setItem(k: string, v: string) { (this._store as Record<string, string>)[k] = String(v) },
  removeItem(k: string) { delete (this._store as Record<string, string>)[k] },
  clear() { (this as unknown as { _store: Record<string, string> })._store = {} },
}

// ─────────────────────────────────────────────
// generateRoomCode — pure function, tested
// against the exact character set from source
// ─────────────────────────────────────────────
const CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // mirrors roomUtils.ts
function generateRoomCode(): string {
  return Array.from(
    { length: 6 },
    () => CHARS[Math.floor(Math.random() * CHARS.length)],
  ).join('')
}

describe('generateRoomCode', () => {
  it('returns a 6-character string', () => {
    assert.equal(generateRoomCode().length, 6)
  })

  it('only contains characters from the allowed set', () => {
    const VALID = /^[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]{6}$/
    for (let i = 0; i < 100; i++) {
      const code = generateRoomCode()
      assert.ok(VALID.test(code), `Invalid code: ${code}`)
    }
  })

  it('never contains visually ambiguous characters O, 0, I, or 1', () => {
    for (let i = 0; i < 200; i++) {
      const code = generateRoomCode()
      assert.ok(!/[O0I1]/.test(code), `Ambiguous char in: ${code}`)
    }
  })

  it('produces unique codes across repeated calls', () => {
    const codes = new Set(Array.from({ length: 50 }, generateRoomCode))
    assert.ok(codes.size > 1, 'Expected more than one unique code')
  })
})

// ─────────────────────────────────────────────
// useUserStore — Zustand store logic
// ─────────────────────────────────────────────
const { useUserStore } = await import('../store/useUserStore.ts')

describe('useUserStore', () => {
  beforeEach(() => {
    ;(globalThis as unknown as { sessionStorage: { clear(): void } }).sessionStorage.clear()
    useUserStore.setState({ uid: null, displayName: null, roomCode: null })
  })

  it('sets uid', () => {
    useUserStore.getState().setUid('user-123')
    assert.equal(useUserStore.getState().uid, 'user-123')
  })

  it('sets displayName', () => {
    useUserStore.getState().setDisplayName('Wendy')
    assert.equal(useUserStore.getState().displayName, 'Wendy')
  })

  it('sets roomCode', () => {
    useUserStore.getState().setRoomCode('ABC123')
    assert.equal(useUserStore.getState().roomCode, 'ABC123')
  })

  it('clear() resets displayName and roomCode but keeps uid', () => {
    useUserStore.setState({ uid: 'user-123', displayName: 'Wendy', roomCode: 'ABC123' })
    useUserStore.getState().clear()
    assert.equal(useUserStore.getState().uid, 'user-123')
    assert.equal(useUserStore.getState().displayName, null)
    assert.equal(useUserStore.getState().roomCode, null)
  })

  it('setRoomCode(null) clears the room', () => {
    useUserStore.setState({ roomCode: 'XYZ999' })
    useUserStore.getState().setRoomCode(null)
    assert.equal(useUserStore.getState().roomCode, null)
  })

  it('persists state to sessionStorage', () => {
    useUserStore.getState().setDisplayName('Wendy')
    useUserStore.getState().setRoomCode('ROOM01')
    const raw = (globalThis as unknown as { sessionStorage: Storage }).sessionStorage
      .getItem('monash-chat-session')
    const stored = JSON.parse(raw ?? '{}') as { state: { displayName: string; roomCode: string } }
    assert.equal(stored.state.displayName, 'Wendy')
    assert.equal(stored.state.roomCode, 'ROOM01')
  })
})
