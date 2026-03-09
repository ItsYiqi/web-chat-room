import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '@/components/atoms/Button';
import Input from '@/components/atoms/Input';
import { useUserStore } from '@/store/useUserStore';
import { createRoom, roomExists } from '@/lib/roomUtils';
import styles from './LobbyPage.module.scss';

export default function LobbyPage() {
  const navigate = useNavigate();
  const { uid, displayName, setDisplayName, setRoomCode } = useUserStore();

  const [name, setName] = useState(displayName ?? '');
  const [code, setCode] = useState('');
  const [nameErr, setNameErr] = useState('');
  const [codeErr, setCodeErr] = useState('');
  const [creating, setCreating] = useState(false);
  const [joining, setJoining] = useState(false);

  const validateName = (): boolean => {
    if (!name.trim()) {
      setNameErr('Please enter your name.');
      return false;
    }
    if (name.trim().length > 24) {
      setNameErr('Name must be 24 characters or fewer.');
      return false;
    }
    setNameErr('');
    return true;
  };

  const handleCreate = async () => {
    if (!validateName() || !uid) return;
    setCreating(true);
    try {
      const trimmedName = name.trim();
      setDisplayName(trimmedName);
      const newCode = await createRoom(uid);
      setRoomCode(newCode);
      navigate(`/room/${newCode}`);
    } catch {
      setCodeErr('Failed to create room. Please try again.');
    } finally {
      setCreating(false);
    }
  };

  const handleJoin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateName()) return;
    if (!code.trim()) {
      setCodeErr('Please enter a room code.');
      return;
    }

    setJoining(true);
    try {
      const upper = code.trim().toUpperCase();
      const exists = await roomExists(upper);
      if (!exists) {
        setCodeErr('Room not found. Check the code and try again.');
        setJoining(false);
        return;
      }
      setDisplayName(name.trim());
      setRoomCode(upper);
      navigate(`/room/${upper}`);
    } catch {
      setCodeErr('Something went wrong. Please try again.');
    } finally {
      setJoining(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        {/* Header */}
        <div className={styles.hero}>
          <div className={styles.logoMark}>💬</div>
          <h1 className={styles.title}>Monash Chat</h1>
          <p className={styles.sub}>Real-time rooms, zero friction.</p>
        </div>

        {/* Name field */}
        <Input
          label="Your name"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            setNameErr('');
          }}
          placeholder="e.g. Wendy"
          error={nameErr}
          maxLength={24}
          autoFocus
        />

        <div className={styles.divider}>
          <span>then</span>
        </div>

        {/* Create room */}
        <Button fullWidth loading={creating} onClick={handleCreate}>
          ✦ Create a new room
        </Button>

        {/* Join room */}
        <form className={styles.joinRow} onSubmit={handleJoin}>
          <Input
            placeholder="Room code — e.g. AB3X7Q"
            value={code}
            onChange={(e) => {
              setCode(e.target.value.toUpperCase());
              setCodeErr('');
            }}
            error={codeErr}
            maxLength={8}
            style={{ flex: 1 }}
          />
          <Button type="submit" variant="secondary" loading={joining}>
            Join
          </Button>
        </form>
      </div>
    </div>
  );
}
