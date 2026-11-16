import { StoreSettingsAdmin } from "@/components/admin/StoreSettingsAdmin";
import { Alert } from "@/components/account/ui";
import { missingBusinessFields } from "@/lib/legal";

export default function YonetimAyarlarPage() {
  const missing = missingBusinessFields();
  return (
    <div className="space-y-5">
      {missing.length ? (
        <Alert>
          Yasal sayfalarda eksik satıcı bilgisi var: {missing.join(", ")}. E-Ticaret Kanunu gereği bunların sitede
          yer alması gerekir; bilgileri geliştiriciye iletin (src/lib/legal.ts).
        </Alert>
      ) : null}
      <StoreSettingsAdmin />
    </div>
  );
}
