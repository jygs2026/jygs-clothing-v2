"use client";

import { ImageUp, Loader2, RefreshCw, Trash2 } from "lucide-react";
import { useId, useRef, useState } from "react";

import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

/**
 * A photograph, chosen by dropping a file on it or picking one — never by
 * pasting a URL. Asking somebody to find a product shot, upload it somewhere
 * else, copy the address and paste it in is three steps and a second service
 * to do one thing.
 *
 * There is no server behind this, so the file is read, shrunk and kept in the
 * page as a data URL. That is also why it is shrunk rather than kept whole: a
 * photograph straight off a phone is four megabytes and 4000px wide, which as
 * base64 is over five megabytes of string held in memory to draw a
 * fifty-pixel thumbnail.
 */

/** Longest edge kept. Enough for the product page, far below a phone's raw output. */
const MAX_EDGE = 1024;
/** Refused before decoding — a 50MB file should not be read at all. */
const MAX_BYTES = 15 * 1024 * 1024;
const QUALITY = 0.82;

/**
 * Draws the file onto a canvas no larger than `MAX_EDGE` and returns it as a
 * JPEG data URL. Encoded onto white rather than kept transparent: a PNG cut
 * out against nothing becomes black once it is JPEG, and every surface this
 * lands on in the studio is a pale card.
 */
async function shrink(file: File): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("no canvas");
  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, width, height);
  context.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  return canvas.toDataURL("image/jpeg", QUALITY);
}

function readableSize(dataUrl: string) {
  // base64 carries three bytes in every four characters.
  const bytes = Math.round((dataUrl.length - dataUrl.indexOf(",") - 1) * 0.75);
  return bytes > 900_000
    ? `${(bytes / 1_048_576).toFixed(1)} MB`
    : `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

export function ImageDrop({
  value,
  onChange,
  label,
  hint,
  alt,
}: {
  /** A data URL from a dropped file, or an address a seeded product came with. */
  value: string;
  onChange: (next: string) => void;
  label: string;
  hint?: string;
  alt: string;
}) {
  const id = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [over, setOver] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function take(file: File | undefined) {
    if (!file) return;
    setError(null);

    if (!file.type.startsWith("image/")) {
      setError("That is not an image. JPEG, PNG, WebP or HEIC.");
      return;
    }
    if (file.size > MAX_BYTES) {
      setError(`That file is ${(file.size / 1_048_576).toFixed(1)} MB. Keep it under 15 MB.`);
      return;
    }

    setBusy(true);
    try {
      onChange(await shrink(file));
    } catch {
      // Safari cannot decode every HEIC it will happily hand over.
      setError("That image could not be read. Try exporting it as a JPEG.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <Label htmlFor={id} className="mb-1.5 text-xs text-foreground/70">
        {label}
      </Label>

      <div
        onDragOver={(event) => {
          event.preventDefault();
          setOver(true);
        }}
        onDragLeave={() => setOver(false)}
        onDrop={(event) => {
          event.preventDefault();
          setOver(false);
          void take(event.dataTransfer.files?.[0]);
        }}
        className={cn(
          "flex items-center gap-3 rounded-lg border border-dashed border-border p-3 transition-colors duration-(--admin-fast) ease-admin",
          over && "border-accent bg-accent/8",
          error && "border-destructive/60"
        )}
      >
        {value ? (
          <>
            {/*
             * A background image rather than <img>: the same treatment the
             * thumbnails in the table use, so what is previewed here is
             * exactly what the list will show.
             */}
            <span
              role="img"
              aria-label={alt}
              className="size-16 shrink-0 rounded-md border border-border bg-muted bg-cover bg-center"
              style={{ backgroundImage: `url("${value}")` }}
            />
            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-medium">
                {value.startsWith("data:") ? "Photograph added" : "Existing photograph"}
              </p>
              <p className="mt-0.5 truncate text-[12px] text-foreground/50">
                {value.startsWith("data:")
                  ? `Scaled to ${MAX_EDGE}px · ${readableSize(value)}`
                  : "Came with the piece"}
              </p>
              <div className="mt-1.5 flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => inputRef.current?.click()}
                  className="flex h-8 items-center gap-1.5 rounded-md px-2 text-[12.5px] text-accent-2 transition-colors duration-(--admin-fast) hover:bg-muted"
                >
                  <RefreshCw className="size-3.5" strokeWidth={1.8} />
                  Replace
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onChange("");
                    setError(null);
                  }}
                  className="flex h-8 items-center gap-1.5 rounded-md px-2 text-[12.5px] text-foreground/60 transition-colors duration-(--admin-fast) hover:bg-muted hover:text-destructive"
                >
                  <Trash2 className="size-3.5" strokeWidth={1.8} />
                  Remove
                </button>
              </div>
            </div>
          </>
        ) : (
          /*
           * The label is the whole target — a 40px button inside a drop zone
           * leaves most of the zone looking clickable and doing nothing. The
           * input stays in the DOM and focusable (`sr-only`, not hidden) so
           * the field can still be reached and opened from the keyboard.
           */
          <label
            htmlFor={id}
            className="flex min-h-20 flex-1 cursor-pointer flex-col items-center justify-center gap-1 rounded-md py-2 text-center"
          >
            {busy ? (
              <Loader2 className="size-5 animate-spin text-foreground/40" strokeWidth={1.7} />
            ) : (
              <ImageUp className="size-5 text-foreground/35" strokeWidth={1.6} />
            )}
            <span className="text-[13px] font-medium text-foreground/75">
              {busy ? "Reading the file…" : "Drop a photograph here"}
            </span>
            <span className="text-[12px] text-foreground/50">
              or <span className="text-accent-2 underline underline-offset-2">choose a file</span>
            </span>
          </label>
        )}

        <input
          ref={inputRef}
          id={id}
          type="file"
          accept="image/*"
          className="sr-only"
          onChange={(event) => {
            void take(event.target.files?.[0]);
            // Cleared so choosing the same file twice still fires a change.
            event.target.value = "";
          }}
        />
      </div>

      {error ? (
        <p role="alert" className="mt-1.5 text-[12.5px] leading-[18px] text-destructive">
          {error}
        </p>
      ) : null}
      {hint && !error ? (
        <p className="mt-1.5 text-[12px] leading-[18px] text-foreground/50">{hint}</p>
      ) : null}
    </div>
  );
}
