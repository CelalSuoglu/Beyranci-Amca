import type { Metadata } from "next";
import { LegalDocumentView } from "@/components/legal/LegalDocumentView";
import { cerezPolitikasi } from "@/lib/legal/documents";

const doc = cerezPolitikasi();

export const metadata: Metadata = {
  title: doc.title,
  description: doc.summary,
  alternates: { canonical: "/cerez-politikasi" },
};

export default function Page() {
  return <LegalDocumentView doc={doc} />;
}
