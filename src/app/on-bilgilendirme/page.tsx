import type { Metadata } from "next";
import { LegalDocumentView } from "@/components/legal/LegalDocumentView";
import { onBilgilendirme } from "@/lib/legal/documents";

const doc = onBilgilendirme();

export const metadata: Metadata = {
  title: doc.title,
  description: doc.summary,
  alternates: { canonical: "/on-bilgilendirme" },
};

export default function Page() {
  return <LegalDocumentView doc={doc} />;
}
