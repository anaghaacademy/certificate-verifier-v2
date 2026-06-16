import { NextRequest } from "next/server";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export const runtime = "nodejs";

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const trimmed = id?.trim();
  if (!trimmed) {
    return new Response("Missing ID", { status: 400 });
  }

  const snap = await getDoc(doc(db, "certificates", trimmed));
  if (!snap.exists()) {
    return new Response("Certificate not found", { status: 404 });
  }

  const cert = snap.data() as any;

  // For now, build a simple text content representing the certificate.
  const content = `
CERTIFICATE - ANAGHA ACADEMY

Certificate ID: ${trimmed}
Student Name: ${cert.studentName}
Father Name: ${cert.fatherName}
Course Name: ${cert.courseName}
From: ${cert.fromDate}
To: ${cert.toDate}
Grade: ${cert.grade}
Status: ${cert.status}

(Replace this with a real PDF later.)
`;

  return new Response(content, {
    headers: {
      "Content-Type": "application/octet-stream",
      "Content-Disposition": `attachment; filename="${trimmed}.txt"`,
    },
  });
}