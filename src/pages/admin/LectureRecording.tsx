import { motion, AnimatePresence } from "framer-motion";
import { Mic, MicOff, Radio, CheckCircle2 } from "lucide-react";
import GlowButton from "@/components/GlowButton";
import { useState, useRef } from "react";

const API = import.meta.env.VITE_API_URL || "http://localhost:8000";

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

const LectureRecording = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");

  const recognitionRef = useRef<any>(null);
  const isRecordingRef = useRef(false);
  const transcriptRef = useRef("");

  const startRecording = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Please use Chrome browser for recording.");
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
      localStorage.setItem("latestTranscript", newTranscript);
    };

    recognition.onend = () => {
      // Auto-restart if still recording (Chrome stops after silence)
      if (isRecordingRef.current) {
        recognition.start();
      }
    };

    recognition.onerror = (event: any) => {
      if (event.error === "no-speech") {
        // Ignore — just keep going
        return;
      }
      console.error("Speech error:", event.error);
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
      alert("Not enough speech detected. Please speak clearly and try again.");
      return;
    }

    setLoading(true);
    try {
      const lectureRes = await fetch(`${API}/lectures/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim() || "Lecture " + new Date().toLocaleDateString(),
          transcript: currentTranscript.trim(),
          department: "Computer Science",
        }),
      });
      const data = await lectureRes.json();
      if (data.summary || data.notes) {
        setNotes(data.summary || data.notes);
      }
    } catch (e) {
      console.error("Save error:", e);
      alert("Could not save lecture. Please try again.");
    }
    setLoading(false);
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
      <h1 className="font-display text-2xl font-bold mb-1">Lecture Recording</h1>
      <p className="text-sm text-muted-foreground mb-8">Record and transcribe your lectures in real-time</p>

      <div className="glass-strong p-8 rounded-2xl max-w-2xl mx-auto text-center">
        {/* Title input */}
        <div className="mb-8">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter Lecture Title (e.g. Introduction to AI)"
            className="w-full px-4 py-3 rounded-xl bg-muted/50 border border-border text-sm text-foreground focus:outline-none focus:border-primary/50 transition-all text-center"
            disabled={isRecording || loading}
          />
        </div>

        {/* Waveform */}
        <div className="flex items-center justify-center gap-1 h-16 mb-6">
          {Array.from({ length: 24 }).map((_, i) => (
            <motion.div key={i} className="w-1 rounded-full bg-primary"
              animate={isRecording ? { height: [8, Math.random() * 40 + 8, 8] } : { height: 8 }}
              transition={isRecording ? { duration: 0.5 + Math.random() * 0.5, repeat: Infinity, repeatType: "reverse", delay: i * 0.05 } : {}}
              style={{ height: 8 }} />
          ))}
        </div>

        {/* Status */}
        <AnimatePresence mode="wait">
          {isRecording && (
            <motion.div key="rec" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="flex items-center justify-center gap-2 mb-4">
              <Radio className="w-4 h-4 text-destructive animate-pulse" />
              <span className="text-sm font-medium text-destructive">Recording in progress...</span>
            </motion.div>
          )}
          {loading && (
            <motion.div key="load" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="mb-4">
              <p className="text-sm text-primary animate-pulse">Generating AI notes... please wait</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Live transcript while recording */}
        {isRecording && transcript && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="mb-6 text-left p-4 rounded-xl bg-muted/30 border border-border max-h-48 overflow-y-auto">
            <p className="text-xs text-muted-foreground/60 mb-1 font-medium">Live transcript:</p>
            <p className="text-xs text-muted-foreground leading-relaxed">{transcript}</p>
          </motion.div>
        )}

        {/* Buttons */}
        {!loading && !isDone && (
          <GlowButton
            onClick={isRecording ? stopRecording : startRecording}
            variant={isRecording ? "secondary" : "primary"}
            className="px-10 py-4 text-base"
          >
            {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            {isRecording ? "Stop Recording" : "Start Recording"}
          </GlowButton>
        )}

        {isDone && !loading && (
          <GlowButton onClick={recordAgain} variant="secondary" className="px-10 py-4 text-base">
            <Mic className="w-5 h-5" /> Record Again
          </GlowButton>
        )}

        <p className="text-xs text-muted-foreground mt-4">
          {isRecording
            ? "Speak clearly — transcript appears in real time"
            : loading
            ? "Processing with Groq AI..."
            : "Use Chrome for best results"}
        </p>

        {/* Results */}
        <AnimatePresence>
          {isDone && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-8 space-y-4">
              <div className="flex items-center justify-center gap-2 p-3 rounded-xl bg-green-500/10 border border-green-500/20">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                <span className="text-sm font-semibold text-green-500">Lecture Recorded Successfully</span>
              </div>

              <div className="text-left p-4 rounded-xl bg-muted/30 border border-border">
                <h3 className="text-sm font-semibold mb-2 text-primary">Transcript</h3>
                <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-wrap">{transcript}</p>
              </div>

              {notes && (
                <div className="text-left p-4 rounded-xl bg-primary/5 border border-primary/20">
                  <h3 className="text-sm font-semibold mb-2 text-primary">AI Notes</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-wrap">{notes}</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default LectureRecording;
