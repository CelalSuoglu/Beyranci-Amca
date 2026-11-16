import { Redirect } from "expo-router";
import { useAuth } from "../../src/context/AuthContext";
import { Loading } from "../../src/components/ui";
import { KitchenScreen } from "../../src/screens/KitchenScreen";

/** Personel paneli. Ekran gizleme sadece görünüm içindir; siparişlere erişim veritabanında (RLS) denetlenir. */
export default function PanelTab() {
  const { ready, session, isStaff } = useAuth();
  if (!ready) return <Loading />;
  if (!session || !isStaff) return <Redirect href="/" />;
  return <KitchenScreen session={session} />;
}
