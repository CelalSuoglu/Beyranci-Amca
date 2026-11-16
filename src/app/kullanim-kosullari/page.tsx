import type { Metadata } from "next";
import { LegalDocumentView } from "@/components/legal/LegalDocumentView";
import { kullanimKosullari } from "@/lib/legal/documents";

const doc = kullanimKosullari();

export const metadata: Metadata = {
  title: doc.title,
  description: doc.summary,
  alternates: { canonical: "/kullanim-kosullari" },
};

export default function Page() {
  return <LegalDocumentView doc={doc} />;
}
