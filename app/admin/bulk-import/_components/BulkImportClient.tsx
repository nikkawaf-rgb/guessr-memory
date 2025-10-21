"use client";

import { useState } from "react";
import { createClient } from "@supabase/supabase-js";
import exifr from "exifr";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface ImportResult {
  success: number;
  errors: string[];
}

export default function BulkImportClient() {
  const [files, setFiles] = useState<FileList | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [progress, setProgress] = useState(0);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFiles(e.target.files);
    setResult(null);
  };

  const uploadFiles = async () => {
    if (!files || files.length === 0) return;

    setIsUploading(true);
    setProgress(0);
    const errors: string[] = [];
    let successCount = 0;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      try {
        // Extract EXIF data before uploading
        let exifData = null;
        let imageWidth = null;
        let imageHeight = null;
        
        try {
          exifData = await exifr.parse(file, {
            pick: ['DateTimeOriginal', 'DateTime', 'CreateDate', 'ImageWidth', 'ImageHeight', 'Make', 'Model'],
          });
          
          // Get image dimensions
          if (exifData) {
            imageWidth = exifData.ImageWidth || null;
            imageHeight = exifData.ImageHeight || null;
          }
          
          console.log(`EXIF for ${file.name}:`, exifData);
        } catch (exifError) {
          console.warn(`Could not extract EXIF from ${file.name}:`, exifError);
        }

        // Upload to Supabase Storage
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
        // filePath should just be the filename, bucket is already "photos"
        const filePath = fileName;

        const { error: uploadError } = await supabase.storage
          .from('photos')
          .upload(filePath, file);

        if (uploadError) {
          errors.push(`${file.name}: ${uploadError.message}`);
          continue;
        }

        // Register in database with EXIF data
        const response = await fetch('/api/admin/bulk-import', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            storagePath: filePath,
            originalName: file.name,
            fileSize: file.size,
            mimeType: file.type,
            width: imageWidth,
            height: imageHeight,
            exifData: exifData,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          errors.push(`${file.name}: ${errorData.error}`);
          continue;
        }

        const responseData = await response.json();
        if (!responseData.hasDate) {
          errors.push(`${file.name}: ВНИМАНИЕ - нет EXIF даты, фото не будет использоваться в игре`);
        }

        successCount++;
      } catch (error) {
        errors.push(`${file.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }

      setProgress(Math.round(((i + 1) / files.length) * 100));
    }

    setResult({ success: successCount, errors });
    setIsUploading(false);
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-6">Массовый импорт фото</h1>
      
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2">
            Выберите файлы для загрузки
          </label>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileSelect}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
          {files && (
            <p className="text-sm text-gray-600 mt-2">
              Выбрано файлов: {files.length}
            </p>
          )}
        </div>

        {files && files.length > 0 && (
          <div>
            <button
              onClick={uploadFiles}
              disabled={isUploading}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUploading ? `Загрузка... ${progress}%` : 'Начать загрузку'}
            </button>
          </div>
        )}

        {isUploading && (
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        )}

        {result && (
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded p-4">
              <h3 className="font-semibold text-green-800 mb-2">Результат загрузки</h3>
              <p className="text-green-700">
                Успешно загружено: {result.success} из {files?.length || 0} файлов
              </p>
            </div>

            {result.errors.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded p-4">
                <h3 className="font-semibold text-red-800 mb-2">Ошибки:</h3>
                <ul className="text-red-700 space-y-1">
                  {result.errors.map((error, index) => (
                    <li key={index} className="text-sm">{error}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        <div className="bg-yellow-50 border border-yellow-200 rounded p-4">
          <h3 className="font-semibold text-yellow-800 mb-2">Важно:</h3>
          <ul className="text-yellow-700 text-sm space-y-1">
            <li>• Поддерживаются форматы: JPG, PNG, GIF, WebP</li>
            <li>• Максимальный размер файла: 10MB</li>
            <li>• Рекомендуется загружать не более 50 файлов за раз</li>
            <li>• Фото будут автоматически обработаны и добавлены в базу данных</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
