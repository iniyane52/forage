"use client";

import { useCallback, useRef, useState, useSyncExternalStore } from "react";
import { createClient } from "@/lib/supabase/client";

// Thin wrapper around voice capture. Chromium's native SpeechRecognition (free,
// instant, no network) is used when available. Firefox/Safari lack it, so they fall
// back to MediaRecorder + Groq Whisper (recorded blob posted to the `interview` edge
// function's transcribe action once the user stops recording) -- both are well
// supported in those browsers, unlike SpeechRecognition. Callers don't need to know
// which path is active: `supported` means "can capture voice at all", and
// `start`/`stop` route to whichever method is available.

type RecognitionResult = { transcript: string; isFinal: boolean };

// Minimal shape of the non-standard SpeechRecognition API (not in lib.dom.d.ts).
interface SpeechRecognitionLike extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  onresult: ((event: unknown) => void) | null;
  onend: (() => void) | null;
  onerror: ((event: unknown) => void) | null;
}

function getRecognitionCtor(): (new () => SpeechRecognitionLike) | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as Record<string, unknown>;
  return (w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null) as
    | (new () => SpeechRecognitionLike)
    | null;
}

function hasMediaRecorderFallback(): boolean {
  if (typeof window === "undefined") return false;
  return (
    typeof navigator.mediaDevices?.getUserMedia === "function" &&
    typeof MediaRecorder !== "undefined"
  );
}

// Static per browser session (never changes after mount), so a no-op subscribe is
// correct -- useSyncExternalStore over useState+useEffect because this reads
// browser-only capability APIs unavailable during SSR.
function subscribeToSupport() {
  return () => {};
}
function getSupportSnapshot(): boolean {
  const hasSynthesis = "speechSynthesis" in window;
  return hasSynthesis && (!!getRecognitionCtor() || hasMediaRecorderFallback());
}
function getSupportServerSnapshot(): boolean {
  return false;
}

export function useVoice() {
  const supported = useSyncExternalStore(subscribeToSupport, getSupportSnapshot, getSupportServerSnapshot);
  const [listening, setListening] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [transcript, setTranscript] = useState("");
  const recRef = useRef<SpeechRecognitionLike | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const onFinalRef = useRef<((text: string) => void) | null>(null);

  const transcribeBlob = useCallback(async (blob: Blob) => {
    try {
      const supabase = createClient();
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;
      if (!token) return;
      const form = new FormData();
      form.append("audio", blob, "answer.webm");
      const res = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/interview`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      });
      if (!res.ok) return;
      const result = await res.json();
      const text = typeof result.text === "string" ? result.text.trim() : "";
      if (text) {
        setTranscript(text);
        onFinalRef.current?.(text);
      }
    } catch {
      // Best-effort -- leave transcript empty, the user can retype the answer.
    }
  }, []);

  const startFallbackRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      chunksRef.current = [];
      const rec = new MediaRecorder(stream);
      rec.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      rec.onstop = () => {
        streamRef.current?.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
        setListening(false);
        const blob = new Blob(chunksRef.current, { type: rec.mimeType || "audio/webm" });
        void transcribeBlob(blob);
      };
      mediaRecorderRef.current = rec;
      setTranscript("");
      setListening(true);
      rec.start();
    } catch {
      setListening(false);
    }
  }, [transcribeBlob]);

  const start = useCallback(
    (onFinal: (text: string) => void) => {
      onFinalRef.current = onFinal;
      const Ctor = getRecognitionCtor();
      if (Ctor) {
        mediaRecorderRef.current = null;
        const rec = new Ctor();
        rec.continuous = true;
        rec.interimResults = true;
        rec.lang = "en-US";
        rec.onresult = (event: unknown) => {
          const e = event as { results: ArrayLike<{ 0: RecognitionResult; isFinal: boolean }> };
          let interim = "";
          let final = "";
          for (let i = 0; i < e.results.length; i++) {
            const r = e.results[i];
            if (r.isFinal) final += r[0].transcript;
            else interim += r[0].transcript;
          }
          setTranscript((final + interim).trim());
          if (final.trim()) onFinalRef.current?.(final.trim());
        };
        rec.onend = () => setListening(false);
        rec.onerror = () => setListening(false);
        recRef.current = rec;
        setTranscript("");
        setListening(true);
        rec.start();
        return;
      }
      recRef.current = null;
      void startFallbackRecording();
    },
    [startFallbackRecording]
  );

  const stop = useCallback(() => {
    if (recRef.current) {
      recRef.current.stop();
    } else if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
    setListening(false);
  }, []);

  const speakNative = useCallback((text: string, onDone?: () => void) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      onDone?.();
      return;
    }
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.rate = 1.02;
    utter.onstart = () => setSpeaking(true);
    utter.onend = () => {
      setSpeaking(false);
      onDone?.();
    };
    utter.onerror = () => {
      setSpeaking(false);
      onDone?.();
    };
    window.speechSynthesis.speak(utter);
  }, []);

  // Groq's Orpheus TTS sounds far more natural than the browser default -- used as the
  // primary voice, with the native browser voice as an automatic fallback if the network
  // call fails (rate limit, offline, etc.) so the interviewer never goes silent.
  const speak = useCallback(
    (text: string, onDone?: () => void) => {
      (async () => {
        try {
          const supabase = createClient();
          const { data } = await supabase.auth.getSession();
          const token = data.session?.access_token;
          if (!token) throw new Error("no session");
          const res = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/interview`, {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: JSON.stringify({ action: "speak", text }),
          });
          if (!res.ok) throw new Error("tts request failed");
          const blob = await res.blob();
          const url = URL.createObjectURL(blob);
          const audio = new Audio(url);
          audioRef.current = audio;
          audio.onplay = () => setSpeaking(true);
          audio.onended = () => {
            setSpeaking(false);
            URL.revokeObjectURL(url);
            audioRef.current = null;
            onDone?.();
          };
          audio.onerror = () => {
            setSpeaking(false);
            URL.revokeObjectURL(url);
            audioRef.current = null;
            speakNative(text, onDone);
          };
          await audio.play();
        } catch {
          speakNative(text, onDone);
        }
      })();
    },
    [speakNative]
  );

  const cancelSpeech = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setSpeaking(false);
  }, []);

  return { supported, listening, speaking, transcript, start, stop, speak, cancelSpeech };
}
