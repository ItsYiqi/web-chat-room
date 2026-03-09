import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import styles from './RoomHeader.module.scss'

interface Props {
  roomCode:    string
  onlineCount: number
  searchQuery: string
  onSearch:    (q: string) => void
}

export default function RoomHeader({ roomCode, onlineCount, searchQuery, onSearch }: Props) {
  const [copied,       setCopied]       = useState(false)
  const [showSearch,   setShowSearch]   = useState(false)
  const navigate = useNavigate()

  async function handleCopy() {
    await navigator.clipboard.writeText(roomCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function handleLeave() {
    navigate('/')
  }

  return (
    <header className={styles.header}>
      <div className={styles.left}>
        <button className={styles.leaveBtn} onClick={handleLeave} title="Leave room">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <div>
          <p className={styles.roomLabel}>Room</p>
          <button className={styles.codeBtn} onClick={handleCopy} title="Click to copy">
            <span className={styles.code}>{roomCode}</span>
            <span className={styles.copyHint}>{copied ? '✓ Copied!' : 'Copy'}</span>
          </button>
        </div>
      </div>

      <div className={styles.right}>
        <span className={styles.online}>
          <span className={styles.dot} />
          {onlineCount} online
        </span>

        <button
          className={[styles.iconBtn, showSearch ? styles.active : ''].join(' ')}
          onClick={() => { setShowSearch(s => !s); onSearch('') }}
          title="Search messages"
        >
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
        </button>
      </div>

      {showSearch && (
        <div className={styles.searchBar}>
          <input
            autoFocus
            className={styles.searchInput}
            placeholder="Search messages…"
            value={searchQuery}
            onChange={(e) => onSearch(e.target.value)}
          />
          {searchQuery && (
            <button className={styles.clearBtn} onClick={() => onSearch('')}>✕</button>
          )}
        </div>
      )}
    </header>
  )
}
