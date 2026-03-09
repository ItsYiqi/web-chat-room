import Avatar from '@/components/atoms/Avatar';
import styles from './MessageBubble.module.scss';
import type { Message } from '@/hooks/useMessages';

interface Props {
  message: Message;
  isOwn: boolean;
  isFirst: boolean; // first in a consecutive group — show avatar + name
  isLast: boolean; // last in a group — show rounded bottom corner
}

export default function MessageBubble({ message, isOwn, isFirst, isLast }: Props) {
  const time = new Date(message.sentAt).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  const rowClass = [
    styles.row,
    isOwn ? styles.own : styles.other,
    isFirst ? styles.first : '',
    isLast  ? styles.last  : '',
  ].filter(Boolean).join(' ');

  return (
    <div className={rowClass}>
      {/* Avatar — show on first message in group for both own and other users */}
      <div className={styles.avatarSlot}>
        {isFirst && (
          <Avatar
            userId={message.userId}
            displayName={message.displayName}
            size={30}
          />
        )}
      </div>

      <div className={styles.content}>
        {!isOwn && isFirst && (
          <span className={styles.name}>{message.displayName}</span>
        )}
        <div className={styles.bubble}>
          <p className={styles.text}>{message.text}</p>
          <span className={styles.time}>{time}</span>
        </div>
      </div>
    </div>
  );
}
