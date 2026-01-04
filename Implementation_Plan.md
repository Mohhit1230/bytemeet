# Implementation Plan

This document contains detailed implementation plans for two project transformations. Each plan is divided into **independent sections** that can be implemented one at a time.

---

# 🎯 PROJECT 1: AI-Powered Interview Prep Platform ("MockMate")

Transform the current chat app into a platform where users can practice technical interviews with an AI interviewer.

## Overview
| Aspect | Details |
|--------|---------|
| **Target Users** | Job seekers, CS students, developers |
| **Core Value** | Realistic interview practice anytime |
| **Tech Stack** | Next.js, TypeScript, TailwindCSS, GSAP |

---

## Section 1.1: Database Schema & Models
**Prompt:** "Implement Section 1.1 - Database Schema for Interview Platform"

**Tasks:**
- [ ] Create `Interview` model (replaces/extends Project)
  - Fields: `type` (DSA/System Design/Behavioral), `difficulty`, `status`, `score`, `feedback`
- [ ] Create `Question` model
  - Fields: `title`, `description`, `category`, `difficulty`, `testCases`, `hints`, `solution`
- [ ] Create `Submission` model
  - Fields: `interviewId`, `questionId`, `code`, `language`, `result`, `timeTaken`
- [ ] Create `FeedbackReport` model
  - Fields: `interviewId`, `technicalScore`, `communicationScore`, `suggestions[]`
- [ ] Seed database with 50+ interview questions (DSA, System Design)

**Files to modify/create:**
- `backend/models/interview.model.js`
- `backend/models/question.model.js`
- `backend/models/submission.model.js`
- `backend/models/feedback.model.js`
- `backend/seeds/questions.seed.js`

---

## Section 1.2: Interview Room UI
**Prompt:** "Implement Section 1.2 - Interview Room UI"

**Tasks:**
- [ ] Redesign Home page to show "Start Interview" options
  - Interview type selector (DSA, System Design, Behavioral)
  - Difficulty selector (Easy, Medium, Hard)
  - Duration selector (30min, 45min, 60min)
- [ ] Create Interview Room layout
  - Left panel: AI chat (interviewer)
  - Center panel: Code editor with syntax highlighting
  - Right panel: Question description, test cases, hints
  - Top bar: Timer, submit button, end interview button
- [ ] Add interview status indicators (In Progress, Completed, Reviewing)

**Files to modify/create:**
- `frontend/src/screens/Home.jsx` (add interview start flow)
- `frontend/src/screens/InterviewRoom.jsx` (new)
- `frontend/src/components/InterviewTimer.jsx` (new)
- `frontend/src/components/QuestionPanel.jsx` (new)

---

## Section 1.3: AI Interviewer Logic
**Prompt:** "Implement Section 1.3 - AI Interviewer Logic"

**Tasks:**
- [ ] Create interview-specific system prompt for AI
  - Persona: Professional but friendly interviewer
  - Behavior: Ask clarifying questions, give hints when stuck, evaluate approach
- [ ] Implement question selection algorithm
  - Progressive difficulty based on performance
  - Category-based filtering
- [ ] Add AI response types
  - `QUESTION`: Ask the interview question
  - `CLARIFICATION`: Ask follow-up questions
  - `HINT`: Provide subtle hints
  - `FEEDBACK`: Give immediate feedback on approach
  - `WRAP_UP`: End interview with summary
- [ ] Implement conversation state machine
  - States: INTRO → QUESTION → CODING → REVIEW → FEEDBACK

**Files to modify/create:**
- `backend/services/ai.service.js` (add interview prompts)
- `backend/services/interview.service.js` (new)
- `backend/controllers/interview.controller.js` (new)

---

## Section 1.4: Code Evaluation Engine
**Prompt:** "Implement Section 1.4 - Code Evaluation Engine"

**Tasks:**
- [ ] Integrate code execution (use existing WebContainer or add Judge0 API)
- [ ] Implement test case runner
  - Run user code against hidden test cases
  - Capture output, errors, runtime
- [ ] Add time complexity analyzer
  - Parse code to estimate Big O notation
  - Compare with optimal solution
