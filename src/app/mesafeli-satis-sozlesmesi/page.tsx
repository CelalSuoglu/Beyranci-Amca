import type { Metadata } from "next";
import { LegalDocumentView } from "@/components/legal/LegalDocumentView";
import { mesafeliSatis } from "@/lib/legal/documents";

const doc = mesafeliSatis();

export const metadata: Metadata = {
  title: doc.title,
  description: doc.summary,
  alternates: { canonical: "/mesafeli-satis-sozlesmesi" },
};

export default function Page() {
  return <LegalDocumentView doc={doc} />;
}
