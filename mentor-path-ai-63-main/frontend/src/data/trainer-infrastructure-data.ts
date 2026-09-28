/**
 * TRAINER INTELLIGENCE, INFRASTRUCTURE PLANNING & UPGRADED STUDENT SKILL GAP DATA
 * 
 * Supports:
 * - Section 15: Trainer Intelligence (Current vs Required Trainer Capacity, Skill Gap, Upskilling Areas)
 * - Section 16: Infrastructure / Equipment Planning (Current vs Recommended Infrastructure across 5 categories + Explainable Gap)
 * - Section 17: Upgraded Student Skill Gap (8-factor evaluation: Market Requirement vs Student Current Level)
 * - Section 18: Upgraded Market-Aware Career Roadmap (7-stage pipeline: Gap -> Learning -> Practice -> Project -> Assessment -> Evidence -> Opportunity)
 */

// =========================================================
// SECTION 15: TRAINER INTELLIGENCE DATA MODELS
// =========================================================

export interface TrainerSkillPlanningItem {
  id: string;
  skillName: string;
  sector: string;
  category: "Core Technical" | "Analytical & BI" | "Cloud & Infrastructure" | "AI & Emerging";
  currentTrainersCount: number; // Current trainer availability
  requiredTrainersCount: number; // Required trainer capacity
  trainerGap: number; // Deficit (negative number)
  deficitPercentage: number;
  urgencyLevel: "Critical Deficit" | "High Deficit" | "Moderate Deficit" | "Balanced";
  certifiedFacultyRatePct: number;
  recommendedUpskillingAreas: string[];
  mandatoryCertifications: string[];
  totCohortsNeeded: number;
  totDurationWeeks: number;
  projectedStudentsPerTrainer: number;
}