- [ ] Implement evaluation scoring
  - Correctness (passes test cases)
  - Efficiency (time/space complexity)
  - Code quality (readability, best practices)
- [ ] Store submission results

**Files to modify/create:**
- `backend/services/codeRunner.service.js` (new)
- `backend/services/complexityAnalyzer.service.js` (new)
- `backend/routes/submission.routes.js` (new)

---

## Section 1.5: Feedback Report Generation
**Prompt:** "Implement Section 1.5 - Feedback Report Generation"

**Tasks:**
- [ ] Create post-interview analysis
  - Compile all submissions and scores
  - Analyze conversation for communication patterns
- [ ] Generate AI-powered feedback report
  - Technical strengths and weaknesses
  - Specific improvement suggestions
  - Recommended practice topics
- [ ] Create beautiful report UI
  - Score breakdown with charts
  - Question-by-question analysis
  - Downloadable PDF option
- [ ] Add progress tracking dashboard
  - Historical interview scores
  - Skill progression over time

**Files to modify/create:**
- `backend/services/feedback.service.js` (new)
- `frontend/src/screens/FeedbackReport.jsx` (new)
- `frontend/src/screens/Dashboard.jsx` (new)
- `frontend/src/components/ScoreChart.jsx` (new)

---

## Section 1.6: Voice Integration (Advanced)
**Prompt:** "Implement Section 1.6 - Voice Integration"

**Tasks:**
- [ ] Add Speech-to-Text for user responses
  - Use Web Speech API or Deepgram
  - Real-time transcription in chat
- [ ] Add Text-to-Speech for AI interviewer
  - Use Web Speech API or ElevenLabs
  - Natural voice output for questions
- [ ] Implement voice mode toggle
  - Text-only mode (default)
  - Voice mode (premium feature)
- [ ] Add voice activity detection
  - Visual indicator when speaking
  - Auto-pause timer during explanations

**Files to modify/create:**
- `frontend/src/hooks/useSpeechRecognition.js` (new)
- `frontend/src/hooks/useTextToSpeech.js` (new)
- `frontend/src/components/VoiceControls.jsx` (new)

---

## Section 1.7: Premium Features & Monetization
**Prompt:** "Implement Section 1.7 - Premium Features"

**Tasks:**
- [ ] Implement user subscription tiers
  - Free: 3 interviews/month, basic feedback
  - Pro: Unlimited interviews, detailed reports, voice mode
  - Enterprise: Team management, custom questions
- [ ] Add Stripe/Razorpay payment integration
- [ ] Create subscription management UI
- [ ] Implement usage tracking and limits
- [ ] Add referral system

**Files to modify/create:**
- `backend/models/subscription.model.js` (new)
- `backend/services/payment.service.js` (new)
- `frontend/src/screens/Pricing.jsx` (new)
- `frontend/src/screens/Subscription.jsx` (new)

---
---

# 📚 PROJECT 2: Collaborative Learning Platform ("ByteMeet")

Transform the current chat app into a platform where students can create study rooms, invite friends, and learn together with AI tutoring.

## Overview
| Aspect | Details |
|--------|---------|
| **Target Users** | College students, study groups, friends |
| **Core Value** | Group study with AI tutoring + collaborative learning |
| **Frontend** | **Next.js 14+ (App Router), TypeScript, TailwindCSS, GSAP** |
| **Real-time Chat** | Supabase Realtime |
| **File Storage** | Cloudinary |
| **Caching** | Redis (1-2 day message cache) |
| **Video Calls** | WebRTC / LiveKit / Daily.co (Google Meet-style grid) |
| **Backend** | Node.js + Express + MongoDB |
| **AI** | OpenAI API (GPT-4) |

