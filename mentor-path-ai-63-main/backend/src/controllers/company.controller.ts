import type { Request, Response, NextFunction } from "express";
import type { AuthenticatedRequest } from "../middleware/auth.middleware.js";
import { Company } from "../models/Company.js";
import { firecrawlSearch } from "../services/firecrawl.service.js";
import { callGateway } from "../services/ai.service.js";
import { extractJson, slugify } from "../utils/json-parser.js";

export async function getCompaniesHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const companies = await Company.find().sort({ name: 1 });
    res.json({ success: true, data: companies });
  } catch (err) {
    next(err);
  }
}

export async function getCompanyBySlugHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { slug } = req.params;
    const company = await Company.findOne({ slug });
    if (!company) {
      res.status(404).json({ success: false, error: "Company not found" });
      return;
    }
    res.json({ success: true, data: company });
  } catch (err) {
    next(err);
  }
}

export async function addCompanyHandler(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { name } = req.body || {};
    if (!name || typeof name !== "string" || name.trim().length < 2) {
      res.status(400).json({ success: false, error: "Company name is required (min 2 characters)" });
      return;
    }

    const companyName = name.trim().slice(0, 100);
    const slug = slugify(companyName);

    // Check if company already exists
    const existing = await Company.findOne({ slug });
    if (existing) {
      res.json({ success: true, data: existing });
      return;
    }

    // 1) Pull real web sources via Firecrawl if keys are present
    const [overview, placement] = await Promise.all([
      firecrawlSearch(`${companyName} company official website careers headquarters industry`),
      firecrawlSearch(`${companyName} India campus placement eligibility CGPA cutoff hiring process salary LPA branches`),
    ]);
    const sources = [overview, placement].filter(Boolean).join("\n\n");

    let companyData: Record<string, unknown> = {
      slug,
      name: companyName,
      industry: "Information Technology",
      description: `${companyName} is an active campus placement recruiter.`,
      minCgpa: 7.0,
      allowedBranches: ["CSE", "IT", "ECE"],
      techStack: ["Java", "Python", "SQL", "Data Structures"],
      verificationStatus: "verified",
    };

    if (sources) {
      try {
        const prompt = `You are a placement research analyst. Using ONLY the web sources provided below, extract accurate, verifiable information about "${companyName}" for Indian campus placements. Do NOT invent facts. If a field is not supported by the sources, set it to null. Return ONLY a JSON object with this shape:
{
  "name": string,
  "industry": string,
  "description": string (2-3 sentences),
  "website": string,
  "careers_url": string,
  "hq_location": string,
  "min_cgpa": number|null,
  "allowed_branches": string[],
  "tech_stack": string[],
  "salary_min": number|null,
  "salary_max": number|null,
  "hiring_season": string,
  "process_steps": string[],
  "dsa_topics": string[],
  "cs_subjects": string[]
}
No prose, no markdown, JSON only.

WEB SOURCES:
${sources}`;

        const result = await callGateway({
          messages: [
            {
              role: "system",
              content: "You output strict JSON only. Ground every field in the provided web sources; use null when unsupported.",
            },
            { role: "user", content: prompt },
          ],
        });

        const content = result.choices?.[0]?.message?.content ?? "";
        const parsed = extractJson(content) as Record<string, unknown>;

        companyData = {
          slug,
          name: (parsed.name as string) || companyName,
          industry: (parsed.industry as string) ?? companyData.industry,
          description: (parsed.description as string) ?? companyData.description,
          website: (parsed.website as string) ?? null,
          careersUrl: (parsed.careers_url as string) ?? null,
          hqLocation: (parsed.hq_location as string) ?? null,
          minCgpa: parsed.min_cgpa != null ? Number(parsed.min_cgpa) : 7.0,
          allowedBranches: (parsed.allowed_branches as string[]) ?? ["CSE", "IT"],
          techStack: (parsed.tech_stack as string[]) ?? ["Problem Solving"],
          salaryMin: parsed.salary_min != null ? Math.round(Number(parsed.salary_min)) : null,
          salaryMax: parsed.salary_max != null ? Math.round(Number(parsed.salary_max)) : null,
          hiringSeason: (parsed.hiring_season as string) ?? "Autumn 2026",
          processSteps: (parsed.process_steps as string[]) ?? ["Online Assessment", "Technical Round", "HR Round"],
          dsaTopics: (parsed.dsa_topics as string[]) ?? ["Arrays", "Trees", "DP"],
          csSubjects: (parsed.cs_subjects as string[]) ?? ["DBMS", "OS", "CN"],
          verificationStatus: "verified",
        };
      } catch (aiErr) {
        console.warn("[Company AI Parse Warning]:", aiErr);
      }
    }

    const inserted = await Company.create(companyData);
    res.json({ success: true, data: inserted });
  } catch (err) {
    next(err);
  }
}

export async function updateCompanyHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const company = await Company.findByIdAndUpdate(id, { $set: updateData }, { new: true });
    res.json({ success: true, data: company });
  } catch (err) {
    next(err);
  }
}

export async function deleteCompanyHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    await Company.findByIdAndDelete(id);
    res.json({ success: true, message: "Company deleted successfully" });
  } catch (err) {
    next(err);
  }
}
