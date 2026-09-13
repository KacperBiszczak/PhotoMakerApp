import { formatAdded, type Photo } from "@/lib/wedding-store";

type Props = {
  photos: Photo[];
  onSelect: (index: number) => void;
};

export function PhotoMasonry({ photos, onSelect }: Props) {
  return (
    <div className="columns-2 gap-3 sm:columns-3 sm:gap-4 lg:columns-4">
      {photos.map((photo, i) => (
        <button
          key={photo.id}
          onClick={() => onSelect(i)}
          className="group mb-3 block w-full break-inside-avoid overflow-hidden rounded-xl bg-secondary text-left sm:mb-4"
        >
          <div className="relative">
            <img
              src={photo.src}
              alt={photo.author ?? "Zdjęcie z wesela"}
              loading="lazy"
              className="w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
            />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 bg-gradient-to-t from-ink/60 to-transparent px-3 pb-2.5 pt-10 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
              <span className="min-w-0 truncate text-sm text-background">
                {photo.author ?? "Gość"}
              </span>
              <span className="shrink-0 text-[11px] text-background/70">
                {formatAdded(photo.createdAt)}
              </span>
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}