## Architecture Overview
```
┌─────────────────────────────────────────────────────────────────────────┐
│                          BYTEMEET APP                                    │
│                    (Next.js + TypeScript + TailwindCSS + GSAP)           │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌──────────────┐    ┌──────────────────────┐    ┌──────────────┐       │
│  │  SUBJECT     │    │   VIDEO CALL GRID    │    │  AI CHAT     │       │
│  │  (Room)      │    │   (Google Meet UI)   │    │  + CANVAS    │       │
│  │              │    │                      │    │              │       │
│  │  - Unique ID │    │  ┌────┐ ┌────┐       │    │  - Questions │       │
│  │  - Members   │    │  │ 👤 │ │ 👤 │       │    │  - Text resp │       │
│  │  - Approval  │    │  └────┘ └────┘       │    │  - Artifacts │       │
│  └──────────────┘    │  ┌────┐ ┌────┐       │    └──────────────┘       │
│                      │  │ 👤 │ │ 👤 │       │                           │
│  ┌──────────────┐    │  └────┘ └────┘       │    ┌──────────────────┐   │
│  │  FRIENDS     │    │                      │    │     CANVAS       │   │
│  │  CHAT        │    │  [Mic] [Cam] [Share] │    │   (Artifacts)    │   │
│  │  - Text      │    │  [End Call]          │    │  [PDF] [Code]    │   │
│  │  - Voice     │    └──────────────────────┘    │  [Image] [...]   │   │
│  │  - Video     │                                └──────────────────┘   │
│  └──────────────┘                                                       │
│                                                                          │
├─────────────────────────────────────────────────────────────────────────┤
│  BACKEND SERVICES                                                        │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────────┐         │
│  │  Supabase  │  │ Cloudflare │  │   Redis    │  │  OpenAI    │         │
│  │  Realtime  │  │     R2     │  │  Caching   │  │  GPT-4     │         │
│  │  (Chat DB) │  │  (Storage) │  │ (1-2 days) │  │  (Tutor)   │         │
│  └────────────┘  └────────────┘  └────────────┘  └────────────┘         │
│                                                                          │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐                         │
│  │  LiveKit/  │  │  MongoDB   │  │  Express   │                         │
│  │  Daily.co  │  │  (Users,   │  │   API      │                         │
│  │ (WebRTC)   │  │  Artifacts)│  │  Server    │                         │
│  └────────────┘  └────────────┘  └────────────┘                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Section 2.0: Next.js Project Setup
**Prompt:** "Implement Section 2.0 - Next.js Project Setup for ByteMeet"

**Tasks:**
- [x] Create new Next.js 14+ project with TypeScript
  ```bash
  npx create-next-app@latest bytemeet --typescript --tailwind --eslint --app --src-dir
  ```
- [x] Configure project structure
  ```
  bytemeet/
  ├── src/
  │   ├── app/                    # Next.js App Router
  │   │   ├── (auth)/             # Auth group routes
  │   │   │   ├── login/page.tsx
  │   │   │   └── register/page.tsx
  │   │   ├── (dashboard)/        # Protected routes
  │   │   │   ├── home/page.tsx
  │   │   │   ├── subject/[id]/page.tsx
  │   │   │   └── join/[code]/page.tsx
  │   │   ├── api/                # API routes
  │   │   ├── layout.tsx
  │   │   └── page.tsx
  │   ├── components/             # React components
  │   │   ├── ui/                 # Reusable UI components
  │   │   ├── chat/               # Chat components
  │   │   ├── video/              # Video call components
  │   │   └── canvas/             # Canvas/artifacts
  │   ├── hooks/                  # Custom hooks
  │   ├── lib/                    # Utilities, configs
  │   ├── types/                  # TypeScript types
  │   └── styles/                 # Global styles
  ├── public/
  └── ...config files
  ```
- [x] Install dependencies
  ```bash
  npm install gsap @supabase/supabase-js axios socket.io-client
  npm install @livekit/components-react livekit-client  # Video calls
  npm install framer-motion lucide-react               # UI
  npm install -D @types/node
  ```
- [x] Configure TailwindCSS with custom theme
  - Dark mode by default
  - **Color Palette:**
    - Accent: `#e94d37` (Base), `#f06b58` (Light), `#d44330` (Dark)
    - Neutrals/Surfaces: 
      - `#262624` (bg-soft)
      - `#30302e` (bg-subtle)
      - `#212121` (bg-dark)
      - `#181818` (bg-deeper)
      - `#131314` (background-main)
      - `#1e1f20` (surface-panel)
  - Animation utilities
