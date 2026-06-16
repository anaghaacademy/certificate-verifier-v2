import { NextRequest } from "next/server";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import PDFDocument from "pdfkit";

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

  // Create PDF in memory
  const docPdf = new PDFDocument({
    size: "A4",
    margin: 50,
  });

  const chunks: Buffer[] = [];
  docPdf.on("data", (chunk) => chunks.push(chunk as Buffer));
  const pdfPromise = new Promise<Buffer>((resolve) => {
    docPdf.on("end", () => {
      resolve(Buffer.concat(chunks));
    });
  });

  // Basic certificate styling
  docPdf.rect(20, 20, 555, 800).lineWidth(3).stroke("#f2b24c");

  docPdf
    .fontSize(28)
    .fillColor("#5b21b6")
    .text("CERTIFICATE", { align: "center", underline: false });

  docPdf.moveDown(0.3);
  docPdf
    .fontSize(18)
    .fillColor("#000000")
    .text("ANAGHA ACADEMY", { align: "center" });

  docPdf.moveDown(1.5);
  docPdf
    .fontSize(12)
    .fillColor("#000000")
    .text(`Certificate ID: ${trimmed}`, { align: "center" });

  docPdf.moveDown(1.5);
  docPdf
    .fontSize(14)
    .text(
      `This is to certify that ${cert.studentName},`,
      { align: "left" }
    );
  docPdf.moveDown(0.3);
  docPdf.text(
    `S/o/D/o ${cert.fatherName}, has successfully completed the ${cert.courseName} Course/Internship conducted by Anagha Academy from ${cert.fromDate} to ${cert.toDate}.`
  );
  docPdf.moveDown(0.5);
  docPdf.text(`His/Her performance was graded as ${cert.grade}.`);

  // Footer: date/place + signature
  docPdf.moveDown(3);
  const yFooter = docPdf.y;
  docPdf
    .fontSize(12)
    .text("Date: __________\nPlace: Kurnool.", 50, yFooter);
  docPdf.text(" ", 50, yFooter); // spacer
  docPdf
    .fontSize(12)
    .text("A. SHIVANI\nDirector’s Signature", 350, yFooter, {
      align: "right",
    });

  docPdf.end();

  const pdfBuffer = await pdfPromise;

  return new Response(pdfBuffer, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${trimmed}.pdf"`,
    },
  });
}