import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "ViralKatta | जळगाव बातम्या", template: "%s | ViralKatta" },
  description: "जळगावच्या सर्व ताज्या बातम्या एकाच ठिकाणी. ViralKatta — आपला विश्वासू मराठी न्यूज पोर्टल.",
  keywords: ["जळगाव", "मराठी बातम्या", "जळगाव न्यूज", "ViralKatta", "Jalgaon News"],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="mr" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Devanagari:wght@300;400;500;600;700;800;900&family=Mukta:wght@300;400;500;600;700;800&family=Baloo+2:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
