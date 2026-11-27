import type { Metadata } from 'next';
import Link from 'next/link';
import {
  ArrowDown, ArrowLeft, ArrowRight, BookOpen, BrainCircuit, Check,
  Code2, FileText, Layers3, MessageCircle, Plus, Sparkles, Users, Video,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'About | ByteMeet',
  description: 'Discover how ByteMeet brings study rooms, AI tutoring, live calls and shared learning materials together.',
};

const features = [
  { icon: Users, title: 'Your own study spaces', description: 'Create a room for each subject, invite your peers and manage who joins.', color: 'text-accent-light', background: 'bg-accent/10' },
  { icon: BrainCircuit, title: 'An AI tutor in the room', description: 'Ask questions, explore difficult concepts and learn with contextual explanations and code examples.', color: 'text-accent-secondary-light', background: 'bg-accent-secondary/10' },
  { icon: Video, title: 'Meet face to face', description: 'Talk through a problem with audio, video and screen sharing, without leaving your study space.', color: 'text-accent-light', background: 'bg-accent/10' },
  { icon: MessageCircle, title: 'Keep the conversation going', description: 'Exchange ideas and discuss questions in a shared, real-time group chat.', color: 'text-accent-secondary-light', background: 'bg-accent-secondary/10' },
  { icon: Layers3, title: 'A canvas for your resources', description: 'Keep PDFs, images and code in a shared workspace so useful material is easier to find.', color: 'text-accent-light', background: 'bg-accent/10' },
  { icon: BookOpen, title: 'Focus on one subject at a time', description: 'Keep conversations and resources organized by subject instead of scattered across different apps.', color: 'text-accent-secondary-light', background: 'bg-accent-secondary/10' },
];

const steps = [
  { number: '01', icon: Plus, title: 'Create a room', description: 'Choose a subject and give your group a dedicated place to learn.' },
  { number: '02', icon: Users, title: 'Bring your people', description: 'Share your invite code and approve requests from your study partners.' },
  { number: '03', icon: Sparkles, title: 'Learn together', description: 'Discuss, ask the AI tutor, share resources and jump into a call.' },
];

const focusClass = 'focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent-light';

function Brand() {
  return (
    <Link href="/" aria-label="ByteMeet home" className={`inline-flex shrink-0 items-center rounded-md text-2xl font-bold tracking-tight italic sm:text-3xl ${focusClass}`}>
      Byte<span className="text-accent">Meet.</span>
    </Link>
  );
}

function WorkspacePreview() {
  return (
    <div className="relative mx-auto w-full max-w-lg" aria-label="Illustrative preview of a ByteMeet study room">
      <div aria-hidden="true" className="absolute -inset-8 -z-10 rounded-full bg-accent/10 blur-[85px]" />
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-bg-500 shadow-2xl shadow-black/50">
        <div className="flex items-center justify-between gap-3 border-b border-white/10 bg-bg-400 px-4 py-3 sm:px-5">
          <div className="flex items-center gap-2">
            <span aria-hidden="true" className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/10 text-accent-light"><BookOpen size={16} /></span>
            <div>
              <p className="text-xs font-semibold text-white sm:text-sm">Data Structures</p>
              <p className="mt-0.5 text-[10px] text-gray-400">Example study room</p>
            </div>
          </div>
          <span className="rounded-full border border-white/10 px-2.5 py-1 text-[10px] text-gray-300">3 members</span>
        </div>
        <div className="grid gap-3 p-3 sm:grid-cols-[1.15fr_1fr] sm:p-4">
          <div className="rounded-xl border border-white/10 bg-bg-400 p-3">
            <div className="mb-4 flex items-center gap-2 text-xs font-semibold"><Sparkles size={15} className="text-accent-light" aria-hidden="true" /> AI Tutor</div>
            <div className="ml-3 rounded-xl rounded-tr-sm bg-accent/15 p-3 text-xs leading-relaxed text-gray-200">How does binary search work?</div>
            <div className="mt-3 rounded-xl rounded-tl-sm border border-white/5 bg-bg-300 p-3 text-xs leading-relaxed text-gray-300">
              Start with a sorted list. Compare the middle element, then search only the relevant half.
              <div className="mt-3 flex flex-wrap gap-1" aria-hidden="true">
                {[2, 5, 8, 12, 16].map((number) => (
                  <span key={number} className={`flex h-7 min-w-6 flex-1 items-center justify-center rounded border px-1 text-[10px] font-semibold ${number === 8 ? 'border-accent/60 bg-accent/20 text-accent-light' : 'border-white/10 bg-bg-500 text-gray-400'}`}>{number}</span>
                ))}
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-3">
            <div className="rounded-xl border border-white/10 bg-bg-400 p-3">
              <div className="mb-3 flex items-center gap-2 text-xs font-semibold"><Layers3 size={15} className="text-accent-secondary-light" aria-hidden="true" /> Canvas</div>
              <div className="flex items-center gap-2 rounded-lg bg-bg-300 p-2.5"><FileText size={16} className="shrink-0 text-accent-light" aria-hidden="true" /><span className="min-w-0 truncate text-[11px] text-gray-200">DSA notes.pdf</span></div>
              <div className="mt-2 flex items-center gap-2 rounded-lg bg-bg-300 p-2.5"><Code2 size={16} className="shrink-0 text-accent-secondary-light" aria-hidden="true" /><span className="min-w-0 truncate text-[11px] text-gray-200">binary_search.cpp</span></div>
            </div>
            <div className="flex flex-1 items-center gap-2 rounded-xl border border-accent-secondary/20 bg-accent-secondary/5 p-3">
              <Video size={18} className="shrink-0 text-accent-secondary-light" aria-hidden="true" />
              <div><p className="text-xs font-semibold">Study call</p><p className="mt-0.5 text-[10px] text-gray-400">Connect with your group</p></div>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-white/10 px-4 py-3 text-[10px] text-gray-400 sm:px-5">
          <span className="flex items-center gap-1.5"><MessageCircle size={13} aria-hidden="true" /> Group chat</span>
          <span className="flex items-center gap-1.5"><Users size={13} aria-hidden="true" /> Study partners</span>
          <span className="ml-auto text-accent-light">One workspace.</span>
        </div>
      </div>
      <p className="mt-3 text-center text-xs text-gray-400">A glimpse of learning with ByteMeet</p>
    </div>
  );
}

