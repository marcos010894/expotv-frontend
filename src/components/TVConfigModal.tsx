import { useState, useEffect } from 'react';
import { FiX, FiSettings, FiInfo } from 'react-icons/fi';
import './TVConfigModal.css';
import type { TV, TVConfigProporcao } from '../services/api';

interface TVConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  tv: TV;
  onSave: (config: TVConfigProporcao) => Promise<void>;
}

export default function TVConfigModal({ isOpen, onClose, tv, onSave }: TVConfigModalProps) {
  const [proporcaoAvisos, setProporcaoAvisos] = useState(tv.proporcao_avisos ?? 1);
  const [proporcaoAnuncios, setProporcaoAnuncios] = useState(tv.proporcao_anuncios ?? 5);
  const [proporcaoNoticias, setProporcaoNoticias] = useState(tv.proporcao_noticias ?? 3);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setProporcaoAvisos(tv.proporcao_avisos ?? 1);
      setProporcaoAnuncios(tv.proporcao_anuncios ?? 5);
      setProporcaoNoticias(tv.proporcao_noticias ?? 3);
    }
  }, [isOpen, tv]);

  const handleSave = async () => {
    setLoading(true);
    try {
      await onSave({
        proporcao_avisos: proporcaoAvisos,
        proporcao_anuncios: proporcaoAnuncios,
        proporcao_noticias: proporcaoNoticias,
      });
      onClose();
    } catch (error) {
      console.error('Erro ao salvar configuração:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDescricao = () => {
    const parts = [];
    const isLayout2 = tv.template?.toLowerCase().includes('2');
    
    if (proporcaoAvisos > 0) parts.push(`${proporcaoAvisos} aviso(s)`);
    if (proporcaoAnuncios > 0) parts.push(`${proporcaoAnuncios} anúncio(s)`);
    if (isLayout2 && proporcaoNoticias > 0) {
      parts.push(`${proporcaoNoticias} notícia(s)`);
    }
    return parts.join(' : ') || 'Nenhum conteúdo configurado';
  };

  const getPreviewSequencia = () => {
    const intercalado = [];
    let avisoIdx = 0;
    let anuncioIdx = 0;
    
    // Intercalar avisos e anúncios
    while ((avisoIdx < proporcaoAvisos || anuncioIdx < proporcaoAnuncios) && intercalado.length < 12) {
      // Adicionar avisos do bloco
      for (let i = 0; i < proporcaoAvisos && avisoIdx < proporcaoAvisos && intercalado.length < 12; i++) {
        intercalado.push({ type: 'aviso', label: `A${avisoIdx + 1}` });
        avisoIdx++;
      }
      // Adicionar anúncios do bloco
      for (let i = 0; i < proporcaoAnuncios && anuncioIdx < proporcaoAnuncios && intercalado.length < 12; i++) {
        intercalado.push({ type: 'anuncio', label: `An${anuncioIdx + 1}` });
        anuncioIdx++;
      }
    }

    // Adicionar notícias no final (apenas Layout 2)
    const isLayout2 = tv.template?.toLowerCase().includes('2');
    if (isLayout2 && proporcaoNoticias > 0) {
      const noticiasParaMostrar = Math.min(proporcaoNoticias, 12 - intercalado.length);
      for (let i = 0; i < noticiasParaMostrar; i++) {
        intercalado.push({ type: 'noticia', label: `N${i + 1}` });
      }
    }

    return intercalado;
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content tv-config-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">
            <FiSettings size={24} />
            <div>
              <h2>Configuração de Proporção</h2>
              <p className="tv-name">{tv.nome} - {tv.template === 'layout1' ? 'Layout 1' : 'Layout 2'}</p>
            </div>
          </div>
          <button className="modal-close" onClick={onClose}>
            <FiX size={24} />
          </button>
        </div>

        <div className="modal-body">
          <div className="info-box">
            <FiInfo size={18} />
            <div>
              <strong>Como funciona:</strong>
              <p>Defina a proporção de exibição de avisos e anúncios. Por exemplo, 1:5 significa que será exibido 1 aviso a cada 5 anúncios.</p>
            </div>
          </div>

          <div className="config-section">
            <div className="config-group">
              <label htmlFor="avisos">
                <span className="config-icon">📢</span>
                Avisos
              </label>
              <input
                type="number"
                id="avisos"
                min="0"
                value={proporcaoAvisos}
                onChange={(e) => setProporcaoAvisos(Math.max(0, parseInt(e.target.value) || 0))}
                className="config-input"
              />
              <small>Quantidade de avisos por ciclo</small>
            </div>

            <div className="config-separator">:</div>

            <div className="config-group">
              <label htmlFor="anuncios">
                <span className="config-icon">📺</span>
                Anúncios
              </label>
              <input
                type="number"
                id="anuncios"
                min="0"
                value={proporcaoAnuncios}
                onChange={(e) => setProporcaoAnuncios(Math.max(0, parseInt(e.target.value) || 0))}
                className="config-input"
              />
              <small>Quantidade de anúncios por ciclo</small>
            </div>

            {tv.template?.toLowerCase().includes('2') && (
              <>
                <div className="config-separator">:</div>
                <div className="config-group">
                  <label htmlFor="noticias">
                    <span className="config-icon">📰</span>
                    Notícias
                  </label>
                  <input
                    type="number"
                    id="noticias"
                    min="0"
                    value={proporcaoNoticias}
                    onChange={(e) => setProporcaoNoticias(Math.max(0, parseInt(e.target.value) || 0))}
                    className="config-input"
                  />
                  <small>Notícias em tela cheia (Layout 2)</small>
                </div>
              </>
            )}
          </div>

          <div className="preview-section">
            <h3>Proporção Configurada</h3>
            <div className="preview-descricao">
              {getDescricao()}
            </div>
          </div>

          <div className="preview-section">
            <h3>Preview da Sequência (primeiros 12 itens)</h3>
            <div className="preview-sequencia">
              {getPreviewSequencia().map((item, index) => (
                <div key={index} className={`preview-item ${item.type}`}>
                  <span>{item.label}</span>
                </div>
              ))}
              {getPreviewSequencia().length >= 12 && (
                <div className="preview-item more">
                  <span>...</span>
                </div>
              )}
            </div>
            <div className="preview-legend">
              <div className="legend-item">
                <div className="legend-color aviso"></div>
                <span>Aviso</span>
              </div>
              <div className="legend-item">
                <div className="legend-color anuncio"></div>
                <span>Anúncio</span>
              </div>
              {tv.template?.toLowerCase().includes('2') && (
                <div className="legend-item">
                  <div className="legend-color noticia"></div>
                  <span>Notícia</span>
                </div>
              )}
            </div>
          </div>

          <div className="presets-section">
            <h3>Presets Comuns</h3>
            <div className="presets-grid">
              <button
                className="preset-btn"
                onClick={() => {
                  setProporcaoAvisos(1);
                  setProporcaoAnuncios(5);
                  setProporcaoNoticias(3);
                }}
              >
                <span className="preset-name">Padrão</span>
                <span className="preset-ratio">1:5{tv.template?.toLowerCase().includes('2') ? ':3' : ''}</span>
              </button>
              <button
                className="preset-btn"
                onClick={() => {
                  setProporcaoAvisos(1);
                  setProporcaoAnuncios(10);
                  setProporcaoNoticias(2);
                }}
              >
                <span className="preset-name">Comercial</span>
                <span className="preset-ratio">1:10{tv.template?.toLowerCase().includes('2') ? ':2' : ''}</span>
              </button>
              <button
                className="preset-btn"
                onClick={() => {
                  setProporcaoAvisos(3);
                  setProporcaoAnuncios(5);
                  setProporcaoNoticias(5);
                }}
              >
                <span className="preset-name">Equilibrado</span>
                <span className="preset-ratio">3:5{tv.template?.toLowerCase().includes('2') ? ':5' : ''}</span>
              </button>
              <button
                className="preset-btn"
                onClick={() => {
                  setProporcaoAvisos(1);
                  setProporcaoAnuncios(0);
                  setProporcaoNoticias(0);
                }}
              >
                <span className="preset-name">Só Avisos</span>
                <span className="preset-ratio">1:0:0</span>
              </button>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose} disabled={loading}>
            Cancelar
          </button>
          <button className="btn btn-primary" onClick={handleSave} disabled={loading}>
            {loading ? 'Salvando...' : 'Salvar Configuração'}
          </button>
        </div>
      </div>
    </div>
  );
}
