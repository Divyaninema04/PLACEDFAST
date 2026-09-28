import { PDFParse } from "pdf-parse";
import { callGateway } from "../services/ai.service.js";
import { extractJson } from "./json-parser.js";
import { config } from "../config/env.js";

export interface ExtractedResumeData {
  fullName?: string;
  email?: string;
  phone?: string;
  college?: string;
  degree?: string;
  branch?: string;
  graduationYear?: number;
  cgpa?: number;
  skills: string[];
  projects: Array<{ title: string; techStack?: string[]; description?: string }>;
  experience: Array<{ company: string; role: string; duration?: string; description?: string }>;
  certifications: string[];
  links: {
    github?: string;
    linkedin?: string;
    portfolio?: string;
  };
}

const COMMON_SKILLS = [
  "Python", "JavaScript", "TypeScript", "Java", "C++", "C", "C#", "Go", "Rust", "PHP", "Ruby", "Swift", "Kotlin",
  "React", "React Native", "Next.js", "Vue.js", "Angular", "Node.js", "Express", "NestJS", "FastAPI", "Django", "Flask", "Spring Boot",
  "HTML", "CSS", "Tailwind CSS", "Bootstrap", "Sass",
  "SQL", "PostgreSQL", "MySQL", "MongoDB", "Redis", "SQLite", "Firebase", "Supabase", "Prisma",
  "Docker", "Kubernetes", "AWS", "Azure", "GCP", "Git", "GitHub", "GitLab", "CI/CD", "Linux",
  "Machine Learning", "Deep Learning", "TensorFlow", "PyTorch", "Pandas", "NumPy", "Scikit-Learn", "OpenCV", "NLP",
  "Data Structures", "Algorithms", "System Design", "REST API", "GraphQL", "Microservices", "Kafka", "RabbitMQ",
  "Agile", "Scrum", "Jira", "Figma"
];

export async function parsePdfBuffer(buffer: Buffer | Uint8Array): Promise<string> {
  const uint8 = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
  const parser = new PDFParse({ data: uint8 });
  try {
    const textResult = await parser.getText();
    return textResult.text || "";
  } finally {
    try {
      await parser.destroy();
    } catch {
      // ignore destruction errors
    }
  }
}

export function extractDataHeuristically(rawText: string): ExtractedResumeData {
  const lines = rawText.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);

  // 1. Email
  const emailMatch = rawText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  const email = emailMatch ? emailMatch[0] : undefined;

  // 2. Phone
  const phoneMatch = rawText.match(/(?:\+91[\s-]?)?[6-9]\d{4}[\s-]?\d{5}|\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
  const phone = phoneMatch ? phoneMatch[0] : undefined;

  // 3. Links
  const githubMatch = rawText.match(/https?:\/\/(?:www\.)?github\.com\/[a-zA-Z0-9_-]+/i);
  const linkedinMatch = rawText.match(/https?:\/\/(?:www\.)?linkedin\.com\/in\/[a-zA-Z0-9_-]+/i);
  const portfolioMatch = rawText.match(/https?:\/\/(?:www\.)?(?!github\.com|linkedin\.com)[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}(?:\/[^\s]*)?/i);

  // 4. Name: Look at the first 3 lines that do not contain keywords or emails
  let fullName: string | undefined;
  for (const line of lines.slice(0, 5)) {
    if (
      !line.includes("@") &&
      !line.includes("http") &&
      !line.match(/\d/) &&
      !line.toLowerCase().includes("resume") &&
      !line.toLowerCase().includes("curriculum") &&
      line.length >= 3 &&
      line.length <= 40
    ) {
      fullName = line;
      break;
    }
  }

  // 5. Degree & Branch
  let degree: string | undefined;
  let branch: string | undefined;

  if (/\bB\.?Tech\b|\bB\.?E\.?\b|\bBachelor of Technology\b|\bBachelor of Engineering\b/i.test(rawText)) {
    degree = "B.Tech";
  } else if (/\bM\.?Tech\b|\bM\.?E\.?\b|\bMaster of Technology\b/i.test(rawText)) {
    degree = "M.Tech";
  } else if (/\bBCA\b/i.test(rawText)) {
    degree = "BCA";
  } else if (/\bMCA\b/i.test(rawText)) {
    degree = "MCA";
  } else if (/\bB\.?Sc\b|\bBachelor of Science\b/i.test(rawText)) {
    degree = "B.Sc";
  }

  if (/Computer Science|Computer Engineering|CSE|CS/i.test(rawText)) {
    branch = "Computer Engineering";
  } else if (/Information Technology|IT\b/i.test(rawText)) {
    branch = "Information Technology";
  } else if (/Artificial Intelligence|Data Science|AI & DS|AI\/ML/i.test(rawText)) {
    branch = "Artificial Intelligence and Data Science";
  } else if (/Electronics|ECE|Electrical/i.test(rawText)) {
    branch = "Electronics and Telecommunication";
  } else if (/Mechanical/i.test(rawText)) {
    branch = "Mechanical Engineering";
  }

  // 6. College
  let college: string | undefined;
  for (const line of lines) {
    if (/Institute|University|College|School of Engineering|IIT|NIT|IIIT|BITS|COEP|PICT|VIT/i.test(line)) {
      if (line.length <= 100 && !line.includes("@") && !line.includes("http")) {
        college = line.replace(/^[•\-\*]\s*/, "").trim();
        break;
      }
    }
  }

  // 7. Graduation Year
  let graduationYear: number | undefined;
  const yearMatches = rawText.match(/\b(202[3-9]|2030)\b/g);
  if (yearMatches && yearMatches.length > 0) {
    const years = yearMatches.map(Number).sort((a, b) => b - a);
    graduationYear = years[0];
  }

  // 8. CGPA
  let cgpa: number | undefined;
  const cgpaMatch = rawText.match(/(?:CGPA|GPA|Score)[\s:]*([6-9]\.\d{1,2}|10(?:\.0{1,2})?)/i) ||
                    rawText.match(/\b([6-9]\.\d{1,2})\s*\/\s*10\b/);
  if (cgpaMatch && cgpaMatch[1]) {
    cgpa = parseFloat(cgpaMatch[1]);
  }

  // 9. Skills: match against known list
  const lowerText = rawText.toLowerCase();
  const matchedSkills: string[] = [];
  for (const skill of COMMON_SKILLS) {
    const escaped = skill.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(`(?:^|[\\s,;()/\\[\\]:])${escaped}(?:$|[\\s,;()/\\[\\]:])`, "i");
    if (regex.test(rawText)) {
      matchedSkills.push(skill);
    }
  }

  // 10. Projects: scan lines with project markers
  const projects: Array<{ title: string; techStack?: string[]; description?: string }> = [];
  let inProjects = false;
  let currentProject: { title: string; techStack?: string[]; description?: string } | null = null;

  for (const line of lines) {
    if (/^(PROJECTS|ACADEMIC PROJECTS|KEY PROJECTS)/i.test(line)) {
      inProjects = true;
      continue;
    }
    if (inProjects && /^(EXPERIENCE|SKILLS|EDUCATION|CERTIFICATIONS|ACHIEVEMENTS|PUBLICATIONS)/i.test(line)) {
      inProjects = false;
      if (currentProject) projects.push(currentProject);
      break;
    }
    if (inProjects) {
      if (line.length > 3 && line.length < 60 && !line.startsWith("•") && !line.startsWith("-")) {
        if (currentProject) projects.push(currentProject);
        currentProject = { title: line, techStack: [], description: "" };
      } else if (currentProject) {
        currentProject.description = ((currentProject.description || "") + " " + line).trim();
      }
    }
  }
  if (currentProject && projects.length < 5) {
    projects.push(currentProject);
  }

  return {
    fullName,
    email,
    phone,
    college,
    degree,
    branch,
    graduationYear,
    cgpa,
    skills: matchedSkills,
    projects: projects.slice(0, 5),
    experience: [],
    certifications: [],
    links: {
      github: githubMatch ? githubMatch[0] : undefined,
      linkedin: linkedinMatch ? linkedinMatch[0] : undefined,
      portfolio: portfolioMatch ? portfolioMatch[0] : undefined,
    },
  };
}

