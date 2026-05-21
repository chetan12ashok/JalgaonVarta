// src/lib/db.ts — All Firestore operations, Firebase imported directly here

import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getFirestore, collection, doc, getDoc, getDocs,
  addDoc, updateDoc, deleteDoc, query, where,
  orderBy, limit, Timestamp, increment,
} from "firebase/firestore";
function createSlug(text: string): string {
  return text.toLowerCase().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-")
    .replace(/-+/g, "-").trim().substring(0, 80) + "-" + Date.now().toString(36);
}

const firebaseConfig = {
  apiKey:            "AIzaSyACapSCl0G6uALstmD7TfADDCNTSnQ_acE",
  authDomain:        "virralkatta.firebaseapp.com",
  projectId:         "virralkatta",
  storageBucket:     "virralkatta.firebasestorage.app",
  messagingSenderId: "410670993063",
  appId:             "1:410670993063:web:f7dfb909c1c155b1f9d582",
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const db  = getFirestore(app);

// ── Types ──────────────────────────────────────────────────────────────────

export interface Article {
  id:            string;
  title:         string;
  slug:          string;
  content:       string;
  excerpt:       string;
  imageUrl:      string | null;
  status:        string;
  originalTitle: string | null;
  sourceUrl:     string | null;
  views:         number;
  publishedAt:   Date | null;
  createdAt:     Date;
  updatedAt:     Date;
  categoryId:    string;
  categoryName:  string;
  categorySlug:  string;
  categoryColor: string;
  sourceId:      string | null;
  sourceName:    string | null;
  category:      { id: string; name: string; slug: string; color: string };
  source?:       { name: string } | null;
}

export interface Category {
  id:          string;
  name:        string;
  slug:        string;
  description: string | null;
  color:       string;
  createdAt:   Date;
}

export interface Source {
  id:           string;
  name:         string;
  type:         string;
  url:          string;
  active:       boolean;
  lastFetched:  Date | null;
  articleCount: number;
  createdAt:    Date;
}

export interface User {
  id:        string;
  email:     string;
  password:  string;
  name:      string;
  role:      string;
  createdAt: Date;
}

// ── Helpers ────────────────────────────────────────────────────────────────

function toDate(ts: any): Date {
  if (!ts) return new Date();
  if (ts?.toDate) return ts.toDate();
  if (ts?.seconds) return new Date(ts.seconds * 1000);
  return new Date(ts);
}

function toArticle(id: string, d: any): Article {
  const cat = { id: d.categoryId || "", name: d.categoryName || "", slug: d.categorySlug || "", color: d.categoryColor || "#FF6B00" };
  return {
    id, ...d,
    imageUrl:      d.imageUrl      ?? null,
    originalTitle: d.originalTitle ?? null,
    sourceUrl:     d.sourceUrl     ?? null,
    sourceId:      d.sourceId      ?? null,
    sourceName:    d.sourceName    ?? null,
    views:         d.views         ?? 0,
    publishedAt:   d.publishedAt   ? toDate(d.publishedAt) : null,
    createdAt:     toDate(d.createdAt),
    updatedAt:     toDate(d.updatedAt),
    category:      cat,
    source:        d.sourceName ? { name: d.sourceName } : null,
  };
}

function toCategory(id: string, d: any): Category {
  return { id, name: d.name || "", slug: d.slug || "", description: d.description ?? null, color: d.color || "#FF6B00", createdAt: toDate(d.createdAt) };
}

function toSource(id: string, d: any): Source {
  return { id, name: d.name || "", type: d.type || "RSS", url: d.url || "", active: d.active ?? true, lastFetched: d.lastFetched ? toDate(d.lastFetched) : null, articleCount: d.articleCount || 0, createdAt: toDate(d.createdAt) };
}

// ── Articles ───────────────────────────────────────────────────────────────

export async function getArticles(opts: {
  status?: string; categoryId?: string; search?: string; page?: number; pageSize?: number;
} = {}): Promise<{ articles: Article[]; total: number }> {
  const { status, categoryId, page = 1, pageSize = 15 } = opts;
  const constraints: any[] = [];
  if (status && status !== "ALL") constraints.push(where("status", "==", status));
  if (categoryId) constraints.push(where("categoryId", "==", categoryId));
  constraints.push(orderBy("createdAt", "desc"));

  const snap = await getDocs(query(collection(db, "articles"), ...constraints));
  let articles = snap.docs.map((d) => toArticle(d.id, d.data()));

  if (opts.search) {
    const q = opts.search.toLowerCase();
    articles = articles.filter((a) => a.title.toLowerCase().includes(q) || a.excerpt.toLowerCase().includes(q));
  }

  const total = articles.length;
  const start = (page - 1) * pageSize;
  return { articles: articles.slice(start, start + pageSize), total };
}

export async function getArticleBySlug(slug: string): Promise<Article | null> {
  const snap = await getDocs(query(collection(db, "articles"), where("slug", "==", slug), limit(1)));
  if (snap.empty) return null;
  return toArticle(snap.docs[0].id, snap.docs[0].data());
}

export async function getArticleById(id: string): Promise<Article | null> {
  const snap = await getDoc(doc(db, "articles", id));
  if (!snap.exists()) return null;
  return toArticle(snap.id, snap.data());
}

export async function createArticle(data: {
  title: string; content: string; excerpt: string; imageUrl?: string | null;
  categoryId: string; sourceId?: string | null; sourceUrl?: string | null;
  originalTitle?: string | null; status?: string;
}): Promise<Article> {
  const cat = await getCategoryById(data.categoryId);
  const now = Timestamp.now();
  const payload = {
    title: data.title, slug: createSlug(data.title),
    content: data.content, excerpt: data.excerpt,
    imageUrl: data.imageUrl ?? null, status: data.status || "PENDING",
    originalTitle: data.originalTitle ?? null, sourceUrl: data.sourceUrl ?? null,
    views: 0,
    publishedAt: data.status === "PUBLISHED" ? now : null,
    createdAt: now, updatedAt: now,
    categoryId: data.categoryId, categoryName: cat?.name || "",
    categorySlug: cat?.slug || "", categoryColor: cat?.color || "#FF6B00",
    sourceId: data.sourceId ?? null, sourceName: null as string | null,
  };
  const ref = await addDoc(collection(db, "articles"), payload);
  return toArticle(ref.id, payload);
}

export async function updateArticle(id: string, data: any): Promise<void> {
  const updates: any = { ...data, updatedAt: Timestamp.now() };
  if (data.categoryId) {
    const cat = await getCategoryById(data.categoryId);
    if (cat) { updates.categoryName = cat.name; updates.categorySlug = cat.slug; updates.categoryColor = cat.color; }
  }
  if (data.status === "PUBLISHED") {
    const ex = await getArticleById(id);
    if (!ex?.publishedAt) updates.publishedAt = Timestamp.now();
  }
  await updateDoc(doc(db, "articles", id), updates);
}

export async function incrementViews(id: string): Promise<void> {
  await updateDoc(doc(db, "articles", id), { views: increment(1) });
}

export async function deleteArticle(id: string): Promise<void> {
  await deleteDoc(doc(db, "articles", id));
}

export async function isSlugDuplicate(originalTitle: string): Promise<boolean> {
  const snap = await getDocs(query(collection(db, "articles"), where("originalTitle", "==", originalTitle), limit(1)));
  return !snap.empty;
}

// ── Categories ─────────────────────────────────────────────────────────────

export async function getCategories(): Promise<Category[]> {
  const snap = await getDocs(query(collection(db, "categories"), orderBy("name")));
  return snap.docs.map((d) => toCategory(d.id, d.data()));
}

export async function getCategoryById(id: string): Promise<Category | null> {
  const snap = await getDoc(doc(db, "categories", id));
  if (!snap.exists()) return null;
  return toCategory(snap.id, snap.data());
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  const snap = await getDocs(query(collection(db, "categories"), where("slug", "==", slug), limit(1)));
  if (snap.empty) return null;
  return toCategory(snap.docs[0].id, snap.docs[0].data());
}

export async function createCategory(data: { name: string; slug: string; description?: string; color?: string }): Promise<Category> {
  const payload = { ...data, description: data.description ?? null, color: data.color || "#FF6B00", createdAt: Timestamp.now() };
  const ref = await addDoc(collection(db, "categories"), payload);
  return toCategory(ref.id, payload);
}

// ── Sources ────────────────────────────────────────────────────────────────

export async function getSources(): Promise<Source[]> {
  const snap = await getDocs(query(collection(db, "sources"), orderBy("createdAt", "desc")));
  return snap.docs.map((d) => toSource(d.id, d.data()));
}

export async function getActiveSources(): Promise<Source[]> {
  const snap = await getDocs(query(collection(db, "sources"), where("active", "==", true)));
  return snap.docs.map((d) => toSource(d.id, d.data()));
}

export async function getSourceById(id: string): Promise<Source | null> {
  const snap = await getDoc(doc(db, "sources", id));
  if (!snap.exists()) return null;
  return toSource(snap.id, snap.data());
}

export async function createSource(data: { name: string; type: string; url: string }): Promise<Source> {
  const payload = { ...data, active: true, lastFetched: null, articleCount: 0, createdAt: Timestamp.now() };
  const ref = await addDoc(collection(db, "sources"), payload);
  return toSource(ref.id, payload);
}

export async function updateSource(id: string, data: any): Promise<void> {
  await updateDoc(doc(db, "sources", id), data);
}

export async function deleteSource(id: string): Promise<void> {
  await deleteDoc(doc(db, "sources", id));
}

// ── Users (NextAuth) ───────────────────────────────────────────────────────

export async function getUserByEmail(email: string): Promise<User | null> {
  const snap = await getDocs(query(collection(db, "users"), where("email", "==", email), limit(1)));
  if (snap.empty) return null;
  const d = snap.docs[0];
  return { id: d.id, ...d.data(), createdAt: toDate(d.data().createdAt) } as User;
}

export async function createUser(data: { email: string; password: string; name: string; role?: string }): Promise<User> {
  const payload = { ...data, role: data.role || "ADMIN", createdAt: Timestamp.now() };
  const ref = await addDoc(collection(db, "users"), payload);
  return { id: ref.id, ...payload, createdAt: new Date() };
}

// ── Dashboard stats ────────────────────────────────────────────────────────

export async function getDashboardStats() {
  const [pub, pen, rej, src] = await Promise.all([
    getDocs(query(collection(db, "articles"), where("status", "==", "PUBLISHED"))),
    getDocs(query(collection(db, "articles"), where("status", "==", "PENDING"))),
    getDocs(query(collection(db, "articles"), where("status", "==", "REJECTED"))),
    getDocs(query(collection(db, "sources"),  where("active",  "==", true))),
  ]);
  return { totalPublished: pub.size, totalPending: pen.size, totalRejected: rej.size, totalSources: src.size };
}