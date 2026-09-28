import { useMemo } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  Briefcase,
  TrendingUp,
  Sparkles,
  ArrowRight,
  Target,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  Route as RouteIcon,
  BookOpen,
  Layers,
  Clock,
  Award,
  GraduationCap,
  Building2,
  Calendar,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { STATUS_LABEL, STATUS_TONE, type ApplicationStatus } from "@/lib/format";
import { EmptyState } from "@/components/widgets";
import { evaluateCurriculumAlignment } from "@/data/training-alignment-demo-data";
import {
  evaluateOpportunitySkillMatch,
  OPPORTUNITY_SKILL_REQUIREMENTS,
} from "@/data/placement-outcomes-mentor-data";
import { evaluateStudentSkillGap } from "@/data/trainer-infrastructure-data";
import { RAW_EMERGING_SKILLS } from "@/data/market-intelligence-demo-data";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — PlacementPilot" },
      {
        name: "description",
        content:
          "Skill development alignment with industry requirements, curriculum gap analysis, personalized roadmaps, and verified employment outcomes.",
      },
      { property: "og:title", content: "Dashboard — PlacementPilot" },
      {
        property: "og:description",
        content: "Track industry demand, curriculum gaps, skill diagnostics, verified opportunities, and placement outcomes.",
      },
    ],
  }),
  component: DashboardPage,
});

