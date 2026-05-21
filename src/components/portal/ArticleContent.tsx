"use client";
// ArticleContent.tsx
// Client component so it re-renders when CSS variable --fs-base changes
// Also handles copy link button

import { useEffect, useRef } from "react";

interface Props { content: string }

export default function ArticleContent({ content }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  // Make copy link button work
  useEffect(() => {
    const btns = document.querySelectorAll("[data-copy-link]");
    btns.forEach((btn) => {
      btn.addEventListener("click", () => {
        navigator.clipboard.writeText(window.location.href);
        btn.textContent = "✅ कॉपी झाले!";
        setTimeout(() => { btn.textContent = "🔗 लिंक कॉपी करा"; }, 2000);
      });
    });
  }, []);

  return (
    <div
      ref={ref}
      id="article-body" className="article-body"
      style={{
        fontFamily: "'Noto Sans Devanagari', sans-serif",
        fontSize:   "var(--fs-lg)",
        lineHeight: 2,
        color:      "var(--text-primary)",
      }}
      dangerouslySetInnerHTML={{ __html: processContent(content) }}
    />
  );
}

// Clean and enhance article HTML
function processContent(html: string): string {
  if (!html) return "";

  let processed = html
    // Wrap bare text nodes that look like bold/subheadings
    .replace(/<p><strong>(.*?)<\/strong><\/p>/gi,
      '<h3 style="font-family:\'Noto Sans Devanagari\',sans-serif;font-size:var(--fs-xl);font-weight:800;color:var(--text-primary);margin:2rem 0 0.75rem;line-height:1.4;">$1</h3>'
    )
    // Style paragraphs
    .replace(/<p>/gi,
      '<p style="font-family:\'Noto Sans Devanagari\',sans-serif;font-size:var(--fs-lg);line-height:2;margin-bottom:1.5rem;color:var(--text-primary);">'
    )
    // Style existing h2
    .replace(/<h2>/gi,
      '<h2 style="font-family:\'Noto Sans Devanagari\',sans-serif;font-size:var(--fs-2xl);font-weight:900;color:var(--text-primary);margin:2.5rem 0 1rem;line-height:1.35;">'
    )
    // Style existing h3
    .replace(/<h3>/gi,
      '<h3 style="font-family:\'Noto Sans Devanagari\',sans-serif;font-size:var(--fs-xl);font-weight:800;color:var(--text-primary);margin:2rem 0 0.75rem;">'
    )
    // Style ul/ol
    .replace(/<ul>/gi,
      '<ul style="font-family:\'Noto Sans Devanagari\',sans-serif;list-style:disc;padding-left:1.75rem;margin-bottom:1.25rem;font-size:var(--fs-lg);">'
    )
    .replace(/<ol>/gi,
      '<ol style="font-family:\'Noto Sans Devanagari\',sans-serif;list-style:decimal;padding-left:1.75rem;margin-bottom:1.25rem;font-size:var(--fs-lg);">'
    )
    .replace(/<li>/gi,
      '<li style="margin-bottom:0.6rem;line-height:1.85;">'
    )
    // Style blockquote
    .replace(/<blockquote>/gi,
      '<blockquote style="font-family:\'Noto Sans Devanagari\',sans-serif;border-left:5px solid var(--brand);padding:1rem 1.5rem;background:var(--brand-light);border-radius:0 12px 12px 0;margin:2rem 0;font-size:var(--fs-lg);font-style:italic;font-weight:600;color:var(--text-primary);">'
    )
    // Bold
    .replace(/<strong>/gi,
      '<strong style="font-weight:800;color:var(--text-primary);">'
    );

  return processed;
}
