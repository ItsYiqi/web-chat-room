import { useState, useRef, KeyboardEvent } from 'react'
import styles from './MessageInput.module.scss'

interface Props {
  onSend:         (text: string) => Promise<void>
  onTyping:       () => void
  disabled?:      boolean
}

export default function MessageInput({ onSend, onTyping, disabled }: Props) {
  const [text,    setText]    = useState('')
  const [sending, setSending] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  async function handleSend() {
    const trimmed = text.trim()
    if (!trimmed || sending) return

    setSending(true)
    await onSend(trimmed)
    setText('')
    setSending(false)
    textareaRef.current?.focus()
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setText(e.target.value)
    onTyping()
  }

  return (
    <div className={styles.bar}>
      <textarea
        ref={textareaRef}
        className={styles.textarea}
        value={text}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder="Type a message…"
        disabled={disabled || sending}
        rows={1}
        maxLength={500}
      />
      <button
        className={styles.sendBtn}
        onClick={handleSend}
        disabled={!text.trim() || sending || disabled}
        aria-label="Send message"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
          strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="22" y1="2" x2="11" y2="13" />
          <polygon points="22 2 15 22 11 13 2 9 22 2" />
        </svg>
      </button>
    </div>
  )
}
