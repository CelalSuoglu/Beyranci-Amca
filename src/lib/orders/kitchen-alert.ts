/** Mutfak yeni sipariş alarmı — tarayıcı autoplay kuralları için kullanıcı etkileşimi gerekir. */

let sharedCtx: AudioContext | null = null;

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

/** İlk tıklamada / girişten sonra çağırın — ses iznini açar. */
export async function unlockKitchenAudio(): Promise<boolean> {
  try {
    const ctx = getAudioContext();
    if (!ctx) return false;
    if (ctx.state === "suspended") {
      await ctx.resume();
    }
    return ctx.state === "running";
  } catch {
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
  osc.frequency.value = frequency;
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(volume, start + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(start);
  osc.stop(start + duration + 0.02);
}

/** Yeni sipariş alarmı — 3 yüksek bip */
export async function playKitchenOrderAlert(): Promise<void> {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    if (ctx.state === "suspended") {
      await ctx.resume();
    }
    if (ctx.state !== "running") return;

    const now = ctx.currentTime;
    const pattern: [number, number][] = [
      [0, 880],
      [0.28, 1175],
      [0.56, 880],
      [0.9, 1319],
    ];

    for (const [offset, freq] of pattern) {
      tone(ctx, now + offset, 0.22, freq, 0.22);
    }
  } catch {
    // Ses engelliyse sessiz devam
  }
}
