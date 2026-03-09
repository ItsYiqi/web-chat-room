import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import MessageBubble from '../MessageBubble'
import type { Message } from '@/hooks/useMessages'

// scrollIntoView is not implemented in jsdom
beforeEach(() => {
  Element.prototype.scrollIntoView = vi.fn()
})

const baseMessage: Message = {
  id: 'msg-1',
  userId: 'user-a',
  displayName: 'Alice',
  text: 'Hello world',
  sentAt: new Date('2024-01-01T14:30:00').getTime(),
}

describe('MessageBubble', () => {
  it('renders the message text', () => {
    render(<MessageBubble message={baseMessage} isOwn={false} isFirst isLast />)
    expect(screen.getByText('Hello world')).toBeInTheDocument()
  })

  it('shows a formatted timestamp', () => {
    render(<MessageBubble message={baseMessage} isOwn={false} isFirst isLast />)
    // Should contain something that looks like HH:MM
    expect(screen.getByText(/\d{1,2}:\d{2}/)).toBeInTheDocument()
  })

  // ── Sender name ──────────────────────────────────────────────

  it('shows the sender name for another user on the first message', () => {
    render(<MessageBubble message={baseMessage} isOwn={false} isFirst isLast />)
    expect(screen.getByText('Alice')).toBeInTheDocument()
  })

  it('does not show sender name for own messages', () => {
    render(<MessageBubble message={baseMessage} isOwn isFirst isLast />)
    expect(screen.queryByText('Alice')).not.toBeInTheDocument()
  })

  it('does not show sender name on non-first messages in a group', () => {
    render(<MessageBubble message={baseMessage} isOwn={false} isFirst={false} isLast={false} />)
    expect(screen.queryByText('Alice')).not.toBeInTheDocument()
  })

  // ── Avatar visibility ─────────────────────────────────────────

  it('shows avatar on the first message for other users', () => {
    render(<MessageBubble message={baseMessage} isOwn={false} isFirst isLast />)
    expect(screen.getByTitle('Alice')).toBeInTheDocument()
  })

  it('shows avatar on the first message for own messages', () => {
    render(<MessageBubble message={baseMessage} isOwn isFirst isLast />)
    expect(screen.getByTitle('Alice')).toBeInTheDocument()
  })

  it('hides the avatar on non-first messages in a group', () => {
    render(<MessageBubble message={baseMessage} isOwn={false} isFirst={false} isLast={false} />)
    expect(screen.queryByTitle('Alice')).not.toBeInTheDocument()
  })
})