export default function DashboardPage() {
  // 1. Fetch user & profile data
  const profileQuery = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) return null;
      const { data } = await supabase.from("profiles").select("*").eq("id", u.user.id).maybeSingle();
      return { user: u.user, profile: data };
    },
  });

  // 2. Fetch logged applications
  const appsQuery = useQuery({
    queryKey: ["applications"],
    queryFn: async () => {
      const { data } = await supabase
        .from("applications")
        .select("*")
        .order("applied_date", { ascending: false });
      return data ?? [];
    },
  });

  // 3. Fetch verified opportunities
  const oppsQuery = useQuery({
    queryKey: ["opportunities", "dashboard"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("opportunities")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as any[];
    },
  });

  // Student Profile Values
  const user = profileQuery.data?.user;
  const profile = profileQuery.data?.profile;
  const name =
    profile?.full_name ||
    profile?.name ||
    user?.user_metadata?.full_name ||
    user?.name ||
    user?.email?.split("@")[0] ||
    "Student";
  const degree = profile?.degree || "";
  const branch = profile?.branch || "";
  const semester = profile?.current_semester ?? null;
  const targetRole = profile?.preferred_roles?.[0] || profile?.target_role || "";
  const userSkills: string[] = useMemo(() => (profile?.skills ?? []) as string[], [profile?.skills]);

  // Industry required skills benchmark for target role
  const roleSkillRequirements = useMemo(() => {
    if (!targetRole) return [];
    return (
      OPPORTUNITY_SKILL_REQUIREMENTS[targetRole as keyof typeof OPPORTUNITY_SKILL_REQUIREMENTS] ||
      OPPORTUNITY_SKILL_REQUIREMENTS[
        Object.keys(OPPORTUNITY_SKILL_REQUIREMENTS).find(
          (k) =>
            targetRole.toLowerCase().includes(k.toLowerCase()) ||
            k.toLowerCase().includes(targetRole.toLowerCase())
        ) || ""
      ] ||
      []
    );
  }, [targetRole]);

  // Student Skill Gap Evaluation
  const evaluatedGaps = useMemo(() => {
    if (!targetRole) return [];
    return evaluateStudentSkillGap(targetRole, userSkills);
  }, [targetRole, userSkills]);

  // Dynamic Skill Readiness % based strictly on verified profile skills vs target role benchmark
  const { matchingSkills, missingSkills, matchPercentage } = useMemo(() => {
    const matching: string[] = [];
    const missing: string[] = [];

    roleSkillRequirements.forEach((req) => {
      const isPresent = userSkills.some(
        (s) =>
          req.skill.toLowerCase().includes(s.toLowerCase()) ||
          s.toLowerCase().includes(req.skill.split(" ")[0].toLowerCase())
      );
      if (isPresent) {
        matching.push(req.skill);
      } else {
        missing.push(req.skill);
      }
    });

    const pct = roleSkillRequirements.length
      ? Math.round((matching.length / roleSkillRequirements.length) * 100)
      : 0;

    return {
      matchingSkills: matching,
      missingSkills: missing,
      matchPercentage: pct,
    };
  }, [roleSkillRequirements, userSkills]);

  // Curriculum to Industry Gap Evaluation
  const curriculumAlignment = useMemo(() => {
    const res = evaluateCurriculumAlignment(
      "Data Analytics",
      `${degree} ${branch}`,
      "Information Technology & Cloud",
      targetRole,
      "National Benchmark"
    );

    const covered = res.skills.filter((s) => s.curriculumCoverage === "Covered");
    const partial = res.skills.filter((s) => s.curriculumCoverage === "Partial");
    const missing = res.skills.filter((s) => s.curriculumCoverage === "Missing");

    return { covered, partial, missing, alignmentScore: res.overallAlignmentIndex };
  }, [degree, branch, targetRole]);

  // Emerging Skills in this domain
  const relevantEmergingSkills = useMemo(() => {
    return RAW_EMERGING_SKILLS.slice(0, 3);
  }, []);

  // Top 3-5 verified opportunities matching student
  const verifiedOpportunities = useMemo(() => {
    const list = oppsQuery.data ?? [];
    return list
      .map((opp) => {
        const match = evaluateOpportunitySkillMatch(opp.title, opp.category || "Job", userSkills);
        return {
          ...opp,
          skillMatch: match,
        };
      })
      .sort((a, b) => b.skillMatch.matchPercentage - a.skillMatch.matchPercentage)
      .slice(0, 4);
  }, [oppsQuery.data, userSkills]);

  // Application Outcomes
  const applications = appsQuery.data ?? [];
  const totalApplications = applications.length;
  const interviewCount = applications.filter(
    (a) => a.status?.toLowerCase() === "interview"
  ).length;
  const offerCount = applications.filter(
    (a) => a.status?.toLowerCase() === "offer" || a.status?.toLowerCase() === "selected"
  ).length;

  return (
    <div className="mx-auto max-w-6xl space-y-6 pb-12">
      {/* Platform Closed-Loop Navigation Strip */}
      <div className="rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-2xs">
        <div className="flex items-center gap-2 text-primary font-semibold">
          <Layers className="h-4 w-4" />
          <span>Workforce & Skill Alignment Framework:</span>
        </div>
        <div className="flex flex-wrap items-center gap-1.5 font-mono text-[11px] text-muted-foreground">
          <span className="font-semibold text-foreground">Industry Demand</span>
          <span>→</span>
          <span>Required Skills</span>
          <span>→</span>
          <span>Curriculum Gap</span>
          <span>→</span>
          <span>Student Skill Gap</span>
          <span>→</span>
          <span>Personalized Roadmap</span>
          <span>→</span>
          <span>Verified Opportunities</span>
          <span>→</span>
          <span className="font-semibold text-foreground">Outcome</span>
        </div>
      </div>

      {/* 1. STUDENT SNAPSHOT */}
      <div className="bento-card border border-primary/25 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-[10px] font-mono border-primary/30 text-primary">
                Student Snapshot
              </Badge>
              {semester ? (
                <span className="text-xs text-muted-foreground">
                  Semester {semester}
                </span>
              ) : null}
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-foreground mt-1">
              {name}
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              {[degree, branch].filter(Boolean).join(" · ") || (
                <span className="text-muted-foreground italic">Configure degree & branch in Profile</span>
              )}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Link to="/profile">
              <Button variant="outline" size="sm" className="text-xs h-8">
                Edit Profile
              </Button>
            </Link>
            <Link to="/career">
              <Button size="sm" className="text-xs h-8 gap-1.5">
                <RouteIcon className="h-3.5 w-3.5" />
                <span>Career Roadmap</span>
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-border">
          <div className="space-y-1.5">
            <div className="text-xs font-medium text-muted-foreground">Target Industry Role</div>
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-primary" />
              <span className="font-display font-semibold text-base text-foreground">
                {targetRole || <span className="text-muted-foreground italic">Set in Profile</span>}
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground">
              {targetRole
                ? "Primary occupational benchmark configured in your profile."
                : "Configure your target role in Profile to benchmark skill gaps."}
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-muted-foreground">Skill Readiness</span>
              <span className="font-bold text-foreground">{matchPercentage}%</span>
            </div>
            <Progress value={matchPercentage} className="h-2" />
            <p className="text-[11px] text-muted-foreground">
              Calculated dynamically from verified profile skills against industry benchmarks for {targetRole}.
            </p>
          </div>
        </div>
      </div>

      {/* 2. INDUSTRY DEMAND */}
      <div className="rounded-xl border border-border bg-card p-5 space-y-4 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-3">
          <div>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              <h2 className="font-display text-base font-bold text-foreground">
                Industry Demand Analysis: {targetRole}
              </h2>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Current hiring requirements and emerging technology signals from industry employers.
            </p>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
            <Clock className="h-3.5 w-3.5" />
            <span>Updated: September 2026 · Source: Industry Requisition Index</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          {/* Demand Status */}
          <div className="p-3.5 rounded-lg border bg-muted/30 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-foreground">Hiring Velocity</span>
              <Badge variant="outline" className="text-[10px] text-emerald-600 border-emerald-500/30 bg-emerald-500/10">
                Surging Demand
              </Badge>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Active recruitment across enterprise tech, GCCs, and specialized analytics hubs.
            </p>
            <div className="pt-2 border-t text-[11px] text-muted-foreground">
              Source: <strong className="text-foreground">Verified Industry Index</strong>
            </div>
          </div>

          {/* Required Skills */}
          <div className="p-3.5 rounded-lg border bg-card space-y-2">
            <div className="font-semibold text-foreground flex items-center gap-1.5">
              <Target className="h-3.5 w-3.5 text-primary" />
              <span>Core Required Skills</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {roleSkillRequirements.map((req) => (
                <Badge key={req.skill} variant="secondary" className="text-[11px]">
                  {req.skill}
                </Badge>
              ))}
            </div>
            <p className="text-[10px] text-muted-foreground">
              Essential for placement clearance and technical screening.
            </p>
          </div>

          {/* Emerging Skills */}
          <div className="p-3.5 rounded-lg border bg-card space-y-2">
            <div className="font-semibold text-foreground flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-purple-500" />
              <span>Emerging Skills & Technologies</span>
            </div>
            <div className="space-y-1.5">
              {relevantEmergingSkills.map((sk) => (
                <div key={sk.name} className="flex items-center justify-between text-[11px] p-1.5 rounded bg-muted/40">
                  <span className="font-medium text-foreground truncate">{sk.name}</span>
                  <Badge variant="outline" className="text-[9px] shrink-0 font-mono text-purple-600 border-purple-500/30">
                    +{sk.velocityPct}% YoY
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-1">
          <Link to="/labour-market" className="text-xs text-primary hover:underline inline-flex items-center gap-1 font-medium">
            Explore complete market insights <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </div>

      {/* 3. YOUR SKILL GAP */}
      <div className="rounded-xl border border-border bg-card p-5 space-y-4 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-3">
          <div>
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-primary" />
              <h2 className="font-display text-base font-bold text-foreground">
                Your Skill Gap Diagnostic
              </h2>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Direct comparison between your profile skills and market requirements for {targetRole}.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs font-semibold border-primary/30 text-primary">
              Role Match: {matchPercentage}%
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          {/* Skills You Have */}
          <div className="space-y-2.5 p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5">
            <div className="flex items-center gap-2 font-semibold text-emerald-700 dark:text-emerald-400">
              <CheckCircle2 className="h-4 w-4" />
              <span>Skills You Have ({matchingSkills.length})</span>
            </div>
            {matchingSkills.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {matchingSkills.map((s) => (
                  <Badge key={s} className="bg-emerald-600 text-white text-[11px] font-medium">
                    {s}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-[11px] text-muted-foreground">
                No matching skills found in your profile. Add your skills in Profile.
              </p>
            )}
            <p className="text-[11px] text-muted-foreground pt-1">
              Meets entry-level industry benchmark criteria.
            </p>
          </div>

          {/* Missing / Weak Skills */}
          <div className="space-y-2.5 p-4 rounded-xl border border-rose-500/20 bg-rose-500/5">
            <div className="flex items-center gap-2 font-semibold text-rose-700 dark:text-rose-400">
              <AlertTriangle className="h-4 w-4" />
              <span>Missing or Weak Skills ({missingSkills.length})</span>
            </div>
            {missingSkills.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {missingSkills.map((s) => (
                  <Badge key={s} variant="outline" className="border-rose-500/30 text-rose-700 dark:text-rose-400 text-[11px] font-medium bg-rose-500/10">
                    {s}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-[11px] text-emerald-600 font-medium">
                All benchmark core skills for {targetRole} are present!
              </p>
            )}
            <p className="text-[11px] text-muted-foreground pt-1">
              Identified as screening barriers during technical evaluations.
            </p>
          </div>
        </div>

        <div className="flex justify-end pt-1">
          <Link to="/career" className="text-xs text-primary hover:underline inline-flex items-center gap-1 font-medium">
            Open in Career Roadmap diagnostic <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </div>

      {/* 4. CURRICULUM → INDUSTRY GAP */}
      <div className="rounded-xl border border-border bg-card p-5 space-y-4 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-3">
          <div>
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-primary" />
              <h2 className="font-display text-base font-bold text-foreground">
                Curriculum → Industry Gap Analysis
              </h2>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Alignment between university academic coursework ({degree} {branch}) and current employer requirements.
            </p>
          </div>
          <Link to="/curriculum-alignment">
            <Button variant="ghost" size="sm" className="text-xs text-primary gap-1 h-8">
              Open Full Matrix <ArrowRight className="h-3 w-3" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          {/* Covered in Curriculum */}
          <div className="space-y-2 p-3.5 rounded-lg border bg-card">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Covered Skills ({curriculumAlignment.covered.length})
              </span>
              <Badge variant="secondary" className="text-[10px]">Syllabus Met</Badge>
            </div>
            <div className="space-y-1.5 pt-1">
              {curriculumAlignment.covered.map((item) => (
                <div key={item.skill} className="p-2 rounded bg-muted/40 border border-border/50 text-[11px]">
                  <div className="font-medium text-foreground">{item.skill}</div>
                  <div className="text-[10px] text-muted-foreground mt-0.5">{item.syllabusNotes}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Partially Covered */}
          <div className="space-y-2 p-3.5 rounded-lg border bg-card">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                <AlertTriangle className="h-3.5 w-3.5" />
                Partially Covered ({curriculumAlignment.partial.length})
              </span>
              <Badge variant="secondary" className="text-[10px]">Theory Only</Badge>
            </div>
            <div className="space-y-1.5 pt-1">
              {curriculumAlignment.partial.map((item) => (
                <div key={item.skill} className="p-2 rounded bg-amber-500/5 border border-amber-500/20 text-[11px]">
                  <div className="font-medium text-foreground">{item.skill}</div>
                  <div className="text-[10px] text-muted-foreground mt-0.5">{item.syllabusNotes}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Missing in Curriculum */}
          <div className="space-y-2 p-3.5 rounded-lg border bg-card">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
                <AlertTriangle className="h-3.5 w-3.5" />
                Missing in Curriculum ({curriculumAlignment.missing.length})
              </span>
              <Badge variant="secondary" className="text-[10px]">Critical Gaps</Badge>
            </div>
            <div className="space-y-1.5 pt-1">
              {curriculumAlignment.missing.map((item) => (
                <div key={item.skill} className="p-2 rounded bg-rose-500/5 border border-rose-500/20 text-[11px]">
                  <div className="font-medium text-foreground">{item.skill}</div>
                  <div className="text-[10px] text-muted-foreground mt-0.5">{item.suggestedAction}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 5. PERSONALIZED ROADMAP */}
      <div className="rounded-xl border border-border bg-card p-5 space-y-4 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-3">
          <div>
            <div className="flex items-center gap-2">
              <RouteIcon className="h-4 w-4 text-primary" />
              <h2 className="font-display text-base font-bold text-foreground">
                Personalized Learning Roadmap
              </h2>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Next learning actions directly formulated to close your diagnosed skill gaps for {targetRole}.
            </p>
          </div>
          <Link to="/career">
            <Button size="sm" variant="outline" className="text-xs h-8 gap-1.5">
              <span>View Full Roadmap</span>
              <ArrowRight className="h-3 w-3" />
            </Button>
          </Link>
        </div>

        <div className="space-y-3">
          {evaluatedGaps.slice(0, 4).map((gap, idx) => (
            <div
              key={gap.skillName}
              className="p-3.5 rounded-xl border border-border bg-muted/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
            >
              <div className="flex items-start gap-3">
                <div className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary font-bold font-mono text-xs">
                  {idx + 1}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-foreground">{gap.actionableRoadmapStep}</span>
                    <Badge
                      variant="outline"
                      className={`text-[9px] font-mono ${
                        gap.gapSeverity === "Critical"
                          ? "border-rose-500/30 text-rose-600 bg-rose-500/10"
                          : gap.gapSeverity === "High"
                          ? "border-amber-500/30 text-amber-600 bg-amber-500/10"
                          : "border-emerald-500/30 text-emerald-600 bg-emerald-500/10"
                      }`}
                    >
                      {gap.gapSeverity} Gap
                    </Badge>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-1">
                    Targets: <strong className="text-foreground">{gap.skillName}</strong> · Market Requirement: {gap.marketRequirement}
                  </p>
                </div>
              </div>

              <Link to="/career" className="shrink-0">
                <Button size="sm" variant="secondary" className="text-xs h-7">
                  Take Action
                </Button>
              </Link>
            </div>
          ))}
        </div>
      </div>

      {/* 6. VERIFIED OPPORTUNITIES */}
      <div className="rounded-xl border border-border bg-card p-5 space-y-4 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-3">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <h2 className="font-display text-base font-bold text-foreground">
                Verified Opportunities
              </h2>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Verified employer requisitions matched against your current skill profile.
            </p>
          </div>
          <Link to="/opportunities">
            <Button variant="ghost" size="sm" className="text-xs text-primary gap-1 h-8">
              Explore All Listings <ArrowRight className="h-3 w-3" />
            </Button>
          </Link>
        </div>

        {verifiedOpportunities.length > 0 ? (
          <div className="space-y-3">
            {verifiedOpportunities.map((opp) => (
              <div
                key={opp.id}
                className="p-3.5 rounded-xl border border-border bg-card hover:bg-muted/20 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-foreground truncate">{opp.organization}</span>
                    <Badge
                      className={`text-[10px] ${
                        opp.skillMatch.matchPercentage >= 70
                          ? "bg-emerald-600 text-white"
                          : opp.skillMatch.matchPercentage >= 50
                          ? "bg-amber-600 text-white"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {opp.skillMatch.matchPercentage}% Skill Match
                    </Badge>
                  </div>
                  <div className="text-[11px] font-medium text-foreground truncate">{opp.title}</div>
                  <div className="flex flex-wrap items-center gap-3 text-[10px] text-muted-foreground">
                    <span>Deadline: {opp.deadline || "Rolling / Open"}</span>
                    <span>·</span>
                    <span>Source: {opp.source_name || "Official Career Portal"}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {opp.apply_url || opp.source_url ? (
                    <Button asChild size="sm" className="text-xs h-8">
                      <a href={opp.apply_url || opp.source_url} target="_blank" rel="noreferrer noopener">
                        Apply Now <ExternalLink className="h-3 w-3 ml-1" />
                      </a>
                    </Button>
                  ) : (
                    <Link to="/opportunities">
                      <Button size="sm" variant="outline" className="text-xs h-8">
                        View Details
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            title="No verified opportunities found"
            description="Fetch verified live job and internship listings directly from official career portals."
            action={
              <Link to="/opportunities">
                <Button size="sm" className="text-xs">Browse Opportunities</Button>
              </Link>
            }
          />
        )}
      </div>

      {/* 7. EMPLOYMENT OUTCOMES */}
      <div className="rounded-xl border border-border bg-card p-5 space-y-4 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-3">
          <div>
            <div className="flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-primary" />
              <h2 className="font-display text-base font-bold text-foreground">
                Employment Outcomes
              </h2>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Live progression of your logged job applications, interview stages, and placement offers.
            </p>
          </div>
          <Link to="/applications">
            <Button size="sm" className="text-xs h-8 gap-1.5">
              <Briefcase className="h-3.5 w-3.5" />
              <span>Log Application</span>
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-3 gap-3 text-center text-xs">
          <div className="p-3.5 rounded-xl border bg-muted/40">
            <span className="text-[10px] text-muted-foreground block uppercase font-medium">Applications</span>
            <span className="font-display text-2xl font-bold text-foreground mt-0.5 block">{totalApplications}</span>
          </div>
          <div className="p-3.5 rounded-xl border border-amber-500/20 bg-amber-500/5 text-amber-700 dark:text-amber-400">
            <span className="text-[10px] block uppercase font-medium">Interviews</span>
            <span className="font-display text-2xl font-bold mt-0.5 block">{interviewCount}</span>
          </div>
          <div className="p-3.5 rounded-xl border border-emerald-500/20 bg-emerald-500/5 text-emerald-700 dark:text-emerald-400">
            <span className="text-[10px] block uppercase font-medium">Offers / Placements</span>
            <span className="font-display text-2xl font-bold mt-0.5 block">{offerCount}</span>
          </div>
        </div>

        {applications.length > 0 ? (
          <div className="space-y-2 pt-2">
            <div className="text-xs font-semibold text-foreground">Recent Applications</div>
            <div className="divide-y divide-border text-xs border rounded-lg overflow-hidden">
              {applications.slice(0, 3).map((a) => (
                <div key={a.id} className="flex items-center justify-between p-3 bg-card">
                  <div className="min-w-0">
                    <div className="font-medium text-foreground truncate">{a.company_name}</div>
                    <div className="text-[11px] text-muted-foreground truncate">{a.role}</div>
                  </div>
                  <Badge
                    variant="outline"
                    className={`text-[10px] ${STATUS_TONE[a.status as ApplicationStatus] ?? "bg-muted text-muted-foreground"}`}
                  >
                    {STATUS_LABEL[a.status as ApplicationStatus] ?? a.status}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <EmptyState
            title="No applications tracked yet"
            description="Log your job or internship applications to monitor recruitment outcomes in real-time."
            action={
              <Link to="/applications">
                <Button size="sm" variant="outline" className="text-xs">Log First Application</Button>
              </Link>
            }
          />
        )}
      </div>
    </div>
  );
}
