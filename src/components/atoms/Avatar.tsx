import styles from './Avatar.module.scss'

// Deterministic colour from userId — same user always gets same colour
const PALETTE = [
  '#6c63ff','#ff6584','#43e97b',
  '#f7971e','#38bdf8','#e879f9','#fb923c',
]

function colorFromId(id: string): string {
  let hash = 0
  for (let i = 0; i < id.length; i++) {
    hash = (hash << 5) - hash + id.charCodeAt(i)
    hash |= 0
  }
  return PALETTE[Math.abs(hash) % PALETTE.length]
}

interface Props {
  userId:      string
  displayName: string
  size?:       number
}

export default function Avatar({ userId, displayName, size = 32 }: Props) {
  const color   = colorFromId(userId)
  const initials = displayName.trim().slice(0, 2).toUpperCase()

  return (
    <div
      className={styles.avatar}
      style={{
        width:           size,
        height:          size,
        background:      color,
        fontSize:        size * 0.38,
        boxShadow:       `0 0 0 2px ${color}44`,
      }}
      title={displayName}
      aria-label={displayName}
    >
      {initials}
    </div>
  )
}