export async function extractResumeData(rawText: string): Promise<ExtractedResumeData> {
  const heuristic = extractDataHeuristically(rawText);

  // If AI key is available, use Gemini to refine structured extraction
  if (config.lovableApiKey) {
    try {
      const prompt = `You are a resume parser. Extract structured data from this resume text into strict JSON.
Only extract facts present in the text. Return null for fields not found.

JSON format:
{
  "fullName": string | null,
  "email": string | null,
  "phone": string | null,
  "college": string | null,
  "degree": string | null,
  "branch": string | null,
  "graduationYear": number | null,
  "cgpa": number | null,
  "skills": string[],
  "projects": [{ "title": string, "techStack": string[], "description": string }],
  "experience": [{ "company": string, "role": string, "duration": string, "description": string }],
  "certifications": string[],
  "links": { "github": string | null, "linkedin": string | null, "portfolio": string | null }
}

RESUME TEXT:
${rawText.slice(0, 10000)}`;

      const res = await callGateway({
        messages: [
          { role: "system", content: "You output strict JSON only without any markdown formatting or explanations." },
          { role: "user", content: prompt },
        ],
      });

      const parsed = extractJson(res.choices?.[0]?.message?.content ?? "") as Partial<ExtractedResumeData>;
      if (parsed && typeof parsed === "object") {
        return {
          fullName: parsed.fullName || heuristic.fullName,
          email: parsed.email || heuristic.email,
          phone: parsed.phone || heuristic.phone,
          college: parsed.college || heuristic.college,
          degree: parsed.degree || heuristic.degree,
          branch: parsed.branch || heuristic.branch,
          graduationYear: parsed.graduationYear || heuristic.graduationYear,
          cgpa: parsed.cgpa || heuristic.cgpa,
          skills: Array.from(new Set([...(parsed.skills || []), ...(heuristic.skills || [])])),
          projects: parsed.projects?.length ? parsed.projects : heuristic.projects,
          experience: parsed.experience || heuristic.experience,
          certifications: parsed.certifications || heuristic.certifications,
          links: {
            github: parsed.links?.github || heuristic.links.github,
            linkedin: parsed.links?.linkedin || heuristic.links.linkedin,
            portfolio: parsed.links?.portfolio || heuristic.links.portfolio,
          },
        };
      }
    } catch (err) {
      console.warn("[AI Resume Parser Error, using heuristic]:", err);
    }
  }

  return heuristic;
}
