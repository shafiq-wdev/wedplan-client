"use client";

import { useState } from "react";
import Image from "next/image";
import { Images, Sparkles } from "lucide-react";

import CategoryIcon from "@/components/services/CategoryIcon";

export default function ServiceGallery({ images = [], title, category }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const gallery = images.length > 0 ? images : [];
  const activeImage = gallery[activeIndex] || "";

  return (
    <div className="relative min-h-[320px] overflow-hidden bg-gradient-to-br from-rose-200 via-pink-200 to-amber-100 lg:min-h-[520px]">
      {activeImage ? (
        <Image
          key={activeImage}
          src={activeImage}
          alt={`${title} — photo ${activeIndex + 1}`}
          fill
          preload
          unoptimized
          sizes="(max-width: 1024px) 100vw, 50vw"
          className="animate-fade-in object-cover"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-rose-400">
          <Sparkles className="h-14 w-14" />
        </div>
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent lg:hidden" />

      <span className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-full bg-white/95 px-3.5 py-1.5 text-xs font-semibold text-rose-600 shadow-sm backdrop-blur">
        <CategoryIcon category={category} className="h-3.5 w-3.5" />
        {category}
      </span>

      {gallery.length > 1 && (
        <>
          <span className="absolute right-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-black/45 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur">
            <Images className="h-3.5 w-3.5" />
            {activeIndex + 1} / {gallery.length}
          </span>

          <div className="absolute inset-x-4 bottom-4 flex gap-2 overflow-x-auto pb-1">
            {gallery.map((image, index) => (
              <button
                key={`${image}-${index}`}
                type="button"
                onClick={() => setActiveIndex(index)}
                aria-label={`View photo ${index + 1} of ${title}`}
                aria-pressed={index === activeIndex}
                className={`relative h-14 w-20 shrink-0 overflow-hidden rounded-xl border-2 transition ${
                  index === activeIndex
                    ? "border-white shadow-lg"
                    : "border-white/40 opacity-75 hover:opacity-100"
                }`}
              >
                <Image
                  src={image}
                  alt=""
                  fill
                  unoptimized
                  sizes="80px"
                  className="object-cover"
                />
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
