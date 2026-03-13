import React, { useCallback, useState } from "react";
import { UploadCloud, Image as ImageIcon, Film } from "lucide-react";

type UploadedItem = {
  key: string;
  url: string;
  type: "image" | "video";
};

const endpoint = typeof window !== "undefined" ? window.location.origin : "";

async function createSignedUrl(file: File) {
  const res = await fetch(new URL("/api/upload-url", endpoint).toString(), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      fileName: file.name,
      contentType: file.type || "application/octet-stream",
    }),
  });
  if (!res.ok) {
    throw new Error("署名付きURLの取得に失敗しました");
  }
  return (await res.json()) as { uploadUrl: string; url: string; key: string };
}

export default function RawStockUploadPage() {
  const [hovered, setHovered] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [items, setItems] = useState<UploadedItem[]>([]);

  const handleFiles = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      const file = files[0];
      const { uploadUrl, url, key } = await createSignedUrl(file);
      await fetch(uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type || "application/octet-stream" },
        body: file,
      });
      console.log("Uploaded to:", url);
      const type: "image" | "video" = file.type.startsWith("video") ? "video" : "image";
      setItems((prev) => [{ key, url, type }, ...prev]);
    } catch (e) {
      console.error(e);
      alert("アップロードに失敗しました");
    } finally {
      setUploading(false);
      setHovered(false);
    }
  }, []);

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    handleFiles(e.dataTransfer.files);
  };

  const onDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setHovered(true);
  };

  const onDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setHovered(false);
  };

  const onClick = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*,video/*";
    input.onchange = (e: any) => handleFiles(e.target.files);
    input.click();
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #0b1020, #151c2f)",
        color: "white",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: 24,
        fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 720,
          backgroundColor: "rgba(18, 26, 42, 0.96)",
          borderRadius: 24,
          padding: 24,
          boxShadow: "0 24px 60px rgba(0,0,0,0.7)",
          border: "1px solid rgba(100, 181, 246, 0.3)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
          <UploadCloud size={24} color="#64B5F6" />
          <h1 style={{ fontSize: 20, fontWeight: 800, letterSpacing: 0.4 }}>RawStock Uploader</h1>
        </div>
        <p style={{ fontSize: 13, color: "#9FA8DA", marginBottom: 20 }}>
          画像・動画をドラッグ＆ドロップ、またはクリックで選択して Cloudflare R2 にアップロードします。
        </p>

        <div
          onDrop={onDrop}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onClick={onClick}
          style={{
            border: `1.5px dashed ${hovered ? "#64B5F6" : "rgba(144,164,174,0.7)"}`,
            borderRadius: 18,
            padding: 32,
            textAlign: "center",
            background:
              "radial-gradient(circle at top, rgba(100,181,246,0.22), transparent 60%), rgba(13,19,35,0.95)",
            cursor: "pointer",
            transition: "border-color 0.2s ease, background-color 0.2s ease, transform 0.1s ease",
            transform: hovered ? "translateY(-1px)" : "translateY(0)",
          }}
        >
          <div style={{ marginBottom: 12 }}>
            <UploadCloud size={40} color={hovered ? "#90CAF9" : "#64B5F6"} />
          </div>
          <p style={{ fontSize: 14, fontWeight: 600 }}>
            ファイルをここにドラッグ＆ドロップ
          </p>
          <p style={{ fontSize: 12, color: "#B0BEC5", marginTop: 4 }}>
            または <span style={{ color: "#90CAF9", textDecoration: "underline" }}>クリックして選択</span>
          </p>
          {uploading && (
            <p style={{ marginTop: 12, fontSize: 12, color: "#90CAF9" }}>アップロード中...</p>
          )}
        </div>

        {items.length > 0 && (
          <div style={{ marginTop: 24 }}>
            <h2 style={{ fontSize: 13, fontWeight: 700, marginBottom: 8, color: "#B0BEC5" }}>
              アップロード履歴
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 260, overflowY: "auto" }}>
              {items.map((item) => (
                <div
                  key={item.key}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: 10,
                    borderRadius: 10,
                    backgroundColor: "rgba(23, 32, 48, 0.96)",
                    border: "1px solid rgba(84,110,122,0.6)",
                  }}
                >
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 10,
                      background:
                        item.type === "video"
                          ? "radial-gradient(circle at top left, rgba(236,64,122,0.7), rgba(74,20,140,0.9))"
                          : "radial-gradient(circle at top left, rgba(129,199,132,0.8), rgba(27,94,32,0.9))",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {item.type === "video" ? (
                      <Film size={20} color="#FFF" />
                    ) : (
                      <ImageIcon size={20} color="#FFF" />
                    )}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        fontSize: 11,
                        color: "#ECEFF1",
                        marginBottom: 2,
                        wordBreak: "break-all",
                      }}
                    >
                      {item.url}
                    </div>
                    <div style={{ fontSize: 10, color: "#90A4AE" }}>{item.key}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

