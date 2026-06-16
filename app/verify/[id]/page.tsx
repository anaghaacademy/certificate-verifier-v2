"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

type Certificate = {
  certificateId: string;
  studentName: string;
  fatherName: string;
  courseName: string;
  fromDate: string;
  toDate: string;
  grade: string;
  photoUrl: string;
  status: string;
  createdAt: string;
};

export default function VerifyPage() {
  const params = useParams();
  const id = (params?.id as string | undefined) ?? "";
  const [cert, setCert] = useState<Certificate | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const trimmed = id.trim();
    if (!trimmed) {
      setLoading(false);
      return;
    }

    const url = `/api/certificate-json/${encodeURIComponent(trimmed)}`;

    (async () => {
      try {
        const res = await fetch(url, { cache: "no-store" });
        if (!res.ok) {
          setCert(null);
        } else {
          const data = (await res.json()) as Certificate;
          setCert(data);
        }
      } catch {
        setCert(null);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
        <div className="rounded-2xl bg-white p-8 shadow max-w-lg w-full text-center">
          <h1 className="text-2xl font-bold text-purple-700">Verifying...</h1>
          <p className="mt-3 text-gray-600">
            Please wait while we verify your certificate ID.
          </p>
        </div>
      </main>
    );
  }

  if (!cert) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
        <div className="rounded-2xl bg-white p-8 shadow max-w-lg w-full text-center">
          <h1 className="text-2xl font-bold text-red-600">Not Found</h1>
          <p className="mt-3 text-gray-600">
            No certificate found for this ID.
          </p>
          <Link
            href="/"
            className="mt-6 inline-block rounded-lg bg-purple-700 px-5 py-3 text-white"
          >
            Go Back
          </Link>
        </div>
      </main>
    );
  }

  // Normalize Google Drive photo URLs to a direct image URL if possible
  const normalizedPhotoUrl =
    cert.photoUrl && cert.photoUrl.includes("drive.google.com/file/d/")
      ? (() => {
          const match = cert.photoUrl.match(/\/file\/d\/([^/]+)\//);
          const fileId = match?.[1];
          return fileId
            ? `https://drive.google.com/uc?export=view&id=${fileId}`
            : cert.photoUrl;
        })()
      : cert.photoUrl;

  return (
    <main className="min-h-screen bg-gray-100 px-4 py-10">
      <div className="mx-auto max-w-4xl rounded-2xl bg-white p-8 shadow">
        <h1 className="text-3xl font-bold text-center text-green-700">
          Certificate Verified
        </h1>

        <div className="mt-8 grid gap-6 md:grid-cols-[160px_1fr]">
          <div className="flex justify-center">
            {normalizedPhotoUrl ? (
              <img
                src={normalizedPhotoUrl}
                alt="Student Photo"
                className="h-40 w-32 rounded border object-cover"
              />
            ) : (
              <div className="h-40 w-32 rounded border flex items-center justify-center text-xs text-gray-400">
                No photo
              </div>
            )}
          </div>

          <div className="space-y-2 text-gray-800">
            <p>
              <b>Certificate ID:</b> {cert.certificateId}
            </p>
            <p>
              <b>Student Name:</b> {cert.studentName}
            </p>
            <p>
              <b>Father Name:</b> {cert.fatherName}
            </p>
            <p>
              <b>Course Name:</b> {cert.courseName}
            </p>
            <p>
              <b>From:</b> {cert.fromDate}
            </p>
            <p>
              <b>To:</b> {cert.toDate}
            </p>
            <p>
              <b>Grade:</b> {cert.grade}
            </p>
            <p>
              <b>Status:</b> {cert.status}
            </p>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap gap-4">
          <Link
            href={`/api/certificate/${cert.certificateId}`}
            target="_blank"
            className="rounded-lg bg-purple-700 px-5 py-3 text-white"
          >
            Download PDF
          </Link>

          <Link
            href="/"
            className="rounded-lg border border-gray-300 px-5 py-3 text-gray-700"
          >
            Verify Another
          </Link>
        </div>
      </div>
    </main>
  );
}