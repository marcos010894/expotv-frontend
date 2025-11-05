import { useState, useRef } from 'react';
import { FiUpload, FiX, FiImage, FiVideo } from 'react-icons/fi';
import './ImageUpload.css';

interface ImageUploadProps {
  onImageSelect: (file: File | null) => void;
  value?: File | null;
  placeholder?: string;
  accept?: string;
  allowVideo?: boolean;
}

export default function ImageUpload({ 
  onImageSelect, 
  value, 
  placeholder = "Clique para selecionar uma imagem ou vídeo, ou arraste aqui",
  accept = "image/*,video/*",
  allowVideo = true
}: ImageUploadProps) {
  const [dragOver, setDragOver] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [fileType, setFileType] = useState<'image' | 'video' | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (file: File | null) => {
    if (file) {
      const isVideo = file.type.startsWith('video/');
      const isImage = file.type.startsWith('image/');
      
      setFileType(isVideo ? 'video' : isImage ? 'image' : null);
      
      // Criar preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setPreview(null);
      setFileType(null);
    }
    
    onImageSelect(file);
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    handleFileSelect(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      const isVideo = file.type.startsWith('video/');
      const isImage = file.type.startsWith('image/');
      
      if (isImage || (isVideo && allowVideo)) {
        handleFileSelect(file);
      }
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    handleFileSelect(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="image-upload-container">
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileChange}
        className="image-upload-input"
      />
      
      <div
        className={`image-upload-area ${dragOver ? 'drag-over' : ''} ${preview ? 'has-image' : ''}`}
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {preview ? (
          <div className="image-preview">
            {fileType === 'video' ? (
              <video src={preview} className="preview-video" controls />
            ) : (
              <img src={preview} alt="Preview" className="preview-image" />
            )}
            <div className="image-overlay">
              <button
                type="button"
                className="remove-button"
                onClick={handleRemove}
                title={`Remover ${fileType === 'video' ? 'vídeo' : 'imagem'}`}
              >
                <FiX />
              </button>
            </div>
            <div className="image-info">
              {fileType === 'video' ? (
                <FiVideo className="image-icon" />
              ) : (
                <FiImage className="image-icon" />
              )}
              <span className="image-name">
                {value?.name || `${fileType === 'video' ? 'Vídeo' : 'Imagem'} selecionado(a)`}
              </span>
              <span className="image-size">
                {value ? `${(value.size / 1024 / 1024).toFixed(2)} MB` : ''}
              </span>
            </div>
          </div>
        ) : (
          <div className="upload-placeholder">
            <div className="upload-icon">
              <FiUpload />
            </div>
            <div className="upload-text">
              <span className="upload-title">{placeholder}</span>
              <span className="upload-subtitle">
                {allowVideo 
                  ? 'Formatos suportados: JPG, PNG, GIF, MOV, AVI (máx. 50MB)'
                  : 'Formatos suportados: JPG, PNG, WEBP, GIF (máx. 50MB)'
                }
              </span>
            </div>
          </div>
        )}
      </div>
      
      {value && (
        <div className="file-info">
          <span className="file-name">{value.name}</span>
          <span className="file-size">
            {(value.size / 1024 / 1024).toFixed(2)} MB
          </span>
        </div>
      )}
    </div>
  );
}
