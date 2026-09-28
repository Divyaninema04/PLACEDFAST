import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Upload, FileText, Trash2, Download, Star } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ResumeStudio } from "@/components/resume-studio";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/resume")({
  head: () => ({ meta: [{ title: "Resume — PlacementPilot" }] }),
  component: ResumePage,
});

type Resume = {
  id: string;
  label: string;
  file_path: string;
  size_bytes: number | null;
  is_primary: boolean;
  created_at: string;
};

function ResumePage() {
  const qc = useQueryClient();
  const [label, setLabel] = useState("Main resume");
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);

  const list = useQuery({
    queryKey: ["resumes"],
    queryFn: async () => {
      const { data, error } = await supabase.from("resumes").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Resume[];
    },
  });

  const [extractedReview, setExtractedReview] = useState<any | null>(null);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  const upload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return toast.error("Choose a PDF first");
    setBusy(true);
    try {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) {
        setBusy(false);
        return toast.error("Please sign in to upload a resume");
      }
      const path = `${u.user.id}/${Date.now()}-${file.name}`;
      const { data: uploadRes, error: upErr } = await supabase.storage.from("resumes").upload(path, file, {
        contentType: file.type || "application/pdf",
      });
      setBusy(false);
      if (upErr) {
        return toast.error(upErr.message);
      }
      const extracted = (uploadRes as any)?.extractedData;
      setFile(null);
      setLabel("Main resume");
      qc.invalidateQueries({ queryKey: ["resumes"] });
      qc.invalidateQueries({ queryKey: ["profile"] });

      if (extracted && (extracted.skills?.length > 0 || extracted.name || extracted.college || extracted.degree)) {
        setExtractedReview(extracted);
        setReviewOpen(true);
      } else {
        toast.success("Resume uploaded successfully");
      }
    } catch (err: any) {
      setBusy(false);
      toast.error(err?.message || "Failed to upload resume");
    }
  };

  const syncExtractedToProfile = async () => {
    if (!extractedReview) return;
    setIsSyncing(true);
    try {
      const { data: u } = await supabase.auth.getUser();
      if (!u?.user) throw new Error("Not authenticated");

      // Fetch current profile
      const { data: currentProfile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", u.user.id)
        .maybeSingle();

      const existingSkills: string[] = currentProfile?.skills || [];
      const newSkills = Array.from(new Set([...existingSkills, ...(extractedReview.skills || [])]));

      const existingProjects = Array.isArray(currentProfile?.projects) ? currentProfile.projects : [];
      const extractedProjects = (extractedReview.projects || []).map((p: any) => ({
        title: typeof p === "string" ? p : p.title || "Project",
        role: "Developer",
        technologies: "",
        summary: typeof p === "object" ? p.description || "" : "",
        highlights: [],
      }));

      const mergedProjects = [...existingProjects];
      for (const p of extractedProjects) {
        if (!mergedProjects.some((mp: any) => mp.title.toLowerCase() === p.title.toLowerCase())) {
          mergedProjects.push(p);
        }
      }

      const payload: Record<string, any> = {
        id: u.user.id,
        skills: newSkills,
      };

      if (extractedReview.name && !currentProfile?.full_name) {
        payload.full_name = extractedReview.name;
      }
      if (extractedReview.college && !currentProfile?.college) {
        payload.college = extractedReview.college;
      }
      if (extractedReview.degree && !currentProfile?.degree) {
        payload.degree = extractedReview.degree;
      }
      if (extractedReview.branch && !currentProfile?.branch) {
        payload.branch = extractedReview.branch;
      }
      if (extractedReview.graduationYear && !currentProfile?.graduation_year) {
        const yr = parseInt(extractedReview.graduationYear, 10);
        if (!isNaN(yr)) payload.graduation_year = yr;
      }
      if (mergedProjects.length > existingProjects.length) {
        payload.projects = mergedProjects;
      }

      const { error } = await supabase.from("profiles").upsert(payload);
      if (error) throw error;

      toast.success("Profile and skills updated from resume!");
      qc.invalidateQueries({ queryKey: ["profile"] });
      setReviewOpen(false);
    } catch (err: any) {
      toast.error(err.message || "Failed to update profile");
    } finally {
      setIsSyncing(false);
    }
  };

  const remove = useMutation({
    mutationFn: async (r: Resume) => {
      await supabase.storage.from("resumes").remove([r.file_path]);
      const { error } = await supabase.from("resumes").delete().eq("id", r.id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["resumes"] });
      toast.success("Removed");
    },
  });

  const makePrimary = useMutation({
    mutationFn: async (r: Resume) => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) return;
      await supabase.from("resumes").update({ is_primary: false }).eq("user_id", u.user.id);
      const { error } = await supabase.from("resumes").update({ is_primary: true }).eq("id", r.id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["resumes"] }),
  });

  const download = async (r: Resume) => {
    const { data, error } = await supabase.storage.from("resumes").createSignedUrl(r.file_path, 60);
    if (error) return toast.error(error.message);
    window.open(data.signedUrl, "_blank");
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold tracking-tight">Resume</h1>
        <p className="text-sm text-muted-foreground">
          Store the PDFs you send, and build tailored versions in the Studio.
        </p>
      </div>

      <Tabs defaultValue="files">
        <TabsList>
          <TabsTrigger value="files">Uploaded files</TabsTrigger>
          <TabsTrigger value="studio">Resume Studio</TabsTrigger>
        </TabsList>

        <TabsContent value="studio" className="pt-4">
          <ResumeStudio />
        </TabsContent>

        <TabsContent value="files" className="space-y-6 pt-4">
      <form onSubmit={upload} className="bento-card space-y-4">

        <div className="grid gap-4 sm:grid-cols-[2fr_1fr]">
          <div className="space-y-1.5">
            <Label htmlFor="label">Label</Label>
            <Input id="label" value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Product-focused SWE" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="file">PDF file</Label>
            <Input
              id="file"
              type="file"
              accept="application/pdf"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
          </div>
        </div>
        <Button type="submit" disabled={busy} className="gap-2">
          <Upload className="h-4 w-4" /> {busy ? "Uploading…" : "Upload"}
        </Button>
      </form>

      <div className="space-y-3">
        {list.isLoading ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : (list.data?.length ?? 0) === 0 ? (
          <div className="rounded-lg border border-dashed border-border bg-mist/50 p-8 text-center">
            <FileText className="mx-auto h-8 w-8 text-muted-foreground" />
            <p className="mt-2 text-sm text-muted-foreground">No resumes uploaded yet.</p>
          </div>
        ) : (
          list.data!.map((r) => (
            <div key={r.id} className="bento-card !py-4 flex items-center gap-4">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-accent text-primary">
                <FileText className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="truncate font-semibold">{r.label}</span>
                  {r.is_primary && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">
                      <Star className="h-3 w-3" /> primary
                    </span>
                  )}
                </div>
                <div className="text-xs text-muted-foreground">
                  {r.size_bytes ? `${(r.size_bytes / 1024).toFixed(0)} KB · ` : ""}
                  {new Date(r.created_at).toLocaleDateString()}
                </div>
              </div>
              {!r.is_primary && (
                <Button variant="ghost" size="sm" onClick={() => makePrimary.mutate(r)}>Make primary</Button>
              )}
              <Button variant="outline" size="icon" onClick={() => download(r)} aria-label="Download">
                <Download className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => remove.mutate(r)} aria-label="Delete">
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))
        )}
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={reviewOpen} onOpenChange={setReviewOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Resume Parsing Results</DialogTitle>
            <DialogDescription>
              We extracted key credentials and skills from your uploaded PDF. Confirm to synchronize them into your profile.
            </DialogDescription>
          </DialogHeader>

          {extractedReview && (
            <div className="space-y-4 py-2 text-sm">
              <div className="grid grid-cols-2 gap-3 rounded-lg border bg-muted/30 p-3">
                <div>
                  <span className="text-xs text-muted-foreground">Candidate Name:</span>
                  <p className="font-medium text-foreground">{extractedReview.name || "Not detected"}</p>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground">Email:</span>
                  <p className="font-medium text-foreground">{extractedReview.email || "Not detected"}</p>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground">Degree & Branch:</span>
                  <p className="font-medium text-foreground">
                    {[extractedReview.degree, extractedReview.branch].filter(Boolean).join(" · ") || "Not detected"}
                  </p>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground">College & Graduation:</span>
                  <p className="font-medium text-foreground">
                    {[extractedReview.college, extractedReview.graduationYear].filter(Boolean).join(" · ") || "Not detected"}
                  </p>
                </div>
              </div>

              <div>
                <span className="mb-1.5 block text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Extracted Skills ({extractedReview.skills?.length || 0})
                </span>
                <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-1 border rounded-md">
                  {extractedReview.skills && extractedReview.skills.length > 0 ? (
                    extractedReview.skills.map((s: string, idx: number) => (
                      <Badge key={idx} variant="secondary" className="text-xs">
                        {s}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-xs text-muted-foreground italic">No skills extracted</span>
                  )}
                </div>
              </div>

              {extractedReview.projects && extractedReview.projects.length > 0 && (
                <div>
                  <span className="mb-1.5 block text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Extracted Projects ({extractedReview.projects.length})
                  </span>
                  <div className="space-y-1.5 max-h-32 overflow-y-auto">
                    {extractedReview.projects.map((p: any, idx: number) => (
                      <div key={idx} className="rounded border bg-background p-2 text-xs">
                        <span className="font-semibold">{typeof p === "string" ? p : p.title}</span>
                        {typeof p === "object" && p.description && (
                          <p className="text-muted-foreground line-clamp-2 mt-0.5">{p.description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="ghost" onClick={() => setReviewOpen(false)}>
              Keep Existing Profile
            </Button>
            <Button onClick={syncExtractedToProfile} disabled={isSyncing}>
              {isSyncing ? "Syncing…" : "Confirm & Sync to Profile"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}