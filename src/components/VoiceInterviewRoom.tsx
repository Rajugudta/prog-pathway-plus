import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2, Mic, Play, Square, Volume2, RotateCcw, Radio } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { InterviewReportCard, type InterviewReport } from "@/components/InterviewReportCard";
import type { MockInterview } from "@/data/interviews";
import { celebrateBadges } from "@/lib/celebrate";
import { finishInterview, interviewReply, speakLine, transcribeAnswer } from "@/lib/voice.functions";
import { cn } from "@/lib/utils";

type Turn = {
  role: "interviewer" | "candidate";
  text: string;
  at: number;
  /** Object URL of the candidate's recorded audio for this turn. */
  audioUrl?: string;
};

type Phase = "idle" | "live" | "grading" | "report";

/** Deterministic-ish voice per persona so each interviewer sounds distinct. */
const VOICES = ["alloy", "verse", "ballad", "ash", "sage", "coral"];
function voiceFor(id: string) {
  let hash = 0;
  for (const ch of id) hash = (hash * 31 + ch.charCodeAt(0)) % 9973;
  return VOICES[hash % VOICES.length]!;
}

function clock(seconds: number) {
  const s = Math.max(0, Math.round(seconds));
  return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
}

export function VoiceInterviewRoom({ interview }: { interview: MockInterview }) {
  const totalSeconds = interview.durationMinutes * 60;

  const [phase, setPhase] = useState<Phase>("idle");
  const [turns, setTurns] = useState<Turn[]>([]);
  const [elapsed, setElapsed] = useState(0);
  const [recording, setRecording] = useState(false);
  const [level, setLevel] = useState(0);
  const [thinking, setThinking] = useState<null | "transcribing" | "replying" | "speaking">(null);
  const [report, setReport] = useState<InterviewReport | null>(null);
  const [muted, setMuted] = useState(false);

  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const rafRef = useRef<number | null>(null);
  const playerRef = useRef<HTMLAudioElement | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const turnsRef = useRef<Turn[]>([]);
  turnsRef.current = turns;

  const qc = useQueryClient();
  const askFn = useServerFn(interviewReply);
  const speakFn = useServerFn(speakLine);
  const transcribeFn = useServerFn(transcribeAnswer);
  const finishFn = useServerFn(finishInterview);

  const voice = useMemo(() => voiceFor(interview.id), [interview.id]);
  const secondsLeft = Math.max(0, totalSeconds - elapsed);

  // Live timer
  useEffect(() => {
    if (phase !== "live") return;
    const t = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(t);
  }, [phase]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [turns, thinking]);

  const stopMeter = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    setLevel(0);
  }, []);

  const teardown = useCallback(() => {
    stopMeter();
    recorderRef.current?.state === "recording" && recorderRef.current.stop();
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    void audioCtxRef.current?.close().catch(() => {});
    audioCtxRef.current = null;
    playerRef.current?.pause();
  }, [stopMeter]);

  useEffect(() => () => teardown(), [teardown]);

  const play = useCallback(
    async (text: string) => {
      if (muted) return;
      try {
        setThinking("speaking");
        const { audio, mimeType } = await speakFn({ data: { text, voice } });
        const el = playerRef.current ?? new Audio();
        playerRef.current = el;
        el.src = `data:${mimeType};base64,${audio}`;
        await el.play();
        await new Promise<void>((resolve) => {
          el.onended = () => resolve();
          el.onerror = () => resolve();
        });
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Could not play the interviewer's voice.");
      } finally {
        setThinking(null);
      }
    },
    [muted, speakFn, voice],
  );

  const askInterviewer = useCallback(
    async (transcript: Turn[]) => {
      setThinking("replying");
      try {
        const { text } = await askFn({
          data: {
            interviewId: interview.id,
            transcript: transcript.map((t) => ({ role: t.role, text: t.text })),
            secondsLeft: Math.max(0, totalSeconds - elapsed),
          },
        });
        setTurns((prev) => [...prev, { role: "interviewer", text, at: Date.now() }]);
        setThinking(null);
        await play(text);
      } catch (err) {
        setThinking(null);
        toast.error(err instanceof Error ? err.message : "The interviewer went quiet. Try again.");
      }
    },
    [askFn, elapsed, interview.id, play, totalSeconds],
  );

  const start = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      setPhase("live");
      setElapsed(0);
      setTurns([]);
      setReport(null);
      const opener: Turn[] = [
        {
          role: "candidate",
          text: "Hi, I'm ready to start the interview.",
          at: Date.now(),
        },
      ];
      setTurns(opener);
      await askInterviewer(opener);
    } catch {
      toast.error("Microphone access is required for a voice interview.");
    }
  }, [askInterviewer]);

  const beginRecording = useCallback(async () => {
    const stream = streamRef.current;
    if (!stream) return;

    const ctx = audioCtxRef.current ?? new AudioContext();
    audioCtxRef.current = ctx;
    if (ctx.state === "suspended") await ctx.resume();
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 512;
    ctx.createMediaStreamSource(stream).connect(analyser);
    const buf = new Uint8Array(analyser.frequencyBinCount);
    const tick = () => {
      analyser.getByteTimeDomainData(buf);
      let peak = 0;
      for (const v of buf) peak = Math.max(peak, Math.abs(v - 128) / 128);
      setLevel(peak);
      rafRef.current = requestAnimationFrame(tick);
    };
    tick();

    chunksRef.current = [];
    const mime = MediaRecorder.isTypeSupported("audio/webm") ? "audio/webm" : "audio/mp4";
    const rec = new MediaRecorder(stream, { mimeType: mime });
    rec.ondataavailable = (e) => e.data.size > 0 && chunksRef.current.push(e.data);
    rec.start();
    recorderRef.current = rec;
    setRecording(true);
  }, []);

  const endRecording = useCallback(async () => {
    const rec = recorderRef.current;
    if (!rec) return;
    setRecording(false);
    stopMeter();

    const blob: Blob = await new Promise((resolve) => {
      rec.onstop = () => resolve(new Blob(chunksRef.current, { type: rec.mimeType }));
      rec.stop();
    });
    recorderRef.current = null;

    if (blob.size < 2000) {
      toast.error("That was too short to hear — hold the answer button while you speak.");
      return;
    }

    setThinking("transcribing");
    try {
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(String(reader.result).split(",")[1] ?? "");
        reader.onerror = () => reject(new Error("Could not read the recording."));
        reader.readAsDataURL(blob);
      });

      const { text } = await transcribeFn({ data: { audio: base64, mimeType: blob.type || "audio/webm" } });
      setThinking(null);
      if (!text) {
        toast.error("I couldn't hear anything in that answer.");
        return;
      }

      const next: Turn[] = [
        ...turnsRef.current,
        { role: "candidate", text, at: Date.now(), audioUrl: URL.createObjectURL(blob) },
      ];
      setTurns(next);
      await askInterviewer(next);
    } catch (err) {
      setThinking(null);
      toast.error(err instanceof Error ? err.message : "Could not process that answer.");
    }
  }, [askInterviewer, stopMeter, transcribeFn]);

  const end = useCallback(async () => {
    const transcript = turnsRef.current;
    if (transcript.length < 2) {
      toast.error("Answer at least one question before ending the interview.");
      return;
    }
    teardown();
    setPhase("grading");
    try {
      const res = await finishFn({
        data: {
          interviewId: interview.id,
          transcript: transcript.map((t) => ({ role: t.role, text: t.text })),
          durationSeconds: elapsed,
        },
      });
      setReport(res.report);
      setPhase("report");
      qc.invalidateQueries({ queryKey: ["profile"] });
      qc.invalidateQueries({ queryKey: ["achievements"] });
      if (res.reward) {
        toast.success(`+${res.reward.awarded} XP`, {
          description: `${res.reward.xp} XP total · ${res.reward.streak} day streak`,
        });
      }
      celebrateBadges(res.unlocked);
    } catch (err) {
      setPhase("live");
      toast.error(err instanceof Error ? err.message : "Could not score this session.");
    }
  }, [elapsed, finishFn, interview.id, qc, teardown]);

  // Auto-wrap when the clock runs out.
  useEffect(() => {
    if (phase === "live" && secondsLeft === 0 && !recording && !thinking) {
      toast("Time's up — generating your report.");
      void end();
    }
  }, [phase, secondsLeft, recording, thinking, end]);

  if (phase === "report" && report) {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-6">
        <InterviewReportCard
          report={report}
          durationSeconds={elapsed}
          turns={turns}
          onRetry={() => {
            setPhase("idle");
            setReport(null);
            setTurns([]);
            setElapsed(0);
          }}
        />
      </div>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {/* Status bar */}
      <div className="flex items-center justify-between gap-3 border-b border-border bg-background/70 px-4 py-3 backdrop-blur-xl">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span
            className={cn(
              "grid size-7 shrink-0 place-items-center rounded-full border border-border",
              phase === "live" && "border-accent text-accent",
            )}
          >
            <Radio className="size-3.5" />
          </span>
          <span className="truncate">
            {phase === "live" ? `${interview.interviewer} · live` : interview.interviewerTitle}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span
            className={cn(
              "font-mono text-sm tabular-nums",
              secondsLeft <= 60 && phase === "live" ? "text-destructive" : "text-foreground",
            )}
          >
            {clock(secondsLeft)}
          </span>
          <Button variant="ghost" size="sm" onClick={() => setMuted((m) => !m)}>
            <Volume2 className={cn("size-4", muted && "opacity-40")} />
          </Button>
        </div>
      </div>
      {phase === "live" && (
        <div className="h-0.5 w-full bg-secondary">
          <div
            className="h-full bg-accent transition-[width] duration-1000"
            style={{ width: `${(elapsed / totalSeconds) * 100}%` }}
          />
        </div>
      )}

      {/* Transcript */}
      <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto px-4 py-6">
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-5">
          {phase === "idle" && (
            <div className="mica rounded-2xl p-8 text-center">
              <span className="mx-auto grid size-12 place-items-center rounded-full border border-border text-accent">
                <Mic className="size-5" />
              </span>
              <h2 className="mt-4 text-base font-semibold tracking-tight">
                {interview.interviewer} will call you now
              </h2>
              <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
                {interview.whatToExpect}
              </p>
              <p className="mt-3 text-xs text-muted-foreground">
                {interview.durationMinutes} minute timer · your answers are recorded and transcribed · a scored
                report at the end.
              </p>
              <Button variant="hero" className="mt-5" onClick={() => void start()}>
                <Mic className="mr-1.5 size-4" /> Start voice interview
              </Button>
            </div>
          )}

          {turns.map((t, i) => (
            <div key={`${t.at}-${i}`} className={cn("flex flex-col gap-2", t.role === "candidate" && "items-end")}>
              <div
                className={cn(
                  "max-w-[85%] rounded-2xl px-4 py-3 text-[15px] leading-relaxed",
                  t.role === "interviewer" ? "mica" : "bg-primary text-primary-foreground",
                )}
              >
                <p className="mb-1 text-[11px] uppercase tracking-wide opacity-60">
                  {t.role === "interviewer" ? interview.interviewer : "You"}
                </p>
                {t.text}
              </div>
              {t.audioUrl && (
                <audio controls src={t.audioUrl} className="h-8 w-56 max-w-full" preload="none" />
              )}
            </div>
          ))}

          {thinking && (
            <p className="flex items-center gap-2 text-xs text-muted-foreground">
              <Loader2 className="size-3.5 animate-spin" />
              {thinking === "transcribing"
                ? "Transcribing your answer…"
                : thinking === "replying"
                  ? `${interview.interviewer} is thinking…`
                  : `${interview.interviewer} is speaking…`}
            </p>
          )}

          {phase === "grading" && (
            <div className="mica rounded-2xl p-8 text-center">
              <Loader2 className="mx-auto size-5 animate-spin text-accent" />
              <p className="mt-3 text-sm text-muted-foreground">Scoring your performance…</p>
            </div>
          )}
        </div>
      </div>

      {/* Controls */}
      {phase === "live" && (
        <div className="border-t border-border bg-background/70 backdrop-blur-xl">
          <div className="mx-auto flex w-full max-w-3xl items-center gap-4 px-4 py-5">
            <button
              type="button"
              disabled={!!thinking}
              onClick={() => (recording ? void endRecording() : void beginRecording())}
              className={cn(
                "grid size-14 shrink-0 place-items-center rounded-full transition-all disabled:opacity-40",
                recording
                  ? "bg-destructive text-destructive-foreground"
                  : "bg-primary text-primary-foreground hover:scale-105",
              )}
              style={recording ? { boxShadow: `0 0 0 ${4 + level * 22}px hsl(var(--destructive) / 0.15)` } : undefined}
              aria-label={recording ? "Stop answering" : "Start answering"}
            >
              {recording ? <Square className="size-5" /> : <Mic className="size-6" />}
            </button>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium">
                {recording ? "Recording your answer…" : thinking ? "Hold on…" : "Tap to answer out loud"}
              </p>
              <div className="mt-2 flex h-4 items-end gap-1">
                {Array.from({ length: 28 }).map((_, i) => (
                  <span
                    key={i}
                    className={cn("w-1 rounded-full bg-accent/70 transition-all", !recording && "bg-border")}
                    style={{
                      height: recording
                        ? `${Math.max(3, level * 16 * (0.5 + Math.abs(Math.sin((i + elapsed) * 0.7))))}px`
                        : "3px",
                    }}
                  />
                ))}
              </div>
            </div>
            <Button variant="mica" onClick={() => void end()} disabled={recording || !!thinking}>
              End & get report
            </Button>
          </div>
        </div>
      )}

      {phase === "idle" && turns.length > 0 && (
        <div className="border-t border-border p-4 text-center">
          <Button variant="mica" onClick={() => void start()}>
            <RotateCcw className="mr-1.5 size-4" /> Run it again
          </Button>
        </div>
      )}

      {/* Hidden playback element mount point */}
      <span className="sr-only">
        <Play className="size-0" />
      </span>
    </div>
  );
}
