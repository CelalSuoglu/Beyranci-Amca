import type { Metadata } from "next";
import { LegalDocumentView } from "@/components/legal/LegalDocumentView";
import { iptalIade } from "@/lib/legal/documents";

const doc = iptalIade();

export const metadata: Metadata = {
  title: doc.title,
  description: doc.summary,
  alternates: { canonical: "/iptal-ve-iade" },
};

export default function Page() {
  return <LegalDocumentView doc={doc} />;
}
