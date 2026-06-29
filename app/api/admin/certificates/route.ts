import { NextRequest, NextResponse } from "next/server";
import { doc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      certificateId,
      studentName,
      fatherName,
      courseName,
      fromDate,
      toDate,
      grade,
      status,
      certificateFileUrl,
    } = body;

    const trimmedId = (certificateId ?? "").trim();

    if (!trimmedId) {
      return NextResponse.json(
        { error: "certificateId is required" },
        { status: 400 }
      );
    }

    const data = {
      certificateId: trimmedId,
      studentName: (studentName ?? "").trim(),
      fatherName: (fatherName ?? "").trim(),
      courseName: (courseName ?? "").trim(),
      fromDate: (fromDate ?? "").trim(),
      toDate: (toDate ?? "").trim(),
      grade: (grade ?? "").trim(),
      status: (status ?? "").trim() || "Verified",
      certificateFileUrl: (certificateFileUrl ?? "").trim(),
      createdAt: new Date().toISOString(),
    };

    await setDoc(doc(db, "certificates", trimmedId), data);

    return NextResponse.json({ success: true, certificate: data });
  } catch (err) {
    console.error("Error creating certificate", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}