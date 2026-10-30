"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import type { ColumnDef } from "@tanstack/react-table";
import { Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { ApiError, apiFetch, apiList, useApi } from "@/lib/api-client";
import { applyApiError } from "@/lib/form-errors";
import { formatDate } from "@/lib/format";
import { useMe, type Me } from "@/lib/me";
import { adminCreateSchema, type AdminCreateInput, type AdminCreateValues } from "@/lib/validation";
import { Button, Checkbox, ConfirmDialog, DataTable, Dialog, ErrorState, Field, FormError, Input, PageHeader, StatusBadge, useToast } from "@/components/ui";

const LIMIT = 20;

type Action = { kind: "block" | "unblock" | "remove" | "promote" | "demote" | "password"; admin: Me };

/** Super admin only. Middleware redirects everyone else, and the API returns 403 regardless. */
export default function AdminsPage() {
  const { me } = useMe();
  const toast = useToast();
  const [page, setPage] = useState(1);
  const [adding, setAdding] = useState(false);
  const [action, setAction] = useState<Action>();
  const [busy, setBusy] = useState(false);
  const list = useApi(() => apiList<Me>("/admin/admins", { query: { page, limit: LIMIT } }), [page]);

  async function run() {
    if (!action) return;
    const { kind, admin } = action;
    setBusy(true);
    try {
      if (kind === "remove") await apiFetch(`/admin/admins/${admin.id}`, { method: "DELETE" });
      else {
        const body = kind === "block" ? { status: "blocked" } : kind === "unblock" ? { status: "active" } : { superadmin: kind === "promote" };
        await apiFetch(`/admin/admins/${admin.id}`, { method: "PATCH", body });
      }
      toast(`Done: ${admin.name}.`);
      setAction(undefined);
      list.refetch();
    } catch (e) {
      toast(e instanceof ApiError ? e.message : "Could not update this admin.", "error");
    } finally {
      setBusy(false);
    }
  }

  const columns = useMemo<ColumnDef<Me>[]>(() => [
    { accessorKey: "name", header: "Name", cell: (c) => <span className="font-medium">{c.getValue<string>()}</span> },
    { accessorKey: "email", header: "Email" },
    { accessorKey: "mobile", header: "Mobile" },
    {
      id: "role", header: "Role", accessorFn: (a) => (a.roles.includes("superadmin") ? "superadmin" : "admin"),
      cell: (c) => <StatusBadge domain="role" status={c.getValue<string>()} />,
    },
    { accessorKey: "status", header: "Status", cell: (c) => <StatusBadge domain="account" status={c.getValue<string>()} /> },
    { accessorKey: "lastLoginAt", header: "Last login", cell: (c) => <span className="whitespace-nowrap">{c.getValue<string>() ? formatDate(c.getValue<string>()) : "Never"}</span> },
    {
      id: "actions", header: "", enableSorting: false,
      cell: ({ row }) => {
        const a = row.original;
        if (a.id === me?.id) return <span className="text-xs text-ink-400">You</span>;
        const isSuper = a.roles.includes("superadmin");
        const blocked = a.status === "blocked";
        return (
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => setAction({ kind: "password", admin: a })}>Reset password</Button>
            <Button size="sm" variant="outline" onClick={() => setAction({ kind: isSuper ? "demote" : "promote", admin: a })}>{isSuper ? "Make admin" : "Make super admin"}</Button>
            <Button size="sm" variant="outline" onClick={() => setAction({ kind: blocked ? "unblock" : "block", admin: a })}>{blocked ? "Unblock" : "Block"}</Button>
            <Button size="sm" variant="danger" onClick={() => setAction({ kind: "remove", admin: a })}>Remove</Button>
          </div>
        );
      },
    },
  ], [me?.id]);

  const copy: Record<Exclude<Action["kind"], "password">, { title: string; text: string; label: string; danger: boolean }> = {
    block: { title: "Block this admin?", text: "They lose access on their next request.", label: "Block", danger: true },
    unblock: { title: "Unblock this admin?", text: "They can log in again.", label: "Unblock", danger: false },
    remove: { title: "Remove this admin?", text: "The account is deleted. Their notes and records stay. This cannot be undone.", label: "Remove", danger: true },
    promote: { title: "Make super admin?", text: "They will be able to add, block and remove other admins.", label: "Make super admin", danger: false },
    demote: { title: "Remove super admin rights?", text: "They stay an admin but can no longer manage other admins.", label: "Make admin", danger: true },
  };
  const c = action && action.kind !== "password" ? copy[action.kind] : undefined;

  return (
    <>
      <PageHeader title="Admins" description="Who can log in to the admin panel." actions={<Button onClick={() => setAdding(true)}><Plus className="size-4" />Add admin</Button>} />
      {list.error ? (
        <ErrorState message={list.error.message} onRetry={list.refetch} />
      ) : (
        <DataTable columns={columns} data={list.data?.data ?? []} loading={list.loading} paging={{ page, limit: LIMIT, total: list.data?.total ?? 0, onPage: setPage }} />
      )}

      <AddAdminDialog open={adding} onClose={() => setAdding(false)} onSaved={() => { setAdding(false); list.refetch(); }} />
      {action?.kind === "password" && <PasswordDialog admin={action.admin} onClose={() => setAction(undefined)} />}
      <ConfirmDialog open={!!c} onClose={() => setAction(undefined)} onConfirm={run} busy={busy} tone={c?.danger ? "danger" : "primary"} confirmLabel={c?.label} title={c?.title ?? ""}>
        <strong>{action?.admin.name}</strong>. {c?.text}
      </ConfirmDialog>
    </>
  );
}

