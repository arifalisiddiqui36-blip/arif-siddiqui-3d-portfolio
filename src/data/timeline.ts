/**
 * Experience & certifications timeline.
 *
 * Only real entries belong here. Add internships and certifications as you
 * earn them — copy one of the templates at the bottom of this file.
 *
 * Entries render in the order they appear (put the newest first).
 * Empty groups are hidden on the live site; in `npm run dev` they show a
 * hint so you remember to fill them in.
 */
export type TimelineKind = "education" | "experience" | "certification" | "learning";

export type TimelineEntry = {
  kind: TimelineKind;
  title: string;
  org: string;
  period: string;
  description: string;
  tags?: string[];
  /** Optional link, e.g. a credential verification URL. Hidden when empty. */
  link?: string;
};

export const timeline: TimelineEntry[] = [
  {
    kind: "education",
    title: "Master of Computer Applications",
    org: "Ajeenkya DY Patil Engineering College, Pune",
    period: "2025 — 2027 (expected)",
    description:
      "Specialising in Cloud Computing, with coursework and projects around cloud infrastructure, networking and secure application deployment.",
    tags: ["Cloud Computing", "MCA"],
  },
  {
    kind: "learning",
    title: "Deploying a secure app on AWS",
    org: "Project — Secure Cloud Data Vault",
    period: "MCA",
    description:
      "First end-to-end deployment: a Flask app with AES-256-GCM encryption on EC2, served by Gunicorn behind Nginx.",
    tags: ["AWS EC2", "Nginx", "AES-256"],
  },
  {
    kind: "learning",
    title: "Designing a segmented network",
    org: "Project — Smart Hospital Network",
    period: "MCA",
    description:
      "Planned VLANs, OSPF routing, DHCP pools and ACLs for a multi-department hospital network.",
    tags: ["VLAN", "OSPF", "ACL"],
  },
  {
    kind: "learning",
    title: "Working through the DevOps toolchain",
    org: "Self-directed learning",
    period: "Ongoing",
    description:
      "Docker, Kubernetes, Jenkins, Ansible and Terraform — building toward automated, reproducible deployments.",
    tags: ["Docker", "Kubernetes", "Terraform"],
  },

  /* ── Templates — copy, fill in, and move above ─────────────────────────
  {
    kind: "experience",
    title: "Cloud Intern",
    org: "Company name",
    period: "Jun 2026 — Aug 2026",
    description: "What you worked on and what changed because of it.",
    tags: ["AWS", "Linux"],
  },
  {
    kind: "certification",
    title: "AWS Certified Cloud Practitioner",
    org: "Amazon Web Services",
    period: "Issued Mon YYYY",
    description: "One line on what the certification covers.",
    link: "https://www.credly.com/badges/...",
  },
  ─────────────────────────────────────────────────────────────────────── */
];

export const timelineGroups: { kind: TimelineKind; label: string }[] = [
  { kind: "experience", label: "Internships" },
  { kind: "certification", label: "Certifications" },
];
