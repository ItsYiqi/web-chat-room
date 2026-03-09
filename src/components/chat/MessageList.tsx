import { useEffect, useRef } from 'react'
import MessageBubble from './MessageBubble'
import styles from './MessageList.module.scss'
import type { Message } from '@/hooks/useMessages'

interface Props {
  messages:    Message[]
  currentUid:  string
  searchQuery: string
}

export default function MessageList({ messages, currentUid, searchQuery }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages.length])

  // Filter by search query (client-side)
  const filtered = searchQuery.trim()
    ? messages.filter((m) =>
        m.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.displayName.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : messages

  if (filtered.length === 0) {
    return (
      <div className={styles.empty}>
        {searchQuery ? (
          <p>No messages match "<strong>{searchQuery}</strong>"</p>
        ) : (
          <p>No messages yet — say hello! 👋</p>
        )}
      </div>
    )
  }

  return (
    <div className={styles.list}>
      {filtered.map((msg, i) => {
        const prev = filtered[i - 1]
        const next = filtered[i + 1]
        const isFirst = !prev || prev.userId !== msg.userId
        const isLast  = !next || next.userId !== msg.userId

        return (
          <MessageBubble
            key={msg.id}
            message={msg}
            isOwn={msg.userId === currentUid}
            isFirst={isFirst}
            isLast={isLast}
          />
        )
      })}
      <div ref={bottomRef} />
    </div>
  )
}