function AddAdminDialog({ open, onClose, onSaved }: { open: boolean; onClose: () => void; onSaved: () => void }) {
  const toast = useToast();
  const [error, setError] = useState<string>();
  const { register, handleSubmit, reset, setError: setFieldError, formState: { errors, isSubmitting } } = useForm<AdminCreateInput, unknown, AdminCreateValues>({
    resolver: zodResolver(adminCreateSchema) as unknown as Resolver<AdminCreateInput, unknown, AdminCreateValues>,
  });

  async function onSubmit(v: AdminCreateValues) {
    setError(undefined);
    try {
      await apiFetch("/admin/admins", { body: v });
      toast("Admin added. They were emailed a login link.");
      reset();
      onSaved();
    } catch (e) {
      setError(applyApiError(e, setFieldError));
    }
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Add admin"
      footer={<><Button variant="outline" onClick={onClose}>Cancel</Button><Button type="submit" form="admin-form" disabled={isSubmitting}>{isSubmitting ? "Saving…" : "Add admin"}</Button></>}
    >
      <form id="admin-form" onSubmit={handleSubmit(onSubmit)} className="grid gap-4 sm:grid-cols-2" noValidate>
        <Field label="Full name" required error={errors.name?.message} className="sm:col-span-2"><Input {...register("name")} /></Field>
        <Field label="Email" required error={errors.email?.message}><Input type="email" {...register("email")} /></Field>
        <Field label="Mobile number" required error={errors.mobile?.message}><Input type="tel" inputMode="numeric" {...register("mobile")} /></Field>
        <Field label="Temporary password" required hint="At least 8 characters. Share it privately; it is not emailed." error={errors.password?.message} className="sm:col-span-2"><Input type="password" autoComplete="new-password" {...register("password")} /></Field>
        <div className="sm:col-span-2"><Checkbox label="Make this person a super admin (can manage other admins)" {...register("superadmin")} /></div>
        <div className="sm:col-span-2"><FormError>{error}</FormError></div>
      </form>
    </Dialog>
  );
}

function PasswordDialog({ admin, onClose }: { admin: Me; onClose: () => void }) {
  const toast = useToast();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string>();
  const [busy, setBusy] = useState(false);

  async function save() {
    setError(undefined);
    setBusy(true);
    try {
      await apiFetch(`/admin/admins/${admin.id}`, { method: "PATCH", body: { password } });
      toast("Password reset. Share it with them privately.");
      onClose();
    } catch (e) {
      setError(e instanceof ApiError ? e.fields.password ?? e.message : "Could not reset the password.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog open onClose={onClose} title={`Reset password for ${admin.name}`} footer={<><Button variant="outline" onClick={onClose}>Cancel</Button><Button onClick={save} disabled={busy}>{busy ? "Saving…" : "Reset password"}</Button></>}>
      <Field label="New password" required hint="At least 8 characters." error={error}>
        <Input type="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} />
      </Field>
    </Dialog>
  );
}
