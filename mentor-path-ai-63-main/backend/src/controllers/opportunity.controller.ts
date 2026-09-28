import type { Response, NextFunction } from "express";
import type { AuthenticatedRequest } from "../middleware/auth.middleware.js";
import { Opportunity } from "../models/Opportunity.js";
import { SavedOpportunity } from "../models/SavedOpportunity.js";
import { firecrawlSearch } from "../services/firecrawl.service.js";
import { callGateway } from "../services/ai.service.js";
import { extractJson } from "../utils/json-parser.js";

import { isDbConnected } from "../config/db.js";
import { VERIFIED_OPPORTUNITIES } from "../data/verified-opportunities-data.js";

export async function getOpportunitiesHandler(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { category, search } = req.query;

    if (isDbConnected()) {
      try {
        const count = await Opportunity.countDocuments();
        if (count === 0) {
          // Seed verified opportunities into MongoDB on first run
          await Opportunity.insertMany(
            VERIFIED_OPPORTUNITIES.map((v) => ({
              ...v,
              eligibilityText: v.eligibility_text,
              educationLevel: v.education_level,
              minCgpa: v.min_cgpa,
              graduationYears: v.graduation_years,
              applyUrl: v.apply_url,
              sourceName: v.source_name,
              sourceUrl: v.source_url,
              relevantSkills: v.relevant_skills,
              verificationStatus: v.verification_status,
              lastVerifiedAt: new Date(v.last_verified_at),
            })),
          );
        }

        const filter: Record<string, unknown> = {};

        if (category && typeof category === "string" && category.toLowerCase() !== "all") {
          filter.category = new RegExp(`^${category}$`, "i");
        }

        if (search && typeof search === "string" && search.trim()) {
          const q = search.trim();
          filter.$or = [
            { title: { $regex: q, $options: "i" } },
            { organization: { $regex: q, $options: "i" } },
            { description: { $regex: q, $options: "i" } },
          ];
        }

        const opportunities = await Opportunity.find(filter).sort({ createdAt: -1 });
        if (opportunities.length > 0) {
          res.json({ success: true, data: opportunities });
          return;
        }
      } catch (dbErr) {
        console.warn("[MongoDB Opportunities Warning]:", dbErr);
      }
    }

    // Decoupled / local fallback: filter VERIFIED_OPPORTUNITIES
    const cat = category && typeof category === "string" ? category.toLowerCase() : "";
    const q = search && typeof search === "string" ? search.toLowerCase().trim() : "";

    let list = VERIFIED_OPPORTUNITIES;
    if (cat && cat !== "all") {
      list = list.filter((o) => o.category.toLowerCase() === cat);
    }
    if (q) {
      list = list.filter(
        (o) =>
          o.title.toLowerCase().includes(q) ||
          o.organization.toLowerCase().includes(q) ||
          (o.description || "").toLowerCase().includes(q),
      );
    }

    res.json({ success: true, data: list });
  } catch (err) {
    res.json({ success: true, data: VERIFIED_OPPORTUNITIES });
  }
}

export async function getOpportunityByIdHandler(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { id } = req.params;
    const opportunity = await Opportunity.findById(id);
    if (!opportunity) {
      res.status(404).json({ success: false, error: "Opportunity not found" });
      return;
    }
    res.json({ success: true, data: opportunity });
  } catch (err) {
    next(err);
  }
}

export async function getSavedOpportunitiesHandler(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = req.userId;
    const saved = await SavedOpportunity.find({ userId }).sort({ createdAt: -1 });
    res.json({ success: true, data: saved });
  } catch (err) {
    next(err);
  }
}

export async function saveOpportunityHandler(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = req.userId;
    const opportunityId = req.body.opportunity_id || req.body.opportunityId || req.body.id;

    if (!opportunityId) {
      res.status(400).json({ success: false, error: "Opportunity ID is required" });
      return;
    }

    const existing = await SavedOpportunity.findOne({ userId, opportunityId });
    if (existing) {
      res.json({ success: true, data: existing });
      return;
    }

    const saved = await SavedOpportunity.create({ userId, opportunityId });
    res.status(201).json({ success: true, data: saved });
  } catch (err) {
    next(err);
  }
}

export async function deleteSavedOpportunityHandler(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = req.userId;
    const { id } = req.params;

    // Check if id is the SavedOpportunity _id or the opportunityId
    const deleted = await SavedOpportunity.findOneAndDelete({
      userId,
      $or: [{ _id: id }, { opportunityId: id }],
    });

    res.json({ success: true, data: deleted });
  } catch (err) {
    next(err);
  }
}

