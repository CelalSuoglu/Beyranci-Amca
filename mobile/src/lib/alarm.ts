import { createAudioPlayer, setAudioModeAsync, type AudioPlayer } from "expo-audio";
import { Vibration } from "react-native";

let player: AudioPlayer | null = null;

/** Mutfak ekranı açılınca bir kez çağrılır. Telefon sessizdeyken de çalar. */
export async function initAlarm(): Promise<void> {
  try {
    await setAudioModeAsync({ playsInSilentMode: true });
  } catch {
    // ses modu ayarlanamazsa yine de çalmayı dene
  }
  if (!player) {
    player = createAudioPlayer(require("../../assets/alarm.wav"));
    player.volume = 1;
  }
}

/** Yeni sipariş alarmı: bip deseni + titreşim. */
export async function playAlarm(): Promise<void> {
  Vibration.vibrate([0, 400, 200, 400, 200, 400]);
  try {
    if (!player) await initAlarm();
    if (!player) return;
    await player.seekTo(0);
    player.play();
  } catch {
    // ses çalınamazsa titreşim yeterli
  }
}

export function releaseAlarm(): void {
  try {
    player?.remove();
  } catch {
    // yok say
  }
  player = null;
}
