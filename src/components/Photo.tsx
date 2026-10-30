import type { CSSProperties } from "react";
import { PHOTOS, type Photo, type PhotoKey } from "../photos";
import { useSiteContent, type SiteContentState } from "../useSiteContent";

/**
 * Images on the site, and their credits.
 *
 * Each picture has a slot key. The admin panel's Page images section can put
 * any image in a slot; an empty slot shows the built-in image. Creative Commons
 * licences require the author and licence wherever a photo appears, so the
 * credit travels with the image: a built-in photo brings its own, and an
 * admin's image shows the credit typed in for it, if any.
 */

export type ShownImage = {
  src: string;
  alt: string;
  /** A built-in photograph's licence credit. */
  photo: Photo | null;
  /** Free-text credit an admin gave their own image. */
  creditText: string;
};

type Fallback = PhotoKey | { src: string; alt: string };

const BY_SRC = new Map<string, Photo>(Object.values(PHOTOS).map((photo) => [photo.src, photo]));

/** The image at an address, with its credit when it is one of the built-in photos. */
export function imageAt(src: string, alt = ""): ShownImage {
  const photo = BY_SRC.get(src) ?? null;
  return { src, alt: photo?.alt ?? alt, photo, creditText: "" };
}

/** Resolve a slot without a hook, for use inside loops. */
export function resolveSlot(content: SiteContentState, slot: string, fallback: Fallback): ShownImage {
  const builtIn = typeof fallback === "string" ? PHOTOS[fallback] : fallback;
  const chosen = content.pageImage(slot);
  if (!chosen) {
    return imageAt(builtIn.src, builtIn.alt);
  }
  const shown = imageAt(chosen.imageUrl, builtIn.alt);
  return { ...shown, creditText: shown.photo ? "" : chosen.credit };
}

export function useImageSlot(slot: string, fallback: Fallback): ShownImage {
  return resolveSlot(useSiteContent(), slot, fallback);
}

export function ImageCredit({ image, className = "" }: { image: ShownImage; className?: string }) {
  const classes = `photo-credit ${className}`.trim();
  if (image.photo) {
    const item = image.photo;
    return (
      <small className={classes}>
        Photo:{" "}
        <a href={item.source} target="_blank" rel="noreferrer noopener">
          {item.author}
        </a>
        ,{" "}
        {item.licenseUrl ? (
          <a href={item.licenseUrl} target="_blank" rel="noreferrer noopener">
            {item.license}
          </a>
        ) : (
          item.license
        )}
      </small>
    );
  }
  return image.creditText ? <small className={classes}>{image.creditText}</small> : null;
}

/** Props that turn a page's banner into a photo banner: merge onto the header. */
export function bannerProps(image: ShownImage): { className: string; style: CSSProperties } {
  return {
    className: "with-photo",
    style: { "--photo": `url("${image.src}")` } as CSSProperties
  };
}

/** A captioned image. */
export function PhotoFigure({ image, className = "" }: { image: ShownImage; className?: string }) {
  return (
    <figure className={`photo-figure ${className}`.trim()}>
      <img src={image.src} alt={image.alt} loading="lazy" />
      <figcaption>
        <ImageCredit image={image} />
      </figcaption>
    </figure>
  );
}
