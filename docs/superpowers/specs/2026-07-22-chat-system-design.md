# Chat System Design

**Date:** 2026-07-22  
**Status:** Approved  
**Replaces:** Contact Request system

## Overview

Replace the existing contact request system with a real-time per-post chat system using ASP.NET Core SignalR and PostgreSQL. Users can start chatting immediately from a post detail page with no gating step. Chat history is stored in PostgreSQL and auto-deleted after 60 days. Frontend UI built with the `frontend-design` skill.

---

## Data Model

### `Chat` entity

| Field | Type | Notes |
|---|---|---|
| `Id` | Guid | PK |
| `ItemPostId` | Guid | FK → ItemPost |
| `InitiatorUserId` | Guid | FK → AppUser (user who started chat) |
| `RecipientUserId` | Guid | FK → AppUser (post owner) |
| `CreatedAt` | DateTimeOffset | |

**Unique index:** `(ItemPostId, InitiatorUserId, RecipientUserId)` — prevents duplicate chats for same post between same two users.

### `ChatMessage` entity

| Field | Type | Notes |
|---|---|---|
| `Id` | Guid | PK |
| `ChatId` | Guid | FK → Chat |
| `SenderId` | Guid | FK → AppUser |
| `Content` | string | Max 2000 chars |
| `SentAt` | DateTimeOffset | |
| `IsRead` | bool | false by default |

### Cleanup

`ChatCleanupService : BackgroundService` runs nightly at midnight UTC:
1. Delete `ChatMessage` rows where `SentAt < UtcNow - 60 days`
2. Delete `Chat` rows with zero remaining messages

---

## Backend

### New layers

**Domain:**
- `Chat.cs` entity
- `ChatMessage.cs` entity

**Application:**
- `IChatService` interface
- DTOs: `ChatDto`, `ChatMessageDto`, `CreateChatDto`, `SendMessageDto`

**Infrastructure:**
- `ChatService` implementation
- EF Core config + migration for `Chats` and `ChatMessages` tables
- `ChatCleanupService : BackgroundService`

**API:**
- `ChatsController` — REST endpoints
- `ChatHub : Hub` — SignalR hub

### REST Endpoints (`/api/chats`)

| Method | Route | Auth | Description |
|---|---|---|---|
| `POST` | `/api/chats` | Required | Create or get existing chat for a post. Body: `{ itemPostId }`. Returns `ChatDto`. |
| `GET` | `/api/chats` | Required | List all chats for current user (initiator or recipient). Returns last message preview + unread count. |
| `GET` | `/api/chats/{id}/messages` | Required | Paginated message history (`?page=1&pageSize=50`), newest first. |

### SignalR Hub (`/hubs/chat`)

**Authentication:** JWT passed as `?access_token=` query string (standard SignalR pattern).

**Client → Server methods:**

| Method | Params | Description |
|---|---|---|
| `JoinChat` | `chatId` | Join SignalR group. Hub verifies caller is a participant. |
| `LeaveChat` | `chatId` | Leave SignalR group. |
| `SendMessage` | `chatId, content` | Save message to DB, broadcast to group. |
| `MarkRead` | `chatId` | Mark all unread messages in chat as read for caller. |

**Server → Client events:**

| Event | Payload | Description |
|---|---|---|
| `ReceiveMessage` | `ChatMessageDto` | Broadcast to group on new message. |
| `MessagesRead` | `chatId` | Notify other participant their messages were read. |

**Security:** Every hub method validates `currentUserId ∈ {chat.InitiatorUserId, chat.RecipientUserId}` before any operation.

### Packages to add

- `Microsoft.AspNetCore.SignalR` (included in ASP.NET Core 9, no extra package needed)

---

## Frontend

### New pages

| Route | Component | Description |
|---|---|---|
| `/:lang/chats` | `ChatsPage` | Inbox: list of conversations with post title, other user name, last message preview, unread badge |
| `/:lang/chats/:chatId` | `ChatPage` | Chat window: scrollable history, real-time messages, text input + send |

### Modified pages/components

| File | Change |
|---|---|
| `PostDetailsPage` | Replace "Contact Owner" button with "Chat" button. Calls `POST /api/chats`, navigates to `/:lang/chats/:chatId` |
| `Navbar` | Replace contact request links with "Chats" link + unread count badge (polled every 30s) |
| `DashboardPage` | Replace contact request stats widget with chat stats (total conversations, unread messages) |
| `AppRouter` | Add routes for `ChatsPage` and `ChatPage`, remove contact request routes |

### Removed

- `SentContactRequestsPage.tsx`
- `ReceivedContactRequestsPage.tsx`
- All contact request API calls, types, and nav references

### SignalR client

Package: `@microsoft/signalr`

- Connection built once on `ChatPage` mount with JWT from auth context
- Joined to chat group via `JoinChat(chatId)` on mount
- `ReceiveMessage` handler appends message to local state
- `MessagesRead` handler updates read state
- Connection stopped and `LeaveChat` called on unmount

### UI (built with `frontend-design` skill)

- **ChatsPage:** card-based inbox list, unread count badge, last message timestamp
- **ChatPage:** bubble-style message layout (own messages right, other left), auto-scroll to bottom on new message, character counter on input (2000 max), send on Enter or button click

---

## Migration strategy

1. Add new DB tables (EF migration)
2. Implement backend (entities → service → hub → controller)
3. Remove `ContactRequests` table and all related backend code
4. Implement frontend chat pages with `frontend-design` skill
5. Remove old contact request frontend pages and references

---

## Out of scope

- Push notifications (mobile)
- Message editing or deletion by users
- File/image attachments in chat
- Group chats (always exactly two participants per chat)
- Read receipts shown as ticks (tracked in DB but UI shows simple unread count only)