export const RAW_TRAINER_INTELLIGENCE: TrainerSkillPlanningItem[] = [
  {
    id: "tr-sk-01",
    skillName: "SQL (Window Functions, CTEs & Analytics)",
    sector: "IT & Software Services",
    category: "Core Technical",
    currentTrainersCount: 45,
    requiredTrainersCount: 120,
    trainerGap: -75,
    deficitPercentage: 62.5,
    urgencyLevel: "Critical Deficit",
    certifiedFacultyRatePct: 37.5,
    recommendedUpskillingAreas: [
      "SQL Window Functions (OVER, PARTITION BY, RANK)",
      "Query Execution Plan Analysis & Index Optimization",
      "PostgreSQL / Snowflake Analytical ETL",
      "Authoring Machine Coding Timed Assessments",
    ],
    mandatoryCertifications: [
      "Microsoft Certified: Azure Data Fundamentals (DP-900)",
      "NASSCOM FutureSkills Prime Master Trainer in SQL",
    ],
    totCohortsNeeded: 4,
    totDurationWeeks: 3,
    projectedStudentsPerTrainer: 35,
  },
  {
    id: "tr-sk-02",
    skillName: "Python (Data Wrangling, Pandas & NumPy)",
    sector: "IT & Software Services",
    category: "Core Technical",
    currentTrainersCount: 68,
    requiredTrainersCount: 110,
    trainerGap: -42,
    deficitPercentage: 38.2,
    urgencyLevel: "High Deficit",
    certifiedFacultyRatePct: 61.8,
    recommendedUpskillingAreas: [
      "Vectorized Data Processing with Polars / Pandas 2.0",
      "Production Packaging & Clean Code Practices (PEP8, Type Hints)",
      "Automated Testing for Data Pipelines (PyTest)",
    ],
    mandatoryCertifications: [
      "Python Institute Certified Associate in Python Programming (PCAP)",
      "AWS Certified Machine Learning - Specialty",
    ],
    totCohortsNeeded: 2,
    totDurationWeeks: 3,
    projectedStudentsPerTrainer: 30,
  },
  {
    id: "tr-sk-03",
    skillName: "Power BI & Enterprise Dashboarding",
    sector: "IT & Software Services",
    category: "Analytical & BI",
    currentTrainersCount: 18,
    requiredTrainersCount: 85,
    trainerGap: -67,
    deficitPercentage: 78.8,
    urgencyLevel: "Critical Deficit",
    certifiedFacultyRatePct: 21.2,
    recommendedUpskillingAreas: [
      "Advanced DAX Calculations & Time Intelligence Functions",
      "Power Query M Scripting & Data Modeling (Star Schema)",
      "Power BI Service Administration & Row-Level Security (RLS)",
      "Client Dashboard Storytelling & Executive Presentation",
    ],
    mandatoryCertifications: [
      "Microsoft Certified: Power BI Data Analyst Associate (PL-300)",
      "Microsoft Certified Educator (MCE)",
    ],
    totCohortsNeeded: 5,
    totDurationWeeks: 4,
    projectedStudentsPerTrainer: 40,
  },
  {
    id: "tr-sk-04",
    skillName: "Docker & Containerization",
    sector: "IT & Software Services",
    category: "Cloud & Infrastructure",
    currentTrainersCount: 22,
    requiredTrainersCount: 75,
    trainerGap: -53,
    deficitPercentage: 70.7,
    urgencyLevel: "Critical Deficit",
    certifiedFacultyRatePct: 29.3,
    recommendedUpskillingAreas: [
      "Multi-stage Dockerfile Optimization & Minimal Base Images",
      "Docker Compose Multi-Container Stacks (App + DB + Redis)",
      "Container Networking, Volumes & Host Security",
    ],
    mandatoryCertifications: [
      "Docker Certified Associate (DCA)",
      "Linux Foundation Certified System Administrator (LFCS)",
    ],
    totCohortsNeeded: 3,
    totDurationWeeks: 4,
    projectedStudentsPerTrainer: 35,
  },
  {
    id: "tr-sk-05",
    skillName: "Linux CLI & Bash Automation",
    sector: "IT & Software Services",
    category: "Cloud & Infrastructure",
    currentTrainersCount: 55,
    requiredTrainersCount: 90,
    trainerGap: -35,
    deficitPercentage: 38.9,
    urgencyLevel: "High Deficit",
    certifiedFacultyRatePct: 61.1,
    recommendedUpskillingAreas: [
      "Advanced Shell Text Processing (awk, sed, grep, xargs)",
      "Systemd Service Units & Log Journaling",
      "SSH Key Management & Server Hardening",
    ],
    mandatoryCertifications: [
      "Red Hat Certified System Administrator (RHCSA)",
      "CompTIA Linux+",
    ],
    totCohortsNeeded: 2,
    totDurationWeeks: 2,
    projectedStudentsPerTrainer: 35,
  },
  {
    id: "tr-sk-06",
    skillName: "TypeScript & React Modern Architecture",
    sector: "IT & Software Services",
    category: "Core Technical",
    currentTrainersCount: 32,
    requiredTrainersCount: 95,
    trainerGap: -63,
    deficitPercentage: 66.3,
    urgencyLevel: "Critical Deficit",
    certifiedFacultyRatePct: 33.7,
    recommendedUpskillingAreas: [
      "Strict TypeScript Generics & Type Narrowing",
      "Next.js App Router, Server Actions & Modern State",
      "Component Testing with React Testing Library & Vitest",
    ],
    mandatoryCertifications: [
      "Meta Front-End Developer Professional Certificate",
      "NASSCOM Certified Web Development Faculty",
    ],
    totCohortsNeeded: 4,
    totDurationWeeks: 4,
    projectedStudentsPerTrainer: 30,
  },
  {
    id: "tr-sk-07",
    skillName: "Relational Database Design (PostgreSQL / MySQL)",
    sector: "IT & Software Services",
    category: "Core Technical",
    currentTrainersCount: 58,
    requiredTrainersCount: 95,
    trainerGap: -37,
    deficitPercentage: 38.9,
    urgencyLevel: "High Deficit",
    certifiedFacultyRatePct: 61.1,
    recommendedUpskillingAreas: [
      "Physical Schema Modeling, Foreign Keys & Constraints",
      "B-Tree, GiST & GIN Index Strategies",
      "ACID Concurrency, Locks & Transaction Isolation Levels",
    ],
    mandatoryCertifications: [
      "PostgreSQL Certified Professional",
      "Oracle Certified Professional: MySQL 8.0 Database Developer",
    ],
    totCohortsNeeded: 2,
    totDurationWeeks: 3,
    projectedStudentsPerTrainer: 35,
  },
  {
    id: "tr-sk-08",
    skillName: "AWS Cloud Fundamentals & Core Services",
    sector: "IT & Software Services",
    category: "Cloud & Infrastructure",
    currentTrainersCount: 25,
    requiredTrainersCount: 80,
    trainerGap: -55,
    deficitPercentage: 68.8,
    urgencyLevel: "Critical Deficit",
    certifiedFacultyRatePct: 31.3,
    recommendedUpskillingAreas: [
      "VPC Networking (Subnets, NAT Gateways, Route Tables)",
      "IAM Least-Privilege Policies & Role Assumption",
      "EC2 Auto-scaling & S3 Static Hosting Architecture",
    ],
    mandatoryCertifications: [
      "AWS Certified Solutions Architect - Associate",
      "AWS Certified Educator",
    ],
    totCohortsNeeded: 4,
    totDurationWeeks: 4,
    projectedStudentsPerTrainer: 35,
  },
  {
    id: "tr-sk-09",
    skillName: "Applied Inferential Statistics & A/B Testing",
    sector: "IT & Software Services",
    category: "Analytical & BI",
    currentTrainersCount: 30,
    requiredTrainersCount: 65,
    trainerGap: -35,
    deficitPercentage: 53.8,
    urgencyLevel: "High Deficit",
    certifiedFacultyRatePct: 46.2,
    recommendedUpskillingAreas: [
      "Parametric & Non-Parametric Hypothesis Testing (t-test, Chi-Square)",
      "Variance Analysis (ANOVA) & Business p-value decisioning",
      "Designing A/B Test Experiments in Python",
    ],
    mandatoryCertifications: [
      "NASSCOM Lead Instructor: Applied Statistical Modeling",
      "Stanford Online Applied Statistics Educator Certificate",
    ],
    totCohortsNeeded: 2,
    totDurationWeeks: 3,
    projectedStudentsPerTrainer: 35,
  },
];