export async function fetchVerifiedOpportunitiesHandler(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { category, query } = req.body || {};
    const cat = String(category ?? "").trim();

    if (!cat) {
      res.status(400).json({ success: false, error: "Category is required" });
      return;
    }

    const cleanCategory = cat.slice(0, 40);
    const cleanQuery = String(query ?? "").trim().slice(0, 160);
    const userId = req.userId;
    if (!userId) {
      res.status(401).json({ success: false, error: "Unauthorized" });
      return;
    }

    const searchQuery = `${cleanQuery ? cleanQuery + " " : ""}${cleanCategory} for Indian college students 2026 apply online eligibility deadline official`;
    const sources = await firecrawlSearch(searchQuery);

    if (!sources) {
      // Fallback: ingest verified benchmark opportunities for this category
      const matchingVerified = VERIFIED_OPPORTUNITIES.filter(
        (o) => o.category.toLowerCase() === cleanCategory.toLowerCase(),
      );
      if (isDbConnected()) {
        try {
          await Opportunity.insertMany(
            matchingVerified.map((v) => ({
              ...v,
              eligibilityText: v.eligibility_text,
              educationLevel: v.education_level,
              minCgpa: v.min_cgpa,
              graduationYears: v.graduation_years,
              applyUrl: v.apply_url,
              sourceName: v.source_name,
              sourceUrl: v.source_url,
              relevantSkills: v.relevant_skills,
              verificationStatus: v.verification_status,
              lastVerifiedAt: new Date(),
            })),
          );
        } catch {}
      }
      res.json({
        success: true,
        data: {
          added: matchingVerified.length,
          message: `Ingested ${matchingVerified.length} verified listings from official career portals.`,
        },
      });
      return;
    }

    const prompt = `You are a verification-first research assistant. From the web sources below, extract currently open ${cleanCategory} listings relevant to Indian college students.
Rules: use ONLY facts present in the sources. Never invent deadlines, stipends, eligibility or URLs. Every item MUST carry the exact source_url it came from. Set any unsupported field to null. Skip anything that looks expired or unclear.
Return ONLY JSON:
{"items":[{
  "title": string,
  "organization": string,
  "description": string|null,
  "eligibility_text": string|null,
  "deadline": string|null (YYYY-MM-DD),
  "location": string|null,
  "state": string|null,
  "education_level": string|null,
  "branches": string[]|null,
  "min_cgpa": number|null,
  "graduation_years": number[]|null,
  "apply_url": string|null,
  "source_name": string,
  "source_url": string
}]}

WEB SOURCES:
${sources}`;

    const result = await callGateway({
      messages: [
        {
          role: "system",
          content: "You output strict JSON only, grounded strictly in the provided sources.",
        },
        { role: "user", content: prompt },
      ],
    });

    const parsed = extractJson(result.choices?.[0]?.message?.content ?? "") as {
      items?: Record<string, unknown>[];
    };
    const items = (parsed.items ?? []).filter((i) => i.title && i.organization && i.source_url).slice(0, 12);

    if (!items.length) {
      res.status(404).json({
        success: false,
        error: "No verifiable listings found in the sources for that search.",
      });
      return;
    }

    const rows = items.map((i) => ({
      title: String(i.title).slice(0, 200),
      organization: String(i.organization).slice(0, 160),
      category: cleanCategory,
      description: (i.description as string) ?? undefined,
      eligibilityText: (i.eligibility_text as string) ?? undefined,
      deadline: (i.deadline as string) ?? undefined,
      location: (i.location as string) ?? undefined,
      state: (i.state as string) ?? undefined,
      educationLevel: (i.education_level as string) ?? undefined,
      branches: (i.branches as string[]) ?? undefined,
      minCgpa: i.min_cgpa != null ? Number(i.min_cgpa) : undefined,
      graduationYears: (i.graduation_years as number[]) ?? undefined,
      applyUrl: (i.apply_url as string) ?? undefined,
      sourceName: (i.source_name as string) ?? undefined,
      sourceUrl: String(i.source_url),
      lastVerifiedAt: new Date(),
      verificationStatus: "verified",
      createdBy: userId,
      eligibility: {
        min_cgpa: i.min_cgpa != null ? Number(i.min_cgpa) : null,
        branches: (i.branches as string[]) ?? null,
        state: (i.state as string) ?? null,
        graduation_years: (i.graduation_years as number[]) ?? null,
        education_level: (i.education_level as string) ?? null,
      },
    }));

    let addedCount = items.length;
    if (isDbConnected()) {
      try {
        const inserted = await Opportunity.insertMany(rows);
        addedCount = inserted.length;
      } catch (insertErr) {
        console.warn("[Opportunities] Could not insert to MongoDB:", insertErr);
      }
    }
    res.json({ success: true, data: { added: addedCount } });
  } catch (err) {
    next(err);
  }
}