- [x] Set up GSAP
  - Create GSAP context provider
  - Set up ScrollTrigger plugin
- [ ] Configure environment variables
- [x] Set up ESLint + Prettier

**Files to create:**
- `bytemeet/` (entire new project)
- `src/lib/gsap.ts` (GSAP config)
- `src/providers/GSAPProvider.tsx`
- `tailwind.config.ts` (custom theme)

---

## Section 2.1: Tech Stack Setup & Configuration
**Prompt:** "Implement Section 2.1 - Tech Stack Setup for ByteMeet"

**Tasks:**
- [x] Set up Supabase project
  - Create Supabase account and project
  - Configure real-time subscriptions
  - Set up Row Level Security (RLS) policies
- [x] Set up Cloudinary
  - Create Cloudinary account
  - Configure upload presets
  - Set up signed uploads for security
- [x] Configure Redis caching
  - Use existing Redis instance or set up new
  - Configure TTL for 1-2 day message caching
- [x] Set up LiveKit/Daily.co for video calls
  - Create account and get API keys
  - Configure room creation API
- [x] Create environment variables
  ```env
  # Supabase
  NEXT_PUBLIC_SUPABASE_URL=
  NEXT_PUBLIC_SUPABASE_ANON_KEY=
  SUPABASE_SERVICE_KEY=
  
  # Cloudinary (Storage)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
  
  # LiveKit (Video)
  LIVEKIT_API_KEY=
  LIVEKIT_API_SECRET=
  NEXT_PUBLIC_LIVEKIT_URL=
  
  # Backend
  NEXT_PUBLIC_API_URL=
  MONGODB_URI=
  JWT_SECRET=
  REDIS_URL=
  
  # OpenAI
  OPENAI_API_KEY=
  ```

**Files to create:**
- `src/lib/supabase.ts` (Supabase client)
- `src/lib/r2.ts` (R2 client)
- `src/lib/livekit.ts` (LiveKit client)
- `src/lib/redis.ts` (Redis client)
- `src/lib/openai.ts` (OpenAI client)
- `.env.local` (environment variables)

---

## Section 2.2: Database Schema (Supabase + MongoDB)
**Prompt:** "Implement Section 2.2 - Database Schema for ByteMeet"

**Tasks:**
- [x] **Supabase Tables (Real-time chat)**
  ```sql
  -- Subjects (Study Rooms)
  CREATE TABLE subjects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    created_by UUID REFERENCES auth.users(id),
    invite_code TEXT UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
  );
  
  -- Subject Members
  CREATE TABLE subject_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL,  -- MongoDB user ID
    username TEXT NOT NULL,
    role TEXT DEFAULT 'member',  -- 'owner' | 'member'
    status TEXT DEFAULT 'pending',  -- 'pending' | 'approved' | 'rejected'
    joined_at TIMESTAMPTZ DEFAULT NOW()
  );
  
  -- Friend Messages
  CREATE TABLE friend_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL,
    username TEXT NOT NULL,
    content TEXT NOT NULL,
    message_type TEXT DEFAULT 'text',  -- 'text' | 'file' | 'system'
    created_at TIMESTAMPTZ DEFAULT NOW()
  );
  
  -- AI Messages
  CREATE TABLE ai_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE,
    user_id TEXT,  -- NULL for AI responses
    username TEXT,
    content TEXT NOT NULL,
    role TEXT NOT NULL,  -- 'user' | 'assistant'
    has_artifact BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
  );
  ```

- [x] **MongoDB Collections**
  - Update `User` model with username
  - Create `Artifact` model for canvas items

- [x] **TypeScript Types**
  ```typescript
  // src/types/database.ts
  interface Subject {
    id: string;
    name: string;
    description?: string;
    created_by: string;
    invite_code: string;
    created_at: string;
  }
  
  interface SubjectMember {
    id: string;
    subject_id: string;
    user_id: string;
    username: string;
    role: 'owner' | 'member';
    status: 'pending' | 'approved' | 'rejected';
    joined_at: string;
  }
  
  interface Message {
    id: string;
    subject_id: string;
    user_id: string;
    username: string;
    content: string;
    message_type?: string;
    role?: 'user' | 'assistant';
    has_artifact?: boolean;
    created_at: string;
  }
  
  interface Artifact {
    id: string;
    subject_id: string;
    message_id: string;
    type: 'code' | 'image' | 'pdf' | 'diagram';
    file_url: string;
    file_name: string;
    created_by: string;
    created_at: string;
  }
  ```

