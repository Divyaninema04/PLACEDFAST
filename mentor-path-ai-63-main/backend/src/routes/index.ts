import { Router } from "express";
import authRoutes from "./auth.routes.js";
import userRoutes from "./user.routes.js";
import companyRoutes from "./company.routes.js";
import applicationRoutes from "./application.routes.js";
import academicRoutes from "./academic.routes.js";
import resumeRoutes from "./resume.routes.js";
import opportunityRoutes from "./opportunity.routes.js";
import mentorRoutes from "./mentor.routes.js";
import roadmapRoutes from "./roadmap.routes.js";

const apiRouter = Router();

apiRouter.get("/health", (_req, res) => {
  res.json({ status: "healthy", timestamp: new Date().toISOString() });
});

apiRouter.use("/auth", authRoutes);
apiRouter.use("/user", userRoutes);
apiRouter.use("/profile", userRoutes);
apiRouter.use("/companies", companyRoutes);
apiRouter.use("/applications", applicationRoutes);
apiRouter.use("/academics", academicRoutes);
apiRouter.use("/resumes", resumeRoutes);
apiRouter.use("/resume", resumeRoutes); // alias for /api/resume/suggest compatibility
apiRouter.use("/opportunities", opportunityRoutes);
apiRouter.use("/mentor", mentorRoutes);
apiRouter.use("/roadmap", roadmapRoutes);

export default apiRouter;
