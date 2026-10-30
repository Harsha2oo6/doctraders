"use client";

import { Plus } from "lucide-react";
import { useState } from "react";
import { CATEGORIES } from "@/lib/constants";
import { Button, Card, CardBody, Input, PageHeader } from "@/components/ui";

export default function CategoriesPage() {
  const [items, setItems] = useState<{ slug: string; name: string; examples: string }[]>([...CATEGORIES]);
  const [name, setName] = useState("");

  return (
    <>
      <PageHeader title="Categories" description="Product categories shown across the platform." />
      <Card className="mb-4">
        <CardBody className="flex gap-2">
          <Input placeholder="New category name" value={name} onChange={(e) => setName(e.target.value)} />
          <Button disabled={name.trim().length < 2} onClick={() => { setItems((i) => [...i, { slug: name.toLowerCase().replace(/\s+/g, "-"), name, examples: "" }]); setName(""); }}><Plus className="size-4" />Add</Button>
        </CardBody>
      </Card>
      <Card>
        <CardBody className="divide-y divide-ink-100 p-0">
          {items.map((c) => (
            <div key={c.slug} className="flex items-center justify-between px-5 py-3 text-sm">
              <span><span className="font-medium text-ink-900">{c.name}</span><span className="block text-ink-500">{c.examples || "No examples yet"}</span></span>
              <Button size="sm" variant="ghost" onClick={() => setItems((i) => i.filter((x) => x.slug !== c.slug))}>Remove</Button>
            </div>
          ))}
        </CardBody>
      </Card>
    </>
  );
}
