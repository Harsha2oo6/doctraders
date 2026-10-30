"use client";

import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/cn";
import { categoryIcon } from "@/components/category-icon";

/** DESIGN.md 6.11 gallery: main photo (object-contain) + thumbnails. Falls back to the category icon. */
export function Gallery({ images, title, category }: { images: string[]; title: string; category: string }) {
  const [active, setActive] = useState(0);
  const Icon = categoryIcon(category);
  const current = images[active];

  return (
    <div>
      <div className="relative grid aspect-[4/3] place-items-center overflow-hidden rounded-lg border border-ink-100 bg-white">
        {current ? (
          <Image src={current} alt={title} fill priority sizes="(min-width: 1024px) 55vw, 100vw" className="object-contain" />
        ) : (
          <div className="grid h-full w-full place-items-center bg-linear-to-br from-ink-50 to-ink-100">
            <Icon className="size-20 text-ink-300" strokeWidth={1.2} />
          </div>
        )}
      </div>
      {images.length > 1 && (
        <div className="mt-3 flex gap-2 overflow-x-auto">
          {images.map((src, i) => (
            <button
              key={src}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`Photo ${i + 1}`}
              className={cn("relative size-16 shrink-0 cursor-pointer overflow-hidden rounded-md border-2", i === active ? "border-brand-500" : "border-ink-100")}
            >
              <Image src={src} alt="" fill sizes="64px" className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
