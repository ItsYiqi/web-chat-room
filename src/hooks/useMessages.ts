// ─────────────────────────────────────────────
// useMessages.ts
// Subscribes to a room's messages in Firestore.
// Returns the last 50 messages, live-updating.
// ─────────────────────────────────────────────

import { useState, useEffect } from 'react';
import {
  collection,
  query,
  orderBy,
  limitToLast,
  onSnapshot,
  addDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../lib/firebase';

export interface Message {
  id: string;
  text: string;
  userId: string;
  displayName: string;
  sentAt: number; // ms timestamp (converted from Firestore Timestamp)
}

export function useMessages(roomCode: string) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!roomCode) return;

    const q = query(
      collection(db, 'rooms', roomCode, 'messages'),
      orderBy('sentAt', 'asc'),
      limitToLast(50), // only fetch latest 50 — key for scalability
    );

    const unsub = onSnapshot(q, (snapshot) => {
      const msgs: Message[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        text: doc.data().text,
        userId: doc.data().userId,
        displayName: doc.data().displayName,
        sentAt: doc.data().sentAt?.toMillis() ?? Date.now(),
      }));
      setMessages(msgs);
      setLoading(false);
    });

    return () => unsub(); // clean up listener on unmount
  }, [roomCode]);

  // ── Send a message ──────────────────────────
  const sendMessage = async (
    text: string,
    userId: string,
    displayName: string,
  ) => {
    const trimmed = text.trim();
    if (!trimmed || !roomCode) return;

    await addDoc(collection(db, 'rooms', roomCode, 'messages'), {
      text: trimmed,
      userId,
      displayName,
      sentAt: serverTimestamp(),
    });
  };

  return { messages, loading, sendMessage };
}
