import type { Response, NextFunction } from "express";
import type { AuthenticatedRequest } from "../middleware/auth.middleware.js";
import { Application } from "../models/Application.js";
import { isDbConnected } from "../config/db.js";

export async function getApplicationsHandler(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!isDbConnected()) {
      res.json({ success: true, data: [] });
      return;
    }
    const userId = req.userId;
    const applications = await Application.find({ userId }).sort({ createdAt: -1 });
    res.json({ success: true, data: applications });
  } catch (err) {
    res.json({ success: true, data: [] });
  }
}

export async function createApplicationHandler(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.userId;
    const { company_name, companyName, role, status, package_lpa, packageLpa, location, notes } = req.body;

    const application = await Application.create({
      userId,
      companyName: companyName || company_name,
      role,
      status: status || "applied",
      packageLpa: packageLpa || package_lpa,
      location,
      notes,
    });

    res.status(201).json({ success: true, data: application });
  } catch (err) {
    next(err);
  }
}

export async function updateApplicationHandler(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const updateData = req.body;

    if (updateData.package_lpa !== undefined) updateData.packageLpa = updateData.package_lpa;
    if (updateData.company_name !== undefined) updateData.companyName = updateData.company_name;

    const application = await Application.findByIdAndUpdate(id, { $set: updateData }, { new: true });
    res.json({ success: true, data: application });
  } catch (err) {
    next(err);
  }
}

export async function deleteApplicationHandler(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    await Application.findByIdAndDelete(id);
    res.json({ success: true, message: "Application deleted successfully" });
  } catch (err) {
    next(err);
  }
}
