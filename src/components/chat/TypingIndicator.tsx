import styles from './TypingIndicator.module.scss';

interface Props {
  typingUsers: string[]; // array of uids currently typing
}

export default function TypingIndicator({ typingUsers }: Props) {
  const count = typingUsers.length;

  return (
    <>
      {count > 0 && (
        <div className={styles.wrap}>
          <div className={styles.dots}>
            <span />
            <span />
            <span />
          </div>
          <span className={styles.label}>
            {count === 1 ? 'Someone is typing' : `${count} people are typing`}
          </span>
        </div>
      )}
    </>
  );
}
