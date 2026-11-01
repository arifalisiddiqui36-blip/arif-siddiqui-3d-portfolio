/**
 * Components of the interactive cloud infrastructure scene.
 * Positions are in scene units on a flat platform (x, z), y is height.
 */
export type InfraNodeId =
  | "vpc"
  | "lb"
  | "ec2a"
  | "ec2b"
  | "s3"
  | "rds"
  | "monitor"
  | "repo"
  | "ci"
  | "registry";

export type InfraNode = {
  id: InfraNodeId;
  name: string;
  service: string;
  group: "network" | "compute" | "storage" | "database" | "pipeline" | "observability";
  description: string;
};

export const infraNodes: InfraNode[] = [
  {
    id: "vpc",
    name: "Virtual Private Cloud",
    service: "AWS VPC",
    group: "network",
    description:
      "An isolated network boundary. Public subnets face the internet; private subnets keep servers and databases unreachable from outside.",
  },
  {
    id: "lb",
    name: "Load balancer",
    service: "Application Load Balancer",
    group: "network",
    description:
      "Receives every incoming request and spreads traffic across healthy servers, so one failing instance never takes the site down.",
  },
  {
    id: "ec2a",
    name: "App server A",
    service: "EC2 · Nginx + Gunicorn",
    group: "compute",
    description:
      "A virtual machine running the application. Nginx terminates HTTP and passes requests to Gunicorn workers running the Python app.",
  },
  {
    id: "ec2b",
    name: "App server B",
    service: "EC2 · Auto Scaling",
    group: "compute",
    description:
      "A second instance in another availability zone. Auto Scaling adds or removes servers like this one as traffic changes.",
  },
  {
    id: "s3",
    name: "Object storage",
    service: "Amazon S3",
    group: "storage",
    description:
      "Durable storage for uploaded files and static assets. Objects can be encrypted at rest and versioned.",
  },
  {
    id: "rds",
    name: "Managed database",
    service: "Amazon RDS · MySQL",
    group: "database",
    description:
      "A managed MySQL database in a private subnet with automated backups. Only the app servers' security group can connect.",
  },
  {
    id: "monitor",
    name: "Monitoring",
    service: "Amazon CloudWatch",
    group: "observability",
    description:
      "Collects metrics and logs from every component and raises alarms when CPU, errors or latency cross a threshold.",
  },
  {
    id: "repo",
    name: "Source code",
    service: "Git · GitHub",
    group: "pipeline",
    description:
      "Every change starts as a commit. A push to the main branch triggers the deployment pipeline automatically.",
  },
  {
    id: "ci",
    name: "Build & test",
    service: "Jenkins",
    group: "pipeline",
    description:
      "Runs tests, builds a Docker image, and stops the release if anything fails — no manual steps in between.",
  },
  {
    id: "registry",
    name: "Deploy",
    service: "Docker · Terraform · Ansible",
    group: "pipeline",
    description:
      "Terraform defines the infrastructure as code, Ansible configures the servers, and the new container rolls out to EC2.",
  },
];

export const infraById = Object.fromEntries(infraNodes.map((n) => [n.id, n])) as Record<
  InfraNodeId,
  InfraNode
>;