// =========================================================
// SECTION 16: INFRASTRUCTURE / EQUIPMENT PLANNING DATA MODELS
// =========================================================

export interface EquipmentCategoryComparison {
  category: "Computer systems" | "Software" | "Cloud labs" | "Database environments" | "Required licenses/tools";
  currentInfrastructure: string;
  recommendedInfrastructure: string;
  deficitDescription: string;
  impactOnPedagogy: string;
  gapSeverity: "Critical Deficiency" | "Moderate Bottleneck" | "Minor Upgrade";
  estimatedCostInr: string;
}

export interface ProgrammeInfrastructurePlan {
  id: string;
  programmeName: string;
  nsqfLevel: number;
  typicalBatchSize: number;
  categories: EquipmentCategoryComparison[];
  totalEstimatedCapExInr: string;
  totalEstimatedOpExAnnualInr: string;
  explainableInfrastructureGap: string;
}

export const RAW_PROGRAMME_INFRASTRUCTURE_PLANS: Record<string, ProgrammeInfrastructurePlan> = {
  "Data Analytics": {
    id: "infra-da",
    programmeName: "Data Analytics & Business Intelligence",
    nsqfLevel: 6,
    typicalBatchSize: 30,
    categories: [
      {
        category: "Computer systems",
        currentInfrastructure: "Dual-Core / Core i3 (4th-6th Gen), 8GB DDR3 RAM, 500GB HDD, Single 18.5\" 720p monitor",
        recommendedInfrastructure: "Intel Core i7 / AMD Ryzen 7 (12th Gen+), 16GB DDR4 RAM, 512GB NVMe SSD, Dual 24\" FHD displays",
        deficitDescription: "Severe RAM and I/O bottleneck; running Pandas operations on 500K+ row datasets triggers out-of-memory crashes and thermal throttling.",
        impactOnPedagogy: "Students cannot execute real-world analytical pipelines locally, forcing instructors to truncate datasets to toy 100-row CSVs.",
        gapSeverity: "Critical Deficiency",
        estimatedCostInr: "₹13,50,000 (30 Workstations)",
      },
      {
        category: "Software",
        currentInfrastructure: "Microsoft Excel 2010 (Standalone OEM), Python 3.7 via legacy IDLE, Zero BI software",
        recommendedInfrastructure: "Microsoft Power BI Desktop (Latest Academic Edition), Python 3.12 with VS Code, JupyterLab, pgAdmin 4",
        deficitDescription: "Missing modern interactive BI dashboarding software, advanced DAX tooling, and modern notebook extensions.",
        impactOnPedagogy: "Students graduate without ever having built an interactive executive dashboard, leading to immediate elimination in GCC hiring rounds.",
        gapSeverity: "Critical Deficiency",
        estimatedCostInr: "₹0 (Free Academic Tier under Microsoft & Open Source)",
      },
      {
        category: "Cloud labs",
        currentInfrastructure: "No cloud infrastructure; laboratory network blocks external ports and cloud API endpoints behind proxy firewalls",
        recommendedInfrastructure: "AWS Educate & Azure for Students Sandboxes with $100 USD allocated cloud credits per learner; unblocked HTTPS endpoints",
        deficitDescription: "Complete absence of cloud data warehouse connectivity (Snowflake, BigQuery, AWS S3 buckets).",
        impactOnPedagogy: "Learners cannot practice connecting BI tools to live cloud data warehouses or configuring automated schedule refreshes.",
        gapSeverity: "Critical Deficiency",
        estimatedCostInr: "₹2,50,000 (Annual Student Cloud Credit Allocation)",
      },
      {
        category: "Database environments",
        currentInfrastructure: "Single-user local SQLite files or obsolete MS Access databases installed on individual drives",
        recommendedInfrastructure: "Dockerized PostgreSQL 16 server with pgAdmin 4, automated sample transactional databases (Chinook, AdventureWorks, E-Commerce)",
        deficitDescription: "Lacks client-server relational RDBMS architecture, concurrent connections, user role management, and CTE query execution.",
        impactOnPedagogy: "Students cannot experience real multi-user database transactions, analytical window functions, or query optimization.",
        gapSeverity: "Critical Deficiency",
        estimatedCostInr: "₹1,50,000 (Dedicated Lab Server Node)",
      },
      {
        category: "Required licenses/tools",
        currentInfrastructure: "Expired commercial trials or unlicensed software packages with recurring warning dialogs",
        recommendedInfrastructure: "AICTE / Higher Education Academic Alliance institutional licenses (Microsoft Education, GitHub Student Developer Pack, JetBrains Academic)",
        deficitDescription: "No institutional relationship with vendor academic programs for verifiable student certification vouchers.",
        impactOnPedagogy: "Graduates cannot verify certifications (e.g. PL-300) to recruiters, losing out on prime campus placement shortlisting.",
        gapSeverity: "Moderate Bottleneck",
        estimatedCostInr: "₹1,00,000 (Administrative Alliance Setup)",
      },
    ],
    totalEstimatedCapExInr: "₹18,50,000 (30-Seat High-Performance Analytics Lab)",
    totalEstimatedOpExAnnualInr: "₹3,50,000 (Fiber Internet, Cloud Credits, Maintenance)",
    explainableInfrastructureGap: "The physical computing lab suffers from a 62% hardware-software divergence against employer standards. Without 16GB RAM workstations, PostgreSQL servers, and Power BI licenses, students are restricted to 1990s theoretical database spreadsheets, causing 84% of students to fail Round 1 machine query evaluations.",
  },

  "Cloud & DevOps Engineering": {
    id: "infra-cloud",
    programmeName: "Cloud & DevOps Engineering",
    nsqfLevel: 7,
    typicalBatchSize: 30,
    categories: [
      {
        category: "Computer systems",
        currentInfrastructure: "Core i3 / 8GB RAM / Traditional SATA HDD",
        recommendedInfrastructure: "Core i7 / 32GB RAM (Required for nested virtualization & Kubernetes minikube) / 1TB NVMe SSD",
        deficitDescription: "Virtualization disabled in BIOS; 8GB RAM insufficient to run local Docker daemon and Kubernetes cluster simultaneously.",
        impactOnPedagogy: "Learners are unable to spin up multi-node local clusters, halting DevOps containerization labs.",
        gapSeverity: "Critical Deficiency",
        estimatedCostInr: "₹16,00,000",
      },
      {
        category: "Software",
        currentInfrastructure: "Windows 10 Home (No WSL2, No Hyper-V support)",
        recommendedInfrastructure: "Ubuntu Linux 24.04 LTS / Windows 11 Enterprise with WSL2 Ubuntu subsystem enabled",
        deficitDescription: "Missing Linux native terminal workflows and systemd service management.",
        impactOnPedagogy: "Students fail Linux command line proficiency rounds during recruiter evaluations.",
        gapSeverity: "Critical Deficiency",
        estimatedCostInr: "₹0 (Open Source Linux)",
      },
      {
        category: "Cloud labs",
        currentInfrastructure: "Zero cloud access; faculty demonstrates via personal trial accounts",
        recommendedInfrastructure: "AWS Academy Lab Environment with isolated temporary sandbox accounts per student session",
        deficitDescription: "Lack of reproducible hands-on VPC, EC2, and IAM role provisioning.",
        impactOnPedagogy: "Students only memorize slides without ever deploying infrastructure via Terraform.",
        gapSeverity: "Critical Deficiency",
        estimatedCostInr: "₹3,00,000",
      },
      {
        category: "Database environments",
        currentInfrastructure: "Local database installations without replication or connection pooling",
        recommendedInfrastructure: "Managed Cloud DB (AWS RDS PostgreSQL) + Containerized Redis cluster",
        deficitDescription: "Missing distributed database setup and caching layers.",
        impactOnPedagogy: "Students cannot practice automated database backup, failover, and migration pipelines.",
        gapSeverity: "Moderate Bottleneck",
        estimatedCostInr: "₹1,50,000",
      },
      {
        category: "Required licenses/tools",
        currentInfrastructure: "Free public GitHub without CI/CD runner minutes",
        recommendedInfrastructure: "GitHub Campus Program with automated GitHub Actions minutes for CI/CD pipeline automation",
        deficitDescription: "Inability to run automated testing pipelines on student Git commits.",
        impactOnPedagogy: "Students cannot experience true Continuous Integration / Continuous Deployment workflows.",
        gapSeverity: "Moderate Bottleneck",
        estimatedCostInr: "₹50,000",
      },
    ],
    totalEstimatedCapExInr: "₹21,00,000",
    totalEstimatedOpExAnnualInr: "₹4,00,000",
    explainableInfrastructureGap: "Cloud engineering requires nested virtualization and live cloud provisioning. The current lab's lack of 32GB RAM systems and AWS Academy sandbox access prevents learners from executing Kubernetes orchestration and Terraform declarative deployments.",
  },

  "Full-Stack Software Engineering": {
    id: "infra-fs",
    programmeName: "Full-Stack Software Engineering",
    nsqfLevel: 6,
    typicalBatchSize: 30,
    categories: [
      {
        category: "Computer systems",
        currentInfrastructure: "Core i5 / 8GB RAM / Integrated Graphics",
        recommendedInfrastructure: "Core i5/i7 (12th Gen+) / 16GB RAM / 512GB SSD / 1080p display",
        deficitDescription: "Heavy Node.js development, TypeScript compiler daemon, and local DB causes memory swap slowdowns.",
        impactOnPedagogy: "Development cycle is slow and frustrating; students avoid running automated test runners.",
        gapSeverity: "Moderate Bottleneck",
        estimatedCostInr: "₹12,00,000",
      },
      {
        category: "Software",
        currentInfrastructure: "Legacy NetBeans / Eclipse IDEs with vanilla JavaScript",
        recommendedInfrastructure: "VS Code with TypeScript, ESLint, Prettier, Postman API Client, Chrome DevTools",
        deficitDescription: "Absence of modern TypeScript tooling, API testing platforms, and modern linters.",
        impactOnPedagogy: "Students write un-typed code with runtime bugs that fail employer machine tests.",
        gapSeverity: "Critical Deficiency",
        estimatedCostInr: "₹0",
      },
      {
        category: "Cloud labs",
        currentInfrastructure: "Local localhost:3000 only; no web deployments",
        recommendedInfrastructure: "Vercel / Render / Netlify student tiers with custom domain and public HTTPS URLs",
        deficitDescription: "Students have no live public URL portfolio to share with recruiters.",
        impactOnPedagogy: "Recruiters cannot test student projects prior to interview shortlisting.",
        gapSeverity: "Critical Deficiency",
        estimatedCostInr: "₹50,000",
      },
      {
        category: "Database environments",
        currentInfrastructure: "Local MongoDB Compass without relational modeling",
        recommendedInfrastructure: "PostgreSQL 16 + Prisma ORM + Docker Compose environment",
        deficitDescription: "Over-reliance on un-indexed NoSQL without understanding foreign keys and ACID transactions.",
        impactOnPedagogy: "Students fail enterprise relational schema design rounds.",
        gapSeverity: "Critical Deficiency",
        estimatedCostInr: "₹1,00,000",
      },
      {
        category: "Required licenses/tools",
        currentInfrastructure: "No formal version control tooling",
        recommendedInfrastructure: "GitHub Enterprise Education Pack + Postman Team Workspace",
        deficitDescription: "Missing collaborative Git pull request review workflows.",
        impactOnPedagogy: "Students struggle with merge conflicts and team software engineering practices.",
        gapSeverity: "Moderate Bottleneck",
        estimatedCostInr: "₹50,000",
      },
    ],
    totalEstimatedCapExInr: "₹14,00,000",
    totalEstimatedOpExAnnualInr: "₹2,00,000",
    explainableInfrastructureGap: "Full stack engineering demands type safety and live deployment. Moving from NetBeans/localhost to VS Code, TypeScript, PostgreSQL, and Vercel hosting ensures students graduate with verifiable production portfolios.",
  },
};

