import React, { useState, useEffect } from 'react';
import { FiArrowLeft, FiMonitor, FiHome, FiWifi, FiWifiOff, FiSettings } from 'react-icons/fi';
import { tvService, condominioService, type TV, type Condominio, type TVConfigProporcao } from '../services/api';
import Notification from '../components/Notification';
import TVConfigModal from '../components/TVConfigModal';
import './DetalhesTVPage.css';

interface Props {
    tvId: number;
    onBack?: () => void;
}

export function DetalhesTVPage({ tvId, onBack }: Props) {
    const [tv, setTV] = useState<TV | null>(null);
    const [condominio, setCondominio] = useState<Condominio | null>(null);
    const [loading, setLoading] = useState(false);
    const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null);
    const [showConfigModal, setShowConfigModal] = useState(false);

    useEffect(() => {
        loadTVDetails();
    }, [tvId]);

    const loadTVDetails = async () => {
        setLoading(true);
        try {
            const tvData = await tvService.getTVById(tvId);
            setTV(tvData);
            
            // Buscar dados do condomínio
            const condominioData = await condominioService.getCondominioById(tvData.condominio_id);
            setCondominio(condominioData.condominio);
        } catch (error) {
            setNotification({ type: 'error', message: 'Erro ao carregar detalhes da TV' });
        } finally {
            setLoading(false);
        }
    };

    const handleBack = () => {
        onBack && onBack();
    };

    const handleSaveConfig = async (config: TVConfigProporcao) => {
        try {
            const response = await tvService.updateTVConfig(tvId, config);
            setNotification({ type: 'success', message: 'Configuração salva com sucesso!' });
            // Atualizar os dados da TV
            await loadTVDetails();
        } catch (error) {
            setNotification({ type: 'error', message: 'Erro ao salvar configuração' });
            throw error;
        }
    };

    if (loading) {
        return (
            <div className="sindicos-page">
                <div className="page-card">
                    <div className="loading-container">
                        <p>Carregando detalhes...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="sindicos-page">
            <div className="page-card">
                <div className="details-container">
                    <div className="page-header">
                        <h1 className="page-title">Detalhes da TV</h1>
                        <div style={{ display: 'flex', gap: '12px' }}>
                            {tv && (
                                <button 
                                    onClick={() => setShowConfigModal(true)} 
                                    className="btn btn-info"
                                    style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                                >
                                    <FiSettings size={18} />
                                    Configurar Proporção
                                </button>
                            )}
                            <button onClick={handleBack} className="back-btn">
                                <FiArrowLeft size={20} />
                                Voltar
                            </button>
                        </div>
                    </div>

                    {tv && (
                        <div className="tv-details">
                            <div className="tv-main-info">
                                <div className="tv-icon">
                                    <FiMonitor size={48} />
                                </div>
                                <div className="tv-title-section">
                                    <h2>{tv.nome}</h2>
                                    <div className="tv-status-large">
                                        {tv.status === 'online' ? (
                                            <>
                                                <FiWifi size={20} />
                                                <span className="status-online">Online</span>
                                            </>
                                        ) : (
                                            <>
                                                <FiWifiOff size={20} />
                                                <span className="status-offline">Offline</span>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="info-grid">
                                <div className="info-item">
                                    <label>Código de Conexão</label>
                                    <span className="connection-code">{tv.codigo_conexao}</span>
                                </div>
                                <div className="info-item">
                                    <label>Template</label>
                                    <span>{tv.template}</span>
                                </div>
                                <div className="info-item">
                                    <label>Data de Registro</label>
                                    <span>{new Date(tv.data_registro).toLocaleDateString('pt-BR')}</span>
                                </div>
                                <div className="info-item">
                                    <label>Condomínio</label>
                                    <span>{condominio?.nome || 'N/A'}</span>
                                </div>
                                <div className="info-item">
                                    <label>Localização do Condomínio</label>
                                    <span>{condominio?.localizacao || 'N/A'}</span>
                                </div>
                                <div className="info-item">
                                    <label>CEP do Condomínio</label>
                                    <span>{condominio?.cep ? condominio.cep.replace(/(\d{5})(\d{3})/, '$1-$2') : 'N/A'}</span>
                                </div>
                            </div>

                            <div className="config-info-card">
                                <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                                    <FiSettings size={20} />
                                    Configuração de Proporção
                                </h3>
                                <div className="proporção-display">
                                    <div className="proporção-item">
                                        <span className="proporção-emoji">📢</span>
                                        <span className="proporção-value">{tv.proporcao_avisos ?? 1}</span>
                                        <span className="proporção-label">Avisos</span>
                                    </div>
                                    <span className="proporção-sep">:</span>
                                    <div className="proporção-item">
                                        <span className="proporção-emoji">📺</span>
                                        <span className="proporção-value">{tv.proporcao_anuncios ?? 5}</span>
                                        <span className="proporção-label">Anúncios</span>
                                    </div>
                                    {tv.template === 'Template 2' && (
                                        <>
                                            <span className="proporção-sep">:</span>
                                            <div className="proporção-item">
                                                <span className="proporção-emoji">📰</span>
                                                <span className="proporção-value">{tv.proporcao_noticias ?? 3}</span>
                                                <span className="proporção-label">Notícias</span>
                                            </div>
                                        </>
                                    )}
                                </div>
                                <p className="config-hint">
                                    Esta TV exibe {tv.proporcao_avisos ?? 1} aviso(s) para cada {tv.proporcao_anuncios ?? 5} anúncio(s)
                                    {tv.template === 'Template 2' && ` e ${tv.proporcao_noticias ?? 3} notícia(s) em tela cheia`}.
                                </p>
                            </div>

                            <div className="connection-info">
                                <div className="connection-card">
                                    <FiHome size={24} />
                                    <div className="connection-content">
                                        <h3>Informações de Conexão</h3>
                                        <p>Use o código <strong>{tv.codigo_conexao}</strong> para conectar esta TV ao sistema.</p>
                                        <p>Status atual: <span className={`status-text ${tv.status}`}>
                                            {tv.status === 'online' ? 'Conectada' : 'Desconectada'}
                                        </span></p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {notification && (
                <Notification
                    type={notification.type}
                    message={notification.message}
                    onClose={() => setNotification(null)}
                />
            )}

            {tv && (
                <TVConfigModal
                    isOpen={showConfigModal}
                    onClose={() => setShowConfigModal(false)}
                    tv={tv}
                    onSave={handleSaveConfig}
                />
            )}
        </div>
    );
}
