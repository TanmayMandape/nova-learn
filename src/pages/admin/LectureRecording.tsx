import { motion, AnimatePresence } from "framer-motion";
import { Mic, MicOff, Radio, CheckCircle2, BookOpen, GraduationCap } from "lucide-react";
import GlowButton from "@/components/GlowButton";
import { useState, useRef, useEffect } from "react";
import { apiFetch, API } from "@/lib/api";
import { getActiveClassroom, ClassroomInfo } from "@/lib/auth";
import { toast } from "sonner";

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

const LectureRecording = () => {
  const [activeClass, setActiveClass] = useState<ClassroomInfo | null>(getActiveClassroom());
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");

  const recognitionRef = useRef<any>(null);
  const isRecordingRef = useRef(false);
  const transcriptRef = useRef("");

  useEffect(() => {
    const handleClassChange = (e: any) => {
      setActiveClass(e.detail);
    };
    window.addEventListener("classroomChanged", handleClassChange);
    return () => window.removeEventListener("classroomChanged", handleClassChange);
  }, []);

  const startRecording = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Please use Google Chrome for voice lecture recording.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-IN";
    recognition.maxAlternatives = 1;

    let finalTranscript = "";

    recognition.onresult = (event: any) => {
      let interimTranscript = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalTranscript += result[0].transcript + " ";
        } else {
          interimTranscript += result[0].transcript;
        }
      }
      const newTranscript = finalTranscript + interimTranscript;
      setTranscript(newTranscript);
      transcriptRef.current = newTranscript;
    };

    recognition.onend = () => {
      if (isRecordingRef.current) {
        try {
          recognition.start();
        } catch {}
      }
    };

    recognition.onerror = (event: any) => {
      if (event.error === "no-speech") return;
      console.warn("Speech recognition error:", event.error);
    };

    recognitionRef.current = recognition;
    isRecordingRef.current = true;
    recognition.start();
    setIsRecording(true);
    setTranscript("");
    setNotes("");
    transcriptRef.current = "";
    finalTranscript = "";
  };

  const stopRecording = async () => {
    isRecordingRef.current = false;
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setIsRecording(false);

    const currentTranscript = transcriptRef.current;
    if (!currentTranscript || currentTranscript.trim().length < 10) {
      toast.error("Not enough speech detected. Please speak clearly into your microphone.");
      return;
    }

    setLoading(true);
    try {
      const lectureTitle = title.trim() || `Lecture: ${activeClass?.name || "Topic"} — ${new Date().toLocaleDateString()}`;
      const savedLecture = await apiFetch("/lectures/", {
        method: "POST",
        body: JSON.stringify({
          title: lectureTitle,
          transcript: currentTranscript.trim(),
          classroom_id: activeClass?.id || null,
          department: activeClass?.subject || "Computer Science",
        }),
      });

      if (savedLecture.summary || savedLecture.notes) {
        setNotes(savedLecture.summary || savedLecture.notes);
      }
      toast.success("Lecture recorded & AI notes generated!");
    } catch (e: any) {
      console.error("Save error:", e);
      toast.error("Could not save lecture. " + (e.message || ""));
    } finally {
      setLoading(false);
    }
  };

  const recordAgain = () => {
    setTranscript("");
    setNotes("");
    setTitle("");
    transcriptRef.current = "";
  };

  const isDone = !isRecording && !loading && transcript.trim().length > 0;

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight">Lecture Recording</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Record voice lectures in real-time. Speech is auto-transcribed and summarized.
          </p>
        </div>
        {activeClass && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-primary/10 border border-primary/20 text-xs text-primary font-medium">
            <GraduationCap className="w-4 h-4" />
            <span>Target: {activeClass.name}</span>
          </div>
        )}
      </div>

      <div className="glass-strong p-8 rounded-2xl max-w-2xl mx-auto text-center border border-border">
        {/* Title input */}
        <div className="mb-6">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter Lecture Title (e.g. Relational Algebra & SQL Basics)"
            className="w-full px-4 py-3 rounded-xl bg-muted/50 border border-border text-sm text-foreground focus:outline-none focus:border-primary/50 transition-all text-center placeholder:text-muted-foreground/40 font-medium"
            disabled={isRecording || loading}
          />
        </div>

        {/* Waveform Animation */}
        <div className="flex items-center justify-center gap-1.5 h-16 mb-6">
          {Array.from({ length: 24 }).map((_, i) => (
            <motion.div
              key={i}
              className={`w-1 rounded-full ${isRecording ? "bg-primary" : "bg-muted-foreground/20"}`}
              animate={isRecording ? { height: [8, Math.random() * 44 + 8, 8] } : { height: 8 }}
              transition={
                isRecording
                  ? { duration: 0.4 + Math.random() * 0.4, repeat: Infinity, repeatType: "reverse", delay: i * 0.04 }
                  : {}
              }
              style={{ height: 8 }}
            />
          ))}
        </div>

        {/* Recording status badge */}
        <div className="mb-8">
          {isRecording ? (
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-destructive/15 text-destructive text-xs font-semibold animate-pulse border border-destructive/20">
              <Radio className="w-3.5 h-3.5" /> Recording Lecture Live...
            </span>
          ) : loading ? (
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/15 text-primary text-xs font-semibold border border-primary/20">
              Generating Structured AI Notes...
            </span>
          ) : isDone ? (
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-green-500/15 text-green-500 text-xs font-semibold border border-green-500/20">
              <CheckCircle2 className="w-3.5 h-3.5" /> Lecture Saved & Summarized
            </span>
          ) : (
            <span className="text-xs text-muted-foreground">Click the microphone to start recording</span>
          )}
        </div>

        {/* Record button */}
        <div className="flex justify-center mb-8">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={isRecording ? stopRecording : startRecording}
            disabled={loading}
            className={`w-20 h-20 rounded-full flex items-center justify-center transition-all shadow-xl ${
              isRecording
                ? "bg-destructive text-white glow-rose animate-pulse"
                : "bg-primary text-primary-foreground glow-btn"
            } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            {isRecording ? <MicOff className="w-8 h-8" /> : <Mic className="w-8 h-8" />}
          </motion.button>
        </div>

        {/* Action Buttons */}
        {isDone && (
          <div className="flex justify-center gap-3 mb-6">
            <GlowButton variant="secondary" onClick={recordAgain}>
              Record Another Lecture
            </GlowButton>
          </div>
        )}

        {/* Live Transcript View */}
        {transcript && (
          <div className="text-left mt-6 pt-6 border-t border-border">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
              Live Speech Transcription
            </h3>
            <div className="p-4 rounded-xl bg-muted/30 border border-border text-xs text-muted-foreground max-h-48 overflow-y-auto leading-relaxed">
              {transcript}
            </div>
          </div>
        )}

        {/* AI Notes View */}
        {notes && (
          <div className="text-left mt-6 pt-6 border-t border-border">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-primary mb-2 flex items-center gap-1.5">
              <BookOpen className="w-4 h-4" /> AI Generated Lecture Notes
            </h3>
            <div className="p-5 rounded-xl bg-primary/5 border border-primary/20 text-xs leading-relaxed text-foreground whitespace-pre-line">
              {notes}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LectureRecording;
