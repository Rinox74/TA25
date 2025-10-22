import React, { useState, useRef, useEffect } from 'react';

interface FileUploadProps {
  onFileSelect: (fileData: string) => void;
  label: string;
  currentImageUrl?: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onFileSelect, label, currentImageUrl }) => {
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setPreview(currentImageUrl || null);
  }, [currentImageUrl]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setPreview(base64String);
        onFileSelect(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{label}</label>
      <div className="mt-1 flex items-center space-x-4">
        <div className="w-32 h-32 bg-slate-100 dark:bg-slate-700 rounded-md flex items-center justify-center overflow-hidden">
          {preview ? (
            <img src={preview} alt="Anteprima" className="w-full h-full object-cover" />
          ) : (
            <span className="text-sm text-slate-500">Nessuna immagine</span>
          )}
        </div>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          accept="image/*"
        />
        <button
          type="button"
          onClick={handleButtonClick}
          className="px-3 py-2 border border-slate-300 rounded-md shadow-sm text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 dark:bg-slate-600 dark:text-slate-200 dark:border-slate-500 dark:hover:bg-slate-500"
        >
          Sfoglia...
        </button>
      </div>
    </div>
  );
};