**Files to create:**
- `src/types/database.ts`
- `src/types/index.ts`
- `backend/models/artifact.model.js`
- `supabase/schema.sql`

---

## Section 2.3: User Authentication & Username System
**Prompt:** "Implement Section 2.3 - Auth System for ByteMeet"

**Tasks:**
- [x] Create auth pages with GSAP animations
  - Login page with smooth form animations
  - Register page with username input
  - Username availability check (real-time)
- [x] Update backend user model
  - Add `username` field (unique, required)
  - Include username in JWT payload
- [x] Create auth context/provider
  ```typescript
  interface User {
    _id: string;
    email: string;
    username: string;
  }
  
  interface AuthContext {
    user: User | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (email: string, username: string, password: string) => Promise<void>;
    logout: () => void;
  }
  ```
- [x] Create UserAvatar component
  - First letter of username
  - Color based on username hash
  - Online status indicator
- [x] Add auth middleware for API routes

**Files to create:**
- `src/app/(auth)/login/page.tsx`
- `src/app/(auth)/register/page.tsx`
- `src/components/auth/LoginForm.tsx`
- `src/components/auth/RegisterForm.tsx`
- `src/components/ui/UserAvatar.tsx`
- `src/providers/AuthProvider.tsx`
- `src/hooks/useAuth.ts`
- `src/lib/api.ts` (axios instance)

---

## Section 2.4: Subject (Room) Creation & Management
**Prompt:** "Implement Section 2.4 - Subject Room System for ByteMeet"

**Tasks:**
- [x] Create Subject/Room with GSAP animations
  - Modal with slide-in animation
  - Name, description input
  - Auto-generate unique invite code (6 chars)
  - Creator becomes owner
- [x] Home page with subject listing
  - Grid of subject cards with hover effects
  - Owned subjects vs joined subjects tabs
  - Pending invitations section
  - Create new subject button (floating action)
- [x] Subject settings (for owner)
  - Edit name/description
  - Regenerate invite code
  - Delete subject with confirmation
- [x] GSAP animations
  - Stagger animation for subject cards
  - Modal open/close animations
  - Button hover effects

**Files to create:**
- `src/app/(dashboard)/home/page.tsx`
- `src/components/subject/SubjectCard.tsx`
- `src/components/subject/CreateSubjectModal.tsx`
- `src/components/subject/SubjectSettings.tsx`
- `src/hooks/useSubjects.ts`

---

## Section 2.5: Invite & Access Control System
**Prompt:** "Implement Section 2.5 - Invite System for ByteMeet"

**Tasks:**
- [x] Share invite code
  - Copy button with animation
  - Generate shareable link: `/join/{inviteCode}`
- [x] Join request flow
  - Join page with code input
  - Or direct link access
  - Request sent to owner
  - Show "Waiting for approval" screen
- [x] Approval system (Google Meet style)
  - Owner sees join requests in subject header
  - Approve/Reject with slide animation
  - Real-time notification when approved
- [x] Access control
  - Middleware to check membership
  - Redirect non-members to join page
  - Owner can remove members

**Files to create:**
- `src/app/(dashboard)/join/[code]/page.tsx`
- `src/components/subject/InviteModal.tsx`
- `src/components/subject/MemberRequests.tsx`
- `src/components/subject/MemberList.tsx`
- `src/components/subject/PendingApproval.tsx`
- `src/hooks/useMembership.ts`

---

## Section 2.6: Subject Room UI Layout
**Prompt:** "Implement Section 2.6 - Subject Room UI for ByteMeet"

