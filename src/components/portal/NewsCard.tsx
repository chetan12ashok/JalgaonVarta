"use client";
import Link from "next/link";
import Image from "next/image";

function timeAgo(date: Date | string | null): string {
  if (!date) return "";
  const diffMs    = new Date().getTime() - new Date(date).getTime();
  const diffMins  = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays  = Math.floor(diffHours / 24);
  if (diffMins  < 1)  return "आत्ताच";
  if (diffMins  < 60) return `${diffMins} मि. पूर्वी`;
  if (diffHours < 24) return `${diffHours} तास पूर्वी`;
  if (diffDays  < 7)  return `${diffDays} दिवस पूर्वी`;
  return new Intl.DateTimeFormat("mr-IN", { day: "numeric", month: "short" }).format(new Date(date));
}

interface Article {
  id: string; title: string; slug: string; excerpt: string;
  imageUrl?: string | null; publishedAt?: Date | null; views: number;
  categoryName: string; categorySlug: string; categoryColor: string;
  category?: { name: string; slug: string; color: string };
}

interface Props { article: Article; variant?: "featured" | "horizontal" | "compact" | "default" | "list"; }

const MR = "'Noto Sans Devanagari','Mukta',sans-serif";
const THUMBNAIL_RATIO = "3/2";

// Plain span — NOT a Link, since the whole card is already a Link
function CatBadge({ name, color }: { name: string; color: string }) {
  return (
    <span style={{
      display: "inline-block", padding: "3px 10px", borderRadius: "5px",
      fontSize: "11px", fontWeight: 700, color: "#fff",
      background: color, fontFamily: MR, letterSpacing: "0.2px", lineHeight: "1.6",
    }}>
      {name}
    </span>
  );
}

