import { useCallback, useEffect, useRef, useState } from "react";
import { Upload, Trash2, FileText, RefreshCw } from "lucide-react";
import { adminApi } from "@/lib/api";

interface Doc {
  id: number;
  filename: string;
  uploaded_at: string;
  chunk_count: number;
}

interface DocumentUploaderProps {
  token: string;
}

export default function DocumentUploader({ token }: DocumentUploaderProps) {
  const [docs, setDocs] = useState<Doc[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  async function loadDocs() {
    try {
      const res = await adminApi.listDocuments(token);
      setDocs(res.data);
    } catch {
      setError("Belgeler yüklenemedi.");
    }
  }

  useEffect(() => {
    loadDocs();
  }, []);

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
    <div className="rounded-2xl border border-white/10">
      <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
        <h3 className="text-white font-semibold">AI Bilgi Bankası</h3>
        <button onClick={loadDocs} className="text-slate-400 hover:text-white transition-colors">
          <RefreshCw size={16} />
        </button>
      </div>

      <div className="p-6 space-y-4">
        {/* Upload area */}
        <div
          className="border-2 border-dashed border-white/10 rounded-xl p-8 text-center hover:border-violet-500/50 transition-colors cursor-pointer"
          onClick={() => fileRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            const file = e.dataTransfer.files[0];
            if (file) handleUpload(file);
          }}
        >
          <Upload className="mx-auto mb-3 text-slate-500" size={32} />
          <p className="text-slate-400 text-sm">
            PDF sürükleyin veya{" "}
            <span className="text-violet-400">tıklayarak seçin</span>
          </p>
          <p className="text-slate-600 text-xs mt-1">Fiyat listesi, hizmet rehberi, SSS...</p>
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

        {uploading && (
          <div className="flex items-center gap-2 text-violet-400 text-sm">
            <RefreshCw size={14} className="animate-spin" />
            Belge yükleniyor ve vektörize ediliyor...
          </div>
        )}

        {error && <p className="text-rose-400 text-sm">{error}</p>}

        {/* Document list */}
        {docs.length > 0 && (
          <div className="space-y-2">
            {docs.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/3 border border-white/5"
              >
                <FileText size={16} className="text-violet-400 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-white text-sm truncate">{doc.filename}</div>
                  <div className="text-slate-500 text-xs">
                    {doc.chunk_count} parça •{" "}
                    {new Date(doc.uploaded_at).toLocaleDateString("tr-TR")}
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(doc.id)}
                  className="text-slate-600 hover:text-rose-400 transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        )}

        {docs.length === 0 && !uploading && (
          <p className="text-center text-slate-600 text-sm py-4">
            Henüz belge yüklenmedi.
          </p>
        )}
      </div>
    </div>
  );
}
