import { useSyncExternalStore } from "react";

import photo1 from "@/assets/photo-1.jpg";
import photo2 from "@/assets/photo-2.jpg";
import photo3 from "@/assets/photo-3.jpg";
import photo4 from "@/assets/photo-4.jpg";
import photo5 from "@/assets/photo-5.jpg";
import cover from "@/assets/cover.jpg";

export type PhotoStatus = "approved" | "pending";

export type Photo = {
  id: string;
  src: string;
  author?: string;
  createdAt: number;
  status: PhotoStatus;
};

export type Wedding = {
  id: string;
  nameOne: string;
  nameTwo: string;
  date: string;
  cover?: string;
  moderation: boolean;
};

export type AppState = {
  wedding: Wedding;
  photos: Photo[];
};

const STORAGE_KEY = "wedding-album-v1";

const hour = 3600_000;

function sampleState(): AppState {
  const now = Date.now();
  return {
    wedding: {
      id: "anna-michal-2026",
      nameOne: "Anna",
      nameTwo: "Michał",
      date: "2026-08-15",
      cover,
      moderation: false,
    },
    photos: [
      { id: "p1", src: photo1, author: "Kasia", createdAt: now - 1 * hour, status: "approved" },
      { id: "p2", src: photo4, author: "Tomek", createdAt: now - 2 * hour, status: "approved" },
      { id: "p3", src: photo3, createdAt: now - 3 * hour, status: "approved" },
      { id: "p4", src: photo5, author: "Ewa", createdAt: now - 5 * hour, status: "approved" },
      { id: "p5", src: photo2, author: "Paweł", createdAt: now - 6 * hour, status: "approved" },
      { id: "p6", src: photo3, author: "Marta", createdAt: now - 0.4 * hour, status: "pending" },
    ],
  };
}

let state: AppState = sampleState();
let hydrated = false;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

function persist() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* storage full or unavailable — app keeps working in memory */
  }
}

function hydrate() {
  if (hydrated || typeof window === "undefined") return;
  hydrated = true;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as AppState;
      if (parsed?.wedding && Array.isArray(parsed.photos)) {
        state = parsed;
        emit();
      }
    }
  } catch {
    /* ignore corrupted data and keep the sample album */
  }
}

function setState(next: AppState) {
  state = next;
  persist();
  emit();
}

function subscribe(listener: () => void) {
  hydrate();
  listeners.add(listener);
  return () => listeners.delete(listener);
}

const getSnapshot = () => state;

export function useAppState(): AppState {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

export function useWedding(): Wedding {
  return useAppState().wedding;
}

export function useVisiblePhotos(): Photo[] {
  return useAppState()
    .photos.filter((p) => p.status === "approved")
    .sort((a, b) => b.createdAt - a.createdAt);
}

export function useAllPhotos(): Photo[] {
  return [...useAppState().photos].sort((a, b) => b.createdAt - a.createdAt);
}

export function addPhoto(src: string, author?: string): Photo {
  const photo: Photo = {
    id: `p-${Date.now()}-${Math.round(Math.random() * 1e4)}`,
    src,
    author: author?.trim() ? author.trim() : undefined,
    createdAt: Date.now(),
    status: state.wedding.moderation ? "pending" : "approved",
  };
  setState({ ...state, photos: [photo, ...state.photos] });
  return photo;
}

export function approvePhoto(id: string) {
  setState({
    ...state,
    photos: state.photos.map((p) => (p.id === id ? { ...p, status: "approved" } : p)),
  });
}

export function removePhoto(id: string) {
  setState({ ...state, photos: state.photos.filter((p) => p.id !== id) });
}

export function setModeration(moderation: boolean) {
  setState({ ...state, wedding: { ...state.wedding, moderation } });
}

export function createWedding(input: {
  nameOne: string;
  nameTwo: string;
  date: string;
  cover?: string;
}) {
  const slug = `${input.nameOne}-${input.nameTwo}`
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  setState({
    wedding: {
      id: `${slug || "wesele"}-${Math.random().toString(36).slice(2, 6)}`,
      nameOne: input.nameOne,
      nameTwo: input.nameTwo,
      date: input.date,
      cover: input.cover,
      moderation: false,
    },
    photos: [],
  });
}

export function resetToSample() {
  setState(sampleState());
}

/* ---------- draft photo (between capture/upload and confirmation) ---------- */

const DRAFT_KEY = "wedding-album-draft";
let draft: string | null = null;

export function setDraftPhoto(dataUrl: string) {
  draft = dataUrl;
  try {
    window.sessionStorage.setItem(DRAFT_KEY, dataUrl);
  } catch {
    /* keep in memory only */
  }
}

export function getDraftPhoto(): string | null {
  if (draft) return draft;
  if (typeof window === "undefined") return null;
  try {
    draft = window.sessionStorage.getItem(DRAFT_KEY);
  } catch {
    draft = null;
  }
  return draft;
}

export function clearDraftPhoto() {
  draft = null;
  try {
    window.sessionStorage.removeItem(DRAFT_KEY);
  } catch {
    /* noop */
  }
}

/* ---------- formatting helpers ---------- */

export function formatWeddingDate(iso: string): string {
  const d = new Date(`${iso}T12:00:00`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("pl-PL", { day: "numeric", month: "long", year: "numeric" });
}

export function formatShortDate(iso: string): string {
  const d = new Date(`${iso}T12:00:00`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("pl-PL");
}

export function formatAdded(ts: number): string {
  return new Date(ts).toLocaleString("pl-PL", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}
