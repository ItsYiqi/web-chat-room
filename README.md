# 💬 Web Chat Room

A real-time chat application where users can create or join rooms, exchange messages, and see live typing indicators and online presence — all without creating an account.

🔗 **Live preview:** https://monash-chat-94dbb.web.app/
---

## Features

- **Anonymous authentication** — jump straight in with just a display name
- **Create or join rooms** with a 6-character room code
- **Real-time messaging** powered by Firestore
- **Typing indicators** — see when others are composing a message
- **Online presence** — live count of users currently in the room
- **Message search** — filter the chat history by keyword
- **Session restore** — reloading the page returns you to your room automatically

---

## Tech Stack

| Layer | Technology |
|---|---|
| UI framework | [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/) |
| Build tool | [Vite 7](https://vitejs.dev/) |
| Styling | SCSS Modules with a shared design-token system |
| Routing | [React Router v7](https://reactrouter.com/) |
| State management | [Zustand 5](https://zustand-demo.pmnd.rs/) with `sessionStorage` persistence |
| Auth | Firebase Anonymous Authentication |
| Database | [Firebase Firestore](https://firebase.google.com/docs/firestore) (messages & rooms) |
| Realtime | [Firebase Realtime Database](https://firebase.google.com/docs/database) (typing & presence) |
| Testing | [Vitest](https://vitest.dev/) + [Testing Library](https://testing-library.com/) |
| Hosting | [Firebase Hosting](https://firebase.google.com/docs/hosting) |

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) 22 or later
- [npm](https://www.npmjs.com/) 10 or later
- A Firebase project with Firestore, Realtime Database, and Anonymous Auth enabled

### 1. Clone the repository

```bash
git clone https://github.com/itsyiqi/web-chat-room.git
cd web-chat-room
```

### 2. Install dependencies

```bash
npm install
```

### 3. Start the development server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`.

---

## Available Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start the local development server |
| `npm run build` | Type-check and build for production |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint |
| `npm test` | Run the full Vitest test suite |
| `npm run test:watch` | Run Vitest in watch mode |
| `npm run test:node` | Run the zero-dependency Node.js test runner (no extra packages needed) |

---

## Project Structure

```
src/
├── components/
│   ├── atoms/          # Reusable primitives (Avatar, Button, Spinner)
│   ├── chat/           # Chat-specific components (MessageList, MessageBubble, etc.)
│   └── layout/         # Page-level layout components (RoomHeader)
├── hooks/
│   ├── useMessages.ts  # Firestore message subscription + sendMessage
│   ├── useTyping.ts    # RTDB typing indicator (notify + subscribe)
│   └── usePresence.ts  # RTDB online presence (write + subscribe)
├── lib/
│   ├── firebase.ts     # Firebase app initialisation
│   └── roomUtils.ts    # generateRoomCode, roomExists helpers
├── pages/
│   ├── LobbyPage.tsx   # Create / join room entry point
│   └── ChatRoomPage.tsx
├── store/
│   └── useUserStore.ts # Zustand store (uid, displayName, roomCode)
├── styles/
│   └── _variables.scss # Global design tokens (colours, spacing, typography)
└── test/
    ├── setup.ts        # jest-dom matchers
    └── node-runner.ts  # Zero-dependency Node.js test runner
```

---

## Testing

The project has two test runners:

**Vitest** (full suite — run after `npm install`):

```bash
npm test
```

Covers hooks, store, utility functions, React components, and page-level integration tests using `@testing-library/react`.

**Node built-in runner** (zero extra dependencies):

```bash
npm run test:node
```

Covers `generateRoomCode` and `useUserStore` using only Node.js 22's built-in `node:test` module with `--experimental-strip-types`. Useful for a quick sanity check without installing packages.

---

## Deployment

The app is deployed to Firebase Hosting. To deploy your own build:

```bash
npm run build
npx firebase deploy --only hosting
```

---

## License

MIT
