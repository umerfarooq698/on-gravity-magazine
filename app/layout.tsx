import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { formatMetaDescription } from "@/lib/meta";

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "700", "900"],
  variable: "--font-serif",
  display: "swap",
  preload: true,
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "600", "700", "900"],
  variable: "--font-sans",
  display: "swap",
  preload: true,
});

const baseUrl = "https://on-gravity-magazine-mu.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg",
    apple: "/icon.svg",
  },
  verification: {
    google: "VcV0eUidkWh__QNSgtV9u1JFISBSvT77M4gCLWjb0As",
  },
  title: {
    default: "On Gravity Magazine | Independent Journalism and Culture",
    template: "%s | On Gravity Magazine",
  },
  description: formatMetaDescription("Explore in-depth reporting across Tech, Celebrity, Life Style, Health, Business, News, and Food on On Gravity Magazine."),
  keywords: ["Magazine", "Blogs", "Tech", "Celebrity", "Lifestyle", "Health", "Business", "News", "Food"],
  robots: {
    index: true,
    follow: true,
    "max-image-preview": "large",
    "max-snippet": -1,
    "max-video-preview": -1,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: baseUrl,
    siteName: "On Gravity Magazine",
    title: "On Gravity Magazine | Independent Journalism and Culture",
    description: formatMetaDescription("Explore in-depth reporting across Tech, Celebrity, Life Style, Health, Business, News, and Food on On Gravity Magazine."),
  },
  twitter: {
    card: "summary_large_image",
    title: "On Gravity Magazine | Independent Journalism and Culture",
    description: formatMetaDescription("Explore in-depth reporting across Tech, Celebrity, Life Style, Health, Business, News, and Food on On Gravity Magazine."),
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "On Gravity Magazine",
    "url": baseUrl,
    "potentialAction": {
      "@type": "SearchAction",
      "target": `${baseUrl}/search?q={search_term_string}`,
      "query-input": "required name=search_term_string"
    }
  };

  const orgJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "On Gravity Magazine",
    "url": baseUrl,
    "logo": `${baseUrl}/icon.svg`,
    "sameAs": []
  };

  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${playfair.variable} ${inter.variable} h-full antialiased`}
    >
      <head>
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/icon.svg" />
        <meta name="google-site-verification" content="VcV0eUidkWh__QNSgtV9u1JFISBSvT77M4gCLWjb0As" />
        <link rel="preconnect" href="https://images.unsplash.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://images.unsplash.com" />
        <link rel="preconnect" href="https://plus.unsplash.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://plus.unsplash.com" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-sans selection:bg-amber-400 selection:text-zinc-950">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Header />
          <main className="flex-1 w-full">{children}</main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
