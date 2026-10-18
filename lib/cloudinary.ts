import { cloudinaryEnv } from "./env-server";

export async function uploadToCloudinary(
  file: File,
  folder = "berita",
): Promise<{ secure_url: string; public_id: string }> {
  const cloudName = cloudinaryEnv.cloudName;
  const uploadPreset = cloudinaryEnv.uploadPreset;
  if (!cloudName || !uploadPreset) {
    throw new Error("Cloudinary belum dikonfigurasi. Isi NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME dan NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET.");
  }
  const form = new FormData();
  form.append("file", file);
  form.append("upload_preset", uploadPreset);
  form.append("folder", folder);
  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: "POST",
    body: form,
  });
  const json = (await res.json().catch(() => null)) as {
    secure_url?: string;
    public_id?: string;
    error?: { message?: string } | string;
  } | null;
  if (!res.ok) {
    const msg =
      typeof json?.error === "string"
        ? json.error
        : json?.error?.message ?? "Upload ke Cloudinary gagal.";
    throw new Error(msg);
  }
  if (!json?.secure_url) throw new Error("Upload ke Cloudinary gagal: secure_url kosong.");
  return { secure_url: json.secure_url, public_id: json.public_id ?? "" };
}

/**
 * Membersihkan URL Cloudinary dari parameter transformasi (seperti c_fill, w_..., h_..., g_auto)
 * untuk memastikan URL selalu mengarah ke file gambar asli (original aspect ratio & resolution).
 */
export function cleanCloudinaryUrl(url: string): string {
  if (!url || typeof url !== "string") return url;
  if (!url.includes("res.cloudinary.com") || !url.includes("/image/upload/")) {
    return url;
  }
  return url.replace(
    /(res\.cloudinary\.com\/[^/]+\/image\/upload\/)(?:(?:c_[^/]+|w_[^/]+|h_[^/]+|g_[^/]+|q_[^/]+|f_[^/]+|b_[^/]+|ar_[^/]+)\/)+/g,
    "$1"
  );
}

/**
 * Unggah gambar dari URL publik ke Cloudinary (misal untuk sinkronisasi webhook/CMS).
 * Menerapkan fallback buffer download jika Cloudinary scraper dibatasi oleh host sumber.
 * CATATAN PENTING: File diunggah utuh apa adanya (original resolution & aspect ratio)
 * tanpa parameter transformation, crop: 'fill', width, height, atau gravity.
 */
export async function uploadUrlToCloudinary(
  imageUrl: string,
  folder = "smasa/berita",
): Promise<{ secure_url: string; public_id: string }> {
  const cloudName = cloudinaryEnv.cloudName;
  const uploadPreset = cloudinaryEnv.uploadPreset;
  if (!cloudName || !uploadPreset) {
    throw new Error(
      "Cloudinary belum dikonfigurasi. Isi NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME dan NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET."
    );
  }

  // 1. Coba upload langsung via string URL ke endpoint upload Cloudinary
  // Tanpa parameter transformasi atau pemotongan (crop) apa pun
  try {
    const form = new FormData();
    form.append("file", imageUrl);
    form.append("upload_preset", uploadPreset);
    form.append("folder", folder);

    const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: "POST",
      body: form,
    });
    const json = (await res.json().catch(() => null)) as {
      secure_url?: string;
      public_id?: string;
      error?: { message?: string } | string;
    } | null;

    if (res.ok && json?.secure_url) {
      return {
        secure_url: cleanCloudinaryUrl(json.secure_url),
        public_id: json.public_id ?? "",
      };
    }
  } catch {
    // Lanjut ke fallback fetch buffer jika remote fetch Cloudinary gagal/diblokir
  }

  // 2. Fallback: Unduh gambar terlebih dahulu lalu upload sebagai Blob
  // Gambar diunggah utuh dengan rasio asli tanpa crop / transformation
  const imgRes = await fetch(imageUrl, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      Accept: "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
    },
    signal: AbortSignal.timeout(15000),
  });

  if (!imgRes.ok) {
    throw new Error(`Gagal mengunduh gambar sumber (HTTP ${imgRes.status}).`);
  }

  const contentType = imgRes.headers.get("content-type") || "image/jpeg";
  const arrayBuffer = await imgRes.arrayBuffer();
  const blob = new Blob([arrayBuffer], { type: contentType });

  const form = new FormData();
  form.append("file", blob, "image.jpg");
  form.append("upload_preset", uploadPreset);
  form.append("folder", folder);

  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: "POST",
    body: form,
  });

  const json = (await res.json().catch(() => null)) as {
    secure_url?: string;
    public_id?: string;
    error?: { message?: string } | string;
  } | null;

  if (!res.ok) {
    const msg =
      typeof json?.error === "string"
        ? json.error
        : json?.error?.message ?? "Upload ke Cloudinary gagal.";
    throw new Error(msg);
  }

  if (!json?.secure_url) {
    throw new Error("Upload ke Cloudinary gagal: secure_url kosong.");
  }

  return {
    secure_url: cleanCloudinaryUrl(json.secure_url),
    public_id: json.public_id ?? "",
  };
}

