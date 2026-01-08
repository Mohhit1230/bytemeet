/**
 * Code Artifact Component
 *
 * Syntax-highlighted code viewer with line numbers
 */

'use client';

import { useState } from 'react';

interface CodeArtifactProps {
  code: string;
  language: string;
  title?: string;
}

// Language display names and colors
const languageConfig: Record<string, { name: string; color: string }> = {
  javascript: { name: 'JavaScript', color: '#f7df1e' },
  typescript: { name: 'TypeScript', color: '#3178c6' },
  python: { name: 'Python', color: '#3776ab' },
  java: { name: 'Java', color: '#ed8b00' },
  cpp: { name: 'C++', color: '#00599c' },
  c: { name: 'C', color: '#a8b9cc' },
  csharp: { name: 'C#', color: '#239120' },
  go: { name: 'Go', color: '#00add8' },
  rust: { name: 'Rust', color: '#dea584' },
  ruby: { name: 'Ruby', color: '#cc342d' },
  php: { name: 'PHP', color: '#777bb4' },
  swift: { name: 'Swift', color: '#fa7343' },
  kotlin: { name: 'Kotlin', color: '#7f52ff' },
  sql: { name: 'SQL', color: '#e38c00' },
  html: { name: 'HTML', color: '#e34f26' },
  css: { name: 'CSS', color: '#1572b6' },
  json: { name: 'JSON', color: '#292929' },
  markdown: { name: 'Markdown', color: '#083fa1' },
  shell: { name: 'Shell', color: '#4eaa25' },
  mermaid: { name: 'Mermaid', color: '#ff3670' },
  text: { name: 'Text', color: '#666' },
  other: { name: 'Code', color: '#666' },
};

// Simple syntax highlighting (basic keywords)
const highlightCode = (code: string, lang: string): string => {
  // Escape HTML
  let highlighted = code.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  // Apply basic highlighting based on language
  if (['javascript', 'typescript', 'java', 'csharp', 'cpp', 'c'].includes(lang)) {
    // Keywords
    highlighted = highlighted.replace(
      /\b(const|let|var|function|return|if|else|for|while|class|import|export|from|async|await|try|catch|throw|new|this|static|public|private|protected|interface|type|extends|implements)\b/g,
      '<span class="text-purple-400">$1</span>'
    );
    // Strings
    highlighted = highlighted.replace(
      /(['"`])(?:(?!\1)[^\\]|\\.)*\1/g,
      '<span class="text-green-400">$&</span>'
    );
    // Comments
    highlighted = highlighted.replace(
      /(\/\/.*$|\/\*[\s\S]*?\*\/)/gm,
      '<span class="text-gray-500 italic">$1</span>'
    );
    // Numbers
    highlighted = highlighted.replace(
      /\b(\d+\.?\d*)\b/g,
      '<span class="text-orange-400">$1</span>'
    );
  } else if (lang === 'python') {
    highlighted = highlighted.replace(
      /\b(def|class|import|from|if|elif|else|for|while|return|try|except|with|as|lambda|yield|async|await|True|False|None)\b/g,
      '<span class="text-purple-400">$1</span>'
    );
    highlighted = highlighted.replace(
      /(['"])(?:(?!\1)[^\\]|\\.)*\1/g,
      '<span class="text-green-400">$&</span>'
    );
    highlighted = highlighted.replace(/(#.*$)/gm, '<span class="text-gray-500 italic">$1</span>');
  } else if (lang === 'html') {
    highlighted = highlighted.replace(
      /(&lt;\/?)([\w-]+)/g,
      '$1<span class="text-red-400">$2</span>'
    );
    highlighted = highlighted.replace(/([\w-]+)=/g, '<span class="text-yellow-400">$1</span>=');
  } else if (lang === 'css') {
    highlighted = highlighted.replace(
      /([.#]?[\w-]+)\s*{/g,
      '<span class="text-yellow-400">$1</span> {'
    );
    highlighted = highlighted.replace(/([\w-]+):/g, '<span class="text-blue-400">$1</span>:');
  } else if (lang === 'json') {
    highlighted = highlighted.replace(/"([\w-]+)":/g, '<span class="text-purple-400">"$1"</span>:');
    highlighted = highlighted.replace(
      /:\s*"([^"]*)"/g,
      ': <span class="text-green-400">"$1"</span>'
    );
    highlighted = highlighted.replace(/:\s*(\d+)/g, ': <span class="text-orange-400">$1</span>');
  }

  return highlighted;
};

export function CodeArtifact({ code, language, title }: CodeArtifactProps) {
  const [copied, setCopied] = useState(false);
  const [wrapLines, setWrapLines] = useState(false);

  const lines = code.split('\n');
  const config = languageConfig[language] || languageConfig.other;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="overflow-hidden rounded-lg bg-[#0d0d0d]">
      {/* Header Bar */}
      <div className="border-bg-200/30 flex items-center justify-between border-b bg-[#1a1a1b] px-4 py-2">
        <div className="flex items-center gap-3">
          {/* Traffic Lights */}
          <div className="flex gap-1.5">
            <div className="h-3 w-3 rounded-full bg-[#ff5f56]" />
            <div className="h-3 w-3 rounded-full bg-[#ffbd2e]" />
            <div className="h-3 w-3 rounded-full bg-[#27c93f]" />
          </div>

          {/* Title */}
          {title && (
            <span className="border-bg-200/30 max-w-[200px] truncate border-l pl-3 text-xs font-medium text-gray-400">
              {title}
            </span>
          )}

          {/* Language Badge */}
          <span
            className="rounded px-2 py-0.5 text-xs font-medium"
            style={{
              backgroundColor: `${config.color}20`,
              color: config.color,
            }}
          >
            {config.name}
          </span>

          {/* Line count */}
          <span className="text-xs text-gray-500">{lines.length} lines</span>
        </div>

        <div className="flex items-center gap-2">
          {/* Wrap toggle */}
          <button
            onClick={() => setWrapLines(!wrapLines)}
            className={`rounded p-1.5 text-xs transition-colors ${
              wrapLines ? 'bg-accent/20 text-accent-light' : 'text-gray-500 hover:text-white'
            }`}
            title={wrapLines ? 'Disable word wrap' : 'Enable word wrap'}
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h8m-8 6h16"
              />
            </svg>
          </button>

          {/* Copy button */}
          <button
            onClick={handleCopy}
            className={`flex items-center gap-1 rounded px-2 py-1 text-xs transition-all ${
              copied
                ? 'bg-green-500/20 text-green-400'
                : 'hover:bg-bg-100 text-gray-400 hover:text-white'
            }`}
          >
            {copied ? (
              <>
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                Copied
              </>
            ) : (
              <>
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
                Copy
              </>
            )}
          </button>
        </div>
      </div>

      {/* Code Content */}
      <div className={`max-h-[60vh] overflow-auto ${wrapLines ? '' : 'overflow-x-auto'}`}>
        <table className="w-full font-mono text-sm">
          <tbody>
            {lines.map((line, index) => (
              <tr key={index} className="group hover:bg-[#1a1a1b]/50">
                {/* Line Number */}
                <td className="border-bg-200/30 w-12 border-r py-0.5 pr-4 pl-4 text-right text-xs text-gray-600 select-none">
                  {index + 1}
                </td>
                {/* Code Line */}
                <td className="py-0.5 pr-4 pl-4">
                  <pre
                    className={`text-gray-300 ${wrapLines ? 'break-all whitespace-pre-wrap' : 'whitespace-pre'}`}
                    dangerouslySetInnerHTML={{
                      __html: highlightCode(line || ' ', language),
                    }}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default CodeArtifact;
