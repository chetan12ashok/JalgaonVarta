"use client";

import Image from "next/image";
import Link from "next/link";

interface Short {
  id: string;
  slug: string;
  title: string;
  shortNews: string;
  imageUrl: string | null;
  categoryName: string;
  categorySlug: string;
  categoryColor: string;
  views: number;
  publishedAt: string;
}

const MR = "'Noto Sans Devanagari','Mukta',sans-serif";

function timeAgo(iso: string) {
  const diff = new Date().getTime() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  const h = Math.floor(m / 60);
  const d = Math.floor(h / 24);
  if (m < 1) return "आत्ताच";
  if (m < 60) return `${m} मि.`;
  if (h < 24) return `${h} तास`;
  return `${d} दिवस`;
}

export default function ShortsClient({ shorts }: { shorts: Short[] }) {
  function handleShare(a: Short) {
    const url = `${window.location.origin}/article/${a.slug}`;
    if (navigator.share) navigator.share({ title: a.title, url });
    else navigator.clipboard.writeText(url);
  }

  return (
    <div style={{
      height: "100vh",
      overflowY: "scroll",
      scrollSnapType: "y mandatory",
      background: "#000",
    }}>
      {shorts.map((a, index) => (
        <section key={a.id} style={{
          height: "100vh",
          position: "relative",
          scrollSnapAlign: "start",
          overflow: "hidden",
          background: "#000",
        }}>
          {/* BLUR BACKGROUND */}
          {a.imageUrl && (
            <Image
              src={a.imageUrl}
              alt={a.title}
              fill
              priority={index === 0}
              style={{
                objectFit: "cover",
                filter: "blur(35px)",
                transform: "scale(1.2)",
                opacity: 0.25,
              }}
            />
          )}

          {/* MAIN IMAGE — full 16:9, no crop */}
          {a.imageUrl && (
            <div style={{
              position: "absolute",
              top: 110,
              left: 16,
              right: 16,
              height: "42%",
              zIndex: 2,
              borderRadius: 24,
              overflow: "hidden",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "#111",
              boxShadow: "0 10px 30px rgba(0,0,0,0.35)",
            }}>
              <Image
                src={a.imageUrl}
                alt={a.title}
                fill
                priority={index === 0}
                style={{ objectFit: "contain", objectPosition: "center" }}
              />
            </div>
          )}

          {/* DARK OVERLAY */}
          <div style={{
            position: "absolute",
            inset: 0,
            zIndex: 3,
            background: "linear-gradient(to top, rgba(0,0,0,0.95) 8%, rgba(0,0,0,0.08) 45%, rgba(0,0,0,0.35) 100%)",
          }} />

          {/* TOP BAR */}
          <div style={{
            position: "absolute",
            top: 0, left: 0, right: 0,
            zIndex: 20,
            padding: "14px 16px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}>
            <Link href="/" style={{ display:"flex", alignItems:"center", gap:10, textDecoration:"none" }}>
              <div style={{
                width: 58, height: 58, borderRadius: 18,
                background: "#fff",
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: "0 10px 24px rgba(232,66,10,0.35)",
                overflow: "hidden",
              }}>
                <img src="/viral-katta-square.png" alt="ViralKatta" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
              </div>
              <div>
                <div style={{ color:"#fff", fontWeight:900, fontSize:18, lineHeight:1 }}>ViralKatta</div>
                <div style={{ color:"rgba(255,255,255,0.6)", fontSize:12, marginTop:4, fontFamily:MR }}>Shorts</div>
              </div>
            </Link>
            <div style={{ color:"#fff", fontWeight:900, fontSize:18 }}>
              {index + 1}/{shorts.length}
            </div>
          </div>

          {/* BOTTOM CONTENT */}
          <div style={{
            position: "absolute",
            left: 0, right: 0, bottom: 0,
            zIndex: 20,
            padding: "0 16px 24px",
            display: "flex",
            flexDirection: "column",
            gap: 12,
          }}>
            {/* CATEGORY */}
            <div>
              <span style={{
                display: "inline-flex", alignItems: "center",
                background: a.categoryColor, color: "#fff",
                padding: "7px 14px", borderRadius: 999,
                fontSize: 13, fontWeight: 800, fontFamily: MR,
              }}>{a.categoryName}</span>
            </div>

            {/* TITLE */}
            <h2 style={{
              margin: 0, color: "#fff",
              fontFamily: MR, fontWeight: 900,
              fontSize: "clamp(18px,5vw,28px)",
              lineHeight: 1.25,
              textShadow: "0 3px 10px rgba(0,0,0,0.65)",
            }}>{a.title}</h2>

            {/* SHORT NEWS — 60 words from Firestore */}
            <div style={{
              background: "rgba(0,0,0,0.45)",
              backdropFilter: "blur(12px)",
              WebkitBackdropFilter: "blur(12px)",
              borderRadius: 18, padding: "12px 14px",
              border: "1px solid rgba(255,255,255,0.06)",
            }}>
              <p style={{
                margin: 0, color: "rgba(255,255,255,0.92)",
                fontFamily: MR, fontSize: 14, lineHeight: 1.6,
              }}>{a.shortNews}</p>
            </div>

            {/* BUTTONS */}
            <div style={{ display:"flex", gap:12, alignItems:"center" }}>
              <Link href={`/article/${a.slug}`} style={{
                flex: 1, height: 52, borderRadius: 18,
                background: "linear-gradient(135deg,#FF5A1F,#E8420A)",
                color: "#fff", textDecoration: "none",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontWeight: 900, fontSize: 15, fontFamily: MR,
                boxShadow: "0 10px 24px rgba(232,66,10,0.35)",
              }}>📰 पूर्ण बातमी वाचा</Link>

              <button
                onClick={() => handleShare(a)}
                style={{
                  width: 52, height: 52, borderRadius: 18,
                  border: "1px solid rgba(255,255,255,0.12)",
                  background: "rgba(255,255,255,0.08)",
                  backdropFilter: "blur(12px)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "#fff", cursor: "pointer",
                }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
                  <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
                  <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
                </svg>
              </button>
            </div>

            {/* META */}
            <div style={{ display:"flex", gap:16, marginTop:2 }}>
              <span style={{ color:"rgba(255,255,255,0.55)", fontSize:13, fontFamily:MR }}>
                🕐 {timeAgo(a.publishedAt)}
              </span>
              <span style={{ color:"rgba(255,255,255,0.55)", fontSize:13, fontFamily:MR }}>
                👁 {a.views} वाचन
              </span>
            </div>
          </div>
        </section>
      ))}

      <style>{`
        html, body { margin:0; padding:0; overflow:hidden; background:#000; }
        * { box-sizing:border-box; scrollbar-width:none; -ms-overflow-style:none; }
        *::-webkit-scrollbar { display:none; }
      `}</style>
    </div>
  );
}
