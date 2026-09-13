import { useCallback, useEffect } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

import { formatAdded, type Photo } from "@/lib/wedding-store";

type Props = {
  photos: Photo[];
  index: number | null;
  onClose: () => void;
  onIndexChange: (index: number) => void;
};

export function Lightbox({ photos, index, onClose, onIndexChange }: Props) {
  const open = index !== null && index >= 0 && index < photos.length;

  const go = useCallback(
    (dir: number) => {
      if (index === null) return;
      const next = (index + dir + photos.length) % photos.length;
      onIndexChange(next);
    },
    [index, photos.length, onIndexChange],
  );

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose, go]);

  if (!open || index === null) return null;
  const photo = photos[index];
  const author = photo.author ?? "Gość wesela";

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col bg-ink/95 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
    >
      <div className="flex items-center justify-between px-5 py-4">
        <span className="label-xs text-background/60">
          {index + 1} / {photos.length}
        </span>
        <button
          onClick={onClose}
          aria-label="Zamknij"
          className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-background/10 text-background transition-colors hover:bg-background/20"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="relative flex min-h-0 flex-1 items-center justify-center px-3 pb-2">
        <button
          onClick={() => go(-1)}
          aria-label="Poprzednie"
          className="absolute left-2 z-10 grid h-12 w-12 place-items-center rounded-full bg-background/10 text-background transition-colors hover:bg-background/25 sm:left-6"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
        <img
          key={photo.id}
          src={photo.src}
          alt={author}
          className="fade-up max-h-full max-w-full rounded-xl object-contain"
        />
        <button
          onClick={() => go(1)}
          aria-label="Następne"
          className="absolute right-2 z-10 grid h-12 w-12 place-items-center rounded-full bg-background/10 text-background transition-colors hover:bg-background/25 sm:right-6"
        >
          <ChevronRight className="h-6 w-6" />
        </button>
      </div>

      <div className="px-6 pb-8 pt-3 text-center">
        <p className="font-serif text-xl text-background">{author}</p>
        <p className="mt-1 text-sm text-background/55">{formatAdded(photo.createdAt)}</p>
      </div>
    </div>
  );
}
