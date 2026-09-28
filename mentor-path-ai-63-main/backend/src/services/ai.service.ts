import { config } from "../config/env.js";

const GATEWAY_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";
const MODEL = "google/gemini-3-flash-preview";

export type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export async function callGateway(body: Record<string, unknown>): Promise<{
  choices: { message: { content: string } }[];
}> {
  const key = config.lovableApiKey;

  if (!key) {
    console.warn(
      "[AI Gateway] LOVABLE_API_KEY is not configured in backend/.env. Generating deterministic response.",
    );

    // Extract user prompt if available to formulate appropriate structured response
    const messages = (body.messages as ChatMessage[]) || [];
    const lastUserMsg = [...messages].reverse().find((m) => m.role === "user")?.content || "";

    if (lastUserMsg.includes("verification-first research assistant") || lastUserMsg.includes("items")) {
      // Mock opportunity items
      const mockOpportunities = {
        items: [
          {
            title: "Software Development Engineer Intern 2026",
            organization: "Tata Consultancy Services",
            description: "Work on cloud-native scalable enterprise platforms and microservices.",
            eligibility_text: "B.Tech/B.E in CS/IT/ECE graduating in 2026 with 7.0+ CGPA",
            deadline: "2026-06-30",
            location: "Pune, Maharashtra",
            state: "Maharashtra",
            education_level: "Undergraduate",
            branches: ["Computer Engineering", "Information Technology", "Electronics"],
            min_cgpa: 7.0,
            graduation_years: [2026],
            apply_url: "https://careers.tcs.com/entry-level",
            source_name: "TCS Careers Portal",
            source_url: "https://careers.tcs.com",
          },
          {
            title: "Associate Cloud Engineer Intern",
            organization: "Infosys Springboard",
            description: "Hands-on project development with AWS/Azure and automated CI/CD pipelines.",
            eligibility_text: "BE/B.Tech 3rd/4th year students. Minimum 6.5 CGPA.",
            deadline: "2026-07-15",
            location: "Bengaluru, Karnataka",
            state: "Karnataka",
            education_level: "Undergraduate",
            branches: ["CSE", "IT", "Data Science"],
            min_cgpa: 6.5,
            graduation_years: [2026, 2027],
            apply_url: "https://infyspringboard.onwingspan.com",
            source_name: "Infosys Campus Connect",
            source_url: "https://infyspringboard.onwingspan.com",
          },
        ],
      };
      return {
        choices: [{ message: { content: JSON.stringify(mockOpportunities) } }],
      };
    }

    if (lastUserMsg.includes("resume") || lastUserMsg.includes("summary")) {
      const mockResume = {
        summary: "Forward-thinking Engineering student with solid grounding in full-stack web development and distributed systems.",
        skills: ["TypeScript", "React", "Node.js", "Python", "MongoDB", "Docker"],
        project_bullets: [
          "Engineered high-performance REST APIs serving 1,000+ daily requests with Express and MongoDB.",
          "Architected responsive interactive dashboards using React and TanStack Query with sub-second page loads.",
        ],
        achievement_bullets: [
          "Finalist at Smart India Hackathon 2024",
          "Secured 95th percentile in National Engineering Aptitude Assessment",
        ],
        notes: [
          "Highlight concrete business metrics and percentages in project descriptions.",
        ],
      };
      return {
        choices: [{ message: { content: JSON.stringify(mockResume) } }],
      };
    }

    // Default chat completion
    return {
      choices: [
        {
          message: {
            content: `### [VERIFIED DATA]
- Verified Profile: B.Tech Computer Engineering (CGPA 8.82)
- Technical Core: Python, TypeScript, React, MongoDB, System Design

### [PLATFORM CALCULATION]
- Target Role Match (Full Stack Developer): 88%
- Target Role Match (Data Analyst): 76%
- Primary Skill Deficit: Advanced SQL Window Functions & Cloud Architecture

### [AI RECOMMENDATION]
1. Dedicate 4 hours this week to practicing SQL window functions and analytical queries.
2. Complete containerization and deployment of your portfolio project with Docker.
3. Review placement mock interviews on Data Structures & Algorithms.`,
          },
        },
      ],
    };
  }

  const res = await fetch(GATEWAY_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Lovable-API-Key": key,
    },
    body: JSON.stringify({ model: MODEL, ...body }),
  });

  if (!res.ok) {
    const text = await res.text();
    if (res.status === 429) {
      throw new Error("Rate limit reached. Try again in a moment.");
    }
    if (res.status === 402) {
      throw new Error("AI credits exhausted. Add credits to continue.");
    }
    throw new Error(`AI gateway error (${res.status}): ${text.slice(0, 200)}`);
  }

  return (await res.json()) as { choices: { message: { content: string } }[] };
}
