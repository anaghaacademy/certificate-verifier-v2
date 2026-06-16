import { NextRequest } from "next/server";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import puppeteer from "puppeteer-core";
import chromium from "@sparticuz/chromium";

export const runtime = "nodejs";

export async function GET(
  _request: NextRequest,
  context: { params: { id: string } }
) {
  const { id } = context.params;
  const trimmed = id?.trim();
  if (!trimmed) {
    return new Response("Missing ID", { status: 400 });
  }

  const snap = await getDoc(doc(db, "certificates", trimmed));
  if (!snap.exists()) {
    return new Response("Certificate not found", { status: 404 });
  }

  const cert = snap.data() as any;

  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    "https://certificate-verifier-v2-wp6g.vercel.app";

  const html = `
    <html>
      <head>
        <meta charset="utf-8" />
        <style>
          body { margin: 0; font-family: Arial, sans-serif; background: #fff; }
          .page {
            width: 1123px;
            height: 794px;
            position: relative;
            box-sizing: border-box;
            padding: 40px;
            border: 4px solid #f2b24c;
          }
          .title { text-align: center; color: #5b21b6; font-size: 44px; font-weight: 700; margin-top: 50px; }
          .sub { text-align: center; margin-top: 10px; font-size: 18px; font-weight: 700; }
          .body { margin-top: 60px; font-size: 20px; line-height: 1.7; }
          .id { font-weight: 700; }
          .photo {
            position: absolute;
            top: 120px;
            right: 70px;
            width: 160px;
            height: 190px;
            border: 2px solid #3b2a5a;
            object-fit: cover;
          }
          .footer {
            position: absolute;
            bottom: 40px;
            left: 40px;
            right: 40px;
            display: flex;
            justify-content: space-between;
            font-size: 18px;
          }
          .center {
            text-align: center;
            margin-top: 40px;
          }
          .qr {
            margin-top: 8px;
            width: 60px;
            height: 60px;
          }
        </style>
      </head>
      <body>
        <div class="page">
          <div class="title">CERTIFICATE</div>
          <div class="sub">ANAGHA ACADEMY</div>

          ${
            cert.photoUrl
              ? `<img class="photo" src="${cert.photoUrl}" />`
              : `<div class="photo"></div>`
          }

          <div class="body">
            <div><span class="id">Certificate ID:</span> ${trimmed}</div>
            <p>This is to certify that <b>${cert.studentName}</b>,</p>
            <p>S/o/D/o <b>${cert.fatherName}</b>, has successfully completed the <b>${cert.courseName}</b> Course/Internship conducted by Anagha Academy from <b>${cert.fromDate}</b> to <b>${cert.toDate}</b>.</p>
            <p>His/Her performance was graded as <b>${cert.grade}</b>.</p>
          </div>

          <div class="center">
            <img
              class="qr"
              src="https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(
                `${baseUrl}/verify/${trimmed}`
              )}"
            />
            <div>scan to verify</div>
          </div>

          <div class="footer">
            <div>
              <div>Date: __________</div>
              <div>Place: Kurnool.</div>
            </div>
            <div style="text-align:right;">
              <div><b>A. SHIVANI</b></div>
              <div><b>Director’s Signature</b></div>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;

  const browser = await puppeteer.launch({
    args: chromium.args,
    executablePath: await chromium.executablePath(),
    headless: true,
  });

  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: "load" });

  const pdf = await page.pdf({
    format: "A4",
    printBackground: true,
  });

  await browser.close();

  const pdfBlob = new Blob([pdf as any], { type: "application/pdf" });

  return new Response(pdfBlob, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${trimmed}.pdf"`,
    },
  });
}