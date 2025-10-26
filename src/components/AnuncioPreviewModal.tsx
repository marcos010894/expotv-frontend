import { FiX, FiVideo, FiImage } from 'react-icons/fi';
import { useState } from 'react';
import './AnuncioPreviewModal.css';

interface AnuncioPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl?: string;
  nome: string;
  fileType?: string; // Tipo MIME do arquivo (ex: 'video/mp4', 'image/jpeg')
}

export default function AnuncioPreviewModal({ 
  isOpen, 
  onClose, 
  imageUrl,
  nome,
  fileType
}: AnuncioPreviewModalProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<'template1' | 'template2'>('template1');
  
  if (!isOpen) return null;

  // Template 1: COM notícias (5% bar info + 75% anúncio + 20% notícias)
  // Template 2: SEM notícias (5% bar info + 95% anúncio)
  const isTemplate1 = selectedTemplate === 'template1';
  
  // Detectar se é vídeo baseado no tipo MIME ou extensão
  const isVideo = (url?: string, type?: string) => {
    // Primeiro verifica o tipo MIME
    if (type && type.startsWith('video/')) {
      console.log('✅ Vídeo detectado pelo tipo MIME:', type);
      return true;
    }
    
    // Se não tem tipo, tenta pela URL
    if (!url) return false;
    const videoExtensions = ['.mp4', '.webm', '.ogg', '.mov', '.avi', '.mkv', '.flv'];
    const lowerUrl = url.toLowerCase();
    const isVideoByUrl = videoExtensions.some(ext => lowerUrl.includes(ext)) || lowerUrl.includes('video');
    
    if (isVideoByUrl) {
      console.log('✅ Vídeo detectado pela URL:', url);
    } else {
      console.log('❌ Não é vídeo. URL:', url, 'Type:', type);
    }
    
    return isVideoByUrl;
  };
  
  const mediaIsVideo = isVideo(imageUrl, fileType);
  
  console.log('🎬 Preview Modal - mediaIsVideo:', mediaIsVideo, 'imageUrl:', imageUrl, 'fileType:', fileType);

  return (
    <div className="preview-modal-overlay" onClick={onClose}>
      <div className="preview-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="preview-modal-header">
          <h3>Pré-visualização do Anúncio na TV</h3>
          <button 
            className="preview-modal-close"
            onClick={onClose}
            aria-label="Fechar"
          >
            <FiX />
          </button>
        </div>

        <div className="preview-modal-body">
          {/* Seletor de Template */}
          <div className="template-selector">
            <label>
              <strong>Selecione o Template:</strong>
            </label>
            <div className="template-buttons">
              <button
                type="button"
                className={`template-btn ${selectedTemplate === 'template1' ? 'active' : ''}`}
                onClick={() => setSelectedTemplate('template1')}
              >
                Template 1 (Com Notícias)
              </button>
              <button
                type="button"
                className={`template-btn ${selectedTemplate === 'template2' ? 'active' : ''}`}
                onClick={() => setSelectedTemplate('template2')}
              >
                Template 2 (Sem Notícias)
              </button>
            </div>
          </div>

          {/* Simulação da TV */}
          <div className="tv-simulation">
            {/* Bar Info no topo (5%) */}
            <div className="tv-bar-info">
              <span>EXPO TV</span>
            </div>

            {/* Área do Anúncio (75% ou 95%) */}
            <div className="tv-anuncio" style={{ 
              height: isTemplate1 ? '75%' : '95%' 
            }}>
              {imageUrl ? (
                mediaIsVideo ? (
                  <video 
                    src={imageUrl} 
                    controls 
                    autoPlay 
                    loop 
                    muted
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  >
                    Seu navegador não suporta vídeos.
                  </video>
                ) : (
                  <img src={imageUrl} alt={nome} />
                )
              ) : (
                <div className="tv-anuncio-placeholder">
                  {mediaIsVideo ? <FiVideo size={48} /> : <FiImage size={48} />}
                  <p>{mediaIsVideo ? 'Vídeo do Anúncio' : 'Imagem do Anúncio'}</p>
                  <p className="nome-anuncio">{nome || 'Nome do Anúncio'}</p>
                </div>
              )}
            </div>

            {/* Notícias embaixo (20% - apenas Template 1) */}
            {isTemplate1 && (
              <div className="tv-noticias">
                <span>NOTÍCIAS</span>
              </div>
            )}
          </div>

          {/* Informações do Preview */}
          <div className="preview-info">
            <p><strong>Tipo de Mídia:</strong> {mediaIsVideo ? 'Vídeo' : 'Imagem'}</p>
            <p><strong>Template:</strong> {isTemplate1 ? 'Template 1 (Com Notícias)' : 'Template 2 (Sem Notícias)'}</p>
            <p><strong>Resolução TV:</strong> 720 x 1224 px (vertical)</p>
            {isTemplate1 ? (
              <>
                <p><strong>Bar Info (topo):</strong> 720 x 61 px (5%)</p>
                <p><strong>Anúncio:</strong> 720 x 918 px (75%)</p>
                <p><strong>Notícias (embaixo):</strong> 720 x 245 px (20%)</p>
              </>
            ) : (
              <>
                <p><strong>Bar Info (topo):</strong> 720 x 61 px (5%)</p>
                <p><strong>Anúncio:</strong> 720 x 1163 px (95%)</p>
              </>
            )}
          </div>
        </div>

        <div className="preview-modal-footer">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onClose}
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
