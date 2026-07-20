import Link from "next/link";

const CATS = [
  ["जळगाव शहर", "jalgaon-shahar"], ["राजकारण", "rajkaran"],
  ["क्रीडा", "krida"], ["व्यापार", "vyapar"],
  ["कृषी", "krushi"], ["मनोरंजन", "manoranjan"],
];

export default function Footer() {
  return (
    <footer style={{ background: "#050505", color: "#ccc", fontFamily: "'Noto Sans Devanagari', sans-serif", borderTop: "4px solid #FFD735" }} className="mt-12">
      <div className="max-w-7xl mx-auto px-4 pt-12 pb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <img src="/viral-katta-landscape.png" alt="ViralKatta" style={{ width: 240, height: 86, objectFit: "contain", objectPosition: "left center" }} />
            </div>
            <p className="text-sm leading-relaxed text-gray-400">
              जळगावच्या ताज्या बातम्या सर्वात आधी. ViralKatta हे जळगाव जिल्ह्यातील विश्वासार्ह मराठी न्यूज पोर्टल आहे.
            </p>
          </div>

          {/* Categories */}
          <div>
            <h4 className="font-bold text-white mb-4 text-sm">विभाग</h4>
            <ul className="space-y-2 text-sm">
              {CATS.map(([name, slug]) => (
                <li key={slug}>
                  <Link href={`/category/${slug}`} className="text-gray-400 hover:text-yellow-300 transition-colors">
                    {name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-bold text-white mb-4 text-sm">माहिती</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/about"   className="text-gray-400 hover:text-yellow-300 transition-colors">आमच्याबद्दल</Link></li>
              <li><Link href="/contact" className="text-gray-400 hover:text-yellow-300 transition-colors">संपर्क</Link></li>
              <li><Link href="/privacy" className="text-gray-400 hover:text-yellow-300 transition-colors">Privacy Policy</Link></li>
              <li><Link href="/admin"   className="text-gray-400 hover:text-yellow-300 transition-colors">Admin Panel</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-800 pt-5 flex flex-col md:flex-row justify-between items-center gap-2 text-xs text-gray-500">
          <span>© 2026 ViralKatta. सर्व हक्क राखीव.</span>
          <span>Made with ❤️ for Jalgaon</span>
        </div>
      </div>
    </footer>
  );
}