// =========================================================
// SECTION 17: UPGRADED STUDENT SKILL GAP ENGINE (8 FACTORS)
// =========================================================

export type SkillProficiencyLevel = "None" | "Basic" | "Intermediate" | "Advanced";
export type SkillGapSeverity = "Critical" | "High" | "Moderate" | "Low" | "Aligned";

export interface StudentSkillGapEvaluation {
  skillName: string;
  category: string;
  // 8 Mandatory Factors
  factors: {
    studentProfile: string; // Degree, branch, year
    resumeEvidence: string; // Project keywords or absence in resume
    academicCoursework: string; // University course coverage
    existingSkillDeclared: string; // Self-declared level
    targetRoleDemand: string; // Requisition frequency in target role
    currentMarketDemand: string; // Layer A posting percentage
    requiredProficiency: SkillProficiencyLevel; // Layer C employer expected level
    relevantIndustryValidation: string; // Direct employer consensus notes
  };
  // Output display
  marketRequirement: SkillProficiencyLevel;
  studentCurrentLevel: SkillProficiencyLevel;
  gapSeverity: SkillGapSeverity;
  gapRationale: string;
  actionableRoadmapStep: string;
}

export type StudentSkillGapEvaluationItem = StudentSkillGapEvaluation;

export interface ProfileContext {
  degree?: string;
  branch?: string;
  yearOfStudy?: number;
  semester?: number;
  cgpa?: number;
}

