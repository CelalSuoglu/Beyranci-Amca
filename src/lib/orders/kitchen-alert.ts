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

function playBell(
  ctx: AudioContext,
  start: number,
  frequency: number,
  duration: number,
  volume: number,
) {
  const master = ctx.createGain();
  master.connect(ctx.destination);
  master.gain.setValueAtTime(0.0001, start);
  master.gain.exponentialRampToValueAtTime(volume, start + 0.015);
  master.gain.exponentialRampToValueAtTime(volume * 0.35, start + duration * 0.35);
  master.gain.exponentialRampToValueAtTime(0.0001, start + duration);

  // Ana ton
  const fund = ctx.createOscillator();
  fund.type = "sine";
  fund.frequency.setValueAtTime(frequency, start);
  fund.connect(master);
  fund.start(start);
  fund.stop(start + duration);

  // Parlak üst harmonik (zil hissi)
  const harm = ctx.createOscillator();
  const harmGain = ctx.createGain();
  harm.type = "triangle";
  harm.frequency.setValueAtTime(frequency * 2.01, start);
  harmGain.gain.setValueAtTime(volume * 0.45, start);
  harmGain.gain.exponentialRampToValueAtTime(0.0001, start + duration * 0.7);
  harm.connect(harmGain);
  harmGain.connect(master);
  harm.start(start);
  harm.stop(start + duration);

  // Kısa “tik” attack
  const click = ctx.createOscillator();
  const clickGain = ctx.createGain();
  click.type = "sine";
  click.frequency.setValueAtTime(frequency * 3.2, start);
  clickGain.gain.setValueAtTime(volume * 0.25, start);
  clickGain.gain.exponentialRampToValueAtTime(0.0001, start + 0.06);
  click.connect(clickGain);
  clickGain.connect(master);
  click.start(start);
  click.stop(start + 0.08);
}

/**
 * Yeni sipariş zili — yumuşak ama dikkat çeken 3 notalı çan.
 * (Do5 → Mi5 → Sol5 + tekrar)
 */
export async function playKitchenOrderAlert(): Promise<void> {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    if (ctx.state === "suspended") {
      await ctx.resume();
    }
    if (ctx.state !== "running") return;

    const now = ctx.currentTime;
    // C5, E5, G5 — net “sipariş geldi” melodisi
    const notes: [number, number][] = [
      [0, 523.25],
      [0.22, 659.25],
      [0.44, 783.99],
      [0.85, 523.25],
      [1.07, 659.25],
      [1.29, 783.99],
    ];

    for (const [offset, freq] of notes) {
      playBell(ctx, now + offset, freq, 0.55, 0.28);
    }
  } catch {
    // Ses engelliyse sessiz devam
  }
}
