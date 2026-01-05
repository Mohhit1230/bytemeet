/**
 * AI Service
 *
 * Service for interacting with OpenAI API for AI tutor functionality
 */

import OpenAI from 'openai';

// Lazy initialization to prevent crash when API key is not set
let openai: OpenAI | null = null;

function getOpenAIClient(): OpenAI {
  if (!openai) {
    const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error(
        'OpenAI API key not configured. Please set NEXT_PUBLIC_OPENAI_API_KEY in .env.local'
      );
    }
    openai = new OpenAI({
      apiKey,
      dangerouslyAllowBrowser: true, // Note: In production, use backend proxy
    });
  }
  return openai;
}

/**
 * AI Tutor System Prompt
 */
const SYSTEM_PROMPT = `You are ByteMeet AI Tutor - a friendly, helpful, and knowledgeable educational assistant for study groups.

Your role is to:
1. Help students understand complex concepts across multiple subjects
2. Provide clear, step-by-step explanations
3. Answer questions in an engaging and encouraging manner
4. Generate code examples, diagrams, and visual aids when helpful
5. Adapt your teaching style to the student's level

Guidelines:
- Be encouraging and supportive
- Use analogies and real-world examples
- Break down complex topics into digestible parts
- When providing code, use proper formatting with language tags
- For diagrams, use Mermaid syntax within code blocks
- If you don't know something, admit it honestly
- Keep responses concise but comprehensive

When generating artifacts:
- Code: Use \`\`\`language syntax
- Diagrams: Use \`\`\`mermaid syntax
- Math: Use LaTeX within $$ delimiters

Remember: You're part of a collaborative study session. Multiple students may be asking questions, so be helpful to everyone!`;

/**
 * Message type for AI chat
 */
export interface AIMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  username?: string;
  timestamp?: string;
}

/**
 * Artifact detected in AI response
 */
export interface Artifact {
  type: 'code' | 'mermaid' | 'image' | 'latex';
  content: string;
  language?: string;
  title?: string;
}

/**
 * Send message to AI and get response
 */
export async function sendToAI(
  messages: AIMessage[],
  onStream?: (chunk: string) => void
): Promise<{ content: string; artifacts: Artifact[] }> {
  try {
    const client = getOpenAIClient();

    const formattedMessages = [
      { role: 'system' as const, content: SYSTEM_PROMPT },
      ...messages.map((m) => ({
        role: m.role as 'user' | 'assistant',
        content: m.username && m.role === 'user' ? `[${m.username}]: ${m.content}` : m.content,
      })),
    ];

    if (onStream) {
      // Streaming response
      const stream = await client.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: formattedMessages,
        stream: true,
        max_tokens: 2048,
      });

      let fullContent = '';

      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || '';
        fullContent += content;
        onStream(content);
      }

      const artifacts = extractArtifacts(fullContent);
      return { content: fullContent, artifacts };
    } else {
      // Non-streaming response
      const response = await client.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: formattedMessages,
        max_tokens: 2048,
      });

      const content = response.choices[0]?.message?.content || '';
      const artifacts = extractArtifacts(content);
      return { content, artifacts };
    }
  } catch (error: unknown) {
    const e = error as any;
    console.error('AI service error:', e);
    throw new Error(e.message || 'Failed to get AI response');
  }
}

/**
 * Extract artifacts (code blocks, diagrams) from AI response
 */
export function extractArtifacts(content: string): Artifact[] {
  const artifacts: Artifact[] = [];

  // Extract code blocks
  const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
  let match;

  while ((match = codeBlockRegex.exec(content)) !== null) {
    const language = match[1] || 'text';
    const code = match[2].trim();

    if (language === 'mermaid') {
      artifacts.push({
        type: 'mermaid',
        content: code,
        title: 'Diagram',
      });
    } else {
      artifacts.push({
        type: 'code',
        content: code,
        language,
        title: `${language.charAt(0).toUpperCase() + language.slice(1)} Code`,
      });
    }
  }

  // Extract LaTeX blocks
  const latexRegex = /\$\$([\s\S]*?)\$\$/g;
  while ((match = latexRegex.exec(content)) !== null) {
    artifacts.push({
      type: 'latex',
      content: match[1].trim(),
      title: 'Math Expression',
    });
  }

  return artifacts;
}

/**
 * Check if content contains artifacts
 */
export function hasArtifacts(content: string): boolean {
  return /```[\s\S]*?```/.test(content) || /\$\$[\s\S]*?\$\$/.test(content);
}

const aiService = {
  sendToAI,
  extractArtifacts,
  hasArtifacts,
};

export default aiService;
