/**
 * Code Artifact Component
 *
 * Syntax-highlighted code viewer with line numbers
 */

'use client';

import React, { useState } from 'react';

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
    let highlighted = code
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');

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
        highlighted = highlighted.replace(
            /(#.*$)/gm,
            '<span class="text-gray-500 italic">$1</span>'
        );
    } else if (lang === 'html') {
        highlighted = highlighted.replace(
            /(&lt;\/?)([\w-]+)/g,
            '$1<span class="text-red-400">$2</span>'
        );
        highlighted = highlighted.replace(
            /([\w-]+)=/g,
            '<span class="text-yellow-400">$1</span>='
        );
    } else if (lang === 'css') {
        highlighted = highlighted.replace(
            /([.#]?[\w-]+)\s*{/g,
            '<span class="text-yellow-400">$1</span> {'
        );
        highlighted = highlighted.replace(
            /([\w-]+):/g,
            '<span class="text-blue-400">$1</span>:'
        );
    } else if (lang === 'json') {
        highlighted = highlighted.replace(
            /"([\w-]+)":/g,
            '<span class="text-purple-400">"$1"</span>:'
        );
        highlighted = highlighted.replace(
            /:\s*"([^"]*)"/g,
            ': <span class="text-green-400">"$1"</span>'
        );
        highlighted = highlighted.replace(
            /:\s*(\d+)/g,
            ': <span class="text-orange-400">$1</span>'
        );
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
        <div className="bg-[#0d0d0d] rounded-lg overflow-hidden">
            {/* Header Bar */}
            <div className="flex items-center justify-between px-4 py-2 bg-[#1a1a1b] border-b border-bg-200/30">
                <div className="flex items-center gap-3">
                    {/* Traffic Lights */}
                    <div className="flex gap-1.5">
                        <div className="w-3 h-3 rounded-full bg-[#ff5f56]" />
                        <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
                        <div className="w-3 h-3 rounded-full bg-[#27c93f]" />
                    </div>

                    {/* Title */}
                    {title && (
                        <span className="text-xs font-medium text-gray-400 border-l border-bg-200/30 pl-3 truncate max-w-[200px]">
                            {title}
                        </span>
                    )}

                    {/* Language Badge */}
                    <span
                        className="px-2 py-0.5 rounded text-xs font-medium"
                        style={{
                            backgroundColor: `${config.color}20`,
                            color: config.color,
                        }}
                    >
                        {config.name}
                    </span>

                    {/* Line count */}
                    <span className="text-xs text-gray-500">
                        {lines.length} lines
                    </span>
                </div>

                <div className="flex items-center gap-2">
                    {/* Wrap toggle */}
                    <button
                        onClick={() => setWrapLines(!wrapLines)}
                        className={`p-1.5 rounded text-xs transition-colors ${wrapLines
                            ? 'bg-accent/20 text-accent-light'
                            : 'text-gray-500 hover:text-white'
                            }`}
                        title={wrapLines ? 'Disable word wrap' : 'Enable word wrap'}
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h8m-8 6h16" />
                        </svg>
                    </button>

                    {/* Copy button */}
                    <button
                        onClick={handleCopy}
                        className={`flex items-center gap-1 px-2 py-1 rounded text-xs transition-all ${copied
                            ? 'bg-green-500/20 text-green-400'
                            : 'text-gray-400 hover:text-white hover:bg-bg-100'
                            }`}
                    >
                        {copied ? (
                            <>
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                Copied
                            </>
                        ) : (
                            <>
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                                Copy
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Code Content */}
            <div className={`overflow-auto max-h-[60vh] ${wrapLines ? '' : 'overflow-x-auto'}`}>
                <table className="w-full text-sm font-mono">
                    <tbody>
                        {lines.map((line, index) => (
                            <tr key={index} className="hover:bg-[#1a1a1b]/50 group">
                                {/* Line Number */}
                                <td className="select-none text-right pr-4 pl-4 py-0.5 text-gray-600 text-xs w-12 border-r border-bg-200/30">
                                    {index + 1}
                                </td>
                                {/* Code Line */}
                                <td className="pl-4 pr-4 py-0.5">
                                    <pre
                                        className={`text-gray-300 ${wrapLines ? 'whitespace-pre-wrap break-all' : 'whitespace-pre'}`}
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
