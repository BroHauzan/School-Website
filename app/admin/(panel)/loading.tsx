/**
 * Skeleton saat navigasi antar halaman admin — semua rute panel force-dynamic
 * (fetch Firestore), jadi transisi ini memberi feedback visual bahwa klik
 * sudah terdaftar dan halaman sedang dimuat.
 */
export default function PanelLoading() {
  return (
    <div aria-busy="true" aria-label="Memuat halaman…" className="animate-pulse">
      <div className="h-8 w-56 rounded-full bg-navy/10" />
      <div className="mt-4 h-4 w-72 rounded-full bg-navy/5" />
      <div className="mt-10 flex justify-end">
        <div className="h-10 w-40 rounded-full bg-navy/10" />
      </div>
      <div className="mt-5 space-y-4">
        {[0, 1, 2].map((i) => (
          <div key={i} className="flex items-center gap-4 rounded-lg border border-navy/10 bg-paper px-6 py-5">
            <div className="h-9 w-28 rounded-full bg-navy/10" />
            <div className="flex-1 space-y-2">
              <div className="h-5 w-3/4 rounded-full bg-navy/10" />
              <div className="h-3 w-1/3 rounded-full bg-navy/5" />
            </div>
            <div className="h-8 w-24 rounded-full bg-navy/10" />
          </div>
        ))}
      </div>
    </div>
  );
}
