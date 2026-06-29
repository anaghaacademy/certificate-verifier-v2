"use client";

import { useState } from "react";
import Link from "next/link";

export default function AdminPage() {
  const [form, setForm] = useState({
    certificateId: "",
    studentName: "",
    fatherName: "",
    courseName: "",
    fromDate: "",
    toDate: "",
    grade: "",
    status: "Verified",
    certificateFileUrl: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  function isLikelyDriveUrl(url: string): boolean {
    if (!url) return false;
    try {
      const u = new URL(url);
      if (!["http:", "https:"].includes(u.protocol)) return false;
      return u.hostname.includes("drive.google.com");
    } catch {
      return false;
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);
    setError(null);

    const trimmedUrl = form.certificateFileUrl.trim();

    if (!isLikelyDriveUrl(trimmedUrl)) {
      setSubmitting(false);
      setError(
        "Certificate File URL must be a valid Google Drive link (starting with https://drive.google.com/)."
      );
      return;
    }

    try {
      const res = await fetch("/api/admin/certificates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, certificateFileUrl: trimmedUrl }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to save certificate");
      }

      setMessage("Certificate saved successfully.");
      setForm({
        certificateId: "",
        studentName: "",
        fatherName: "",
        courseName: "",
        fromDate: "",
        toDate: "",
        grade: "",
        status: "Verified",
        certificateFileUrl: "",
      });
    } catch (err: any) {
      setError(err.message || "Unknown error");
    } finally {
      setSubmitting(false);
    }
  };

  const inputClasses =
    "mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 bg-white";

  return (
    <main className="min-h-screen bg-gray-100 px-4 py-10">
      <div className="mx-auto max-w-2xl rounded-2xl bg-white p-8 shadow">
        <h1 className="text-3xl font-bold text-center text-purple-700">
          Admin Dashboard
        </h1>

        <p className="mt-2 text-center text-gray-600">
          Add certificate details here.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700">
              Certificate ID
            </label>
            <input
              name="certificateId"
              value={form.certificateId}
              onChange={handleChange}
              required
              className={inputClasses}
              placeholder="Certificate ID"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-semibold text-gray-700">
                Student Name
              </label>
              <input
                name="studentName"
                value={form.studentName}
                onChange={handleChange}
                required
                className={inputClasses}
                placeholder="Student Name"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700">
                Father Name
              </label>
              <input
                name="fatherName"
                value={form.fatherName}
                onChange={handleChange}
                required
                className={inputClasses}
                placeholder="Father Name"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700">
              Course Name
            </label>
            <input
              name="courseName"
              value={form.courseName}
              onChange={handleChange}
              required
              className={inputClasses}
              placeholder="Course Name"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-semibold text-gray-700">
                From Date
              </label>
              <input
                name="fromDate"
                value={form.fromDate}
                onChange={handleChange}
                placeholder="From Date"
                className={inputClasses}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700">
                To Date
              </label>
              <input
                name="toDate"
                value={form.toDate}
                onChange={handleChange}
                placeholder="To Date"
                className={inputClasses}
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-semibold text-gray-700">
                Grade
              </label>
              <input
                name="grade"
                value={form.grade}
                onChange={handleChange}
                placeholder="Excellent"
                className={inputClasses}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700">
                Status
              </label>
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                className={inputClasses}
              >
                <option value="Verified">Verified</option>
                <option value="Invalid">Invalid</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700">
              Certificate File URL (Google Drive link)
            </label>
            <input
              name="certificateFileUrl"
              value={form.certificateFileUrl}
              onChange={handleChange}
              required
              className={inputClasses}
              placeholder="https://drive.google.com/file/d/FILE_ID/view?..."
            />
            <p className="mt-1 text-xs text-gray-500">
              Make sure the file is shared as &quot;Anyone with the link can
              view&quot; and the link starts with
              &quot;https://drive.google.com/&quot;.
            </p>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-lg bg-purple-700 px-4 py-2 font-semibold text-white hover:bg-purple-800 disabled:opacity-60"
          >
            {submitting ? "Saving..." : "Save Certificate"}
          </button>
        </form>

        {message && (
          <p className="mt-4 text-center text-green-600 font-medium">
            {message}
          </p>
        )}
        {error && (
          <p className="mt-4 text-center text-red-600 font-medium">{error}</p>
        )}

        <div className="mt-6 text-center">
          <Link href="/" className="text-sm text-purple-700 underline">
            Go to Verify Page
          </Link>
        </div>
      </div>
    </main>
  );
}