**Tasks:**
- [ ] Create main room layout with panels
  ```
  ┌────────────────────────────────────────────────────────────┐
  │  HEADER: Subject Name | Members | Video Call | Settings   │
  ├──────────────────┬─────────────────────────────────────────┤
  │                  │                                         │
  │   LEFT PANEL     │            RIGHT PANEL                  │
  │   (Switchable)   │            (Switchable)                 │
  │                  │                                         │
  │   [Friends Chat] │   [AI Chat]        [Canvas]             │
  │       OR         │      OR               OR                │
  │   [Video Grid]   │   [Full Canvas]   [AI Chat]             │
  │                  │                                         │
  └──────────────────┴─────────────────────────────────────────┘
  ```
- [ ] Tab system for switching views
  - Friends Chat / Video Call on left
  - AI Chat / Canvas on right
- [ ] Resizable panels
- [ ] Mobile responsive (bottom tabs)
- [ ] GSAP page transitions

**Files to create:**
- `src/app/(dashboard)/subject/[id]/page.tsx`
- `src/app/(dashboard)/subject/[id]/layout.tsx`
- `src/components/room/RoomLayout.tsx`
- `src/components/room/RoomHeader.tsx`
- `src/components/room/PanelTabs.tsx`
- `src/components/room/ResizablePanel.tsx`

---

## Section 2.7: Friends Chat
**Prompt:** "Implement Section 2.7 - Friends Chat for ByteMeet"

**Tasks:**
- [ ] Real-time text chat (Supabase)
  - Send/receive messages instantly
  - Username + avatar above each message
  - All messages aligned LEFT (sender info visible)
  - Typing indicator with animation
  - Message timestamps
- [ ] Message caching (Redis)
  - Cache last 2 days of messages
  - Load from cache first, then Supabase
  - Background sync for new messages
- [ ] Message input
  - Auto-resize textarea
  - Emoji picker
  - File attachment button
  - Send button with animation
- [ ] GSAP animations
  - Message slide-in animation
  - Typing indicator dots bounce

**Files to create:**
- `src/components/chat/FriendsChat.tsx`
- `src/components/chat/MessageList.tsx`
- `src/components/chat/MessageBubble.tsx`
- `src/components/chat/MessageInput.tsx`
- `src/components/chat/TypingIndicator.tsx`
- `src/hooks/useSupabaseChat.ts`
- `src/hooks/useCachedMessages.ts`

---

## Section 2.8: Video Call (Google Meet Style)
**Prompt:** "Implement Section 2.8 - Video Call for ByteMeet"

**Tasks:**
- [ ] Video call grid layout (Google Meet style)
  ```
  ┌─────────────────────────────────────────────┐
  │  ┌─────────┐  ┌─────────┐  ┌─────────┐     │
  │  │  User1  │  │  User2  │  │  User3  │     │
  │  │  👤🎤🔇 │  │  👤🎤   │  │  👤🎤   │     │
  │  └─────────┘  └─────────┘  └─────────┘     │
  │  ┌─────────┐  ┌─────────┐                  │
  │  │  User4  │  │   You   │                  │
  │  │  👤🎤   │  │  👤🎤📹 │                  │
  │  └─────────┘  └─────────┘                  │
  │                                             │
  │  ┌───────────────────────────────────────┐ │
  │  │ 🎤 Mic │ 📹 Cam │ 🖥️ Share │ ❌ Leave │ │
  │  └───────────────────────────────────────┘ │
  └─────────────────────────────────────────────┘
  ```
- [ ] Participant tiles
  - Username label
  - Speaking indicator (border glow when speaking)
  - Mute/camera off indicators
  - Pin participant option
- [ ] Control bar
  - Toggle microphone
  - Toggle camera
  - Screen share
  - Leave call button
- [ ] Dynamic grid
  - Auto-resize based on participant count
  - 1 person = full size
  - 2-4 people = 2x2 grid
  - 5-9 people = 3x3 grid
  - 10+ = scrollable grid
- [ ] Picture-in-Picture for self
- [ ] GSAP animations
  - Participant join/leave animations
  - Control bar slide-up on hover

**Files to create:**
- `src/components/video/VideoCall.tsx`
- `src/components/video/VideoGrid.tsx`
- `src/components/video/ParticipantTile.tsx`
- `src/components/video/ControlBar.tsx`
- `src/components/video/SpeakingIndicator.tsx`
- `src/hooks/useVideoCall.ts`
- `src/hooks/useLiveKit.ts` (or useDaily.ts)
- `src/lib/livekit.ts`

