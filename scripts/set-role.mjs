/**
 * Bir kullanıcıya rol verir (ilk yöneticiyi atamak için).
 * Kullanım: node scripts/set-role.mjs ornek@mail.com admin
 * Roller: customer | staff | admin
 * Kullanıcının önce siteden üye olmuş olması gerekir.
 */
import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const env = Object.fromEntries(
  fs
    .readFileSync(path.join(__dirname, "..", ".env.local"), "utf8")
    .split("\n")
    .filter((l) => l && !l.startsWith("#") && l.includes("="))
    .map((l) => [l.slice(0, l.indexOf("=")).trim(), l.slice(l.indexOf("=") + 1).trim()]),
);

const [email, role] = process.argv.slice(2);
if (!email || !["customer", "staff", "admin"].includes(role)) {
  console.error("Kullanım: node scripts/set-role.mjs <email> <customer|staff|admin>");
  process.exit(1);
}

const admin = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const { data, error } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
if (error) {
  console.error("Kullanıcılar alınamadı:", error.message);
  process.exit(1);
}
const user = data.users.find((u) => (u.email ?? "").toLowerCase() === email.toLowerCase());
if (!user) {
  console.error("Bu e-posta ile kullanıcı yok. Önce siteden üye olun:", email);
  process.exit(1);
}
const { error: upErr } = await admin.from("profiles").upsert({ id: user.id, role }, { onConflict: "id" });
if (upErr) {
  console.error("Rol verilemedi:", upErr.message, "(Migration çalıştırıldı mı?)");
  process.exit(1);
}
console.log(`✅ ${email} → ${role}`);