export default function AboutPage() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-black text-white selection:bg-accent selection:text-white">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[60] focus:rounded-lg focus:bg-bg-400 focus:px-4 focus:py-3">Skip to content</a>
      <header className="sticky top-0 z-50 border-b border-white/10 bg-black/85 backdrop-blur-xl">
        <nav aria-label="Main navigation" className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-5 py-4 sm:px-8 md:px-12">
          <Brand />
          <div className="flex items-center gap-3 sm:gap-5">
            <Link href="/" className={`hidden items-center gap-2 rounded-md text-sm font-medium text-gray-300 transition-colors hover:text-white sm:inline-flex ${focusClass}`}><ArrowLeft size={15} aria-hidden="true" /> Home</Link>
            <Link href="/login" className={`rounded-full border border-white/20 bg-white/5 px-4 py-2 text-sm font-medium transition-colors hover:bg-white/10 sm:px-5 ${focusClass}`}>Sign In</Link>
          </div>
        </nav>
      </header>

      <main id="main-content">
        <section className="relative isolate mx-auto grid max-w-7xl items-center gap-14 px-5 pt-20 pb-16 sm:px-8 md:px-12 lg:grid-cols-[1.1fr_1fr] lg:gap-12 lg:pt-28 lg:pb-24">
          <div aria-hidden="true" className="pointer-events-none absolute -top-20 -left-48 -z-10 h-96 w-96 rounded-full bg-accent/20 blur-[125px]" />
          <div aria-hidden="true" className="pointer-events-none absolute -right-28 bottom-0 -z-10 h-96 w-96 rounded-full bg-accent-secondary/15 blur-[125px]" />
          <div className="motion-safe:animate-slide-up">
            <Link href="/" className={`mb-6 inline-flex items-center gap-2 rounded text-xs text-gray-400 hover:text-white sm:hidden ${focusClass}`}><ArrowLeft size={14} aria-hidden="true" /> Back to home</Link>
            <p className="mb-5 flex items-center gap-2 text-xs font-semibold tracking-[0.2em] text-accent-light uppercase"><span className="h-2 w-2 rounded-full bg-accent" aria-hidden="true" /> About ByteMeet</p>
            <h1 className="text-5xl leading-[1.08] tracking-tight sm:text-6xl xl:text-7xl">Learning is better <span className="text-accent">together.</span></h1>
            <p className="mt-6 max-w-xl text-base leading-8 text-gray-300 sm:text-lg">ByteMeet brings your study group, AI tutor, live conversations and learning resources into one shared space. Less switching between apps. More time understanding what matters.</p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link href="/register" className={`inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3.5 text-sm font-bold text-white transition-colors hover:bg-accent-dark ${focusClass}`}>Get Started Free <ArrowRight size={17} aria-hidden="true" /></Link>
              <a href="#features" className={`inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-5 py-3.5 text-sm font-semibold transition-colors hover:bg-white/10 ${focusClass}`}>Explore features <ArrowDown size={16} aria-hidden="true" /></a>
            </div>
          </div>
          <WorkspacePreview />
        </section>

        <section aria-labelledby="mission-heading" className="border-y border-white/10 bg-bg-500/60">
          <div className="mx-auto grid max-w-7xl gap-9 px-5 py-16 sm:px-8 md:px-12 lg:grid-cols-[0.85fr_1.15fr] lg:py-20">
            <div>
              <p className="mb-4 text-xs font-semibold tracking-[0.2em] text-accent-light uppercase">Our purpose</p>
              <h2 id="mission-heading" className="text-3xl leading-tight tracking-tight sm:text-4xl md:text-5xl">Less fragmentation.<br /> <span className="text-accent">More connection.</span></h2>
            </div>
            <div className="space-y-4 text-base leading-8 text-gray-300">
              <p>Studying with friends often means jumping between messaging apps, video calls, scattered notes and a separate AI assistant. Every switch interrupts the discussion.</p>
              <p>ByteMeet is built around a simple idea: a subject should have its own place to learn. We bring the tools for collaboration and independent exploration into that place, so a question can become a conversation, an explanation or a shared resource.</p>
              <div className="flex flex-wrap gap-x-6 gap-y-3 pt-2 text-sm font-medium text-gray-200">
                {['Subject-first', 'Collaborative by design', 'AI-assisted learning'].map((item) => <span key={item} className="inline-flex items-center gap-2"><Check size={16} className="text-accent-light" aria-hidden="true" />{item}</span>)}
              </div>
            </div>
          </div>
        </section>

        <section id="features" aria-labelledby="features-heading" className="mx-auto max-w-7xl scroll-mt-24 px-5 py-20 sm:px-8 md:px-12 lg:py-24">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <p className="mb-4 text-xs font-semibold tracking-[0.2em] text-accent-light uppercase">Everything in one place</p>
            <h2 id="features-heading" className="text-3xl tracking-tight sm:text-5xl">A workspace for the way <span className="text-accent">you learn.</span></h2>
            <p className="mt-4 leading-7 text-gray-400">From your first question to your next group discussion, your tools stay connected.</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {features.map(({ icon: Icon, title, description, color, background }) => (
              <article key={title} className="group rounded-2xl border border-white/10 bg-bg-500 p-6 transition-colors hover:border-accent/40 hover:bg-bg-400 sm:p-7">
                <div className={`mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl ${color} ${background}`}><Icon size={24} strokeWidth={1.7} aria-hidden="true" /></div>
                <h3 className="text-xl tracking-tight">{title}</h3>
                <p className="mt-3 text-sm leading-7 text-gray-400">{description}</p>
              </article>
            ))}
          </div>
        </section>

        <section aria-labelledby="steps-heading" className="border-y border-white/10 bg-bg-500/60">
          <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 md:px-12 lg:py-20">
            <p className="mb-4 text-xs font-semibold tracking-[0.2em] text-accent-secondary-light uppercase">How it works</p>
            <h2 id="steps-heading" className="text-3xl tracking-tight sm:text-5xl">Your next study session,<br className="hidden sm:block" /> in three simple steps.</h2>
            <ol className="mt-10 grid gap-8 md:grid-cols-3 md:gap-6">
              {steps.map(({ number, icon: Icon, title, description }) => (
                <li key={number} className="relative border-t border-white/15 pt-6">
                  <div className="mb-4 flex items-center justify-between"><span className="text-3xl font-bold tracking-tight text-accent-light">{number}</span><Icon size={26} className="text-gray-400" aria-hidden="true" /></div>
                  <h3 className="text-xl">{title}</h3>
                  <p className="mt-3 max-w-sm text-sm leading-7 text-gray-400">{description}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section aria-labelledby="cta-heading" className="mx-auto max-w-7xl px-5 py-16 sm:px-8 md:px-12 lg:py-24">
          <div className="relative isolate overflow-hidden rounded-3xl border border-accent/25 bg-bg-500 px-6 py-14 text-center sm:px-12 sm:py-20">
            <div aria-hidden="true" className="absolute -top-32 left-1/2 -z-10 h-72 w-96 -translate-x-1/2 rounded-full bg-accent/20 blur-[95px]" />
            <div aria-hidden="true" className="absolute -right-20 -bottom-28 -z-10 h-64 w-64 rounded-full bg-accent-secondary/15 blur-[95px]" />
            <p className="mb-4 text-xs font-semibold tracking-[0.2em] text-accent-light uppercase">Make your next study session count</p>
            <h2 id="cta-heading" className="text-3xl tracking-tight sm:text-5xl">Good questions.<br /> <span className="text-accent">Better together.</span></h2>
            <p className="mx-auto mt-5 max-w-lg text-sm leading-7 text-gray-300 sm:text-base">Create your first study room, invite your friends and turn learning into something you do together.</p>
            <Link href="/register" className={`mt-8 inline-flex items-center gap-2 rounded-full bg-accent px-7 py-4 text-sm font-bold transition-colors hover:bg-accent-dark ${focusClass}`}>Get Started Free <ArrowRight size={17} aria-hidden="true" /></Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-5 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-8 md:px-12">
          <div><Brand /><p className="mt-2 text-xs text-gray-400">Collaborative learning with friends.</p></div>
          <div className="flex flex-wrap gap-5 text-sm text-gray-400">
            <Link href="/" className={`rounded hover:text-white ${focusClass}`}>Home</Link>
            <Link href="/about" aria-current="page" className={`rounded text-accent-light ${focusClass}`}>About</Link>
            <Link href="/login" className={`rounded hover:text-white ${focusClass}`}>Sign In</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
