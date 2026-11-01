/**
 * Featured projects.
 *
 * - `github`: paste the repository URL. Leave "" and the GitHub button is hidden.
 * - `live`:   paste a deployed URL. Leave "" and no live-demo button is shown.
 * - "View project" always opens the in-page case study, so it never breaks.
 * - `highlights`: edit freely — these are written from the stack you listed,
 *   so adjust any detail that doesn't match what you actually built.
 */
export type Project = {
  id: string;
  title: string;
  summary: string;
  description: string;
  highlights: string[];
  stack: string[];
  category: string;
  visual: "vault" | "cleanse" | "party" | "network";
  github: string;
  live: string;
};

export const projects: Project[] = [
  {
    id: "secure-cloud-data-vault",
    title: "Secure Cloud Data Vault",
    category: "Cloud security",
    summary:
      "A Flask web app that encrypts sensitive user data with AES-256-GCM, built to run on AWS EC2.",
    description:
      "A security-focused Flask application with a double-layer protection model: requests are screened for SQL injection and forged forms before they reach the app, and sensitive user information is encrypted with AES-256-GCM before it is stored. Admins get a security dashboard with charts and CSV export. It runs on MySQL in production with an automatic SQLite fallback locally, and is deployed on AWS EC2 with Gunicorn behind Nginx.",
    highlights: [
      "AES-256-GCM authenticated encryption for sensitive fields",
      "SQL-injection detection, CSRF protection and hashed passwords",
      "Role-based access with an admin security dashboard (Chart.js, CSV export)",
      "MySQL in production, SQLite fallback for local runs",
      "Deployed on AWS EC2 with Gunicorn behind Nginx",
    ],
    stack: ["Flask", "Python", "MySQL / SQLite", "AES-256", "AWS EC2", "Nginx", "Gunicorn"],
    visual: "vault",
    github: "https://github.com/arifalisiddiqui36-blip/Secure-Cloud-Data-Vault",
    live: "",
  },
  {
    id: "cloud-cleanse",
    title: "Cloud Cleanse",
    category: "Data management",
    summary:
      "A data redundancy removal system that validates records and blocks duplicates before they're stored.",
    description:
      "Cloud Cleanse validates every incoming record, checks it against existing data for duplicate emails and phone numbers, flags false positives, and stores only verified unique entries. A Flask API backed by MySQL does the checking; a React dashboard shows records in real time.",
    highlights: [
      "Email validation and duplicate email / phone detection",
      "False-positive classification so valid records aren't lost",
      "Only verified unique records reach the MySQL database",
      "React dashboard for live record management",
    ],
    stack: ["Python", "Flask", "MySQL", "React", "Cloud data management"],
    visual: "cleanse",
    github: "https://github.com/arifalisiddiqui36-blip/Data-Redundancy-Removal-System",
    live: "",
  },
  {
    id: "house-party",
    title: "House Party",
    category: "Full stack",
    summary: "A full stack event app for creating parties and managing guests.",
    description:
      "A React front end backed by a Node.js API and PostgreSQL database, with third-party API integration. Hosts create events and guests join them from a shared interface.",
    highlights: [
      "React interface talking to a Node.js REST API",
      "PostgreSQL schema for events, hosts and guests",
      "Third-party API integration",
    ],
    stack: ["Node.js", "React", "PostgreSQL", "API integration"],
    visual: "party",
    github: "",
    live: "",
  },
  {
    id: "smart-hospital-network",
    title: "Smart Hospital Network",
    category: "Network design",
    summary: "A segmented hospital network designed and simulated in Cisco Packet Tracer.",
    description:
      "A campus network for a hospital where each department sits on its own VLAN. OSPF handles dynamic routing between sites, DHCP assigns addresses per segment, and ACLs restrict which departments can reach sensitive systems.",
    highlights: [
      "Department-level segmentation with VLANs",
      "Dynamic routing with OSPF",
      "ACLs restricting access to sensitive segments",
      "DHCP address pools per VLAN",
    ],
    stack: ["Cisco Packet Tracer", "VLAN", "OSPF", "ACL", "DHCP"],
    visual: "network",
    github: "",
    live: "",
  },
];
