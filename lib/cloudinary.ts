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
 * Ekstraksi URL thumbnail asli (og:image) dari postingan Instagram menggunakan bot crawler UA.
 * Mengutamakan crawler yang tidak dipaksa crop 1:1 oleh Instagram (seperti Slackbot / Skype).
 */
export async function extractInstagramThumbnail(postUrl: string): Promise<string | null> {
  const cleanUrl = postUrl.trim().split("?")[0] || "";
  const normalizedUrl = cleanUrl.endsWith("/") ? cleanUrl : `${cleanUrl}/`;
  
  // Slackbot dan Skype mendapatkan og:image dengan aspek rasio asli dari Instagram,
  // sedangkan Facebook dan Twitter bot sering kali mendapatkan thumbnail yang di-crop 1:1 (stp=c...).
  const userAgents = [
    "Slackbot-LinkExpanding 1.0 (+https://api.slack.com/robots)",
    "SkypeUriPreview Preview/0.5",
    "facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)",
    "Twitterbot/1.0",
  ];

  for (const ua of userAgents) {
    try {
      const res = await fetch(normalizedUrl, {
        headers: {
          "User-Agent": ua,
          Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
          "Accept-Language": "en-US,en;q=0.9",
        },
        redirect: "follow",
        signal: AbortSignal.timeout(10000),
      });

      if (!res.ok) continue;

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
    } catch (err) {
      console.warn(`[instagram] Gagal fetch og:image dengan UA ${ua}:`, err);
    }
  }

  return null;
}

