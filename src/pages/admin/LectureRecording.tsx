import { motion } from "framer-motion";
import { Mic, MicOff, Radio } from "lucide-react";
import GlowButton from "@/components/GlowButton";
import { useState, useRef } from "react";
import { toast } from "sonner";

const API = import.meta.env.VITE_API_URL || "http://localhost:8000";

const LectureRecording = () => {
  const [recording, setRecording] = useState(false);
  const [title, setTitle] = useState("");
  const [transcript, setTranscript] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    if (!title.trim()) { toast.error("Enter a lecture title first"); return; }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream, { mimeType: "audio/webm" });
      mediaRecorderRef.current = mr;
      chunksRef.current = [];
      mr.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      mr.start();
      setRecording(true);
      toast.info("Recording started...");
    } catch {
      toast.error("Microphone access denied");
    }
  };

  const stopRecording = () => {
    const mr = mediaRecorderRef.current;
    if (!mr) return;
    mr.onstop = async () => {
      mr.stream.getTracks().forEach(t => t.stop());
      const blob = new Blob(chunksRef.current, { type: "audio/webm" });
      setRecording(false);
      setLoading(true);
      toast.info("Transcribing...");
      try {
        const form = new FormData();
        form.append("audio", blob, "lecture.webm");
        const res = await fetch(`${API}/api/transcribe`, { method: "POST", body: form });
        const data = await res.json();
        const tx: string = data.transcript || "";
        setTranscript(tx);
        toast.info("Saving lecture...");
        const saveRes = await fetch(`${API}/lectures/`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title, transcript: tx, department: "Computer Science" }),
        });
        const saved = await saveRes.json();
        setNotes(saved.notes || saved.summary || "");
        toast.success("Lecture saved with AI notes!");
        setTitle("");
      } catch (err: any) {
        toast.error(err.message || "Failed to process lecture");
      } finally {
        setLoading(false);
      }
    };
    mr.stop();
  };

  return (
    <div>
      <h1 className="font-display text-2xl font-bold mb-1">Lecture Recording</h1>
      <p className="text-sm text-muted-foreground mb-8">Record and transcribe your lectures in real-time</p>

      <div className="glass-strong p-8 rounded-2xl max-w-2xl mx-auto text-center">
        <div className="mb-8">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter Lecture Title (e.g., Intro to Algorithms)"
            className="w-full px-4 py-3 rounded-xl bg-muted/50 border border-border text-sm text-foreground focus:outline-none focus:border-primary/50 transition-all text-center"
            disabled={recording || loading}
          />
        </div>

        <div className="flex items-center justify-center gap-1 h-16 mb-6">
          {Array.from({ length: 24 }).map((_, i) => (
            <motion.div key={i} className="w-1 rounded-full bg-primary"
              animate={recording ? { height: [8, Math.random() * 40 + 8, 8] } : { height: 8 }}
              transition={recording ? { duration: 0.5 + Math.random() * 0.5, repeat: Infinity, repeatType: "reverse", delay: i * 0.05 } : {}}
              style={{ height: 8 }} />
          ))}
        </div>

        {recording && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center justify-center gap-2 mb-6">
            <Radio className="w-4 h-4 text-destructive animate-pulse" />
            <span className="text-sm font-medium text-destructive">Recording in progress...</span>
          </motion.div>
        )}

        {loading && (
          <p className="text-sm text-primary animate-pulse mb-6">Processing with Gemini AI...</p>
        )}

        <GlowButton onClick={recording ? stopRecording : startRecording}
          variant={recording ? "secondary" : "primary"} className="px-10 py-4 text-base" disabled={loading}>
          {recording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          {loading ? "Processing..." : recording ? "Stop Recording" : "Start Recording"}
        </GlowButton>

        <p className="text-xs text-muted-foreground mt-6">
          {recording ? "Click Stop when done — audio will be transcribed" : "Click to start recording your lecture"}
        </p>

        {transcript && !loading && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="mt-6 text-left p-4 rounded-xl bg-muted/30 border border-border">
            <h3 className="text-sm font-semibold mb-2 text-primary">Transcript</h3>
            <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-wrap">{transcript}</p>
          </motion.div>
        )}

        {notes && !loading && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="mt-4 text-left p-4 rounded-xl bg-primary/5 border border-primary/20">
            <h3 className="text-sm font-semibold mb-2 text-primary">AI Notes</h3>
            <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-wrap">{notes}</p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default LectureRecording;
