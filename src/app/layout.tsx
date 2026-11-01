import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { site } from "@/data/site";
import SmoothScroll from "@/components/providers/SmoothScroll";
import Cursor from "@/components/ui/Cursor";

const bricolage = localFont({
  src: "../fonts/bricolage-grotesque-latin-standard-normal.woff2",
  variable: "--font-bricolage",
  weight: "200 800",
  display: "swap",
});

const plex = localFont({
  src: [
    { path: "../fonts/ibm-plex-sans-latin-400-normal.woff2", weight: "400" },
    { path: "../fonts/ibm-plex-sans-latin-500-normal.woff2", weight: "500" },
    { path: "../fonts/ibm-plex-sans-latin-600-normal.woff2", weight: "600" },
  ],
  variable: "--font-plex",
  display: "swap",
});

const plexMono = localFont({
  src: [
    { path: "../fonts/ibm-plex-mono-latin-400-normal.woff2", weight: "400" },
    { path: "../fonts/ibm-plex-mono-latin-500-normal.woff2", weight: "500" },
  ],
  variable: "--font-plex-mono",
  display: "swap",
});

const title = `${site.name} — ${site.roles.join(" | ")}`;
const description = `${site.name} is an MCA student specialising in Cloud Computing in ${site.location}, working across AWS, DevOps automation and full stack development.`;

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: title, template: `%s — ${site.name}` },
  description,
  keywords: [
    site.name,
    "Cloud Engineer",
    "DevOps",
    "AWS",
    "Full Stack Developer",
    "Portfolio",
    "Pune",
    "MCA Cloud Computing",
  ],
  authors: [{ name: site.name }],
  creator: site.name,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: site.url,
    title,
    description,
    siteName: site.name,
    locale: "en_IN",
  },
  twitter: { card: "summary_large_image", title, description },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#050505",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: site.name,
  jobTitle: site.roles[0],
  url: site.url,
  email: `mailto:${site.email}`,
  address: { "@type": "PostalAddress", addressLocality: "Pune", addressCountry: "IN" },
  alumniOf: { "@type": "CollegeOrUniversity", name: site.education.college },
  knowsAbout: ["Cloud Computing", "AWS", "DevOps", "Linux", "Python", "Flask", "Networking"],
  sameAs: [site.linkedin, site.github].filter(Boolean),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${bricolage.variable} ${plex.variable} ${plexMono.variable}`}
      suppressHydrationWarning
    >
      <body className="grain">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-snow focus:px-4 focus:py-2 focus:text-void"
        >
          Skip to content
        </a>
        <SmoothScroll>{children}</SmoothScroll>
        <Cursor />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </body>
    </html>
  );
}
