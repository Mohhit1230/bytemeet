# REST to GraphQL Migration Guide

> A developer's guide to migrating ByteMeet components from REST to GraphQL.

---

## Quick Reference

| REST Endpoint | GraphQL Equivalent |
|---------------|-------------------|
| `GET /api/auth/me` | `query { me { ... } }` |
| `POST /api/auth/login` | `mutation { login(input) { ... } }` |
| `POST /api/auth/register` | `mutation { register(input) { ... } }` |
| `POST /api/auth/logout` | `mutation { logout { ... } }` |
| `GET /api/subjects` | `query { mySubjects { ... } }` |
| `GET /api/subjects/:id` | `query { subject(id) { ... } }` |
| `POST /api/subjects` | `mutation { createSubject(input) { ... } }` |
| `POST /api/subjects/join` | `mutation { joinSubject(inviteCode) { ... } }` |
| `GET /api/notifications` | `query { notifications(filter) { ... } }` |
| `GET /api/artifacts/:subjectId` | `query { artifacts(subjectId) { ... } }` |

---

## Migration Steps

### Step 1: Replace API Hooks

**Before (REST with TanStack Query):**
```typescript
import { useQuery } from '@tanstack/react-query';
import { authApi } from '@/lib/api';

function useMe() {
  return useQuery({
    queryKey: ['me'],
    queryFn: () => authApi.me(),
  });
}
```

**After (GraphQL):**
```typescript
import { useMe } from '@/lib/graphql';

// Just use the hook directly
const { user, loading, isAuthenticated } = useMe();
```

### Step 2: Replace Direct API Calls

**Before (REST):**
```typescript
import { authApi } from '@/lib/api';

async function handleLogin(email: string, password: string) {
  const response = await authApi.login({ email, password });
  if (response.success) {
    // handle success
  }
}
```

**After (GraphQL):**
```typescript
import { useLogin } from '@/lib/graphql';

function LoginComponent() {
  const { login, loading, error } = useLogin();
  
  async function handleLogin(email: string, password: string) {
    await login(email, password);
    // Navigation handled by hook if successful
  }
}
```

### Step 3: Update Data Access Patterns

**Before (REST - multiple requests):**
```typescript
// 3 separate API calls
const user = await authApi.me();
const subjects = await subjectsApi.getMySubjects();
const notifications = await notificationsApi.getAll();
```

**After (GraphQL - single request):**
```typescript
import { gql, useQuery } from '@apollo/client';

const DASHBOARD_QUERY = gql`
  query Dashboard {
    me { id username avatarUrl }
    mySubjects {
      owned { id name }
      joined { id name }
    }
    notifications(filter: { limit: 5 }) {
      nodes { id title isRead }
      unreadCount
    }
  }
`;

const { data, loading } = useQuery(DASHBOARD_QUERY);
```

---

## Common Patterns

### Authentication State

```typescript
// Use the AuthProvider (already migrated)
import { useAuth } from '@/providers/AuthProvider';

function Component() {
  const { user, loading, login, logout } = useAuth();
  
  if (loading) return <Loading />;
  if (!user) return <LoginPrompt />;
  
  return <Dashboard user={user} />;
}
```

### Fetching with Variables

```typescript
import { useQuery } from '@apollo/client';
import { GET_SUBJECT } from '@/lib/graphql/operations';

function SubjectPage({ id }: { id: string }) {
  const { data, loading, error } = useQuery(GET_SUBJECT, {
    variables: { id },
    skip: !id, // Don't fetch if no ID
  });
  
  if (loading) return <Loading />;
  if (error) return <Error message={error.message} />;
  
  return <SubjectView subject={data.subject} />;
}
```

### Mutations with Optimistic Updates

```typescript
import { useMutation } from '@apollo/client';
import { MARK_NOTIFICATIONS_READ, GET_NOTIFICATIONS } from '@/lib/graphql/operations';

function useMarkRead() {
  const [markRead] = useMutation(MARK_NOTIFICATIONS_READ, {
    // Optimistic update - instant UI feedback
    optimisticResponse: {
      markNotificationsRead: { success: true },
    },
    // Refetch to sync with server
    refetchQueries: [{ query: GET_NOTIFICATIONS }],
  });
  
  return markRead;
}
```

### Error Handling

```typescript
import { useQuery } from '@apollo/client';

function Component() {
  const { data, loading, error } = useQuery(SOME_QUERY);
  
  if (error) {
    // Check for specific error codes
    const isAuthError = error.graphQLErrors?.some(
      e => e.extensions?.code === 'UNAUTHENTICATED'
    );
    
    if (isAuthError) {
      return <LoginRedirect />;
    }
    
    return <ErrorDisplay message={error.message} />;
  }
}
```

---

## Provider Migration

Both `AuthProvider` and `NotificationProvider` have been migrated to GraphQL. They maintain the same API:

```typescript
// These hooks work the same as before
import { useAuth } from '@/providers/AuthProvider';
import { useNotificationContext } from '@/providers/NotificationProvider';

// No changes needed in components using these hooks!
const { user, login, logout } = useAuth();
const { notifications, unreadCount, markAsRead } = useNotificationContext();
```

---

## Cache Behavior

Apollo Client caches responses. Key differences from REST:

| Behavior | REST (TanStack Query) | GraphQL (Apollo) |
|----------|----------------------|------------------|
| Cache key | Query key array | Type + ID |
| Invalidation | Manual refetch | Automatic on mutation |
| Deduplication | Per-query | Per-field |

### Manual Cache Update

```typescript
import { useApolloClient } from '@apollo/client';

function Component() {
  const client = useApolloClient();
  
  // Clear all cache
  await client.clearStore();
  
  // Refetch specific query
  await client.refetchQueries({
    include: ['GetMySubjects'],
  });
}
```

---

## Checklist

- [ ] Import hooks from `@/lib/graphql` instead of API modules
- [ ] Replace `useQuery` from TanStack with Apollo's `useQuery`
- [ ] Update error handling for GraphQL error format
- [ ] Remove manual refetch logic (Apollo handles cache)
- [ ] Test authentication flows
- [ ] Verify cache invalidation on mutations