export const uploadFromUrl = uploadUrlToCloudinary;
export const uploadImageFromUrl = uploadUrlToCloudinary;

/**
 * Cek apakah URL merupakan tautan postingan Instagram (post, reel, atau tv).
 */
export function isInstagramPostUrl(url: string): boolean {
  if (!url || typeof url !== "string") return false;
  return /https?:\/\/(?:www\.)?instagram\.com\/(?:p|reel|tv)\/[a-zA-Z0-9_-]+/i.test(url.trim());
}

/**
 * Decode entitas HTML umum dalam URL yang diekstrak dari meta tag.
 */
function decodeHtmlEntities(str: string): string {
  return str
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

/**
 * Ekstraksi URL thumbnail asli (og:image) dari postingan Instagram dengan strategi multi-fallback:
 * 1. Scraping HTML dengan User-Agent bergantian (Slackbot, facebookexternalhit, Twitterbot, WhatsApp).
 * 2. Fallback ke endpoint resmi Instagram oEmbed jika scraping HTML gagal atau terblokir.
 * 3. Timeout handling per attempt dan pesan error komprehensif jika seluruh fallback gagal.
 */
export async function extractInstagramThumbnail(postUrl: string): Promise<string | null> {
  const cleanUrl = postUrl.trim().split("?")[0] || "";
  const normalizedUrl = cleanUrl.endsWith("/") ? cleanUrl : `${cleanUrl}/`;

  // Daftar User-Agent bergantian:
  // Slackbot diprioritaskan karena mengembalikan rasio asli (uncropped 4:5/landscape),
  // diikuti bot sosial resmi Facebook, Twitter, dan WhatsApp.
  const userAgents = [
    { name: "Slackbot", ua: "Slackbot-LinkExpanding 1.0 (+https://api.slack.com/robots)" },
    { name: "Facebookbot", ua: "facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)" },
    { name: "Twitterbot", ua: "Twitterbot/1.0" },
    { name: "WhatsApp", ua: "WhatsApp/2.21.12.21 A" },
  ];

  const attemptErrors: string[] = [];

  // Strategi 1: Scraping HTML dengan User-Agent bergantian
  for (const { name, ua } of userAgents) {
    try {
      const res = await fetch(normalizedUrl, {
        headers: {
          "User-Agent": ua,
          Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
          "Accept-Language": "en-US,en;q=0.9",
        },
        redirect: "follow",
        signal: AbortSignal.timeout(6000), // Timeout 6 detik per attempt
      });

      if (!res.ok) {
        attemptErrors.push(`${name}: HTTP ${res.status}`);
        continue;
      }

      const html = await res.text();

      // Kumpulkan calon URL CDN scontent di dalam HTML
      const scontentMatches = html.match(/https:\/\/[^"'<>\s]*cdninstagram\.com\/v\/[^"'<>\s]+/gi) || [];
      const cleanCandidates = scontentMatches.map((u) =>
        decodeHtmlEntities(u.replace(/\\u0026/g, "&"))
      );

      // Cari calon yang tidak memiliki crop parameter Instagram (stp=c...)
      const uncroppedCandidate = cleanCandidates.find(
        (u) => !/([?&]stp=)c\d+\./i.test(u)
      );

      // Cek og:image terlebih dahulu
      const ogMatch =
        html.match(/<meta\s+[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i) ||
        html.match(/<meta\s+[^>]*content=["']([^"']+)["'][^>]*property=["']og:image["']/i);

      if (ogMatch && ogMatch[1]) {
        const decoded = decodeHtmlEntities(ogMatch[1]);
        // Jika og:image tidak di-crop, langsung pakai
        if (!/([?&]stp=)c\d+\./i.test(decoded) && /^https?:\/\//i.test(decoded)) {
          return decoded;
        }
        // Jika og:image di-crop tapi ada candidate uncropped di halaman, gunakan candidate uncropped
        if (uncroppedCandidate && /^https?:\/\//i.test(uncroppedCandidate)) {
          return uncroppedCandidate;
        }
        // Fallback pakai decoded og:image jika tidak ada pilihan lain
        if (/^https?:\/\//i.test(decoded)) {
          return decoded;
        }
      }

      // Jika og:image tidak ada, gunakan uncropped candidate
      if (uncroppedCandidate && /^https?:\/\//i.test(uncroppedCandidate)) {
        return uncroppedCandidate;
      }

      // Fallback ke twitter:image
      const twitterMatch =
        html.match(/<meta\s+[^>]*name=["']twitter:image["'][^>]*content=["']([^"']+)["']/i) ||
        html.match(/<meta\s+[^>]*content=["']([^"']+)["'][^>]*name=["']twitter:image["']/i);

      if (twitterMatch && twitterMatch[1]) {
        const decoded = decodeHtmlEntities(twitterMatch[1]);
        if (/^https?:\/\//i.test(decoded)) {
          return decoded;
        }
      }

      attemptErrors.push(`${name}: Meta og:image / twitter:image tidak ditemukan`);
    } catch (err) {
      const isTimeout = err instanceof Error && (err.name === "TimeoutError" || err.name === "AbortError");
      const msg = isTimeout ? "Timeout (6s)" : err instanceof Error ? err.message : String(err);
      attemptErrors.push(`${name}: ${msg}`);
      console.warn(`[instagram] Percobaan dengan UA ${name} gagal:`, msg);
    }
  }

  // Strategi 2: Fallback ke endpoint resmi Instagram oEmbed
  try {
    const oembedUrl = `https://api.instagram.com/oembed/?url=${encodeURIComponent(normalizedUrl)}`;
    const res = await fetch(oembedUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "application/json, text/html, */*",
      },
      redirect: "follow",
      signal: AbortSignal.timeout(6000),
    });

    if (res.ok) {
      const rawText = await res.text();
      try {
        const json = JSON.parse(rawText) as { thumbnail_url?: string; url?: string };
        if (json?.thumbnail_url && /^https?:\/\//i.test(json.thumbnail_url)) {
          return decodeHtmlEntities(json.thumbnail_url);
        }
      } catch {
        // Jika respons bukan JSON murni, ekstrak thumbnail_url atau scontent dari teks HTML
        const jsonMatch = rawText.match(/"thumbnail_url"\s*:\s*"([^"]+)"/i);
        if (jsonMatch && jsonMatch[1]) {
          const decoded = decodeHtmlEntities(
            jsonMatch[1].replace(/\\u0026/g, "&").replaceAll("\\/", "/")
          );
          if (/^https?:\/\//i.test(decoded)) {
            return decoded;
          }
        }

        const scontentMatch = rawText.match(/https:\/\/[^"'<>\s]*cdninstagram\.com\/v\/[^"'<>\s]+/i);
        if (scontentMatch && scontentMatch[0]) {
          return decodeHtmlEntities(scontentMatch[0].replace(/\\u0026/g, "&"));
        }
      }
      attemptErrors.push("oEmbed: Field thumbnail_url tidak ditemukan pada respons");
    } else {
      attemptErrors.push(`oEmbed: HTTP ${res.status}`);
    }
  } catch (oembedErr) {
    const isTimeout = oembedErr instanceof Error && (oembedErr.name === "TimeoutError" || oembedErr.name === "AbortError");
    const msg = isTimeout ? "Timeout (6s)" : oembedErr instanceof Error ? oembedErr.message : String(oembedErr);
    attemptErrors.push(`oEmbed: ${msg}`);
    console.warn("[instagram] Percobaan oEmbed gagal:", msg);
  }

  // Jika seluruh percobaan gagal, lempar error dengan pesan diagnostik yang lengkap
  const detail = attemptErrors.length > 0 ? ` [${attemptErrors.join(", ")}]` : "";
  throw new Error(`Gagal mengekstrak thumbnail dari postingan Instagram${detail}. Pastikan postingan bersifat publik.`);
}

