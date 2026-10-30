"use client";

import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { api, useApi } from "@doctraders/api-client";
import { formatINRCompact } from "@doctraders/schemas";
import { Card, CardBody, CardHeader, CardTitle, PageHeader, Spinner, Stat } from "@doctraders/ui";

const INK = "#2a2622";
const BRAND = "#c8262f";

export default function ReportsPage() {
  const { data, loading } = useApi(api.reports);
  if (loading || !data) return <Spinner />;
  const { totals, monthly, byCategory } = data;

  return (
    <>
      <PageHeader title="Reports" description="Users, listings, deals and commission earned." />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Users" value={String(totals.users)} />
        <Stat label="Listings" value={String(totals.listings)} />
        <Stat label="Deals" value={String(totals.deals)} />
        <Stat label="Commission earned" value={formatINRCompact(totals.commissionEarned)} />
      </div>
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Commission per month (₹)</CardTitle></CardHeader>
          <CardBody className="h-72">
            <ResponsiveContainer>
              <LineChart data={monthly}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0ece6" />
                <XAxis dataKey="month" /><YAxis /><Tooltip />
                <Line type="monotone" dataKey="commission" stroke={BRAND} strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>
        <Card>
          <CardHeader><CardTitle>Listings by category</CardTitle></CardHeader>
          <CardBody className="h-72">
            <ResponsiveContainer>
              <BarChart data={byCategory}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0ece6" />
                <XAxis dataKey="name" /><YAxis /><Tooltip />
                <Bar dataKey="listings" fill={INK} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>
      </div>
    </>
  );
}
