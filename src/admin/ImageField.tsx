import { useRef, useState } from "react";
import { uploadMedia } from "../adminApi";

type ImageFieldProps = {
  value: string;
  onChange: (value: string) => void;
};

export function ImageField({ value, onChange }: ImageFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const handleFile = async (file: File | undefined) => {
    if (!file) {
      return;
    }
    setError("");
    setUploading(true);
    try {
      const result = await uploadMedia(file);
      onChange(result.url);
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Upload failed.");
    } finally {
      setUploading(false);
      // Clear the input so re-picking the same file fires onChange again.
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    }
  };

  return (
    <div className="image-field">
      {value && (
        <div className="image-preview">
          <img src={value} alt="" />
        </div>
      )}
      <div className="image-field-controls">
        <input
          type="text"
          value={value}
          placeholder="Paste an image URL, or upload a file"
          onChange={(event) => onChange(event.target.value)}
        />
        <div className="image-field-buttons">
          <input
            ref={inputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml"
            onChange={(event) => void handleFile(event.target.files?.[0])}
            hidden
          />
          <button type="button" onClick={() => inputRef.current?.click()} disabled={uploading}>
            {uploading ? "Uploading..." : "Upload file"}
          </button>
          {value && (
            <button type="button" onClick={() => onChange("")}>
              Clear
            </button>
          )}
        </div>
      </div>
      {error && <p className="admin-error">{error}</p>}
    </div>
  );
}

export default ImageField;
