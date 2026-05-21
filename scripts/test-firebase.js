// scripts/test-firebase.js
const { initializeApp, getApps } = require("firebase/app");
const { getFirestore, collection, addDoc, getDocs, Timestamp } = require("firebase/firestore");

// Config hardcoded — no env vars needed for Node.js scripts
const firebaseConfig = {
  apiKey:            "AIzaSyACapSCl0G6uALstmD7TfADDCNTSnQ_acE",
  authDomain:        "virralkatta.firebaseapp.com",
  projectId:         "virralkatta",
  storageBucket:     "virralkatta.firebasestorage.app",
  messagingSenderId: "410670993063",
  appId:             "1:410670993063:web:f7dfb909c1c155b1f9d582",
};

console.log("\n🔍 Firebase config:");
console.log("  projectId:", firebaseConfig.projectId);

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
const db  = getFirestore(app);
console.log("✅ Firebase initialized\n");

console.log("📖 Testing READ...");
getDocs(collection(db, "_test"))
  .then((snap) => {
    console.log("✅ READ works! Docs in _test:", snap.size);
    return tryWrite();
  })
  .catch((err) => {
    console.log("❌ READ failed:", err.code, "-", err.message);
    console.log("\n💡 Fix:");
    console.log("   Firebase Console → Firestore Database → Rules → set allow read, write: if true → Publish");
    process.exit(1);
  });

async function tryWrite() {
  console.log("✍️  Testing WRITE...");
  try {
    const ref = await addDoc(collection(db, "_test"), {
      msg: "ViralKatta test", createdAt: Timestamp.now(),
    });
    console.log("✅ WRITE works! Doc ID:", ref.id);
    console.log("\n🎉 Firestore fully working! Now run: node scripts/seed.js\n");
  } catch(err) {
    console.log("❌ WRITE failed:", err.code, "-", err.message);
  }
  process.exit(0);
}