---

## Section 2.9: AI Chat with Collaborative Q&A
**Prompt:** "Implement Section 2.9 - AI Chat for ByteMeet"

**Tasks:**
- [ ] Collaborative AI chat
  - All members can ask questions
  - **User messages on LEFT** with username
  - **AI responses on RIGHT**
  - Real-time sync via Supabase
- [ ] AI response handling
  - Stream text responses
  - Detect artifact types (code blocks, images)
  - Non-text artifacts → trigger Canvas update
- [ ] AI tutor persona
  - Helpful, educational system prompt
  - Context awareness
  - Multiple subject expertise
- [ ] GSAP animations
  - Message fade-in
  - AI "thinking" animation
  - Canvas artifact slide-in

**Files to create:**
- `src/components/chat/AIChat.tsx`
- `src/components/chat/AIMessageBubble.tsx`
- `src/components/chat/UserMessageBubble.tsx`
- `src/components/chat/AIThinkingIndicator.tsx`
- `src/hooks/useAIChat.ts`
- `src/services/ai.service.ts`

---

## Section 2.10: Canvas (Artifacts Panel)
**Prompt:** "Implement Section 2.10 - Canvas System for ByteMeet"

**Tasks:**
- [ ] Canvas UI (Claude AI style)
  - Side panel with artifacts
  - Horizontal scrollable carousel
  - Each artifact is a card
  - Click to expand full view
- [ ] Artifact types
  - **Code**: Syntax highlighted, copy button, download
  - **PDF**: Embedded PDF viewer
  - **Image**: Lightbox with zoom
  - **Diagram**: Mermaid/PlantUML rendered
- [ ] Artifact controls
  - Download button
  - Copy content (for code)
  - Share artifact
  - Delete (owner only)
- [ ] File storage (Cloudflare R2)
  - Upload on artifact creation
  - Generate signed URLs
  - Download with original filename
- [ ] GSAP animations
  - Slide-in from right
  - Card flip for expand
  - Carousel smooth scroll

**Files to create:**
- `src/components/canvas/Canvas.tsx`
- `src/components/canvas/ArtifactCarousel.tsx`
- `src/components/canvas/ArtifactCard.tsx`
- `src/components/canvas/CodeArtifact.tsx`
- `src/components/canvas/PDFArtifact.tsx`
- `src/components/canvas/ImageArtifact.tsx`
- `src/components/canvas/ArtifactViewer.tsx`
- `src/hooks/useArtifacts.ts`
- `src/services/r2.service.ts`

---

## Section 2.11: File Upload & Download
**Prompt:** "Implement Section 2.11 - File System for ByteMeet"

**Tasks:**
- [ ] File upload component
  - Drag & drop zone
  - File picker button
  - Progress bar during upload
  - Preview before upload
- [ ] Upload to Cloudflare R2
  - Presigned URL generation
  - Client-side upload
  - Store metadata in MongoDB
- [ ] Download functionality
  - Download button on each artifact
  - Preserve original filename
  - Track download count
- [ ] File validation
  - Allowed types: PDF, images, code files, docs
  - Max 10MB per file
  - Virus scanning (optional)

**Files to create:**
- `src/components/upload/FileUploader.tsx`
- `src/components/upload/DropZone.tsx`
- `src/components/upload/UploadProgress.tsx`
- `src/components/ui/DownloadButton.tsx`
- `src/app/api/upload/route.ts`
- `src/app/api/download/[id]/route.ts`

---

## Section 2.12: Notifications & Real-time Updates
**Prompt:** "Implement Section 2.12 - Notifications for ByteMeet"

**Tasks:**
- [ ] In-app notifications
  - Bell icon in header
  - Unread count badge
  - Notifications dropdown
- [ ] Notification types
  - Join request received
  - Request approved/rejected
  - New message mention
  - New artifact shared
- [ ] Real-time updates
  - Supabase subscriptions for messages
  - Socket.io for other notifications
- [ ] Toast notifications
  - Bottom-right corner
  - Auto-dismiss with progress
  - Click to navigate

