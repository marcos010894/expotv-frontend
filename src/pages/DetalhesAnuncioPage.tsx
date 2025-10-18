import './DetalhesAnuncioPage.css';
import { FiArrowLeft, FiCalendar, FiPhone, FiUser, FiHome, FiImage } from 'react-icons/fi';
import { useAnuncios } from '../hooks/useAnuncios';
import type { Anuncio } from '../services/api';

interface DetalhesAnuncioPageProps {
  anuncio: Anuncio;
  onBack: () => void;
}

export default function DetalhesAnuncioPage({ anuncio, onBack }: DetalhesAnuncioPageProps) {
  const { getCondominiosNames } = useAnuncios();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
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
            <h2 className="section-title">
              <FiHome className="section-icon" />
              Condominios
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

          <div className="details-section">
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

          {anuncio.archive_url && (
            <div className="details-section">
              <h2 className="section-title">
                <FiImage className="section-icon" />
                Imagem do Anuncio
              </h2>
              <div className="image-container">
                <img 
                  src={anuncio.archive_url} 
                  alt={`Imagem do anuncio ${anuncio.nome}`}
                  className="anuncio-image"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
