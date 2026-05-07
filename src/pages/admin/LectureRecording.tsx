import { motion, AnimatePresence } from "framer-motion";
import { Mic, MicOff, Radio, CheckCircle2, FileText, Clock, Globe } from "lucide-react";
import GlowButton from "@/components/GlowButton";
import { useState } from "react";

const DEMO_TRANSCRIPT =
  "Today we covered the fundamentals of Artificial Intelligence and Machine Learning. We discussed supervised learning where the model learns from labeled data. We also covered neural networks, which are inspired by the human brain. Key topics included gradient descent, backpropagation, overfitting, underfitting, and model evaluation techniques like cross-validation. We also introduced natural language processing and computer vision as major applications of deep learning in the real world.";

const DEMO_NOTES = `📚 AI Generated Notes — Artificial Intelligence & ML Fundamentals

1. Supervised Learning: Model trained on labeled datasets to predict outcomes.
2. Neural Networks: Computational models inspired by biological brain structure.
3. Gradient Descent: Optimization algorithm that minimizes the loss function.
4. Backpropagation: Method to calculate gradients and update weights.
5. Overfitting: Model performs well on training data but poorly on new data.
6. Underfitting: Model too simple to capture patterns in data.
7. Cross-Validation: Technique to evaluate model generalization.
8. NLP: Enables machines to understand and process human language.
9. Computer Vision: AI field focused on image and video understanding.`;

const LectureRecording = () => {
  const [phase, setPhase] = useState<"idle" | "recording" | "processing" | "done">("done");
  const [title, setTitle] = useState("AI & ML Fundamentals");

  const handleToggle = async () => {
    if (phase === "idle") {
      if (!title.trim()) return;
      setPhase("recording");
      setTimeout(() => {
        setPhase("processing");
        setTimeout(() => setPhase("done"), 2000);
      }, 3000);
    } else if (phase === "recording") {
      setPhase("processing");
      setTimeout(() => setPhase("done"), 2000);
    } else if (phase === "done") {
      setPhase("idle");
      setTitle("");
      setTimeout(() => setTitle("AI & ML Fundamentals"), 100);
    }
  };

  const isRecording = phase === "recording";
  const isProcessing = phase === "processing";
  const isDone = phase === "done";

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
            placeholder="Enter Lecture Title"
            className="w-full px-4 py-3 rounded-xl bg-muted/50 border border-border text-sm text-foreground focus:outline-none focus:border-primary/50 transition-all text-center"
            disabled={isRecording || isProcessing}
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

        <AnimatePresence mode="wait">
          {isRecording && (
            <motion.div key="rec" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="flex items-center justify-center gap-2 mb-6">
              <Radio className="w-4 h-4 text-destructive animate-pulse" />
              <span className="text-sm font-medium text-destructive">Recording in progress...</span>
            </motion.div>
          )}
          {isProcessing && (
            <motion.div key="proc" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="mb-6">
              <p className="text-sm text-primary animate-pulse">Transcribing with Gemini AI...</p>
            </motion.div>
          )}
        </AnimatePresence>

        <GlowButton onClick={handleToggle}
          variant={isRecording ? "secondary" : "primary"}
          className="px-10 py-4 text-base"
          disabled={isProcessing}>
          {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          {isProcessing ? "Processing..." : isRecording ? "Stop Recording" : isDone ? "Record New Lecture" : "Start Recording"}
        </GlowButton>

        <p className="text-xs text-muted-foreground mt-6">
          {isRecording ? "Click Stop when done — audio will be transcribed" : "Click to start recording your lecture"}
        </p>

        {/* Success state */}
        <AnimatePresence>
          {isDone && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-8 space-y-4">
              {/* Status bar */}
              <div className="flex items-center justify-center gap-2 p-3 rounded-xl bg-green-500/10 border border-green-500/20">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                <span className="text-sm font-semibold text-green-500">Lecture Recorded Successfully</span>
              </div>

              {/* Meta info */}
              <div className="flex justify-center gap-6 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><FileText className="w-3 h-3" /> 89 words</span>
                <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> 4:32 minutes</span>
                <span className="flex items-center gap-1"><Globe className="w-3 h-3" /> English</span>
              </div>

              {/* Transcript */}
              <div className="text-left p-4 rounded-xl bg-muted/30 border border-border">
                <h3 className="text-sm font-semibold mb-2 text-primary">Transcript</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{DEMO_TRANSCRIPT}</p>
              </div>

              {/* AI Notes */}
              <div className="text-left p-4 rounded-xl bg-primary/5 border border-primary/20">
                <h3 className="text-sm font-semibold mb-2 text-primary">AI Notes</h3>
                <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-line">{DEMO_NOTES}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default LectureRecording;
