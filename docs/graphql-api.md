# ByteMeet GraphQL API Documentation

> **Version:** 1.0.0  
> **Endpoint:** `http://localhost:5000/graphql`  
> **Last Updated:** January 9, 2026

---

## Table of Contents

1. [Overview](#overview)
2. [Authentication](#authentication)
3. [Queries](#queries)
4. [Mutations](#mutations)
5. [Types](#types)
6. [Error Handling](#error-handling)
7. [Best Practices](#best-practices)

---

## Overview

ByteMeet uses GraphQL for its API, providing flexible data fetching with a single endpoint. The API runs alongside the legacy REST API at `/api/*` during the migration period.

### Key Benefits

- **Single request** for complex data needs
- **Type safety** with auto-generated TypeScript types
- **Real-time** updates via subscriptions (planned)
- **Efficient caching** with Apollo Client

### Quick Start

```graphql
# Get current user with subjects
query {
  me {
    id
    username
    email
  }
  mySubjects {
    owned {
      name
    }
    joined {
      name
    }
  }
}
```

---

## Authentication

Authentication uses HTTP-only cookies. Tokens are automatically included when using `credentials: 'include'`.

### Login

```graphql
mutation Login($email: String!, $password: String!) {
  login(input: { email: $email, password: $password }) {
    success
    message
    user {
      id
      username
      email
    }
  }
}
```

### Register

```graphql
mutation Register($email: String!, $username: String!, $password: String!) {
  register(input: { email: $email, username: $username, password: $password }) {
    success
    message
    user {
      id
      username
    }
  }
}
```

### Logout

```graphql
mutation {
  logout {
    success
    message
  }
}
```

---

## Queries

### User Queries

| Query                     | Description        | Auth Required |
| ------------------------- | ------------------ | ------------- |
| `me`                      | Get current user   | ✅            |
| `checkUsername(username)` | Check availability | ❌            |
| `checkEmail(email)`       | Check availability | ❌            |

**Example: Get Current User**

```graphql
query GetMe {
  me {
    id
    username
    email
    avatarUrl
    avatarColor
    initials
    bio
    isOnline
    preferences {
      theme
      notifications {
        email
        push
        sound
      }
    }
  }
}
```

### Subject Queries

| Query                       | Description            | Auth Required |
| --------------------------- | ---------------------- | ------------- |
| `mySubjects`                | Get user's subjects    | ✅            |
| `subject(id)`               | Get subject by ID      | ✅            |
| `subjectByInviteCode(code)` | Preview before joining | ❌            |

**Example: Get User Subjects**

```graphql
query GetMySubjects {
  mySubjects {
    owned {
      id
      name
      memberCount
      inviteCode
    }
    joined {
      id
      name
      owner {
        username
      }
    }
    pending {
      id
      name
    }
  }
}
```

### Notification Queries

| Query                     | Description                 | Auth Required |
| ------------------------- | --------------------------- | ------------- |
| `notifications(filter)`   | Get paginated notifications | ✅            |
| `unreadNotificationCount` | Get unread count            | ✅            |

**Example: Get Notifications**

```graphql
query GetNotifications($unreadOnly: Boolean, $limit: Int) {
  notifications(filter: { unreadOnly: $unreadOnly, limit: $limit }) {
    nodes {
      id
      type
      title
      message
      isRead
      createdAt
      fromUser {
        username
        avatarUrl
      }
    }
    unreadCount
    hasMore
  }
}
```

### Artifact Queries

| Query                          | Description           | Auth Required |
| ------------------------------ | --------------------- | ------------- |
| `artifacts(subjectId, filter)` | Get subject artifacts | ✅            |
| `artifact(id)`                 | Get single artifact   | ✅            |
| `artifactStats(subjectId)`     | Get type statistics   | ✅            |

---

## Mutations

### Authentication Mutations

```graphql
# Update profile
mutation UpdateProfile($input: UpdateProfileInput!) {
  updateProfile(input: $input) {
    id
    username
    bio
  }
}

# Refresh token
mutation RefreshToken($refreshToken: String!) {
  refreshToken(refreshToken: $refreshToken) {
    success
    token
  }
}
```

### Subject Mutations

```graphql
# Create subject
mutation CreateSubject($name: String!, $description: String) {
  createSubject(input: { name: $name, description: $description }) {
    id
    name
    inviteCode
  }
}

# Join subject
mutation JoinSubject($inviteCode: String!) {
  joinSubject(inviteCode: $inviteCode) {
    id
    name
    myStatus
  }
}

# Approve join request
mutation ApproveRequest($subjectId: ID!, $userId: ID!) {
  approveJoinRequest(subjectId: $subjectId, userId: $userId) {
    id
    user {
      username
    }
    status
  }
}
```

### Notification Mutations

```graphql
# Mark as read
mutation MarkRead($ids: [ID!]!) {
  markNotificationsRead(ids: $ids) {
    success
  }
}

# Mark all as read
mutation MarkAllRead {
  markAllNotificationsRead {
    success
  }
}
```

---

## Types

### Enums

```graphql
enum MemberRole {
  OWNER
  ADMIN
  MEMBER
}
enum MembershipStatus {
  PENDING
  APPROVED
  REJECTED
}
enum ArtifactType {
  CODE
  IMAGE
  PDF
  DIAGRAM
  MARKDOWN
  HTML
}
enum NotificationType {
  JOIN_REQUEST
  REQUEST_APPROVED
  REQUEST_REJECTED
  MESSAGE_MENTION
  ARTIFACT_SHARED
  MEMBER_JOINED
  SUBJECT_INVITE
  SYSTEM
}
```

### Core Types

| Type           | Key Fields                               |
| -------------- | ---------------------------------------- |
| `User`         | id, username, email, avatarUrl, isOnline |
| `Subject`      | id, name, inviteCode, owner, members     |
| `Artifact`     | id, type, title, content, createdBy      |
| `Notification` | id, type, title, message, isRead         |

---

## Error Handling

GraphQL errors are returned in the `errors` array:

```json
{
  "errors": [
    {
      "message": "Authentication required",
      "extensions": {
        "code": "UNAUTHENTICATED"
      }
    }
  ],
  "data": null
}
```

### Common Error Codes

| Code                | Description                    |
| ------------------- | ------------------------------ |
| `UNAUTHENTICATED`   | User not logged in             |
| `FORBIDDEN`         | Insufficient permissions       |
| `NOT_FOUND`         | Resource doesn't exist         |
| `QUERY_TOO_COMPLEX` | Query exceeds complexity limit |
| `QUERY_TOO_DEEP`    | Query exceeds depth limit      |

---

## Best Practices

### 1. Use Fragments

```graphql
fragment UserFields on User {
  id
  username
  avatarUrl
}

query {
  me {
    ...UserFields
  }
  subject(id: "123") {
    owner {
      ...UserFields
    }
    members {
      user {
        ...UserFields
      }
    }
  }
}
```

### 2. Use Variables

```graphql
# ❌ Bad - inline values
query {
  subject(id: "abc123") {
    name
  }
}

# ✅ Good - variables
query GetSubject($id: ID!) {
  subject(id: $id) {
    name
  }
}
```

### 3. Request Only Needed Fields

```graphql
# ❌ Bad - over-fetching
query { me { id username email bio avatarUrl preferences { ... } } }

# ✅ Good - minimal fields
query { me { id username } }
```

### 4. Use Pagination

```graphql
query GetNotifications($skip: Int, $limit: Int) {
  notifications(filter: { skip: $skip, limit: $limit }) {
    nodes {
      id
      title
    }
    hasMore
  }
}
```

---

## React Hooks Reference

Import from `@/lib/graphql`:

```typescript
import { useMe, useLogin, useLogout, useMySubjects, useNotifications } from '@/lib/graphql';

// Usage
const { user, loading } = useMe();
const { login } = useLogin();
const { owned, joined } = useMySubjects();
```

### Available Hooks

| Hook                 | Returns                              |
| -------------------- | ------------------------------------ |
| `useMe()`            | `{ user, loading, isAuthenticated }` |
| `useLogin()`         | `{ login, loading, error }`          |
| `useRegister()`      | `{ register, loading, error }`       |
| `useLogout()`        | `{ logout, loading }`                |
| `useMySubjects()`    | `{ owned, joined, pending }`         |
| `useSubject(id)`     | `{ subject, loading }`               |
| `useNotifications()` | `{ notifications, unreadCount }`     |

---

_For full schema reference, visit the GraphiQL interface at `/graphql`_
