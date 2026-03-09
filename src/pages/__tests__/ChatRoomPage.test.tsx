import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import ChatRoomPage from '../ChatRoomPage'
import { useUserStore } from '@/store/useUserStore'
import { roomExists } from '@/lib/roomUtils'

// ── Mock all external dependencies ───────────────────────────────
const mockNavigate = vi.fn()

vi.mock('react-router-dom', async (importActual) => {
  const actual = await importActual<typeof import('react-router-dom')>()
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useParams:   () => ({ code: 'ROOM01' }),
  }
})

vi.mock('@/lib/roomUtils', () => ({
  roomExists: vi.fn(async () => true),
}))

vi.mock('@/hooks/useMessages', () => ({
  useMessages: () => ({ messages: [], loading: false, sendMessage: vi.fn() }),
}))

vi.mock('@/hooks/useTyping', () => ({
  useTyping: () => ({ typingUsers: [], notifyTyping: vi.fn() }),
}))

vi.mock('@/hooks/usePresence', () => ({
  usePresence: () => ({ onlineCount: 2 }),
}))

// ── Helper ────────────────────────────────────────────────────────
const renderRoom = () =>
  render(<ChatRoomPage />, { wrapper: MemoryRouter })

describe('ChatRoomPage', () => {
  beforeEach(() => {
    // resetAllMocks clears implementations too, so nothing leaks between tests
    vi.resetAllMocks()
    // Restore the default: room always exists unless a specific test overrides it
    vi.mocked(roomExists).mockResolvedValue(true)
    sessionStorage.clear()
    useUserStore.setState({ uid: 'user-123', displayName: 'Wendy', roomCode: 'ROOM01' })
  })

  // ── Guard: missing display name ───────────────────────────────

  it('redirects to the lobby when displayName is not set', async () => {
    useUserStore.setState({ uid: 'user-123', displayName: null, roomCode: null })
    renderRoom()
    await waitFor(() =>
      expect(mockNavigate).toHaveBeenCalledWith('/', { replace: true }),
    )
  })

  // ── Loading state ─────────────────────────────────────────────

  it('shows a loading spinner while validating the room', () => {
    // Never resolve so the component stays in loading state
    vi.mocked(roomExists).mockReturnValue(new Promise(() => {}))
    renderRoom()
    expect(screen.getByRole('status')).toBeInTheDocument()
  })

  // ── Successful render ─────────────────────────────────────────

  it('renders the message input after the room is validated', async () => {
    renderRoom()
    await waitFor(() =>
      expect(screen.getByPlaceholderText(/type a message/i)).toBeInTheDocument(),
    )
  })

  it('renders the room code in the header', async () => {
    renderRoom()
    await waitFor(() =>
      expect(screen.getByText('ROOM01')).toBeInTheDocument(),
    )
  })

  it('shows the online count from usePresence', async () => {
    renderRoom()
    await waitFor(() =>
      expect(screen.getByText(/2 online/i)).toBeInTheDocument(),
    )
  })

  // ── Guard: room not found ─────────────────────────────────────

  it('redirects to the lobby when the room does not exist', async () => {
    vi.mocked(roomExists).mockResolvedValueOnce(false)
    renderRoom()
    await waitFor(() =>
      expect(mockNavigate).toHaveBeenCalledWith('/', { replace: true }),
    )
  })
})
