"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";

const STORAGE_IMAGE_PREFIX = "storage://entry-images/";
const SIGNED_URL_LIFETIME_SECONDS = 60 * 60;
const SIGNED_URL_REFRESH_MS = 50 * 60 * 1000;

export function useImageUrls(images: string[]) {
  const supabase = useMemo(() => createClient(), []);
  const [signedUrls, setSignedUrls] = useState<Record<string, string>>({});
  const serializedImages = JSON.stringify(images);

  useEffect(() => {
    let cancelled = false;
    let refreshTimer: ReturnType<typeof setTimeout> | undefined;
    const imageList = JSON.parse(serializedImages) as string[];

    async function resolveStorageImages() {
      const results = await Promise.all(
        imageList.map(async (image) => {
          if (!image.startsWith(STORAGE_IMAGE_PREFIX)) return null;
          const path = image.slice(STORAGE_IMAGE_PREFIX.length);
          try {
            const { data, error } = await supabase.storage
              .from("entry-images")
              .createSignedUrl(path, SIGNED_URL_LIFETIME_SECONDS);

            if (error) {
              console.error("Could not create a signed entry image URL:", error.message);
              return null;
            }

            return [image, data.signedUrl] as const;
          } catch (error) {
            console.error("Could not create a signed entry image URL:", error);
            return null;
          }
        })
      );

      if (!cancelled) {
        setSignedUrls(Object.fromEntries(results.filter((result) => result !== null)));
        if (imageList.some((image) => image.startsWith(STORAGE_IMAGE_PREFIX))) {
          refreshTimer = setTimeout(() => {
            void resolveStorageImages();
          }, SIGNED_URL_REFRESH_MS);
        }
      }
    }

    void resolveStorageImages();
    return () => {
      cancelled = true;
      if (refreshTimer) clearTimeout(refreshTimer);
    };
  }, [serializedImages, supabase]);

  return images.map((image) =>
    image.startsWith(STORAGE_IMAGE_PREFIX) ? signedUrls[image] ?? "" : image
  );
}
