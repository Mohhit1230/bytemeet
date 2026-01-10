# ByteMeet GraphQL Endpoint Flow Documentation

> Complete reference of all 32 endpoints with REST ↔ GraphQL mapping and examples.

---

## Table of Contents

1. [Authentication Endpoints (8)](#authentication-endpoints)
2. [Subject Endpoints (10)](#subject-endpoints)
3. [Artifact Endpoints (7)](#artifact-endpoints)
4. [Notification Endpoints (5)](#notification-endpoints)
5. [Video Endpoints (2)](#video-endpoints)

---

## Authentication Endpoints

### 1. User Registration

**REST (Deprecated):**
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "username": "johndoe",
  "password": "SecurePass123!"
}
```

**GraphQL:**
```graphql
mutation Register {
  register(input: {
    email: "user@example.com"
    username: "johndoe"
    password: "SecurePass123!"
  }) {
    success
    message
    token
    user {
      id
      username
      email
    }
  }
}
```

---

### 2. User Login

**REST (Deprecated):**
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**GraphQL:**
```graphql
mutation Login {
  login(input: {
    email: "user@example.com"
    password: "SecurePass123!"
  }) {
    success
    message
    user { id username email avatarUrl }
  }
}
```

---

### 3. User Logout

**REST (Deprecated):**
```http
POST /api/auth/logout
```

**GraphQL:**
```graphql
mutation Logout {
  logout {
    success
    message
  }
}
```

---

### 4. Get Current User

**REST (Deprecated):**
```http
GET /api/auth/me
Authorization: Bearer <token>
```

**GraphQL:**
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
    createdAt
    preferences {
      theme
      notifications { email push sound }
    }
  }
}
```

---

### 5. Refresh Token

**REST (Deprecated):**
```http
POST /api/auth/refresh
Cookie: refreshToken=<token>
```

**GraphQL:**
```graphql
mutation RefreshToken {
  refreshToken(refreshToken: "<token>") {
    success
    token
  }
}
```

---

### 6. Check Username Availability

**REST (Deprecated):**
```http
GET /api/auth/check-username?username=johndoe
```

**GraphQL:**
```graphql
query CheckUsername {
  checkUsername(username: "johndoe") {
    available
    value
  }
}
```

**Response:**
```json
{
  "data": {
    "checkUsername": {
      "available": true,
      "value": "johndoe"
    }
  }
}
```

---

### 7. Check Email Availability

**REST (Deprecated):**
```http
GET /api/auth/check-email?email=user@example.com
```

**GraphQL:**
```graphql
query CheckEmail {
  checkEmail(email: "user@example.com") {
    available
    value
  }
}
```

---

### 8. Update Profile

**REST (Deprecated):**
```http
PUT /api/auth/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "username": "newusername",
  "bio": "Software Developer"
}
```

**GraphQL:**
```graphql
mutation UpdateProfile {
  updateProfile(input: {
    username: "newusername"
    bio: "Software Developer"
  }) {
    id
    username
    bio
  }
}
```

---

## Subject Endpoints

### 9. Get My Subjects

**REST (Deprecated):**
```http
GET /api/subjects
Authorization: Bearer <token>
```

**GraphQL:**
```graphql
query GetMySubjects {
  mySubjects {
    owned {
      id
      name
      description
      inviteCode
      memberCount
    }
    joined {
      id
      name
      owner { username }
    }
    pending {
      id
      name
    }
  }
}
```

---

### 10. Get Single Subject

**REST (Deprecated):**
```http
GET /api/subjects/:id
```

**GraphQL:**
```graphql
query GetSubject($id: ID!) {
  subject(id: $id) {
    id
    name
    description
    inviteCode
    myRole
    owner { id username avatarUrl }
    members {
      id
      user { id username avatarUrl }
      role
      status
    }
  }
}
```

---

### 11. Create Subject

**REST (Deprecated):**
```http
POST /api/subjects
Content-Type: application/json

{
  "name": "Math 101",
  "description": "Calculus study group"
}
```

**GraphQL:**
```graphql
mutation CreateSubject {
  createSubject(input: {
    name: "Math 101"
    description: "Calculus study group"
  }) {
    id
    name
    inviteCode
  }
}
```

---

### 12. Update Subject

**REST (Deprecated):**
```http
PUT /api/subjects/:id
Content-Type: application/json

{ "name": "Math 102", "description": "Updated description" }
```

**GraphQL:**
```graphql
mutation UpdateSubject($id: ID!) {
  updateSubject(id: $id, input: {
    name: "Math 102"
    description: "Updated description"
  }) {
    id
    name
    description
  }
}
```

---

### 13. Delete Subject

**REST (Deprecated):**
```http
DELETE /api/subjects/:id
```

**GraphQL:**
```graphql
mutation DeleteSubject($id: ID!) {
  deleteSubject(id: $id) {
    success
    message
  }
}
```

---

### 14. Join Subject

**REST (Deprecated):**
```http
POST /api/subjects/join
Content-Type: application/json

{ "invite_code": "ABC123" }
```

**GraphQL:**
```graphql
mutation JoinSubject {
  joinSubject(inviteCode: "ABC123") {
    id
    name
    myStatus
  }
}
```

---

### 15. Preview Subject by Invite Code

**REST (Deprecated):**
```http
GET /api/subjects/preview/:code
```

**GraphQL:**
```graphql
query PreviewSubject {
  subjectByInviteCode(code: "ABC123") {
    id
    name
    description
    memberCount
    ownerUsername
  }
}
```

---

### 16. Regenerate Invite Code

**REST (Deprecated):**
```http
POST /api/subjects/:id/regenerate-code
```

**GraphQL:**
```graphql
mutation RegenerateCode($subjectId: ID!) {
  regenerateInviteCode(subjectId: $subjectId) {
    id
    inviteCode
  }
}
```

---

### 17. Approve Join Request

**REST (Deprecated):**
```http
POST /api/subjects/:id/approve
Content-Type: application/json

{ "user_id": "userId123" }
```

**GraphQL:**
```graphql
mutation ApproveRequest($subjectId: ID!, $userId: ID!) {
  approveJoinRequest(subjectId: $subjectId, userId: $userId) {
    id
    user { username }
    status
  }
}
```

---

### 18. Reject Join Request

**REST (Deprecated):**
```http
POST /api/subjects/:id/reject
Content-Type: application/json

{ "user_id": "userId123" }
```

**GraphQL:**
```graphql
mutation RejectRequest($subjectId: ID!, $userId: ID!) {
  rejectJoinRequest(subjectId: $subjectId, userId: $userId) {
    success
    message
  }
}
```

---

## Artifact Endpoints

### 19. Get Artifacts for Subject

**REST (Deprecated):**
```http
GET /api/artifacts/subject/:subjectId?type=code
```

**GraphQL:**
```graphql
query GetArtifacts($subjectId: ID!) {
  artifacts(subjectId: $subjectId, filter: { type: CODE }) {
    id
    type
    title
    content
    fileUrl
    createdBy { username }
    viewCount
    createdAt
  }
}
```

---

### 20. Get Single Artifact

**REST (Deprecated):**
```http
GET /api/artifacts/:id
```

**GraphQL:**
```graphql
query GetArtifact($id: ID!) {
  artifact(id: $id) {
    id
    type
    title
    content
    fileUrl
    fileName
    fileSize
    displaySize
    language
    createdBy { id username }
    viewCount
    downloadCount
  }
}
```

---

### 21. Get Artifact Stats

**REST (Deprecated):**
```http
GET /api/artifacts/subject/:subjectId/stats
```

**GraphQL:**
```graphql
query GetArtifactStats($subjectId: ID!) {
  artifactStats(subjectId: $subjectId) {
    total
    totalSize
    code { count totalSize }
    image { count totalSize }
    pdf { count totalSize }
  }
}
```

---

### 22. Create Artifact

**REST (Deprecated):**
```http
POST /api/artifacts
Content-Type: application/json

{
  "subjectId": "subjectId123",
  "type": "code",
  "title": "Hello World",
  "content": "console.log('Hello');"
  "language": "javascript"
}
```

**GraphQL:**
```graphql
mutation CreateArtifact {
  createArtifact(input: {
    subjectId: "subjectId123"
    type: CODE
    title: "Hello World"
    content: "console.log('Hello');"
    language: JAVASCRIPT
  }) {
    id
    title
    type
  }
}
```

---

### 23. Upload Artifact (File)

**REST Only (Multipart file upload):**
```http
POST /api/artifacts/upload
Content-Type: multipart/form-data

file: <binary>
subjectId: "subjectId123"
title: "My PDF Document"
```

> Note: File uploads still use REST endpoint due to multipart/form-data handling.

---

### 24. Delete Artifact

**REST (Deprecated):**
```http
DELETE /api/artifacts/:id
```

**GraphQL:**
```graphql
mutation DeleteArtifact($id: ID!) {
  deleteArtifact(id: $id) {
    success
    message
  }
}
```

---

### 25. Track Artifact View

**REST (Deprecated):**
```http
POST /api/artifacts/:id/view
```

**GraphQL:**
```graphql
mutation TrackView($id: ID!) {
  trackArtifactView(id: $id) {
    id
    viewCount
  }
}
```

---

## Notification Endpoints

### 26. Get Notifications

**REST (Deprecated):**
```http
GET /api/notifications?limit=20&unread_only=true
```

**GraphQL:**
```graphql
query GetNotifications {
  notifications(filter: { limit: 20, unreadOnly: true }) {
    nodes {
      id
      type
      title
      message
      isRead
      createdAt
      fromUser { username avatarUrl }
      data { subjectId subjectName }
    }
    unreadCount
    hasMore
  }
}
```

---

### 27. Get Unread Count

**REST (Deprecated):**
```http
GET /api/notifications/unread-count
```

**GraphQL:**
```graphql
query GetUnreadCount {
  unreadNotificationCount
}
```

**Response:**
```json
{
  "data": {
    "unreadNotificationCount": 5
  }
}
```

---

### 28. Mark Notifications as Read

**REST (Deprecated):**
```http
PUT /api/notifications/read
Content-Type: application/json

{ "ids": ["notif1", "notif2"] }
```

**GraphQL:**
```graphql
mutation MarkRead {
  markNotificationsRead(ids: ["notif1", "notif2"]) {
    success
    message
  }
}
```

---

### 29. Mark All as Read

**REST (Deprecated):**
```http
PUT /api/notifications/read-all
```

**GraphQL:**
```graphql
mutation MarkAllRead {
  markAllNotificationsRead {
    success
    message
  }
}
```

---

### 30. Delete Notification

**REST (Deprecated):**
```http
DELETE /api/notifications/:id
```

**GraphQL:**
```graphql
mutation DeleteNotification($id: ID!) {
  deleteNotification(id: $id) {
    success
    message
  }
}
```

---

## Video Endpoints

### 31. Generate Video Token

**REST (Deprecated):**
```http
POST /api/video/token
Content-Type: application/json

{
  "room_name": "subjectId123",
  "username": "johndoe"
}
```

**GraphQL:**
```graphql
mutation GenerateVideoToken {
  generateVideoToken(roomName: "subjectId123") {
    success
    token
  }
}
```

---

### 32. Health Check

**REST:**
```http
GET /api/health
```

**GraphQL:**
```graphql
query {
  __typename  # Returns "Query" - confirms server is up
}
```

---

## Quick Reference Table

| # | Endpoint | REST Path | GraphQL Operation |
|---|----------|-----------|-------------------|
| 1 | Register | `POST /auth/register` | `mutation register` |
| 2 | Login | `POST /auth/login` | `mutation login` |
| 3 | Logout | `POST /auth/logout` | `mutation logout` |
| 4 | Get Me | `GET /auth/me` | `query me` |
| 5 | Refresh Token | `POST /auth/refresh` | `mutation refreshToken` |
| 6 | Check Username | `GET /auth/check-username` | `query checkUsername` |
| 7 | Check Email | `GET /auth/check-email` | `query checkEmail` |
| 8 | Update Profile | `PUT /auth/profile` | `mutation updateProfile` |
| 9 | Get Subjects | `GET /subjects` | `query mySubjects` |
| 10 | Get Subject | `GET /subjects/:id` | `query subject` |
| 11 | Create Subject | `POST /subjects` | `mutation createSubject` |
| 12 | Update Subject | `PUT /subjects/:id` | `mutation updateSubject` |
| 13 | Delete Subject | `DELETE /subjects/:id` | `mutation deleteSubject` |
| 14 | Join Subject | `POST /subjects/join` | `mutation joinSubject` |
| 15 | Preview Subject | `GET /subjects/preview/:code` | `query subjectByInviteCode` |
| 16 | Regenerate Code | `POST /subjects/:id/regenerate` | `mutation regenerateInviteCode` |
| 17 | Approve Request | `POST /subjects/:id/approve` | `mutation approveJoinRequest` |
| 18 | Reject Request | `POST /subjects/:id/reject` | `mutation rejectJoinRequest` |
| 19 | Get Artifacts | `GET /artifacts/subject/:id` | `query artifacts` |
| 20 | Get Artifact | `GET /artifacts/:id` | `query artifact` |
| 21 | Artifact Stats | `GET /artifacts/.../stats` | `query artifactStats` |
| 22 | Create Artifact | `POST /artifacts` | `mutation createArtifact` |
| 23 | Upload Artifact | `POST /artifacts/upload` | *REST only* |
| 24 | Delete Artifact | `DELETE /artifacts/:id` | `mutation deleteArtifact` |
| 25 | Track View | `POST /artifacts/:id/view` | `mutation trackArtifactView` |
| 26 | Get Notifications | `GET /notifications` | `query notifications` |
| 27 | Unread Count | `GET /notifications/unread-count` | `query unreadNotificationCount` |
| 28 | Mark Read | `PUT /notifications/read` | `mutation markNotificationsRead` |
| 29 | Mark All Read | `PUT /notifications/read-all` | `mutation markAllNotificationsRead` |
| 30 | Delete Notif | `DELETE /notifications/:id` | `mutation deleteNotification` |
| 31 | Video Token | `POST /video/token` | `mutation generateVideoToken` |
| 32 | Health Check | `GET /health` | `query { __typename }` |

---

## GraphQL Playground

Access the interactive GraphQL playground at:

```
http://localhost:5000/graphql
```

Features:
- Auto-complete for queries/mutations
- Schema documentation browser
- Variable editor
- Response viewer

---

*REST API Sunset Date: June 1, 2026*
