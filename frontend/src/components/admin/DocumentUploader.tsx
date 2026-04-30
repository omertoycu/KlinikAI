import { useCallback, useEffect, useRef, useState } from "react";
import { Upload, Trash2, FileText, RefreshCw, Loader2, BookOpen } from "lucide-react";
import { adminApi } from "@/lib/api";

interface Doc {
  id: number;
  filename: string;
  uploaded_at: string;
  chunk_count: number;
}

interface DocumentUploaderProps { token: string }

export default function DocumentUploader({ token }: DocumentUploaderProps) {
  const [docs,      setDocs]      = useState<Doc[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error,     setError]     = useState("");
  const [dragging,  setDragging]  = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  async function loadDocs() {
    try {
      const res = await adminApi.listDocuments(token);
      setDocs(res.data);
    } catch {
      setError("Belgeler yüklenemedi.");
    }
  }

  useEffect(() => { loadDocs(); }, []);

  const handleUpload = useCallback(
    async (file: File) => {
      if (!file.name.endsWith(".pdf")) {
        setError("Sadece PDF dosyaları yüklenebilir.");
        return;
      }
      setError("");
      setUploading(true);
      try {
        await adminApi.uploadDocument(file, token);
        await loadDocs();
      } catch (e: unknown) {
        const msg = (e as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
        setError(msg ?? "Yükleme başarısız.");
      } finally {
        setUploading(false);
        if (fileRef.current) fileRef.current.value = "";
      }
    },
    [token]
  );

  async function handleDelete(id: number) {
    if (!confirm("Bu belgeyi silmek istediğinizden emin misiniz?")) return;
    try {
      await adminApi.deleteDocument(id, token);
      await loadDocs();
    } catch {
      setError("Silme işlemi başarısız.");
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      {/* Upload area */}
      <div
        className={`rounded-2xl border-2 border-dashed p-10 text-center cursor-pointer transition-all
          ${dragging
            ? "border-primary bg-primary/5 scale-[1.01]"
            : "border-outline-variant hover:border-primary/50 hover:bg-surface-container-low bg-surface-container-lowest"
          }`}
        onClick={() => fileRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          const file = e.dataTransfer.files[0];
          if (file) handleUpload(file);
        }}
      >
        {uploading ? (
          <div className="flex flex-col items-center gap-3">
            <Loader2 size={36} className="text-primary animate-spin" />
            <p className="text-on-surface font-medium text-sm">Belge yükleniyor ve vektörize ediliyor…</p>
            <p className="text-secondary text-xs">Bu işlem birkaç saniye sürebilir</p>
          </div>
        ) : (
          <>
            <div className="w-14 h-14 rounded-2xl bg-primary-container text-on-primary-container flex items-center justify-center mx-auto mb-4">
              <Upload size={22} />
            </div>
            <p className="text-on-background font-semibold text-sm mb-1">
              PDF sürükleyin veya{" "}
              <span className="text-primary">tıklayarak seçin</span>
            </p>
            <p className="text-secondary text-xs">Fiyat listesi, hizmet rehberi, SSS vb.</p>
          </>
        )}
        <input
          ref={fileRef}
          type="file"
          accept=".pdf"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleUpload(file);
          }}
        />
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-200 rounded-xl px-4 py-3 text-rose-700 text-sm">
          {error}
        </div>
      )}

      {/* Document list */}
      <div className="rounded-2xl border border-outline-variant bg-surface-container-lowest overflow-hidden shadow-sm">
        <div className="flex items-center justify-between px-6 py-4 border-b border-outline-variant bg-surface-container-low">
          <div className="flex items-center gap-2">
            <BookOpen size={15} className="text-primary" />
            <h3 className="text-on-background font-semibold text-sm">Yüklü Belgeler</h3>
            <span className="text-secondary text-xs bg-surface-container border border-outline-variant px-2 py-0.5 rounded-full">
              {docs.length}
            </span>
          </div>
          <button
            onClick={loadDocs}
            className="text-secondary hover:text-primary transition-colors p-1.5 rounded-lg hover:bg-surface-container"
          >
            <RefreshCw size={14} />
          </button>
        </div>

        {docs.length === 0 ? (
          <div className="text-center py-12">
            <FileText size={28} className="text-secondary/30 mx-auto mb-2" />
            <p className="text-secondary text-sm">Henüz belge yüklenmedi.</p>
          </div>
        ) : (
          <div className="divide-y divide-outline-variant/40">
            {docs.map((doc) => (
              <div key={doc.id} className="flex items-center gap-4 px-6 py-4 hover:bg-surface-container-low transition-colors">
                <div className="w-9 h-9 rounded-xl bg-primary-container text-on-primary-container flex items-center justify-center flex-shrink-0">
                  <FileText size={15} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-on-background text-sm font-medium truncate">{doc.filename}</div>
                  <div className="text-secondary text-xs mt-0.5">
                    {doc.chunk_count} parça bölüm •{" "}
                    {new Date(doc.uploaded_at).toLocaleDateString("tr-TR")}
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(doc.id)}
                  className="p-2 rounded-lg text-secondary hover:text-rose-600 hover:bg-rose-50 transition-colors flex-shrink-0"
                  title="Sil"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
