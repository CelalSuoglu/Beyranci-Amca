import type { Metadata } from "next";
import { LegalDocumentView } from "@/components/legal/LegalDocumentView";
import { erisilebilirlik } from "@/lib/legal/documents";

const doc = erisilebilirlik();

export const metadata: Metadata = {
  title: doc.title,
  description: doc.summary,
  alternates: { canonical: "/erisilebilirlik" },
};

export default function Page() {
  return <LegalDocumentView doc={doc} />;
}
