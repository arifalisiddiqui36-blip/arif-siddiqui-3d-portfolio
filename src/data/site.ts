/**
 * Personal details and links.
 * Edit this file to update everything that appears in the hero, about,
 * contact section, footer and SEO metadata.
 *
 * Any link left as an empty string is hidden automatically, so the site
 * never shows a broken button.
 */
export const site = {
  name: "Arif Siddiqui",
  shortName: "Arif",
  initials: "AS",
  roles: ["Cloud Engineer", "DevOps Enthusiast", "Full Stack Developer"],
  location: "Pune, India",

  headline: "Building the Future Through Cloud & Technology.",
  subtitle:
    "Exploring Cloud Infrastructure, Automation, DevOps and Modern Web Technologies.",

  education: {
    degree: "Master of Computer Applications (MCA)",
    specialization: "Cloud Computing",
    college: "Ajeenkya DY Patil Engineering College",
    graduation: 2027,
  },

  // Public production URL — used for SEO metadata, sitemap and Open Graph.
  // On Vercel this resolves automatically to the production domain; set
  // NEXT_PUBLIC_SITE_URL only if you add a custom domain.
  url:
    process.env.NEXT_PUBLIC_SITE_URL ??
    (process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : "http://localhost:3000"),

  email: "arifalisiddiqui36@gmail.com",
  // Paste your full profile URLs here, e.g. "https://www.linkedin.com/in/your-handle"
  linkedin: "",
  github: "https://github.com/arifalisiddiqui36-blip",
  // Optional: link a PDF placed in /public, e.g. "/Arif-Siddiqui-Resume.pdf"
  resume: "",
} as const;

export type Site = typeof site;
