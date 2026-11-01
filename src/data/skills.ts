/**
 * Skills showcase content.
 *
 * Levels are deliberately honest. Set each one to what you can defend in an
 * interview:
 *   "learning"    – studied it, followed tutorials, small experiments
 *   "comfortable" – used it in your own projects without hand-holding
 *   "proficient"  – used it repeatedly, can debug it and explain trade-offs
 *
 * The defaults below are a starting guess based on the projects listed in
 * projects.ts — please review them.
 */
export type SkillLevel = "learning" | "comfortable" | "proficient";

export type Skill = {
  name: string;
  level: SkillLevel;
  note?: string;
};

export type SkillCategory = {
  id: "cloud" | "devops" | "programming" | "infrastructure";
  title: string;
  blurb: string;
  skills: Skill[];
};

export const levelMeta: Record<SkillLevel, { label: string; rank: 1 | 2 | 3 }> = {
  learning: { label: "Learning", rank: 1 },
  comfortable: { label: "Comfortable", rank: 2 },
  proficient: { label: "Proficient", rank: 3 },
};

export const skillCategories: SkillCategory[] = [
  {
    id: "cloud",
    title: "Cloud",
    blurb: "Provisioning and running workloads on AWS.",
    skills: [
      { name: "AWS", level: "comfortable" },
      { name: "EC2", level: "comfortable", note: "Hosted Secure Cloud Data Vault" },
      { name: "S3", level: "learning" },
      { name: "IAM", level: "learning" },
      { name: "VPC", level: "learning" },
      { name: "RDS", level: "learning" },
      { name: "CloudWatch", level: "learning" },
    ],
  },
  {
    id: "devops",
    title: "DevOps",
    blurb: "Version control, containers and automation pipelines.",
    skills: [
      { name: "Git", level: "comfortable" },
      { name: "GitHub", level: "comfortable" },
      { name: "Docker", level: "learning" },
      { name: "Kubernetes", level: "learning" },
      { name: "Jenkins", level: "learning" },
      { name: "Ansible", level: "learning" },
      { name: "Terraform", level: "learning" },
    ],
  },
  {
    id: "programming",
    title: "Programming",
    blurb: "Backend services and the web layer on top of them.",
    skills: [
      { name: "Python", level: "comfortable" },
      { name: "Flask", level: "comfortable" },
      { name: "JavaScript", level: "comfortable" },
      { name: "Node.js", level: "learning" },
    ],
  },
  {
    id: "infrastructure",
    title: "Infrastructure",
    blurb: "The servers, networks and databases underneath.",
    skills: [
      { name: "Linux", level: "comfortable" },
      { name: "Ubuntu", level: "comfortable" },
      { name: "Amazon Linux", level: "learning" },
      { name: "Nginx", level: "comfortable" },
      { name: "MySQL", level: "comfortable" },
      { name: "Networking", level: "comfortable", note: "VLAN, OSPF, ACL, DHCP" },
    ],
  },
];

export const allSkills = skillCategories.flatMap((c) =>
  c.skills.map((s) => ({ ...s, category: c.id })),
);
