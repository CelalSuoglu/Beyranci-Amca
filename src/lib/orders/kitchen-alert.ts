/** Mutfak yeni sipariş alarmı — tarayıcı autoplay kuralları için kullanıcı etkileşimi gerekir. */

let sharedCtx: AudioContext | null = null;
let armed = false;
const listeners = new Set<(value: boolean) => void>();

function notifyArmed() {
  for (const listener of listeners) listener(armed);
}

function setArmed(value: boolean) {
  if (armed === value) return;
  armed = value;
  notifyArmed();
}

export function isKitchenAudioArmed(): boolean {
  return armed;
}

export function subscribeKitchenAudioArmed(
  listener: (value: boolean) => void,
): () => void {
  listeners.add(listener);
  listener(armed);
  return () => {
    listeners.delete(listener);
  };
}

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const AudioCtx =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext;
  if (!AudioCtx) return null;

  if (!sharedCtx || sharedCtx.state === "closed") {
    sharedCtx = new AudioCtx();
  }
  return sharedCtx;
}

/** iOS/Safari: kullanıcı jesti içinde kısa sessiz buffer çalarak sesi kalıcı açar. */
async function primeContext(ctx: AudioContext): Promise<void> {
  if (ctx.state === "suspended") {
    await ctx.resume();
  }
  try {
    const buffer = ctx.createBuffer(1, 1, ctx.sampleRate);
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(ctx.destination);
    source.start(0);
  } catch {
    // prime başarısız olsa da resume yeterli olabilir
  }
}

/** Panelde tıklama / “Ses test et” / giriş sonrası çağırın. */
export async function unlockKitchenAudio(): Promise<boolean> {
  try {
    const ctx = getAudioContext();
    if (!ctx) {
      setArmed(false);
      return false;
    }
    await primeContext(ctx);
    const ok = ctx.state === "running";
    setArmed(ok);
    return ok;
  } catch {
    setArmed(false);
    return false;
  }
}

function tone(
  ctx: AudioContext,
  start: number,
  duration: number,
  frequency: number,
  volume: number,
) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "square";
  osc.frequency.setValueAtTime(frequency, start);
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(volume, start + 0.012);
  gain.gain.exponentialRampToValueAtTime(volume * 0.55, start + duration * 0.45);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(start);
  osc.stop(start + duration + 0.02);
}

/**
 * Yeni sipariş alarmı — yüksek, tekrarlayan bip (mutfakta duyulur).
 * @returns çaldı mı
 */
export async function playKitchenOrderAlert(): Promise<boolean> {
  try {
    const ctx = getAudioContext();
    if (!ctx) {
      setArmed(false);
      return false;
    }

    if (ctx.state === "suspended") {
      await ctx.resume();
    }
    if (ctx.state !== "running") {
      setArmed(false);
      return false;
    }
    setArmed(true);

    const now = ctx.currentTime;
    // 3 tur: yüksek–daha yüksek–yüksek
    const pattern: [number, number][] = [
      [0, 880],
      [0.22, 1175],
      [0.44, 880],
      [0.75, 1319],
      [1.05, 880],
      [1.27, 1175],
      [1.49, 880],
      [1.8, 1319],
    ];

    for (const [offset, freq] of pattern) {
      tone(ctx, now + offset, 0.18, freq, 0.42);
    }
    return true;
  } catch {
    setArmed(false);
    return false;
  }
}