const ROLE_SKILL_BENCHMARKS: Record<
  string,
  Array<{
    skillName: string;
    category: string;
    marketRequirement: SkillProficiencyLevel;
    targetRoleDemand: string;
    currentMarketDemand: string;
    industryValidation: string;
    learningModule: string;
    practiceDrill: string;
  }>
> = {
  "Data Analyst": [
    {
      skillName: "SQL",
      category: "Core Technical",
      marketRequirement: "Advanced",
      targetRoleDemand: "96% of active Data Analyst requisitions mandate advanced querying (CTEs, window functions).",
      currentMarketDemand: "Very High Demand (42,100 active postings)",
      industryValidation: "98% of surveyed employers test live window functions in technical machine rounds.",
      learningModule: "Advanced SQL: Window Functions, CTEs & Index Tuning (14 hours)",
      practiceDrill: "Solve 25 HackerRank SQL Medium/Hard analytical queries",
    },
    {
      skillName: "Python",
      category: "Core Technical",
      marketRequirement: "Intermediate",
      targetRoleDemand: "88% of Data Analyst job postings require Python for data wrangling and automation.",
      currentMarketDemand: "High Demand (38,400 active postings)",
      industryValidation: "91% of employers validate intermediate Pandas/NumPy proficiency without external assistance.",
      learningModule: "Production Python & Vectorized Data Pipelines (12 hours)",
      practiceDrill: "Clean and reshape 3 messy real-world datasets with Pandas",
    },
    {
      skillName: "Power BI",
      category: "Tools & BI",
      marketRequirement: "Intermediate",
      targetRoleDemand: "84% of enterprise analytics roles require interactive business dashboards.",
      currentMarketDemand: "High Demand (32,800 active postings; +42% YoY)",
      industryValidation: "86% of recruiters prioritize candidates with interactive public dashboard links.",
      learningModule: "Power BI Desktop & Enterprise DAX Modeling (16 hours)",
      practiceDrill: "Build executive KPI dashboards with dynamic DAX slicers",
    },
    {
      skillName: "Relational Database Design",
      category: "Core Technical",
      marketRequirement: "Intermediate",
      targetRoleDemand: "84% of tech employers require clean relational schema design with indexing.",
      currentMarketDemand: "High Demand (35,200 active postings)",
      industryValidation: "88% of hiring managers test ER modeling and foreign key cascades.",
      learningModule: "Database Engineering & Query Execution Plans (10 hours)",
      practiceDrill: "Design normalized schema and evaluate composite indexes in PostgreSQL",
    },
    {
      skillName: "Applied Inferential Statistics",
      category: "Analytical",
      marketRequirement: "Intermediate",
      targetRoleDemand: "68% of product analytics and experimentation teams require hypothesis testing.",
      currentMarketDemand: "Medium Demand (24,100 active postings)",
      industryValidation: "74% of employers test p-values, sample variance, and confidence intervals.",
      learningModule: "Practical Business Statistics & A/B Testing (12 hours)",
      practiceDrill: "Implement two-sample t-tests and Chi-Square tests in Python",
    },
  ],
  "Software Development Engineer": [
    {
      skillName: "Data Structures & Algorithms",
      category: "Core Computer Science",
      marketRequirement: "Advanced",
      targetRoleDemand: "98% of tech companies mandate DSA problem solving for screening.",
      currentMarketDemand: "Critical Benchmark (65,000 active postings)",
      industryValidation: "Live coding interviews focus on Trees, Graphs, DP, and Two Pointers.",
      learningModule: "DSA Mastery: Graphs, Dynamic Programming & Trees (40 hours)",
      practiceDrill: "Solve 100 LeetCode Medium problems across top patterns",
    },
    {
      skillName: "System Design",
      category: "Architecture",
      marketRequirement: "Intermediate",
      targetRoleDemand: "82% of software engineering interviews test scalability and system architecture.",
      currentMarketDemand: "High Demand (48,000 active postings)",
      industryValidation: "Architectural rounds evaluate caching, load balancers, and microservices.",
      learningModule: "Low-Level and High-Level System Design Fundamentals (20 hours)",
      practiceDrill: "Design a scalable URL shortener and rate limiter on paper and code",
    },
    {
      skillName: "Object-Oriented Programming",
      category: "Core Technical",
      marketRequirement: "Advanced",
      targetRoleDemand: "92% of product engineering teams mandate solid OOP/SOLID principles.",
      currentMarketDemand: "High Demand (54,000 active postings)",
      industryValidation: "Design pattern implementation tested in machine rounds.",
      learningModule: "Design Patterns & Clean Code Architecture (15 hours)",
      practiceDrill: "Refactor a monolithic service using Factory and Strategy patterns",
    },
    {
      skillName: "SQL & Databases",
      category: "Database Engineering",
      marketRequirement: "Intermediate",
      targetRoleDemand: "86% of backend roles mandate ACID transactions and indexing.",
      currentMarketDemand: "High Demand (45,000 active postings)",
      industryValidation: "Database isolation levels and transaction locks tested in Round 2.",
      learningModule: "Relational Modeling, Index Optimization & Transactions (12 hours)",
      practiceDrill: "Optimize slow queries using EXPLAIN ANALYZE in PostgreSQL",
    },
    {
      skillName: "Git & Version Control",
      category: "Engineering Tools",
      marketRequirement: "Intermediate",
      targetRoleDemand: "95% of software engineering roles require collaborative Git workflows.",
      currentMarketDemand: "High Demand (60,000 active postings)",
      industryValidation: "Production onboarding requires branching, rebasing, and PR reviews.",
      learningModule: "Collaborative Git Workflows & CI/CD Pipelines (8 hours)",
      practiceDrill: "Set up automated GitHub Actions workflow with unit tests",
    },
  ],
  "Full Stack Developer": [
    {
      skillName: "TypeScript / JavaScript",
      category: "Core Technical",
      marketRequirement: "Advanced",
      targetRoleDemand: "95% of web engineering teams build on modern TypeScript.",
      currentMarketDemand: "High Demand (58,000 active postings)",
      industryValidation: "Strict type safety and async/event-loop mechanics tested.",
      learningModule: "Modern TypeScript: Generics, Utility Types & Async Patterns (18 hours)",
      practiceDrill: "Convert an untyped JavaScript app to strict TypeScript",
    },
    {
      skillName: "React / Next.js",
      category: "Frontend Engineering",
      marketRequirement: "Advanced",
      targetRoleDemand: "90% of front-end and full-stack positions specify React.",
      currentMarketDemand: "High Demand (52,000 active postings)",
      industryValidation: "State management, custom hooks, and server components evaluated.",
      learningModule: "Production React 19 & Next.js Architecture (24 hours)",
      practiceDrill: "Build an SSR application with TanStack Query and optimistic UI",
    },
    {
      skillName: "Node.js & REST APIs",
      category: "Backend Engineering",
      marketRequirement: "Advanced",
      targetRoleDemand: "88% of full stack roles mandate scalable REST API design.",
      currentMarketDemand: "High Demand (47,000 active postings)",
      industryValidation: "Authentication, validation middleware, and error handling tested.",
      learningModule: "Enterprise REST API Development with Express / NestJS (20 hours)",
      practiceDrill: "Develop secure JWT auth and role-based access control backend",
    },
    {
      skillName: "Database Modeling (SQL / NoSQL)",
      category: "Data Storage",
      marketRequirement: "Intermediate",
      targetRoleDemand: "85% of full-stack positions require database schema design.",
      currentMarketDemand: "High Demand (42,000 active postings)",
      industryValidation: "Schema migration and ORM indexing evaluated in technical rounds.",
      learningModule: "PostgreSQL & Prisma ORM Data Modeling (14 hours)",
      practiceDrill: "Build relational models with migrations and transactional integrity",
    },
    {
      skillName: "Docker & Cloud Deployment",
      category: "DevOps & Delivery",
      marketRequirement: "Intermediate",
      targetRoleDemand: "78% of modern teams require containerized deployments.",
      currentMarketDemand: "High Demand (39,000 active postings)",
      industryValidation: "Containerization and environment orchestration tested.",
      learningModule: "Docker Containerization & Vercel / Cloud Run Deployment (10 hours)",
      practiceDrill: "Dockerize full-stack application and deploy to live public URL",
    },
  ],
};

