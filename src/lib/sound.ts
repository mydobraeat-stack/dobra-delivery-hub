/**
 * Tiny WebAudio chimes for high-priority alerts.
 * Browsers block audio until the user has interacted with the page, so we
 * only unlock the audio context after the first click/keypress/touch.
 */

let ctx: AudioContext | null = null;
let unlocked = false;

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const Ctor =
    (window as unknown as { AudioContext?: typeof AudioContext; webkitAudioContext?: typeof AudioContext })
      .AudioContext ??
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctor) return null;
  if (!ctx) ctx = new Ctor();
  return ctx;
}

/** Call once on mount: enables sound after the first user interaction. */
export function initSoundUnlock() {
  if (typeof window === "undefined" || unlocked) return () => {};
  const unlock = () => {
    const c = getCtx();
    if (!c) return;
    void c.resume();
    unlocked = true;
    remove();
  };
  const remove = () => {
    window.removeEventListener("pointerdown", unlock);
    window.removeEventListener("keydown", unlock);
    window.removeEventListener("touchstart", unlock);
  };
  window.addEventListener("pointerdown", unlock, { once: true });
  window.addEventListener("keydown", unlock, { once: true });
  window.addEventListener("touchstart", unlock, { once: true });
  return remove;
}

export function soundEnabled() {
  return unlocked;
}

type Tone = { freq: number; start: number; duration: number };

const PATTERNS: Record<string, Tone[]> = {
  // urgent double-rise for vendors / admins
  alert: [
    { freq: 880, start: 0, duration: 0.16 },
    { freq: 1320, start: 0.18, duration: 0.22 },
    { freq: 1320, start: 0.44, duration: 0.22 },
  ],
  // friendly resolve for a delivered order
  success: [
    { freq: 660, start: 0, duration: 0.16 },
    { freq: 990, start: 0.16, duration: 0.3 },
  ],
  // soft single blip for everything else
  soft: [{ freq: 720, start: 0, duration: 0.14 }],
};

export type SoundName = keyof typeof PATTERNS;

export function playSound(name: SoundName) {
  if (!unlocked) return;
  const c = getCtx();
  if (!c) return;
  if (c.state === "suspended") void c.resume();
  const now = c.currentTime + 0.02;
  for (const tone of PATTERNS[name] ?? PATTERNS["soft"]!) {
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = "sine";
    osc.frequency.value = tone.freq;
    gain.gain.setValueAtTime(0.0001, now + tone.start);
    gain.gain.exponentialRampToValueAtTime(0.22, now + tone.start + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + tone.start + tone.duration);
    osc.connect(gain).connect(c.destination);
    osc.start(now + tone.start);
    osc.stop(now + tone.start + tone.duration + 0.05);
  }
}

/**
 * Repeating two-tone ringtone for driver delivery offers. Loops until the
 * returned stop() is called or maxSeconds (default 30s) elapses.
 */
export function startRingtone(maxSeconds = 30): () => void {
  if (!unlocked) return () => {};
  const c = getCtx();
  if (!c) return () => {};
  if (c.state === "suspended") void c.resume();

  const ring = () => {
    const now = c.currentTime + 0.02;
    const tones: Tone[] = [
      { freq: 988, start: 0, duration: 0.18 },
      { freq: 1319, start: 0.2, duration: 0.18 },
      { freq: 988, start: 0.4, duration: 0.18 },
      { freq: 1319, start: 0.6, duration: 0.3 },
    ];
    for (const tone of tones) {
      const osc = c.createOscillator();
      const gain = c.createGain();
      osc.type = "triangle";
      osc.frequency.value = tone.freq;
      gain.gain.setValueAtTime(0.0001, now + tone.start);
      gain.gain.exponentialRampToValueAtTime(0.25, now + tone.start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + tone.start + tone.duration);
      osc.connect(gain).connect(c.destination);
      osc.start(now + tone.start);
      osc.stop(now + tone.start + tone.duration + 0.05);
    }
  };

  ring();
  const interval = window.setInterval(ring, 1500);
  const timeout = window.setTimeout(() => window.clearInterval(interval), maxSeconds * 1000);
  return () => {
    window.clearInterval(interval);
    window.clearTimeout(timeout);
  };
}
