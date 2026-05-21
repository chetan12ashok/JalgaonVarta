"use client";

interface Props { content: string }

export default function ArticleContent({ content }: Props) {
  return (
    <div
      id="article-body"
      className="article-body"
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

function processContent(html: string): string {
  if (!html) return "";

  return html
    // Strip ALL hardcoded color styles — replace with CSS variables
    .replace(/color\s*:\s*#[0-9a-fA-F]{3,6}/g, "color:var(--text-primary)")
    .replace(/color\s*:\s*rgb\([^)]+\)/g, "color:var(--text-primary)")
    .replace(/background-color\s*:\s*#[0-9a-fA-F]{3,6}/g, "")
    .replace(/background-color\s*:\s*rgb\([^)]+\)/g, "")

    // Style paragraphs
    .replace(/<p>/gi,
      '<p style="font-family:\'Noto Sans Devanagari\',sans-serif;font-size:var(--fs-lg);line-height:2;margin-bottom:1.5rem;color:var(--text-primary);">'
    )
    // Style h2
    .replace(/<h2>/gi,
      '<h2 style="font-family:\'Noto Sans Devanagari\',sans-serif;font-size:var(--fs-2xl);font-weight:900;color:var(--text-primary);margin:2.5rem 0 1rem;line-height:1.35;">'
    )
    // Style h3
    .replace(/<h3>/gi,
      '<h3 style="font-family:\'Noto Sans Devanagari\',sans-serif;font-size:var(--fs-xl);font-weight:800;color:var(--text-primary);margin:2rem 0 0.75rem;">'
    )
    // Bold
    .replace(/<strong>/gi,
      '<strong style="font-weight:800;color:var(--text-primary);">'
    )
    // Lists
    .replace(/<ul>/gi,
      '<ul style="font-family:\'Noto Sans Devanagari\',sans-serif;list-style:disc;padding-left:1.75rem;margin-bottom:1.25rem;font-size:var(--fs-lg);color:var(--text-primary);">'
    )
    .replace(/<ol>/gi,
      '<ol style="font-family:\'Noto Sans Devanagari\',sans-serif;list-style:decimal;padding-left:1.75rem;margin-bottom:1.25rem;font-size:var(--fs-lg);color:var(--text-primary);">'
    )
    .replace(/<li>/gi,
      '<li style="margin-bottom:0.6rem;line-height:1.85;color:var(--text-primary);">'
    )
    // Blockquote
    .replace(/<blockquote>/gi,
      '<blockquote style="font-family:\'Noto Sans Devanagari\',sans-serif;border-left:5px solid var(--brand);padding:1rem 1.5rem;background:var(--brand-light);border-radius:0 12px 12px 0;margin:2rem 0;font-size:var(--fs-lg);font-style:italic;font-weight:600;color:var(--text-primary);">'
    )
    // Strong with bold subheadings
    .replace(/<p><strong>(.*?)<\/strong><\/p>/gi,
      '<h3 style="font-family:\'Noto Sans Devanagari\',sans-serif;font-size:var(--fs-xl);font-weight:800;color:var(--text-primary);margin:2rem 0 0.75rem;line-height:1.4;">$1</h3>'
    );
}