export default function NewsCard({ article, variant = "default" }: Props) {
  const catName  = article.categoryName || article.category?.name  || "";
  const catSlug  = article.categorySlug || article.category?.slug  || "";
  const catColor = article.categoryColor || article.category?.color || "#E8420A";
  const ago      = timeAgo(article.publishedAt || null);
  const href     = `/article/${article.slug}`;

  /* ── Featured ── */
  if (variant === "featured") return (
    <Link href={href} className="group block relative rounded-2xl overflow-hidden bg-gray-900" style={{ aspectRatio:THUMBNAIL_RATIO }}>
      {article.imageUrl
        ? <Image src={article.imageUrl} alt={article.title} fill className="object-contain" />
        : <div className="absolute inset-0" style={{ background:`linear-gradient(135deg,${catColor}88,${catColor})` }} />
      }
      <div className="absolute inset-0" style={{ background:"linear-gradient(to top,rgba(0,0,0,0.88) 0%,rgba(0,0,0,0.3) 55%,transparent 100%)" }} />
      <div className="absolute bottom-0 left-0 right-0 p-5 md:p-7">
        <div className="mb-2"><CatBadge name={catName} color={catColor} /></div>
        <h2 style={{ fontFamily:MR, fontSize:"clamp(1.1rem,2.5vw,1.6rem)", fontWeight:800, lineHeight:1.35, color:"#fff", textShadow:"0 2px 10px rgba(0,0,0,0.8)", marginBottom:10 }}
          className="line-clamp-3">
          {article.title}
        </h2>
        <div style={{ display:"flex", alignItems:"center", gap:12, color:"rgba(255,255,255,0.75)", fontSize:12, fontFamily:MR }}>
          <span>{ago}</span><span>·</span><span>👁 {article.views}</span>
        </div>
      </div>
    </Link>
  );

  /* ── Horizontal ── */
  if (variant === "horizontal") return (
    <Link href={href} className="vk-card group flex gap-3 p-3">
      <div className="relative flex-shrink-0 rounded-lg overflow-hidden bg-black" style={{ width:108, aspectRatio:THUMBNAIL_RATIO }}>
        {article.imageUrl
          ? <Image src={article.imageUrl} alt={article.title} fill className="object-contain" />
          : <div className="w-full h-full" style={{ background:`linear-gradient(135deg,${catColor}55,${catColor}99)` }} />
        }
      </div>
      <div className="flex-1 min-w-0">
        <div className="mb-1"><CatBadge name={catName} color={catColor} /></div>
        <h3 style={{ fontFamily:MR, fontWeight:700, fontSize:13, lineHeight:1.45, color:"var(--text-primary)" }} className="line-clamp-2">
          {article.title}
        </h3>
        <p style={{ fontSize:11, color:"var(--text-light)", marginTop:3, fontFamily:MR }}>{ago}</p>
      </div>
    </Link>
  );

  /* ── Compact ── */
  if (variant === "compact") return (
    <Link href={href} className="group flex items-start gap-3 py-3" style={{ borderBottom:"1px solid var(--border)" }}>
      <span className="w-2 h-2 rounded-full mt-2 flex-shrink-0" style={{ background:catColor }} />
      <div className="flex-1 min-w-0">
        <h3 style={{ fontFamily:MR, fontWeight:600, fontSize:"var(--fs-sm)", lineHeight:1.5, color:"var(--text-primary)" }}
          className="line-clamp-2 group-hover:text-orange-600 transition-colors">
          {article.title}
        </h3>
        <p style={{ fontSize:11, color:"var(--text-light)", marginTop:2, fontFamily:MR }}>{ago}</p>
      </div>
    </Link>
  );

  /* ── List ── */
  if (variant === "list") return (
    <Link href={href} className="vk-card group flex gap-4 p-4">
      {article.imageUrl && (
        <div className="relative flex-shrink-0 rounded-lg overflow-hidden bg-black" style={{ width:144, aspectRatio:THUMBNAIL_RATIO }}>
          <Image src={article.imageUrl} alt={article.title} fill className="object-contain" />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <div className="mb-2"><CatBadge name={catName} color={catColor} /></div>
        <h3 style={{ fontFamily:MR, fontWeight:700, fontSize:"var(--fs-md)", lineHeight:1.4, color:"var(--text-primary)" }}
          className="line-clamp-2 mb-1 group-hover:text-orange-600 transition-colors">
          {article.title}
        </h3>
        <p style={{ fontSize:"var(--fs-sm)", color:"var(--text-secondary)", fontFamily:MR }} className="line-clamp-2 mb-2">
          {article.excerpt}
        </p>
        <p style={{ fontSize:11, color:"var(--text-light)", fontFamily:MR }}>{ago} · 👁 {article.views}</p>
      </div>
    </Link>
  );

  /* ── Default card ── */
  return (
    <Link href={href} className="vk-card group block">
      <div className="relative overflow-hidden bg-black" style={{ aspectRatio:THUMBNAIL_RATIO }}>
        {article.imageUrl
          ? <Image src={article.imageUrl} alt={article.title} fill className="object-contain" />
          : <div className="w-full h-full flex items-center justify-center" style={{ background:`linear-gradient(135deg,${catColor}33,${catColor}66)` }}>
              <span className="text-4xl opacity-40">📰</span>
            </div>
        }
      </div>
      <div className="p-3">
        <div className="mb-2"><CatBadge name={catName} color={catColor} /></div>
        <h3 style={{ fontFamily:MR, fontWeight:700, fontSize:"var(--fs-md)", lineHeight:1.45, color:"var(--text-primary)", marginBottom:6,
          display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical" as any, overflow:"hidden" }}>
          {article.title}
        </h3>
        <p style={{ fontSize:"var(--fs-sm)", color:"var(--text-secondary)", fontFamily:MR,
          display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical" as any, overflow:"hidden", marginBottom:8 }}>
          {article.excerpt}
        </p>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <span style={{ fontSize:11, color:"var(--text-light)", fontFamily:MR }}>{ago}</span>
          <span style={{ fontSize:11, color:"var(--text-light)", fontFamily:MR }}>👁 {article.views}</span>
        </div>
      </div>
    </Link>
  );
}
