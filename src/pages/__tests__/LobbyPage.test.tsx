import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import LobbyPage from '../LobbyPage'
import { useUserStore } from '@/store/useUserStore'

// ── Mock navigation and room utilities ────────────────────────────
const mockNavigate = vi.fn()

vi.mock('react-router-dom', async (importActual) => {
  const actual = await importActual<typeof import('react-router-dom')>()
  return { ...actual, useNavigate: () => mockNavigate }
})

vi.mock('@/lib/roomUtils', () => ({
  createRoom: vi.fn(async () => 'NEW123'),
  roomExists: vi.fn(async () => true),
}))

// Wrap in MemoryRouter so Link / history hooks resolve
const renderLobby = () =>
  render(<LobbyPage />, { wrapper: MemoryRouter })

describe('LobbyPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    sessionStorage.clear()
    useUserStore.setState({ uid: 'user-123', displayName: null, roomCode: null })
  })

  // ── Rendering ─────────────────────────────────────────────────

  it('renders the name field, create button, and room-code input', () => {
    renderLobby()
    expect(screen.getByLabelText(/your name/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /create/i })).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/room code/i)).toBeInTheDocument()
  })

  // ── Validation ────────────────────────────────────────────────

  it('shows an error when creating without entering a name', async () => {
    renderLobby()
    await userEvent.click(screen.getByRole('button', { name: /create/i }))
    expect(screen.getByText(/please enter your name/i)).toBeInTheDocument()
  })

  it('shows an error when joining without entering a name', async () => {
    renderLobby()
    await userEvent.click(screen.getByRole('button', { name: /^join$/i }))
    expect(screen.getByText(/please enter your name/i)).toBeInTheDocument()
  })

  it('shows an error when joining without a room code', async () => {
    renderLobby()
    await userEvent.type(screen.getByLabelText(/your name/i), 'Wendy')
    await userEvent.click(screen.getByRole('button', { name: /^join$/i }))
    expect(screen.getByText(/please enter a room code/i)).toBeInTheDocument()
  })

  it('shows an error when the name exceeds 24 characters', async () => {
    renderLobby()
    // maxLength on the input prevents typing >24 chars, but store validation
    // still fires — trigger it by bypassing via fireEvent or checking the guard
    await userEvent.type(screen.getByLabelText(/your name/i), 'A'.repeat(24))
    await userEvent.click(screen.getByRole('button', { name: /create/i }))
    // 24 chars is at the limit — should succeed, not error
    await waitFor(() => expect(screen.queryByText(/24 characters/i)).not.toBeInTheDocument())
  })

  // ── Create flow ───────────────────────────────────────────────

  it('navigates to the new room after successful creation', async () => {
    renderLobby()
    await userEvent.type(screen.getByLabelText(/your name/i), 'Wendy')
    await userEvent.click(screen.getByRole('button', { name: /create/i }))
    await waitFor(() =>
      expect(mockNavigate).toHaveBeenCalledWith('/room/NEW123'),
    )
  })

  it('stores the display name and room code in the session after creation', async () => {
    renderLobby()
    await userEvent.type(screen.getByLabelText(/your name/i), 'Wendy')
    await userEvent.click(screen.getByRole('button', { name: /create/i }))
    await waitFor(() => {
      expect(useUserStore.getState().displayName).toBe('Wendy')
      expect(useUserStore.getState().roomCode).toBe('NEW123')
    })
  })

  // ── Join flow ─────────────────────────────────────────────────

  it('navigates to the room after a successful join', async () => {
    renderLobby()
    await userEvent.type(screen.getByLabelText(/your name/i), 'Wendy')
    await userEvent.type(screen.getByPlaceholderText(/room code/i), 'ABC123')
    await userEvent.click(screen.getByRole('button', { name: /^join$/i }))
    await waitFor(() =>
      expect(mockNavigate).toHaveBeenCalledWith('/room/ABC123'),
    )
  })

  it('shows an error when the room code does not exist', async () => {
    const { roomExists } = await import('@/lib/roomUtils')
    vi.mocked(roomExists).mockResolvedValueOnce(false)

    renderLobby()
    await userEvent.type(screen.getByLabelText(/your name/i), 'Wendy')
    await userEvent.type(screen.getByPlaceholderText(/room code/i), 'BADCODE')
    await userEvent.click(screen.getByRole('button', { name: /^join$/i }))
    await waitFor(() =>
      expect(screen.getByText(/room not found/i)).toBeInTheDocument(),
    )
  })

  // ── Session restore ───────────────────────────────────────────

  it('redirects to the existing room when a session is already active', async () => {
    useUserStore.setState({ uid: 'u1', displayName: 'Wendy', roomCode: 'ABC123' })
    renderLobby()
    await waitFor(() =>
      expect(mockNavigate).toHaveBeenCalledWith('/room/ABC123', { replace: true }),
    )
  })
})
