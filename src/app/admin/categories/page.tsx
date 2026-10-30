"use client";

import { ArrowDown, ArrowUp, Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { ApiError, apiFetch, useApi } from "@/lib/api-client";
import { Badge, Button, Card, CardBody, ConfirmDialog, Dialog, ErrorState, Field, FormError, Input, PageHeader, Spinner, useToast } from "@/components/ui";

/** Shape of GET /api/v1/admin/categories. */
type Category = { id: string; name: string; slug: string; order: number; active: boolean; examples: string | null; listingCount: number };

export default function AdminCategoriesPage() {
  const toast = useToast();
  const q = useApi(() => apiFetch<Category[]>("/admin/categories"));
  const [name, setName] = useState("");
  const [addError, setAddError] = useState<string>();
  const [busy, setBusy] = useState(false);
  const [renaming, setRenaming] = useState<Category>();
  const [newName, setNewName] = useState("");
  const [renameError, setRenameError] = useState<string>();
  const [toDelete, setToDelete] = useState<Category>();

  const message = (e: unknown, fallback: string) => (e instanceof ApiError ? e.message : fallback);

  async function add() {
    setAddError(undefined);
    setBusy(true);
    try {
      await apiFetch("/admin/categories", { body: { name } });
      toast("Category added.");
      setName("");
      q.refetch();
    } catch (e) {
      setAddError(message(e, "Could not add the category."));
    } finally {
      setBusy(false);
    }
  }

  async function update(c: Category, body: Partial<Pick<Category, "name" | "active" | "order">>, done?: string) {
    setBusy(true);
    try {
      await apiFetch(`/admin/categories/${c.id}`, { method: "PATCH", body });
      if (done) toast(done);
      q.refetch();
      return true;
    } catch (e) {
      toast(message(e, "Could not update the category."), "error");
      return false;
    } finally {
      setBusy(false);
    }
  }

  async function rename() {
    if (!renaming) return;
    setRenameError(undefined);
    setBusy(true);
    try {
      await apiFetch(`/admin/categories/${renaming.id}`, { method: "PATCH", body: { name: newName } });
      toast("Category renamed.");
      setRenaming(undefined);
      q.refetch();
    } catch (e) {
      setRenameError(message(e, "Could not rename the category."));
    } finally {
      setBusy(false);
    }
  }

  /** Swaps display order with the neighbour. The list is re-numbered so equal order values can't get stuck. */
  async function move(index: number, dir: -1 | 1) {
    const rows = q.data ?? [];
    const j = index + dir;
    if (j < 0 || j >= rows.length) return;
    setBusy(true);
    try {
      const next = [...rows];
      [next[index], next[j]] = [next[j]!, next[index]!];
      await Promise.all(next.map((c, i) => (c.order === i ? null : apiFetch(`/admin/categories/${c.id}`, { method: "PATCH", body: { order: i } }))));
      q.refetch();
    } catch (e) {
      toast(message(e, "Could not move the category."), "error");
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    if (!toDelete) return;
    setBusy(true);
    try {
      const r = await apiFetch<{ deleted: boolean }>(`/admin/categories/${toDelete.id}`, { method: "DELETE" });
      toast(r.deleted ? "Category deleted." : "This category is in use, so it was deactivated instead.");
      setToDelete(undefined);
      q.refetch();
    } catch (e) {
      toast(message(e, "Could not delete the category."), "error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <PageHeader title="Categories" description="Shown across the site, in registration and in the listing form." />
      <Card className="mb-4">
        <CardBody className="space-y-2">
          <form className="flex gap-2" onSubmit={(e) => { e.preventDefault(); void add(); }}>
            <Input placeholder="New category name" aria-label="New category name" value={name} onChange={(e) => setName(e.target.value)} />
            <Button type="submit" disabled={busy || name.trim().length < 2}><Plus className="size-4" />Add</Button>
          </form>
          <FormError>{addError}</FormError>
        </CardBody>
      </Card>

      {q.loading && !q.data ? (
        <Spinner />
      ) : q.error || !q.data ? (
        <ErrorState message={q.error?.message} onRetry={q.refetch} />
      ) : (
        <Card>
          <CardBody className="divide-y divide-ink-100 p-0">
            {q.data.length === 0 && <p className="p-5 text-sm text-ink-500">No categories yet. Add the first one above.</p>}
            {q.data.map((c, i) => (
              <div key={c.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-3 text-sm">
                <span className="min-w-0">
                  <span className="flex items-center gap-2 font-medium text-ink-900">{c.name}{!c.active && <Badge tone="neutral">Inactive</Badge>}</span>
                  <span className="block text-ink-500">{c.listingCount} {c.listingCount === 1 ? "listing" : "listings"}{c.examples ? ` · ${c.examples}` : ""}</span>
                </span>
                <span className="flex flex-wrap items-center gap-1">
                  <Button size="sm" variant="ghost" aria-label={`Move ${c.name} up`} disabled={busy || i === 0} onClick={() => move(i, -1)}><ArrowUp className="size-4" /></Button>
                  <Button size="sm" variant="ghost" aria-label={`Move ${c.name} down`} disabled={busy || i === q.data!.length - 1} onClick={() => move(i, 1)}><ArrowDown className="size-4" /></Button>
                  <Button size="sm" variant="ghost" aria-label={`Rename ${c.name}`} disabled={busy} onClick={() => { setRenaming(c); setNewName(c.name); setRenameError(undefined); }}><Pencil className="size-4" /></Button>
                  <Button size="sm" variant="outline" disabled={busy} onClick={() => update(c, { active: !c.active }, c.active ? "Category hidden from forms and menus." : "Category is active again.")}>{c.active ? "Deactivate" : "Activate"}</Button>
                  <Button size="sm" variant="ghost" aria-label={`Delete ${c.name}`} disabled={busy} onClick={() => setToDelete(c)}><Trash2 className="size-4" /></Button>
                </span>
              </div>
            ))}
          </CardBody>
        </Card>
      )}

      <Dialog
        open={!!renaming}
        onClose={() => setRenaming(undefined)}
        title="Rename category"
        footer={<><Button variant="outline" onClick={() => setRenaming(undefined)}>Cancel</Button><Button onClick={rename} disabled={busy}>{busy ? "Saving…" : "Save"}</Button></>}
      >
        <Field label="Name" required hint="Existing listings stay in this category." error={renameError}>
          <Input value={newName} onChange={(e) => setNewName(e.target.value)} />
        </Field>
      </Dialog>

      <ConfirmDialog open={!!toDelete} onClose={() => setToDelete(undefined)} onConfirm={remove} busy={busy} confirmLabel="Delete" title={`Delete ${toDelete?.name}?`}>
        It is deleted only if no listing or business uses it. Otherwise it is deactivated, so it stops appearing in forms and menus.
      </ConfirmDialog>
    </>
  );
}
