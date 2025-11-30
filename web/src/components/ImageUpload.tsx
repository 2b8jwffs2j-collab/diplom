import { useState, useRef } from 'react';
import { toast } from 'sonner';
import { Camera } from 'lucide-react';

interface ImageUploadProps {
  onUploadComplete: (urls: string[]) => void;
  maxFiles?: number;
  existingImages?: string[];
}

export default function ImageUpload({
  onUploadComplete,
  maxFiles = 10,
  existingImages = [],
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [previewUrls, setPreviewUrls] = useState<string[]>(existingImages);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // Check file count
    if (previewUrls.length + files.length > maxFiles) {
      toast.error(`Хамгийн ихдээ ${maxFiles} зураг оруулах боломжтой`);
      return;
    }

    // Check file types and sizes
    const validFiles: File[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name}: Зөвхөн зураг файл оруулах боломжтой`);
        continue;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name}: Файлын хэмжээ 5MB-аас их байна`);
        continue;
      }
      validFiles.push(file);
    }

    if (validFiles.length === 0) return;

    setUploading(true);

    try {
      const formData = new FormData();
      validFiles.forEach((file) => {
        formData.append('images', file);
      });

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Upload хийхэд алдаа гарлаа');
      }

      const data = await response.json();
      const newUrls = [...previewUrls, ...data.urls];
      setPreviewUrls(newUrls);
      onUploadComplete(newUrls);
      toast.success(`${data.urls.length} зураг амжилттай upload хийгдлээ!`);
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error(`Алдаа: ${error.message}`);
    } finally {
      setUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemove = (index: number) => {
    const newUrls = previewUrls.filter((_, i) => i !== index);
    setPreviewUrls(newUrls);
    onUploadComplete(newUrls);
  };

  return (
    <div className="space-y-4">
      {/* File Input */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Зураг оруулах ({previewUrls.length}/{maxFiles})
        </label>
        <div className="flex items-center space-x-4">
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileSelect}
            disabled={uploading || previewUrls.length >= maxFiles}
            className="hidden"
            id="image-upload"
          />
          <label
            htmlFor="image-upload"
            className={`cursor-pointer px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition ${
              uploading || previewUrls.length >= maxFiles ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {uploading ? (
              'Upload хийж байна...'
            ) : (
              <>
                <Camera className="w-4 h-4 mr-1" />
                Зураг сонгох
              </>
            )}
          </label>
          {previewUrls.length > 0 && (
            <button
              type="button"
              onClick={() => {
                setPreviewUrls([]);
                onUploadComplete([]);
              }}
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              Бүгдийг устгах
            </button>
          )}
        </div>
        <p className="text-xs text-gray-500 mt-1">
          Зөвхөн зураг файл (JPEG, PNG, GIF, WebP), хамгийн ихдээ 5MB
        </p>
      </div>

      {/* Preview Grid */}
      {previewUrls.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {previewUrls.map((url, index) => (
            <div key={index} className="relative group">
              <img
                src={url}
                alt={`Preview ${index + 1}`}
                className="w-full h-32 object-cover rounded-lg border border-gray-200"
              />
              <button
                type="button"
                onClick={() => handleRemove(index)}
                className="absolute top-2 right-2 bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition text-xs"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
