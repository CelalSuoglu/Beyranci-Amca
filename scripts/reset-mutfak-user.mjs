/**
 * Mutfak kullanıcısını oluşturur / şifresini sıfırlar.
 * Çalıştır: node scripts/reset-mutfak-user.mjs "GüçlüBirŞifre123"
 */
import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.join(__dirname, "..", ".env.local");

if (!fs.existsSync(envPath)) {
  console.error(".env.local bulunamadı.");
  process.exit(1);
}

const env = Object.fromEntries(
  fs
    .readFileSync(envPath, "utf8")
    .split("\n")
    .filter((l) => l && !l.startsWith("#") && l.includes("="))
    .map((l) => {
      const i = l.indexOf("=");
      return [l.slice(0, i).trim(), l.slice(i + 1).trim()];
    }),
);

const url = env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;
const anonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !serviceKey || !anonKey) {
  console.error(".env.local içinde Supabase değişkenleri eksik.");
  process.exit(1);
}

const email = "mutfak@beyranciamca.com";
// Şifre koda yazılmaz; komut satırından verilir
const password = process.argv[2];
if (!password || password.length < 10) {
  console.error('Kullanım: node scripts/reset-mutfak-user.mjs "<en az 10 karakterli şifre>"');
  process.exit(1);
}

const admin = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const listed = await admin.auth.admin.listUsers({ page: 1, perPage: 200 });
if (listed.error) {
  console.error("Kullanıcı listesi alınamadı:", listed.error.message);
  process.exit(1);
}

const existing = listed.data.users.find(
  (u) => (u.email || "").toLowerCase() === email,
);

if (existing) {
  const upd = await admin.auth.admin.updateUserById(existing.id, {
    password,
    email_confirm: true,
  });
  if (upd.error) {
    console.error("Şifre güncellenemedi:", upd.error.message);
    process.exit(1);
  }
  console.log("Mevcut kullanıcı güncellendi:", email);
} else {
  const created = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  if (created.error) {
    console.error("Kullanıcı oluşturulamadı:", created.error.message);
    process.exit(1);
  }
  console.log("Yeni kullanıcı oluşturuldu:", email);
}

const anon = createClient(url, anonKey);
const signIn = await anon.auth.signInWithPassword({ email, password });
if (signIn.error) {
  console.error("Test girişi BAŞARISIZ:", signIn.error.message);
  process.exit(1);
}

console.log("");
console.log("✅ Hazır. Mutfak girişi:");
console.log("   URL:   https://beyranci-amca.vercel.app/mutfak/giris");
console.log("   Email:", email);
console.log("   Şifre: (komut satırında verdiğiniz şifre)");
console.log("   Rolü personel yapmak için: node scripts/set-role.mjs", email, "staff");
