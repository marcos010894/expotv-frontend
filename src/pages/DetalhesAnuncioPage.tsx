import { useState } from 'react';
import './DetalhesAnuncioPage.css';
import { FiArrowLeft, FiCalendar, FiPhone, FiUser, FiHome, FiImage, FiEye } from 'react-icons/fi';
import { useAnuncios } from '../hooks/useAnuncios';
import type { Anuncio } from '../services/api';
import AnuncioPreviewModal from '../components/AnuncioPreviewModal';

interface DetalhesAnuncioPageProps {
  anuncio: Anuncio;
  onBack: () => void;
}

export default function DetalhesAnuncioPage({ anuncio, onBack }: DetalhesAnuncioPageProps) {
  const { getCondominiosNames } = useAnuncios();
  const [showPreview, setShowPreview] = useState(false);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  // Função para verificar se é vídeo
  const isVideo = (url: string) => {
    if (!url) return false;
    const videoExtensions = ['.mp4', '.webm', '.ogg', '.mov', '.avi'];
    const urlLower = url.toLowerCase();
    return videoExtensions.some(ext => urlLower.endsWith(ext));
  };

  const condominiosNomes = getCondominiosNames(anuncio.condominios_ids);

  return (
    <main className="detalhes-page">
      <div className="page-card">
        <div className="page-header">
          <button className="back-btn" onClick={onBack} type="button">
            <FiArrowLeft className="back-icon" />
            Voltar
          </button>
          <h1 className="page-title">Detalhes do Anuncio</h1>
          {anuncio.archive_url && (
            <button 
              className="btn btn-info btn-preview-small"
              onClick={() => setShowPreview(true)}
              style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              <FiEye size={14} />
              Pré-visualizar na TV
            </button>
          )}
        </div>

        <div className="details-content">
          <div className="details-section">
            <h2 className="section-title">Informações do Anuncio</h2>
            <div className="details-grid">
              <div className="detail-item">
                <span className="detail-label">ID:</span>
                <span className="detail-value">#{anuncio.id}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Nome:</span>
                <span className="detail-value">{anuncio.nome}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Status:</span>
                <span className={`detail-value status ${anuncio.status}`}>
                  {anuncio.status === 'ativo' ? 'Ativo' : 'Inativo'}
                </span>
              </div>
            </div>
          </div>

          <div className="details-section">
            <h2 className="section-title">
              <FiUser className="section-icon" />
              Dados do Anunciante
            </h2>
            <div className="details-grid">
              <div className="detail-item">
                <span className="detail-label">
                  <FiUser className="detail-icon" />
                  Nome:
                </span>
                <span className="detail-value">{anuncio.nome_anunciante}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">
                  <FiPhone className="detail-icon" />
                  Telefone:
                </span>
                <span className="detail-value">{anuncio.numero_anunciante}</span>
              </div>
            </div>
          </div>

          <div className="details-section">
            <div className="condominios-periodo-grid">
              <div className="condominios-section">
                <h2 className="section-title">
                  <FiHome className="section-icon" />
                  Condomínios
                </h2>
                <div className="condominiums-list">
                  {condominiosNomes.split(', ').map((nome, index) => (
                    <div key={index} className="condominium-chip">
                      <FiHome className="chip-icon" />
                      {nome}
                    </div>
                  ))}
                </div>
              </div>

              <div className="periodo-section">
                <h2 className="section-title">
                  <FiCalendar className="section-icon" />
                  Período
                </h2>
                <div className="details-grid">
                  <div className="detail-item">
                    <span className="detail-label">
                      <FiCalendar className="detail-icon" />
                      Data de Expiração:
                    </span>
                    <span className="detail-value">{formatDate(anuncio.data_expiracao)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {anuncio.archive_url && (
            <div className="details-section">
              <h2 className="section-title">
                <FiImage className="section-icon" />
                {isVideo(anuncio.archive_url) ? 'Vídeo do Anúncio' : 'Imagem do Anúncio'}
              </h2>
              <div className="image-container">
                {isVideo(anuncio.archive_url) ? (
                  <video 
                    src={anuncio.archive_url}
                    className="anuncio-image"
                    controls
                    muted
                    loop
                    playsInline
                  />
                ) : (
                  <img 
                    src={anuncio.archive_url} 
                    alt={`Imagem do anuncio ${anuncio.nome}`}
                    className="anuncio-image"
                  />
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Modal de Preview */}
      <AnuncioPreviewModal
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        imageUrl={anuncio.archive_url}
        nome={anuncio.nome}
        fileType={undefined}
      />
    </main>
  );
}
