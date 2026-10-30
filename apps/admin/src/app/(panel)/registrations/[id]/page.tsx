"use client";

import { ArrowLeft, FileText } from "lucide-react";
import Link from "next/link";
import { use } from "react";
import { api, useApi } from "@doctraders/api-client";
import { Card, CardBody, CardHeader, CardTitle, PageHeader, Spinner } from "@doctraders/ui";
import { ReviewPanel } from "@/components/review-panel";

export default function RegistrationDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: user, loading } = useApi(() => api.user(id));

  if (loading) return <Spinner />;
  if (!user) return <p>Registration not found.</p>;

  const rows: [string, string][] = [
    ["Company", user.companyName], ["Type", user.companyType], ["Country", user.country],
    ["Contact", user.contactName], ["Email", user.email], ["Phone", user.phone], ["Submitted", user.createdAt],
  ];

  return (
    <>
      <Link href="/registrations" className="mb-3 inline-flex items-center gap-1 text-sm text-ink-600 hover:text-ink-900"><ArrowLeft className="size-4" />Back</Link>
      <PageHeader title={user.companyName} />
      <div className="grid gap-4 lg:grid-cols-[1fr_22rem]">
        <div className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Company details</CardTitle></CardHeader>
            <CardBody>
              <dl className="grid gap-3 text-sm sm:grid-cols-2">
                {rows.map(([k, v]) => <div key={k}><dt className="text-ink-500">{k}</dt><dd className="font-medium capitalize text-ink-900">{v}</dd></div>)}
              </dl>
            </CardBody>
          </Card>
          <Card>
            <CardHeader><CardTitle>Uploaded documents</CardTitle></CardHeader>
            <CardBody className="divide-y divide-ink-100 p-0">
              {user.documents.map((d) => (
                <div key={d.key} className="flex items-center gap-3 px-5 py-3 text-sm">
                  <FileText className="size-4 text-ink-500" />
                  <span className="flex-1"><span className="font-medium text-ink-900">{d.label}</span><span className="block text-ink-500">{d.fileName}</span></span>
                  <button className="cursor-pointer text-xs font-semibold text-ink-700 underline">View</button>
                </div>
              ))}
              {user.documents.length === 0 && <p className="p-5 text-sm text-ink-500">No documents uploaded.</p>}
            </CardBody>
          </Card>
        </div>
        <ReviewPanel user={user} />
      </div>
    </>
  );
}
