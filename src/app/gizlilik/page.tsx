import type { Metadata } from "next";
import { LegalDocumentView } from "@/components/legal/LegalDocumentView";
import { gizlilik } from "@/lib/legal/documents";

const doc = gizlilik();

export const metadata: Metadata = {
  title: doc.title,
  description: doc.summary,
  alternates: { canonical: "/gizlilik" },
};

export default function Page() {
  return <LegalDocumentView doc={doc} />;
}
