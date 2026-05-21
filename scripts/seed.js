// scripts/seed.js — Seeds Firestore with initial ViralKatta data
const { initializeApp, getApps } = require("firebase/app");
const { getFirestore, collection, addDoc, getDocs, query, where, Timestamp } = require("firebase/firestore");
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

async function exists(col, field, value) {
  const snap = await getDocs(query(collection(db, col), where(field, "==", value)));
  return !snap.empty;
}

async function seed() {
  console.log("🌱 Seeding ViralKatta Firestore...\n");

  // Admin user
  if (await exists("users", "email", "admin@viralkatta.com")) {
    console.log("⏭️  Admin already exists");
  } else {
    const hashed = await bcrypt.hash("viralkatta@admin", 10);
    await addDoc(collection(db, "users"), {
      email: "admin@viralkatta.com", password: hashed,
      name: "Admin", role: "ADMIN", createdAt: Timestamp.now(),
    });
    console.log("✅ Admin user created");
  }

  // Categories
  const cats = [
    { name: "जळगाव शहर", slug: "jalgaon-shahar", color: "#FF6B00", description: "जळगाव शहरातील बातम्या" },
    { name: "राजकारण",   slug: "rajkaran",        color: "#E53E3E", description: "राजकीय बातम्या" },
    { name: "क्रीडा",    slug: "krida",            color: "#38A169", description: "खेळाच्या बातम्या" },
    { name: "व्यापार",   slug: "vyapar",           color: "#3182CE", description: "व्यापार आणि उद्योग" },
    { name: "शिक्षण",    slug: "shikshan",         color: "#805AD5", description: "शिक्षण बातम्या" },
    { name: "मनोरंजन",   slug: "manoranjan",       color: "#DD6B20", description: "मनोरंजन जगत" },
    { name: "गुन्हेगारी",slug: "gunhegari",        color: "#C53030", description: "गुन्हेगारी बातम्या" },
    { name: "कृषी",      slug: "krushi",           color: "#276749", description: "शेती बातम्या" },
  ];

  const catIds = {};
  for (const cat of cats) {
    if (await exists("categories", "slug", cat.slug)) {
      const snap = await getDocs(query(collection(db, "categories"), where("slug", "==", cat.slug)));
      catIds[cat.slug] = snap.docs[0].id;
      console.log(`⏭️  Category exists: ${cat.name}`);
    } else {
      const ref = await addDoc(collection(db, "categories"), { ...cat, createdAt: Timestamp.now() });
      catIds[cat.slug] = ref.id;
      console.log(`✅ Category: ${cat.name}`);
    }
  }

  // Sources
  const sources = [
    { name: "LiveTrends News", type: "WORDPRESS", url: "https://livetrends.news/wp-json/wp/v2/posts", active: true },
    { name: "Jalgaon Today",   type: "RSS",       url: "https://jalgaontoday.com/feed/",              active: false },
  ];
  for (const src of sources) {
    if (await exists("sources", "name", src.name)) {
      console.log(`⏭️  Source exists: ${src.name}`);
    } else {
      await addDoc(collection(db, "sources"), { ...src, articleCount: 0, lastFetched: null, createdAt: Timestamp.now() });
      console.log(`✅ Source: ${src.name}`);
    }
  }

  // Sample article
  const sampleTitle = "जळगाव: महापालिकेच्या नव्या योजनेमुळे शहरातील रस्त्यांचे रूप पालटणार";
  if (await exists("articles", "originalTitle", sampleTitle)) {
    console.log("⏭️  Sample article exists");
  } else {
    const now = Timestamp.now();
    await addDoc(collection(db, "articles"), {
      title:         sampleTitle,
      slug:          "jalgaon-mahapalika-navi-yojana-" + Date.now().toString(36),
      excerpt:       "जळगाव महापालिकेने शहरातील प्रमुख रस्त्यांच्या विकासासाठी ५० कोटी रुपयांची नवीन योजना जाहीर केली आहे.",
      content:       "<p>जळगाव महापालिकेने शहरातील प्रमुख रस्त्यांच्या विकासासाठी ५० कोटी रुपयांची नवीन योजना जाहीर केली आहे.</p>",
      status:        "PUBLISHED",
      originalTitle: sampleTitle,
      sourceUrl:     null,
      imageUrl:      null,
      views:         0,
      publishedAt:   now,
      createdAt:     now,
      updatedAt:     now,
      categoryId:    catIds["jalgaon-shahar"],
      categoryName:  "जळगाव शहर",
      categorySlug:  "jalgaon-shahar",
      categoryColor: "#FF6B00",
      sourceId:      null,
      sourceName:    null,
    });
    console.log("✅ Sample article created");
  }

  console.log("\n🎉 Done!");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("  Email:    admin@viralkatta.com");
  console.log("  Password: viralkatta@admin");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
  process.exit(0);
}

seed().catch((e) => { console.error("❌ Error:", e.message); process.exit(1); });
