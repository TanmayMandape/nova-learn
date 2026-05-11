import { motion, AnimatePresence } from "framer-motion";
import { Mic, MicOff, Radio, CheckCircle2 } from "lucide-react";
import GlowButton from "@/components/GlowButton";
import { useState, useRef } from "react";

const API = import.meta.env.VITE_API_URL || "http://localhost:8000";

const LectureRecording = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const sendAudioToBackend = async (audioBlob: Blob) => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("audio", audioBlob, "recording.webm");

      const transcribeRes = await fetch(`${API}/api/transcribe`, {
        method: "POST",
        body: formData,
      });
      const transcribeData = await transcribeRes.json();

      if (!transcribeData.transcript) {
        alert("Could not transcribe audio. Please try again.");
        setLoading(false);
        return;
      }

      setTranscript(transcribeData.transcript);

      const lectureRes = await fetch(`${API}/lectures/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim() || "Lecture " + new Date().toLocaleDateString(),
          transcript: transcribeData.transcript,
          department: "Computer Science",
        }),
      });
      const lectureData = await lectureRes.json();

      if (lectureData.summary || lectureData.notes) {
        setNotes(lectureData.summary || lectureData.notes);
      }
    } catch (err) {
      alert("Something went wrong. Please try again.");
    }
    setLoading(false);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: "audio/webm" });
        stream.getTracks().forEach(track => track.stop());
        await sendAudioToBackend(audioBlob);
      };

      mediaRecorder.start();
      setIsRecording(true);
      setTranscript("");
      setNotes("");
    } catch (err) {
      alert("Microphone access denied. Please allow microphone and try again.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const recordAgain = () => {
    setTranscript("");
    setNotes("");
    setTitle("");
  };

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

        {/* Status messages */}
        <AnimatePresence mode="wait">
          {isRecording && (
            <motion.div key="rec" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="flex items-center justify-center gap-2 mb-6">
              <Radio className="w-4 h-4 text-destructive animate-pulse" />
              <span className="text-sm font-medium text-destructive">Recording in progress...</span>
            </motion.div>
          )}
          {loading && (
            <motion.div key="load" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="mb-6">
              <p className="text-sm text-primary animate-pulse">Transcribing audio with AI... please wait</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Buttons */}
        {!loading && !transcript && (
          <GlowButton
            onClick={isRecording ? stopRecording : startRecording}
            variant={isRecording ? "secondary" : "primary"}
            className="px-10 py-4 text-base"
          >
            {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            {isRecording ? "Stop Recording" : "Start Recording"}
          </GlowButton>
        )}

        {transcript && !loading && (
          <GlowButton onClick={recordAgain} variant="secondary" className="px-10 py-4 text-base">
            <Mic className="w-5 h-5" /> Record Again
          </GlowButton>
        )}

        <p className="text-xs text-muted-foreground mt-6">
          {isRecording
            ? "Speak clearly — click Stop when done"
            : loading
            ? "Processing your audio..."
            : "Click Start Recording to begin"}
        </p>

        {/* Results */}
        <AnimatePresence>
          {transcript && !loading && (
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
