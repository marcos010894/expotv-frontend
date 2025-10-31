import { FiX, FiVideo, FiImage } from 'react-icons/fi';
import { FaInstagram, FaWhatsapp, FaClock, FaQuoteLeft } from 'react-icons/fa';
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

  // Hora e data atuais
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const months = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 
                  'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
  const day = now.getDate();
  const month = months[now.getMonth()];
  
  const mediaIsVideo = isVideo(imageUrl, fileType);
  
  console.log('🎬 Preview Modal - mediaIsVideo:', mediaIsVideo, 'imageUrl:', imageUrl, 'fileType:', fileType);

  return (
    <div className="preview-modal-overlay" onClick={onClose}>
      <div className="preview-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="preview-modal-header">
          <h3>Pré-visualização na TV</h3>
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
                Template 2 (Tela Cheia)
              </button>
            </div>
          </div>

          {/* Simulação da TV com proporções exatas */}
          <div className="tv-simulation-wrapper">
            <div className={`tv-container ${!isTemplate1 ? 'template-2' : ''}`}>
              {/* Barcode (5% - 61px de 1224px) */}
              <div className="tv-barcode">
                <div className="barcode-left">
                  <div className="hour-display">
                    <div className="hour-time">{hours}:{minutes}</div>
                    <div className="hour-date">{day} {month}</div>
                  </div>
                </div>

                <div className="barcode-center">
                  <div className="info-item">
                    <span className="info-icon">☁️</span>
                    <span className="info-value">22.8</span>
                    <span className="info-unit">°C</span>
                  </div>
                  
                  <div className="info-item">
                    <span className="currency-flag">🇺🇸</span>
                    <span className="info-value">5,40</span>
                    <span className="info-unit">BRL</span>
                  </div>

                  <div className="info-item">
                    <span className="currency-flag">🇪🇺</span>
                    <span className="info-value">6,32</span>
                    <span className="info-unit">BRL</span>
                  </div>

                  <div className="info-item">
                    <span className="bitcoin-icon">₿</span>
                    <span className="info-value">639.430</span>
                    <span className="info-unit">BRL</span>
                  </div>
                </div>

                <div className="barcode-right">
                  <div className="logo-placeholder">📺</div>
                  <div className="social-info">
                    <div className="social-item">
                      <FaInstagram style={{ color: '#E4405F' }} />
                      <span>@expohq</span>
                    </div>
                    <div className="social-item">
                      <FaWhatsapp style={{ color: '#25D366' }} />
                      <span>(12) 98259-4781</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Área do Anúncio (75% = 918px ou 95% = 1163px) */}
              <div className="tv-anuncio-area">
                {imageUrl ? (
                  mediaIsVideo ? (
                    <video 
                      src={imageUrl} 
                      autoPlay 
                      loop 
                      muted
                      playsInline
                      className="tv-media"
                    >
                      Seu navegador não suporta vídeos.
                    </video>
                  ) : (
                    <img src={imageUrl} alt={nome} className="tv-media" />
                  )
                ) : (
                  <div className="tv-anuncio-placeholder">
                    {mediaIsVideo ? <FiVideo size={48} /> : <FiImage size={48} />}
                    <p>{nome || 'Anúncio'}</p>
                  </div>
                )}
              </div>

              {/* Notícias embaixo (20% = 245px - apenas Template 1) */}
              {isTemplate1 && (
                <div className="tv-noticia-area">
                  <div className="noticia-content-mock">
                    <div className="noticia-image-mock">
                      <div className="noticia-image-placeholder">📰</div>
                    </div>
                    <div className="noticia-text-mock">
                      <div className="noticia-title-mock">
                        <FaQuoteLeft className="quote-icon" />
                        <span>Título da Notícia</span>
                      </div>
                      <div className="noticia-desc-mock">
                        Os layouts de página ficam melhores com algo em cada seção. 
                        Designers usam lorem ipsum para distinguir áreas de conteúdo...
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Informações do Preview */}
          <div className="preview-info">
            <p><strong>Tipo de Mídia:</strong> {mediaIsVideo ? 'Vídeo' : 'Imagem'}</p>
            <p><strong>Template:</strong> {isTemplate1 ? 'Template 1 (Com Notícias)' : 'Template 2 (Tela Cheia)'}</p>
            <p><strong>Resolução TV:</strong> 720 x 1224 px (vertical)</p>
            {isTemplate1 ? (
              <>
                <p><strong>Barcode (topo):</strong> 720 x 61 px (5%)</p>
                <p><strong>Anúncio:</strong> 720 x 918 px (75%)</p>
                <p><strong>Notícias (rodapé):</strong> 720 x 245 px (20%)</p>
              </>
            ) : (
              <>
                <p><strong>Barcode (topo):</strong> 720 x 61 px (5%)</p>
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
