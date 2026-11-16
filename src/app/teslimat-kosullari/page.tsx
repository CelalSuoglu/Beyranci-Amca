import type { Metadata } from "next";
import { LegalDocumentView } from "@/components/legal/LegalDocumentView";
import { teslimat } from "@/lib/legal/documents";

const doc = teslimat();

export const metadata: Metadata = {
  title: doc.title,
  description: doc.summary,
  alternates: { canonical: "/teslimat-kosullari" },
};

export default function Page() {
  return <LegalDocumentView doc={doc} />;
}
