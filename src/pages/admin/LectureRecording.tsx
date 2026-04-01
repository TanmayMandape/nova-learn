import { motion } from "framer-motion";
import { Mic, MicOff, Radio } from "lucide-react";
import GlowButton from "@/components/GlowButton";
import { useState } from "react";
import { apiFetch } from "@/lib/api";
import { toast } from "sonner";

const LectureRecording = () => {
  const [recording, setRecording] = useState(false);
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);

  const handleToggleRecording = async () => {
    if (recording) {
      // Stopping recording
      if (!title.trim()) {
        toast.error("Please enter a lecture title before stopping");
        return;
      }

      setLoading(true);
      try {
        const mockTranscript = "This is a mock transcript of the lecture about " + title + ". Dynamic programming is an optimization method that involves breaking down a problem into simpler subproblems...";
        
        await apiFetch("/lectures", {
          method: "POST",
          body: JSON.stringify({
            title,
            transcript: mockTranscript,
            department: "Computer Science"
          })
        });

        toast.success("Lecture created successfully with AI notes!");
        setRecording(false);
        setTitle("");
      } catch (error: any) {
        console.error("Lecture creation error:", error);
        toast.error(error.message || "Failed to save lecture");
      } finally {
        setLoading(false);
      }
    } else {
      // Starting recording
      setRecording(true);
      toast.info("Recording started...");
    }
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

        {/* Waveform */}
        <div className="flex items-center justify-center gap-1 h-16 mb-6">
          {Array.from({ length: 24 }).map((_, i) => (
            <motion.div
              key={i}
              className="w-1 rounded-full bg-primary"
              animate={recording ? {
                height: [8, Math.random() * 40 + 8, 8],
              } : { height: 8 }}
              transition={recording ? {
                duration: 0.5 + Math.random() * 0.5,
                repeat: Infinity,
                repeatType: "reverse",
                delay: i * 0.05,
              } : {}}
              style={{ height: 8 }}
            />
          ))}
        </div>

        {recording && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center justify-center gap-2 mb-6"
          >
            <Radio className="w-4 h-4 text-destructive animate-pulse" />
            <span className="text-sm font-medium text-destructive">Recording in progress...</span>
          </motion.div>
        )}

        <GlowButton
          onClick={handleToggleRecording}
          variant={recording ? "secondary" : "primary"}
          className="px-10 py-4 text-base"
          disabled={loading}
        >
          {loading ? "Saving..." : (recording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />)}
          {loading ? "Saving Lecture..." : (recording ? "Stop Recording" : "Start Recording")}
        </GlowButton>

        <p className="text-xs text-muted-foreground mt-6">
          {recording ? "Your lecture is being transcribed in real-time" : "Click to start recording your lecture"}
        </p>
      </div>
    </div>
  );
};

export default LectureRecording;