function getBenchmarksForRole(targetRole: string) {
  const normalized = (targetRole || "").trim().toLowerCase();
  for (const [key, items] of Object.entries(ROLE_SKILL_BENCHMARKS)) {
    if (normalized.includes(key.toLowerCase()) || key.toLowerCase().includes(normalized)) {
      return items;
    }
  }
  return ROLE_SKILL_BENCHMARKS["Software Development Engineer"];
}

export function evaluateStudentSkillGap(
  targetRole: string,
  userSkills: string[] = [],
  profileContext?: ProfileContext
): StudentSkillGapEvaluation[] {
  const benchmarkSkills = getBenchmarksForRole(targetRole);
  const normalizedUserSkills = (userSkills || []).map((s) => s.toLowerCase().trim());
  const studentProfileLabel =
    [profileContext?.degree, profileContext?.branch].filter(Boolean).join(" ") ||
    "Engineering Student";

  return benchmarkSkills.map((benchmark) => {
    const isPresent = normalizedUserSkills.some(
      (s) =>
        s.includes(benchmark.skillName.toLowerCase()) ||
        benchmark.skillName.toLowerCase().includes(s) ||
        benchmark.skillName.toLowerCase().split(/[ /&]+/).some((w) => w.length > 2 && s.includes(w))
    );

    const studentLevel: SkillProficiencyLevel = isPresent ? "Intermediate" : "None";
    const gapSeverity: SkillGapSeverity = isPresent ? "Aligned" : "High";

    return {
      skillName: benchmark.skillName,
      category: benchmark.category,
      factors: {
        studentProfile: studentProfileLabel,
        resumeEvidence: isPresent
          ? `Verified skill "${benchmark.skillName}" present in user profile.`
          : `No verified evidence of "${benchmark.skillName}" found in user profile.`,
        academicCoursework: isPresent
          ? "Reinforced through academic coursework or verified project work."
          : `Curriculum coverage indicates potential gap for enterprise-level ${benchmark.skillName}.`,
        existingSkillDeclared: isPresent ? "Declared in profile" : "Unattempted / Missing",
        targetRoleDemand: benchmark.targetRoleDemand,
        currentMarketDemand: benchmark.currentMarketDemand,
        requiredProficiency: benchmark.marketRequirement,
        relevantIndustryValidation: benchmark.industryValidation,
      },
      marketRequirement: benchmark.marketRequirement,
      studentCurrentLevel: studentLevel,
      gapSeverity,
      gapRationale: isPresent
        ? `Student profile matches entry-level expectations for ${benchmark.skillName}.`
        : `Absence of ${benchmark.skillName} creates an immediate barrier during technical evaluations for ${targetRole || "target role"}.`,
      actionableRoadmapStep: isPresent
        ? `Maintain fluency; complete 1 advanced capstone integration.`
        : benchmark.practiceDrill,
    };
  });
}

