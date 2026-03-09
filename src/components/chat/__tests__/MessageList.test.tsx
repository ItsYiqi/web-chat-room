import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import MessageList from '../MessageList'
import type { Message } from '@/hooks/useMessages'

beforeEach(() => {
  Element.prototype.scrollIntoView = vi.fn()
})

const msgs: Message[] = [
  { id: '1', userId: 'user-a', displayName: 'Alice', text: 'Hello from Alice', sentAt: 1000 },
  { id: '2', userId: 'user-b', displayName: 'Bob',   text: 'Hey there',        sentAt: 2000 },
  { id: '3', userId: 'user-a', displayName: 'Alice', text: 'Alice again',       sentAt: 3000 },
]

describe('MessageList', () => {
  // ── Empty states ──────────────────────────────────────────────

  it('shows a "say hello" prompt when there are no messages', () => {
    render(<MessageList messages={[]} currentUid="user-a" searchQuery="" />)
    expect(screen.getByText(/say hello/i)).toBeInTheDocument()
  })

  it('shows a search-specific empty state when no messages match', () => {
    render(<MessageList messages={msgs} currentUid="user-a" searchQuery="xyzzy" />)
    expect(screen.getByText(/xyzzy/i)).toBeInTheDocument()
  })

  // ── Rendering ─────────────────────────────────────────────────

  it('renders all messages when the search query is empty', () => {
    render(<MessageList messages={msgs} currentUid="user-a" searchQuery="" />)
    expect(screen.getByText('Hello from Alice')).toBeInTheDocument()
    expect(screen.getByText('Hey there')).toBeInTheDocument()
    expect(screen.getByText('Alice again')).toBeInTheDocument()
  })

  // ── Search filtering ──────────────────────────────────────────

  it('filters messages by text content', () => {
    render(<MessageList messages={msgs} currentUid="user-a" searchQuery="hello" />)
    expect(screen.getByText('Hello from Alice')).toBeInTheDocument()
    expect(screen.queryByText('Hey there')).not.toBeInTheDocument()
    expect(screen.queryByText('Alice again')).not.toBeInTheDocument()
  })

  it('filters messages case-insensitively', () => {
    render(<MessageList messages={msgs} currentUid="user-a" searchQuery="HELLO" />)
    expect(screen.getByText('Hello from Alice')).toBeInTheDocument()
  })

  it('filters messages by sender display name', () => {
    render(<MessageList messages={msgs} currentUid="user-a" searchQuery="Bob" />)
    expect(screen.getByText('Hey there')).toBeInTheDocument()
    expect(screen.queryByText('Hello from Alice')).not.toBeInTheDocument()
  })

  it('shows multiple matching messages when query matches several', () => {
    render(<MessageList messages={msgs} currentUid="user-a" searchQuery="alice" />)
    // "Hello from Alice" matches by name, "Alice again" matches by text AND name
    expect(screen.getByText('Hello from Alice')).toBeInTheDocument()
    expect(screen.getByText('Alice again')).toBeInTheDocument()
    expect(screen.queryByText('Hey there')).not.toBeInTheDocument()
  })
})
