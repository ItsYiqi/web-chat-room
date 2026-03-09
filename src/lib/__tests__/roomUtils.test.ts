import { describe, it, expect } from 'vitest'
import { generateRoomCode } from '../roomUtils'

// No O/0/I/1 in the character set to avoid visual ambiguity
const VALID = /^[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]{6}$/

describe('generateRoomCode', () => {
  it('returns a 6-character string', () => {
    expect(generateRoomCode()).toHaveLength(6)
  })

  it('only contains characters from the allowed set', () => {
    for (let i = 0; i < 100; i++) {
      expect(generateRoomCode()).toMatch(VALID)
    }
  })

  it('never contains visually ambiguous characters O, 0, I, or 1', () => {
    for (let i = 0; i < 200; i++) {
      expect(generateRoomCode()).not.toMatch(/[O0I1]/)
    }
  })

  it('produces unique codes across repeated calls', () => {
    const codes = new Set(Array.from({ length: 50 }, generateRoomCode))
    expect(codes.size).toBeGreaterThan(1)
  })
})
