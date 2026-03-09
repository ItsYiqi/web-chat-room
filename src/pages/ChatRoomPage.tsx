import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import RoomHeader from '@/components/layout/RoomHeader';
import MessageList from '@/components/chat/MessageList';
import MessageInput from '@/components/chat/MessageInput';
import TypingIndicator from '@/components/chat/TypingIndicator';
import Spinner from '@/components/atoms/Spinner';
import { useUserStore } from '@/store/useUserStore';
import { useMessages } from '@/hooks/useMessages';
import { useTyping } from '@/hooks/useTyping';
import { usePresence } from '@/hooks/usePresence';
import { roomExists } from '@/lib/roomUtils';
import styles from './ChatRoomPage.module.scss';

export default function ChatRoomPage() {
  const { code = '' } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const { uid, displayName } = useUserStore();

  const [validating, setValidating] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Redirect to lobby if no display name
  useEffect(() => {
    if (!displayName) {
      navigate('/', { replace: true });
      return;
    }

    // Validate that the room exists in Firestore
    roomExists(code).then((exists) => {
      if (!exists) navigate('/', { replace: true });
      else setValidating(false);
    });
  }, [code, displayName, navigate]);

  const { messages, loading, sendMessage } = useMessages(code);
  const { typingUsers, notifyTyping } = useTyping(code, uid ?? '');
  const { onlineCount } = usePresence(code, uid ?? '', displayName ?? '');

  async function handleSend(text: string) {
    if (!uid || !displayName) return;
    await sendMessage(text, uid, displayName);
  }

  if (validating || loading) {
    return (
      <div className={styles.loadingScreen}>
        <Spinner size={36} />
        <p>Connecting to room…</p>
      </div>
    );
  }

  return (
    <div className={styles.room}>
      <RoomHeader
        roomCode={code}
        onlineCount={onlineCount}
        searchQuery={searchQuery}
        onSearch={setSearchQuery}
      />

      <MessageList
        messages={messages}
        currentUid={uid ?? ''}
        searchQuery={searchQuery}
      />

      <TypingIndicator typingUsers={typingUsers} />

      <MessageInput onSend={handleSend} onTyping={notifyTyping} />
    </div>
  );
}
