// scripts/check-user.js — Check if admin user exists in Firestore
const { initializeApp, getApps } = require("firebase/app");
const { getFirestore, collection, getDocs, query, where } = require("firebase/firestore");
const bcrypt = require("bcryptjs");

const firebaseConfig = {
  apiKey:            "AIzaSyACapSCl0G6uALstmD7TfADDCNTSnQ_acE",
  authDomain:        "virralkatta.firebaseapp.com",
  projectId:         "virralkatta",
  storageBucket:     "virralkatta.firebasestorage.app",
  messagingSenderId: "410670993063",
  appId:             "1:410670993063:web:f7dfb909c1c155b1f9d582",
};

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
const db  = getFirestore(app);

async function check() {
  console.log("\n🔍 Checking admin user in Firestore...\n");

  // 1. List all users
  const allUsers = await getDocs(collection(db, "users"));
  console.log(`Total users in Firestore: ${allUsers.size}`);
  allUsers.forEach((d) => {
    const data = d.data();
    console.log(`  - ID: ${d.id}`);
    console.log(`    Email: ${data.email}`);
    console.log(`    Name:  ${data.name}`);
    console.log(`    Role:  ${data.role}`);
    console.log(`    Has password: ${!!data.password}`);
  });

  // 2. Query by email
  console.log("\n🔍 Querying by email: admin@viralkatta.com");
  const snap = await getDocs(query(collection(db, "users"), where("email", "==", "admin@viralkatta.com")));
  
  if (snap.empty) {
    console.log("❌ User NOT found! Run: node scripts/seed.js");
    process.exit(1);
  }

  const user = snap.docs[0].data();
  console.log("✅ User found!");

  // 3. Test password
  console.log("\n🔍 Testing password: viralkatta@admin");
  const valid = await bcrypt.compare("viralkatta@admin", user.password);
  console.log(valid ? "✅ Password is correct!" : "❌ Password mismatch!");

  if (!valid) {
    console.log("\n🔧 Fixing password...");
    const { updateDoc, doc } = require("firebase/firestore");
    const hashed = await bcrypt.hash("viralkatta@admin", 10);
    await updateDoc(doc(db, "users", snap.docs[0].id), { password: hashed });
    console.log("✅ Password reset to: viralkatta@admin");
  }

  console.log("\n✅ All good! Try logging in again.\n");
  process.exit(0);
}

check().catch((e) => { console.error("❌", e.message); process.exit(1); });