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
  status: string;
  createdAt: string;
  certificateFileUrl?: string;
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

  return (
    <main className="min-h-screen bg-gray-100 px-4 py-10">
      <div className="mx-auto max-w-4xl rounded-2xl bg-white p-8 shadow">
        <h1 className="text-3xl font-bold text-center text-green-700">
          Certificate Verified
        </h1>

        <div className="mt-8 space-y-2 text-gray-800">
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

        <div className="mt-8 flex flex-wrap gap-4">
          {cert.certificateFileUrl ? (
            <a
              href={cert.certificateFileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg bg-purple-700 px-5 py-3 text-white"
            >
              Download Certificate
            </a>
          ) : null}

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