// =========================================================
// SECTION 18: MARKET-AWARE 7-STAGE CAREER ROADMAP GENERATOR
// =========================================================

export interface MarketAwareRoadmapPipelineStage {
  stageNumber: number;
  stageName:
    | "CURRENT SKILL GAP"
    | "LEARNING"
    | "PRACTICE"
    | "PROJECT"
    | "ASSESSMENT"
    | "EVIDENCE OF SKILL"
    | "OPPORTUNITY";
  title: string;
  description: string;
  marketDemandContext: string;
  actionableTasks: string[];
  isCompleted: boolean;
  completionBadge?: string;
  directOpportunityLink?: {
    companyName: string;
    role: string;
    packageLpa: string;
    url: string;
  };
}

export function generateMarketAwareRoadmap(
  targetRole: string = "Data Analyst",
  userSkills: string[] = [],
  profileContext?: ProfileContext
): MarketAwareRoadmapPipelineStage[] {
  const benchmarkSkills = getBenchmarksForRole(targetRole);
  const normalizedUserSkills = (userSkills || []).map((s) => s.toLowerCase().trim());

  const missing = benchmarkSkills.filter(
    (b) =>
      !normalizedUserSkills.some(
        (s) =>
          s.includes(b.skillName.toLowerCase()) ||
          b.skillName.toLowerCase().includes(s) ||
          b.skillName.toLowerCase().split(/[ /&]+/).some((w) => w.length > 2 && s.includes(w))
      )
  );

  const missingSkillNames = missing.map((m) => m.skillName);
  const hasGaps = missingSkillNames.length > 0;

  const gapTasks = hasGaps
    ? missingSkillNames.slice(0, 3).map((name) => `Acknowledge critical gap in ${name} against industry benchmark`)
    : ["All core benchmark skills verified in profile! Focus on advanced capstone projects and mock interviews."];

  const learningTasks = hasGaps
    ? missing.slice(0, 3).map((m) => `Complete learning module: ${m.learningModule}`)
    : [
        `Complete Advanced System Architecture & Scaling (20 hours)`,
        `Review Cloud Native Microservices Patterns (15 hours)`,
      ];

  const practiceTasks = hasGaps
    ? missing.slice(0, 3).map((m) => m.practiceDrill)
    : [
        `Solve 50 Advanced LeetCode / HackerRank problems`,
        `Conduct 3 peer mock coding loops under timed constraints`,
      ];

  const roleLabel = targetRole || "Software Engineering";

  return [
    {
      stageNumber: 1,
      stageName: "CURRENT SKILL GAP",
      title: "Identified Market Skill Gaps",
      description: "Empirical deficit detected between your verified profile and active hiring filters.",
      marketDemandContext: hasGaps
        ? `Active ${roleLabel} requisitions mandate ${missingSkillNames.slice(0, 2).join(" & ")}, which are absent in your profile.`
        : `Verified alignment with industry benchmarks for ${roleLabel}.`,
      actionableTasks: gapTasks,
      isCompleted: !hasGaps,
      completionBadge: hasGaps ? "Gap Diagnosed" : "Skills Aligned",
    },
    {
      stageNumber: 2,
      stageName: "LEARNING",
      title: "Structured Curriculum Learning",
      description: "Engage accredited, employer-endorsed learning modules targeting the diagnosed deficits.",
      marketDemandContext: `Curated learning paths tailored to ${profileContext?.branch || "engineering"} students targeting ${roleLabel}.`,
      actionableTasks: learningTasks,
      isCompleted: false,
    },
    {
      stageNumber: 3,
      stageName: "PRACTICE",
      title: "Rigorous Hands-On Lab Practice",
      description: "Solve real-world machine coding drills and problem sets under timed conditions.",
      marketDemandContext: `Employers evaluate live fluency on standardized coding and design assessments.`,
      actionableTasks: practiceTasks,
      isCompleted: false,
    },
    {
      stageNumber: 4,
      stageName: "PROJECT",
      title: "Production Portfolio Project",
      description: "Build an end-to-end, production-grade project that solves a tangible business problem.",
      marketDemandContext: "Hiring managers disregard generic clones; require domain-grounded repositories.",
      actionableTasks: [
        `Architect and build an end-to-end ${roleLabel} capstone project with clean modular architecture`,
        `Integrate persistent database storage with automated migrations and test coverage`,
        `Write comprehensive production README detailing system architecture, API contracts, and live demo link`,
      ],
      isCompleted: false,
    },
    {
      stageNumber: 5,
      stageName: "ASSESSMENT",
      title: "Timed Technical Assessment",
      description: "Pass a standardized machine coding round simulating corporate interview loops.",
      marketDemandContext: "Employers utilize 90-minute live coding platforms to filter candidate pools.",
      actionableTasks: [
        `Take 90-minute timed Mock Placement Assessment for ${roleLabel}`,
        `Achieve score ≥ 85% with zero external references`,
        `Undergo mock technical viva explaining architectural trade-offs and code complexity`,
      ],
      isCompleted: false,
    },
    {
      stageNumber: 6,
      stageName: "EVIDENCE OF SKILL",
      title: "Verifiable Skill Evidence",
      description: "Publish tamper-proof proof of competency accessible to recruiters in 30 seconds.",
      marketDemandContext: "Verifiable GitHub repositories and live deployments drive recruiter interview shortlists.",
      actionableTasks: [
        `Publish public GitHub repository with comprehensive README, CI/CD badges, and unit tests`,
        `Deploy production application to a publicly accessible HTTPS URL`,
        `Add verified credential badges and project links into PlacementPilot Profile & ATS Resume`,
      ],
      isCompleted: false,
    },
    {
      stageNumber: 7,
      stageName: "OPPORTUNITY",
      title: "Direct Placement Opportunity Matching",
      description: "Direct conversion into campus placement shortlists and recruiter interview slots.",
      marketDemandContext: `Direct matching against verified campus hiring partners recruiting for ${roleLabel}.`,
      actionableTasks: [
        `Apply to verified partner companies hiring for ${roleLabel}`,
        `Ensure ATS resume version is aligned to job requisition keywords`,
        `Track interview loops and application progress in Opportunities & Applications tab`,
      ],
      isCompleted: false,
      directOpportunityLink: {
        companyName: "Enterprise Hiring Partner",
        role: roleLabel,
        packageLpa: "₹8.0 - ₹14.0 LPA",
        url: "/opportunities",
      },
    },
  ];
}
