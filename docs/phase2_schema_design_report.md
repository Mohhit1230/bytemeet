# Phase 2: GraphQL Schema Design Report

**Project:** ByteMeet  
**Date:** January 9, 2026  
**Status:** Complete

---

## Executive Summary

The GraphQL schema has been designed to replace all 32 REST API endpoints while providing enhanced flexibility and real-time capabilities. The schema introduces subscriptions for live updates and custom directives for authorization.

---

## Schema Overview

### File Location
```
backend/graphql/schema.graphql
```

### Statistics
| Category | Count |
|----------|-------|
| Custom Scalars | 3 |
| Enums | 10 |
| Input Types | 12 |
| Object Types | 20 |
| Queries | 15 |
| Mutations | 25 |
| Subscriptions | 6 |
| Directives | 4 |

---

## Type Mappings

### REST → GraphQL Query Mappings

| REST Endpoint | GraphQL Query |
|---------------|---------------|
| `GET /api/auth/me` | `me` |
| `GET /api/auth/check-username/:username` | `checkUsername(username)` |
| `GET /api/auth/check-email/:email` | `checkEmail(email)` |
| `GET /api/subjects` | `mySubjects` |
| `GET /api/subjects/:id` | `subject(id)` |
| `GET /api/subjects/:id/pending-requests` | `subject.pendingRequests` |
| `GET /api/notifications` | `notifications(filter)` |
| `GET /api/notifications/unread-count` | `unreadNotificationCount` |
| `GET /api/artifacts/subject/:id` | `artifacts(subjectId, filter)` |
| `GET /api/artifacts/subject/:id/stats` | `artifactStats(subjectId)` |
| `GET /api/artifacts/:id` | `artifact(id)` |

### REST → GraphQL Mutation Mappings

| REST Endpoint | GraphQL Mutation |
|---------------|------------------|
| `POST /api/auth/register` | `register(input)` |
| `POST /api/auth/login` | `login(input)` |
| `POST /api/auth/logout` | `logout` |
| `POST /api/auth/refresh` | `refreshToken(refreshToken)` |
| `PUT /api/auth/profile` | `updateProfile(input)` |
| `POST /api/subjects` | `createSubject(input)` |
| `PUT /api/subjects/:id` | `updateSubject(id, input)` |
| `DELETE /api/subjects/:id` | `deleteSubject(id)` |
| `POST /api/subjects/join` | `joinSubject(inviteCode)` |
| `POST /api/subjects/:id/regenerate-code` | `regenerateInviteCode(subjectId)` |
| `POST /api/subjects/:id/approve` | `approveJoinRequest(subjectId, userId)` |
| `POST /api/subjects/:id/reject` | `rejectJoinRequest(subjectId, userId)` |
| `DELETE /api/subjects/:id/members/:userId` | `removeMember(subjectId, userId)` |
| `POST /api/artifacts` | `createArtifact(input)` |
| `POST /api/artifacts/upload` | `uploadArtifact(...)` |
| `DELETE /api/artifacts/:id` | `deleteArtifact(id)` |
| `POST /api/artifacts/:id/view` | `trackArtifactView(id)` |
| `POST /api/artifacts/:id/download` | `trackArtifactDownload(id)` |
| `POST /api/notifications/mark-read` | `markNotificationsRead(ids)` |
| `POST /api/notifications/mark-all-read` | `markAllNotificationsRead` |
| `DELETE /api/notifications/:id` | `deleteNotification(id)` |
| `DELETE /api/notifications/clear-old` | `clearOldNotifications(days)` |
| `POST /api/video/token` | `generateVideoToken(roomName)` |

---

## Key Design Decisions

### 1. Nested Relationships
Instead of multiple REST calls, a single GraphQL query can fetch related data:

```graphql
query GetSubjectWithDetails {
  subject(id: "123") {
    name
    owner {
      username
      avatarUrl
    }
    members {
      user {
        username
      }
      role
    }
    artifacts(filter: { limit: 10 }) {
      title
      type
      createdBy {
        username
      }
    }
  }
}
```

### 2. Subscriptions for Real-Time
GraphQL subscriptions replace polling for:
- New notifications
- Member status changes
- Join request alerts
- New artifacts

### 3. Custom Directives for Authorization
```graphql
directive @auth on FIELD_DEFINITION
directive @hasRole(roles: [MemberRole!]!) on FIELD_DEFINITION
directive @owner on FIELD_DEFINITION
directive @rateLimit(max: Int!, window: String!) on FIELD_DEFINITION
```

### 4. Input Types for Complex Mutations
All mutations use typed inputs for validation:
```graphql
input CreateSubjectInput {
  name: String!
  description: String
}
```

### 5. Pagination Support
```graphql
type NotificationConnection {
  nodes: [Notification!]!
  totalCount: Int!
  unreadCount: Int!
  hasMore: Boolean!
}
```

---

## Enums Defined

| Enum | Values |
|------|--------|
| `Theme` | LIGHT, DARK, SYSTEM |
| `MemberRole` | OWNER, ADMIN, MEMBER |
| `MembershipStatus` | PENDING, APPROVED, REJECTED |
| `ArtifactType` | CODE, IMAGE, PDF, DIAGRAM, MARKDOWN, HTML |
| `ProgrammingLanguage` | 19 languages |
| `DiagramType` | MERMAID, PLANTUML, FLOWCHART, SEQUENCE, OTHER |
| `NotificationType` | 8 types |
| `OAuthProvider` | GOOGLE, GITHUB, DISCORD |

---

## GraphQL vs REST Benefits

| Feature | REST (Current) | GraphQL (New) |
|---------|---------------|---------------|
| Dashboard load | 3 API calls | 1 query |
| Subject detail | 3 API calls | 1 query |
| Field selection | All fields | Client chooses |
| Real-time | Polling | Subscriptions |
| Type safety | Manual | Automatic |
| Documentation | Separate | Self-documenting |

---

## Phase 2 Completion Checklist

- [x] Design core types (User, Subject, Artifact, Notification)
- [x] Design Query types (15 queries)
- [x] Design Mutation types (25 mutations)
- [x] Plan Subscription types (6 subscriptions)
- [x] Define custom directives
- [x] Create schema file (`backend/graphql/schema.graphql`)

---

## Next Steps (Phase 3)

1. Set up GraphQL server (Apollo Server)
2. Configure schema loading
3. Set up development playground
4. Implement code generation

---

*Report Generated: Phase 2 Complete*  
*Next Step: Phase 3 - Infrastructure Setup*
