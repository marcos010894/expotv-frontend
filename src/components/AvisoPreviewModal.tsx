import { useEffect } from 'react';
import './AvisoPreviewModal.css';
import { FiX } from 'react-icons/fi';

interface AvisoPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  aviso: {
    nome: string;
    mensagem: string;
    archive_url?: string | null;
  };
}

export default function AvisoPreviewModal({ isOpen, onClose, aviso }: AvisoPreviewModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const isVideo = (url?: string | null) => {
    if (!url) return false;
    const videoExtensions = ['.mp4', '.webm', '.ogg', '.mov', '.avi'];
    return videoExtensions.some(ext => url.toLowerCase().includes(ext));
  };

  const hasMedia = aviso.archive_url && aviso.archive_url !== '';

  return (
    <div className="aviso-preview-overlay" onClick={onClose}>
      <div className="aviso-preview-modal" onClick={(e) => e.stopPropagation()}>
        <div className="aviso-preview-header">
          <h2>Pré-visualização na TV</h2>
          <button className="aviso-preview-close" onClick={onClose}>
            <FiX />
          </button>
        </div>
        
        <div className="aviso-preview-content">
          {/* Simulação da TV */}
          <div className="tv-simulation">
            <div className="tv-screen">
              {hasMedia ? (
                <div className="aviso-media-container">
                  {isVideo(aviso.archive_url) ? (
                    <video
                      src={aviso.archive_url!}
                      autoPlay
                      loop
                      muted
                      playsInline
                      className="aviso-preview-video"
                    />
                  ) : (
                    <img
                      src={aviso.archive_url!}
                      alt={aviso.nome}
                      className="aviso-preview-image"
                    />
                  )}
                </div>
              ) : (
                // Aviso com mensagem de texto (estilo elegante)
                <div className="aviso-elegante">
                  <div className="aviso-detalhe top-left"></div>
                  <div className="aviso-detalhe top-right"></div>
                  <div className="aviso-detalhe bottom-left"></div>
                  <div className="aviso-detalhe bottom-right"></div>
                  <div className="aviso-texto-container">
                    <div className="aviso-titulo">{aviso.nome || 'Aviso Importante'}</div>
                    <div className="aviso-mensagem">{aviso.mensagem}</div>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div className="aviso-preview-info">
            <h3>Informações do Aviso</h3>
            <div className="info-item">
              <strong>Título:</strong>
              <span>{aviso.nome}</span>
            </div>
            <div className="info-item">
              <strong>Mensagem:</strong>
              <span className="mensagem-completa">{aviso.mensagem}</span>
            </div>
            {hasMedia && (
              <div className="info-item">
                <strong>Tipo de Conteúdo:</strong>
                <span>{isVideo(aviso.archive_url) ? 'Vídeo' : 'Imagem'}</span>
              </div>
            )}
            {!hasMedia && (
              <div className="info-item">
                <strong>Tipo de Conteúdo:</strong>
                <span>Texto</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
