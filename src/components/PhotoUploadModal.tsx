import { useState } from 'react';
import { FiX, FiCamera, FiUpload } from 'react-icons/fi';
import './PhotoUploadModal.css';
import ImageUpload from './ImageUpload';

interface PhotoUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (file: File) => Promise<void>;
  currentPhotoUrl?: string;
}

export default function PhotoUploadModal({ 
  isOpen, 
  onClose, 
  onUpload,
  currentPhotoUrl 
}: PhotoUploadModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleFileSelect = (file: File | null) => {
    setSelectedFile(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setLoading(true);
    try {
      await onUpload(selectedFile);
      setSelectedFile(null);
      onClose();
    } catch (error) {
      console.error('Erro ao fazer upload:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="photo-modal-overlay" onClick={handleClose}>
      <div className="photo-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="photo-modal-header">
          <h3>
            <FiCamera />
            Atualizar Foto do Perfil
          </h3>
          <button 
            className="photo-modal-close"
            onClick={handleClose}
            disabled={loading}
          >
            <FiX />
          </button>
        </div>

        <div className="photo-modal-body">
          {currentPhotoUrl && (
            <div className="current-photo-section">
              <h4>Foto Atual</h4>
              <div className="current-photo">
                <img src={currentPhotoUrl} alt="Foto atual" />
              </div>
            </div>
          )}

          <div className="new-photo-section">
            <h4>Nova Foto</h4>
            <ImageUpload
              onImageSelect={handleFileSelect}
              value={selectedFile}
              placeholder="Selecione uma nova foto para seu perfil"
              accept="image/*"
            />
          </div>
        </div>

        <div className="photo-modal-footer">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleClose}
            disabled={loading}
          >
            Cancelar
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleUpload}
            disabled={!selectedFile || loading}
          >
            {loading ? (
              <>
                <div className="loading-spinner"></div>
                Enviando...
              </>
            ) : (
              <>
                <FiUpload />
                Atualizar Foto
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
