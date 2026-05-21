// prisma/seed.js
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding ViralKatta database...");

  // Create admin user
  const hashedPassword = await bcrypt.hash("viralkatta@admin", 10);
  const admin = await prisma.user.upsert({
    where: { email: "admin@viralkatta.com" },
    update: {},
    create: {
      email: "admin@viralkatta.com",
      password: hashedPassword,
      name: "Admin",
      role: "ADMIN",
    },
  });
  console.log("✅ Admin user created:", admin.email);

  // Create categories
  const categories = [
    { name: "जळगाव शहर", slug: "jalgaon-shahar", color: "#FF6B00", description: "जळगाव शहरातील बातम्या" },
    { name: "राजकारण", slug: "rajkaran", color: "#E53E3E", description: "राजकीय बातम्या" },
    { name: "क्रीडा", slug: "krida", color: "#38A169", description: "खेळाच्या बातम्या" },
    { name: "व्यापार", slug: "vyapar", color: "#3182CE", description: "व्यापार आणि उद्योग" },
    { name: "शिक्षण", slug: "shikshan", color: "#805AD5", description: "शिक्षण बातम्या" },
    { name: "मनोरंजन", slug: "manoranjan", color: "#DD6B20", description: "मनोरंजन जगत" },
    { name: "गुन्हेगारी", slug: "gunhegari", color: "#C53030", description: "गुन्हेगारी बातम्या" },
    { name: "कृषी", slug: "krushi", color: "#276749", description: "शेती बातम्या" },
  ];

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
  }
  console.log("✅ Categories created:", categories.length);

  // Create news sources
  const sources = [
    { name: "LiveTrends News", type: "WORDPRESS", url: "https://livetrends.news/wp-json/wp/v2/posts", active: true },
    { name: "Jalgaon Today", type: "RSS", url: "https://jalgaontoday.com/feed/", active: false },
    { name: "Jalgaon Mirror", type: "SCRAPER", url: "https://jalgaonmirror.com/", active: false },
  ];

  for (const src of sources) {
    await prisma.source.upsert({
      where: { id: src.name.toLowerCase().replace(/ /g, "-") },
      update: {},
      create: { ...src, id: src.name.toLowerCase().replace(/ /g, "-") },
    });
  }
  console.log("✅ Sources created");

  // Sample articles
  const jalgaonCat = await prisma.category.findUnique({ where: { slug: "jalgaon-shahar" } });
  const rajkaranCat = await prisma.category.findUnique({ where: { slug: "rajkaran" } });
  const kridaCat = await prisma.category.findUnique({ where: { slug: "krida" } });
  const source = await prisma.source.findFirst();

  const sampleArticles = [
    {
      title: "जळगाव: महापालिकेच्या नव्या योजनेमुळे शहरातील रस्त्यांचे रूप पालटणार",
      slug: "jalgaon-mahapalika-navi-yojana-raste",
      excerpt: "जळगाव महापालिकेने शहरातील प्रमुख रस्त्यांच्या विकासासाठी ५० कोटी रुपयांची नवीन योजना जाहीर केली आहे.",
      content: `<p>जळगाव महापालिकेने शहरातील प्रमुख रस्त्यांच्या विकासासाठी ५० कोटी रुपयांची नवीन योजना जाहीर केली आहे. या योजनेअंतर्गत शहरातील ३० किलोमीटरचे रस्ते नव्याने बांधण्यात येणार आहेत.</p><p>महापालिका आयुक्तांनी सांगितले की, ही योजना पुढील सहा महिन्यांत पूर्ण करण्याचे उद्दिष्ट आहे. पावसाळ्यापूर्वी मुख्य रस्त्यांची दुरुस्ती करण्याला प्राधान्य दिले जाणार आहे.</p>`,
      status: "PUBLISHED",
      categoryId: jalgaonCat.id,
      sourceId: source?.id,
      publishedAt: new Date(),
      views: 245,
    },
    {
      title: "जळगाव जिल्ह्यात उन्हाच्या झळांनी नागरिक त्रस्त; तापमान ४४ अंशांवर",
      slug: "jalgaon-unhache-jhala-tapman-44",
      excerpt: "जळगाव जिल्ह्यात उन्हाळ्याची तीव्रता वाढत असून तापमान ४४ अंश सेल्सियसवर पोहोचले आहे.",
      content: `<p>जळगाव जिल्ह्यात उन्हाळ्याची तीव्रता वाढत असून तापमान ४४ अंश सेल्सियसवर पोहोचले आहे. जिल्हा आरोग्य विभागाने नागरिकांना दुपारी बाहेर न पडण्याचे आवाहन केले आहे.</p>`,
      status: "PUBLISHED",
      categoryId: jalgaonCat.id,
      sourceId: source?.id,
      publishedAt: new Date(),
      views: 189,
    },
    {
      title: "जळगाव लोकसभा मतदारसंघात निवडणुकीची रणधुमाळी; उमेदवारांची जोरदार तयारी",
      slug: "jalgaon-loksabha-nivadnuk-tayari",
      excerpt: "जळगाव लोकसभा मतदारसंघात आगामी निवडणुकीसाठी सर्व पक्षांनी जोरदार तयारी सुरू केली आहे.",
      content: `<p>जळगाव लोकसभा मतदारसंघात आगामी निवडणुकीसाठी सर्व पक्षांनी जोरदार तयारी सुरू केली आहे. भाजप, काँग्रेस आणि राष्ट्रवादी काँग्रेसने आपापले उमेदवार निश्चित केले असून प्रचार मोहीम तीव्र झाली आहे.</p>`,
      status: "PENDING",
      categoryId: rajkaranCat.id,
      sourceId: source?.id,
      views: 0,
    },
    {
      title: "जळगावच्या युवा क्रिकेटपटूची राज्य संघात निवड; शहरात आनंदोत्सव",
      slug: "jalgaon-yuva-cricket-rajya-sangh",
      excerpt: "जळगावच्या १८ वर्षीय युवा क्रिकेटपटू राहुल पाटलाची महाराष्ट्र राज्य अंडर-१९ संघात निवड झाली आहे.",
      content: `<p>जळगावच्या १८ वर्षीय युवा क्रिकेटपटू राहुल पाटलाची महाराष्ट्र राज्य अंडर-१९ संघात निवड झाली आहे. या निवडीने जळगावकरांमध्ये आनंदाचे वातावरण आहे.</p>`,
      status: "PENDING",
      categoryId: kridaCat.id,
      sourceId: source?.id,
      views: 0,
    },
  ];

  for (const article of sampleArticles) {
    await prisma.article.upsert({
      where: { slug: article.slug },
      update: {},
      create: article,
    });
  }
  console.log("✅ Sample articles created:", sampleArticles.length);

  console.log("\n🎉 Seeding complete!");
  console.log("📧 Admin Email: admin@viralkatta.com");
  console.log("🔑 Admin Password: viralkatta@admin");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
