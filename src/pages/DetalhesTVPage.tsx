import React, { useState, useEffect } from 'react';
import { FiArrowLeft, FiMonitor, FiHome, FiWifi, FiWifiOff } from 'react-icons/fi';
import { tvService, condominioService, type TV, type Condominio } from '../services/api';
import Notification from '../components/Notification';
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
                        <button onClick={handleBack} className="back-btn">
                            <FiArrowLeft size={20} />
                            Voltar
                        </button>
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
        </div>
    );
}
