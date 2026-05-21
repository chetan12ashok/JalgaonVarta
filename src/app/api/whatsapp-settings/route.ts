import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyACapSCl0G6uALstmD7TfADDCNTSnQ_acE",
  authDomain: "virralkatta.firebaseapp.com",
  projectId: "virralkatta",
  storageBucket: "virralkatta.firebasestorage.app",
  messagingSenderId: "410670993063",
  appId: "1:410670993063:web:f7dfb909c1c155b1f9d582",
};
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const db  = getFirestore(app);

export async function GET() {
  try {
    const snap = await getDoc(doc(db, "settings", "whatsapp"));
    if (!snap.exists()) return NextResponse.json({ groupLink: "", siteUrl: "https://viralkatta.com" });
    return NextResponse.json(snap.data());
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const { groupLink, siteUrl } = await req.json();
    await setDoc(doc(db, "settings", "whatsapp"), {
      groupLink: groupLink || "",
      siteUrl:   siteUrl   || "https://viralkatta.com",
      updatedAt: new Date().toISOString(),
    });
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