**Files to create:**
- `src/components/notifications/NotificationBell.tsx`
- `src/components/notifications/NotificationList.tsx`
- `src/components/ui/Toast.tsx`
- `src/providers/NotificationProvider.tsx`
- `src/hooks/useNotifications.ts`

---

## Section 2.13: GSAP Animations & Polish
**Prompt:** "Implement Section 2.13 - Animations for ByteMeet"

**Tasks:**
- [ ] Page transitions
  - Fade + slide between routes
  - Loading states with skeleton
- [ ] Component animations
  - Modal open/close
  - Dropdown menus
  - Button hover states
- [ ] Scroll animations
  - Reveal on scroll for home page
  - Parallax effects
- [ ] Micro-interactions
  - Button click feedback
  - Icon animations
  - Loading spinners
- [ ] Performance optimization
  - Use will-change
  - GPU acceleration
  - Respect reduced motion

**Files to create:**
- `src/lib/gsap.ts` (GSAP utilities)
- `src/components/animations/PageTransition.tsx`
- `src/components/animations/FadeIn.tsx`
- `src/components/animations/SlideIn.tsx`
- `src/hooks/useGSAP.ts`

---

## Section 2.14: Mobile Responsiveness
**Prompt:** "Implement Section 2.14 - Mobile UI for ByteMeet"

**Tasks:**
- [ ] Mobile navigation
  - Bottom tab bar
  - Hamburger menu for header
- [ ] Responsive layouts
  - Single column on mobile
  - Collapsible panels
  - Full-screen modals
- [ ] Touch optimizations
  - Larger touch targets
  - Swipe gestures for panels
  - Pull-to-refresh
- [ ] Mobile video call
  - 2x2 grid max
  - Swipe between participants
  - Floating self-view

**Files to create:**
- `src/components/navigation/MobileNav.tsx`
- `src/components/navigation/BottomTabBar.tsx`
- `src/hooks/useMediaQuery.ts`
- `src/hooks/useMobile.ts`

---

# 🗓️ Recommended Implementation Order

## For ByteMeet Platform (Project 2):
```
Phase 0: Setup (Start Here!)
└── 2.0 Next.js Project Setup ⭐

Phase 1: Foundation
├── 2.1 Tech Stack Setup
├── 2.2 Database Schema
└── 2.3 Auth & Username

Phase 2: Core Room System
├── 2.4 Subject Creation
├── 2.5 Invite & Access Control
└── 2.6 Room Layout

Phase 3: Communication
├── 2.7 Friends Chat
├── 2.8 Video Call (Google Meet UI) ⭐
└── 2.9 AI Chat (OpenAI GPT-4)

Phase 4: Artifacts
├── 2.10 Canvas System
└── 2.11 File Upload/Download

Phase 5: Polish
├── 2.12 Notifications
├── 2.13 GSAP Animations ⭐
└── 2.14 Mobile Responsiveness
```

---

# 📝 How to Use This Plan

1. **Pick a section** you want to implement
2. **Copy the prompt** exactly as written (e.g., "Implement Section 2.0 - Next.js Project Setup for ByteMeet")
3. **Paste it in the chat** and I will implement that specific section
4. **Review and test** before moving to the next section
5. **Repeat** until complete!

---

# 🛠️ Tech Stack Summary for ByteMeet

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Framework** | Next.js 14+ (App Router) | Full-stack React framework |
| **Language** | TypeScript | Type safety |
| **Styling** | TailwindCSS | Utility-first CSS |
| **Animations** | GSAP + Framer Motion | Smooth animations |
| **Real-time Chat** | Supabase Realtime | Friends & AI chat |
| **Video Calls** | LiveKit / Daily.co | WebRTC video conferencing |
| **File Storage** | Cloudflare R2 | Images, PDFs, code files |
| **Caching** | Redis | Message caching (1-2 days) |
| **Auth** | JWT + MongoDB | User authentication |
| **AI** | **OpenAI API (GPT-4)** | AI tutor responses |
| **Backend API** | Node.js + Express | REST API server |
| **Database** | MongoDB + Supabase | Extended data + real-time |

