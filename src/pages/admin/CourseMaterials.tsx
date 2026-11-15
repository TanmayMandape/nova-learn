import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  UploadCloud,
  CheckCircle2,
  FileCheck,
  Layers,
  Image as ImageIcon,
  Sparkles,
  GraduationCap,
  AlertCircle,
} from "lucide-react";
import GlowButton from "@/components/GlowButton";
import { apiFetch } from "@/lib/api";
import { getActiveClassroom, ClassroomInfo } from "@/lib/auth";
import { toast } from "sonner";

const CourseMaterials = () => {
  const [activeClass, setActiveClass] = useState<ClassroomInfo | null>(getActiveClassroom());
  const [materials, setMaterials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [lastUploadedStats, setLastUploadedStats] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchMaterials = async () => {
    if (!activeClass) {
      setLoading(false);
      return;
    }
    try {
      const res = await apiFetch(`/materials/?classroom_id=${activeClass.id}`);
      setMaterials(res.materials || []);
    } catch (e) {
      console.warn("Failed to fetch materials:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMaterials();
    const handleClassChange = (e: any) => {
      setActiveClass(e.detail);
      setLoading(true);
      fetchMaterials();
    };
    window.addEventListener("classroomChanged", handleClassChange);
    return () => window.removeEventListener("classroomChanged", handleClassChange);
  }, [activeClass?.id]);

  const handleFileUpload = async (file: File) => {
    if (!file.name.toLowerCase().endsWith(".pdf")) {
      toast.error("Please upload a valid PDF document (.pdf)");
      return;
    }
    if (!activeClass) {
      toast.error("Please select or create a classroom first.");
      return;
    }

    setUploading(true);
    setLastUploadedStats(null);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("classroom_id", activeClass.id);
    formData.append("title", file.name.replace(".pdf", "").replace(/[-_]/g, " "));

    try {
      const res = await apiFetch("/materials/upload", {
        method: "POST",
        body: formData,
      });

      if (res.success) {
        toast.success(`PDF uploaded and indexed into ChromaDB!`);
        setLastUploadedStats(res.stats);
        fetchMaterials();
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to process PDF");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight">
            Course Materials & PDF OCR
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Upload digital or scanned syllabus PDFs. The system applies OCR, generates embeddings, and indexes them in ChromaDB.
          </p>
        </div>
        {activeClass && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-primary/10 border border-primary/20 text-xs text-primary font-medium">
            <GraduationCap className="w-4 h-4" />
            <span>Classroom: {activeClass.name}</span>
          </div>
        )}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Upload Zone */}
        <div className="lg:col-span-1 space-y-6">
          <div className="glass p-6 rounded-2xl">
            <h2 className="font-display font-semibold text-base mb-4 flex items-center gap-2">
              <UploadCloud className="w-5 h-5 text-primary" /> Upload Course PDF
            </h2>

            <div
              onClick={() => !uploading && fileInputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const file = e.dataTransfer.files?.[0];
                if (file) handleFileUpload(file);
              }}
              className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
                uploading
                  ? "border-primary bg-primary/5 cursor-not-allowed"
                  : "border-border hover:border-primary/60 hover:bg-muted/20"
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf"
                className="hidden"
                disabled={uploading}
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleFileUpload(f);
                }}
              />

              {uploading ? (
                <div className="space-y-3 py-4">
                  <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="text-xs font-semibold text-primary">Processing PDF Document...</p>
                  <p className="text-[11px] text-muted-foreground">
                    Running text extraction, scanned OCR, chunking & ChromaDB vector storage.
                  </p>
                </div>
              ) : (
                <div className="space-y-2 py-4">
                  <div className="w-12 h-12 rounded-2xl bg-primary/15 text-primary flex items-center justify-center mx-auto mb-3">
                    <FileText className="w-6 h-6" />
                  </div>
                  <p className="text-xs font-semibold text-foreground">
                    Click to browse or drop PDF here
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    Supports digital PDFs, scanned lecture notes, and textbook chapters.
                  </p>
                </div>
              )}
            </div>

            {/* Uploaded stats highlight */}
            <AnimatePresence>
              {lastUploadedStats && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-xs space-y-2"
                >
                  <div className="flex items-center gap-1.5 font-semibold text-green-500">
                    <CheckCircle2 className="w-4 h-4" /> Ready in ChromaDB
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[11px] text-muted-foreground">
                    <div>Pages: <strong className="text-foreground">{lastUploadedStats.pages}</strong></div>
                    <div>Chunks: <strong className="text-foreground">{lastUploadedStats.chunks}</strong></div>
                    <div>Mode: <strong className="text-foreground uppercase">{lastUploadedStats.type}</strong></div>
                    <div>Figures: <strong className="text-foreground">{lastUploadedStats.figures_detected}</strong></div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Existing Materials List */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass p-6 rounded-2xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-primary" />
                <h2 className="font-display font-semibold text-base">Classroom Study Resources</h2>
              </div>
              <span className="text-xs px-2 py-0.5 rounded-full bg-primary/15 text-primary font-bold">
                {materials.length} {materials.length === 1 ? "File" : "Files"}
              </span>
            </div>

            {loading ? (
              <div className="text-center py-12 text-xs text-muted-foreground animate-pulse">
                Loading course resources...
              </div>
            ) : materials.length === 0 ? (
              <div className="text-center py-12 border border-dashed border-border rounded-xl">
                <FileText className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                <h3 className="font-medium text-sm">No Documents Uploaded Yet</h3>
                <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                  Upload PDF lecture notes or textbook chapters above to enable RAG question answering for students.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {materials.map((m) => (
                  <div
                    key={m.id}
                    className="p-4 rounded-xl bg-muted/30 border border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-xl bg-primary/15 text-primary flex items-center justify-center shrink-0 mt-0.5">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-sm leading-snug">{m.title}</h3>
                        <p className="text-xs text-muted-foreground/80 font-mono mt-0.5">
                          {m.filename}
                        </p>
                        <div className="flex items-center gap-3 mt-1.5 text-[11px] text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Layers className="w-3 h-3 text-primary" /> {m.pages} pages ({m.chunks} chunks)
                          </span>
                          <span className="px-1.5 py-0.2 rounded bg-muted/50 text-[10px] uppercase font-bold text-foreground">
                            {m.doc_type || "pdf"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="inline-flex items-center gap-1 text-[11px] text-green-500 font-medium bg-green-500/10 px-2 py-0.5 rounded-full">
                        <CheckCircle2 className="w-3 h-3" /> Vector Indexed
                      </span>
                      <p className="text-[10px] text-muted-foreground/60 mt-1">
                        {new Date(m.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseMaterials;
