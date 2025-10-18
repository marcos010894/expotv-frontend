import React, { useState, useEffect } from 'react';
import { FiArrowLeft, FiMonitor, FiImage, FiHome } from 'react-icons/fi';
import { condominioService } from '../services/api';
import type { CondominioDetalhado } from '../services/api';
import Notification from '../components/Notification';
import './DetalhesCondominioPage.css';

interface Props {
    condominioId: number;
    onBack?: () => void;
}

export function DetalhesCondominioPage({ condominioId, onBack }: Props) {
    const [condominioDetalhado, setCondominioDetalhado] = useState<CondominioDetalhado | null>(null);
    const [loading, setLoading] = useState(false);
    const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null);
    const [activeSection, setActiveSection] = useState<'condominio' | 'tv' | 'anuncios'>('condominio');

    useEffect(() => {
        loadCondominioDetalhes();
    }, [condominioId]);

    const loadCondominioDetalhes = async () => {
        setLoading(true);
        try {
            const detalhes = await condominioService.getCondominioById(condominioId);
            setCondominioDetalhado(detalhes);
        } catch (error) {
            setNotification({ type: 'error', message: 'Erro ao carregar detalhes do condomínio' });
        } finally {
            setLoading(false);
        }
    };

    const handleBack = () => {
        onBack && onBack();
    };

    const getSectionIcon = (section: string) => {
        switch (section) {
            case 'condominio': return <FiHome size={20} />;
            case 'tv': return <FiMonitor size={20} />;
            case 'anuncios': return <FiImage size={20} />;
            default: return null;
        }
    };

    const renderCondominioSection = () => (
        <div className="section-content">
            <div className="info-grid">
                <div className="info-item">
                    <label>Nome</label>
                    <span>{condominioDetalhado?.condominio.nome}</span>
                </div>
                <div className="info-item">
                    <label>CEP</label>
                    <span>{condominioDetalhado?.condominio.cep}</span>
                </div>
                <div className="info-item">
                    <label>Localização</label>
                    <span>{condominioDetalhado?.condominio.localizacao}</span>
                </div>
                <div className="info-item">
                    <label>Síndico</label>
                    <span>{condominioDetalhado?.sindico.nome}</span>
                </div>
                <div className="info-item">
                    <label>Email do Síndico</label>
                    <span>{condominioDetalhado?.sindico.email}</span>
                </div>
                <div className="info-item">
                    <label>Data de Registro</label>
                    <span>{new Date(condominioDetalhado?.condominio.data_registro || '').toLocaleDateString('pt-BR')}</span>
                </div>
            </div>
        </div>
    );

    const renderTVSection = () => (
        <div className="section-content">
            <div className="cards-grid">
                {condominioDetalhado?.tvs.map(tv => (
                    <div key={tv.id} className="tv-card">
                        <div className="card-header">
                            <FiMonitor size={24} />
                            <div className="card-title">{tv.nome}</div>
                            <div className={`status ${tv.status}`}>
                                {tv.status === 'online' ? 'Online' : 'Offline'}
                            </div>
                        </div>
                        <div className="card-content">
                            <div className="card-info">
                                <label>Código de Conexão</label>
                                <span>{tv.codigo_conexao}</span>
                            </div>
                            <div className="card-info">
                                <label>Template</label>
                                <span>{tv.template}</span>
                            </div>
                            <div className="card-info">
                                <label>Data de Registro</label>
                                <span>{new Date(tv.data_registro).toLocaleDateString('pt-BR')}</span>
                            </div>
                        </div>
                    </div>
                ))}
                {(!condominioDetalhado?.tvs || condominioDetalhado.tvs.length === 0) && (
                    <div className="empty-state">
                        <FiMonitor size={48} />
                        <p>Nenhuma TV cadastrada</p>
                    </div>
                )}
            </div>
        </div>
    );

    const renderAnunciosSection = () => (
        <div className="section-content">
            <div className="anuncios-grid">
                {condominioDetalhado?.anuncios.map(anuncio => (
                    <div key={anuncio.id} className="anuncio-card">
                        <div className="anuncio-image">
                            <img 
                                src={anuncio.archive_url} 
                                alt={anuncio.nome}
                                onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNzIwIiBoZWlnaHQ9IjEyMjQiIHZpZXdCb3g9IjAgMCA3MjAgMTIyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjcyMCIgaGVpZ2h0PSIxMjI0IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0zNjAgNjEyQzM2MCA2MTIgMzYwIDYxMiAzNjAgNjEyWiIgZmlsbD0iIzlDQTNBRiIvPgo8L3N2Zz4K';
                                }}
                            />
                        </div>
                        <div className="anuncio-content">
                            <h4>{anuncio.nome}</h4>
                            <div className="anuncio-info">
                                <span><strong>Anunciante:</strong> {anuncio.nome_anunciante}</span>
                                <span><strong>Contato:</strong> {anuncio.numero_anunciante}</span>
                                <span><strong>Vencimento:</strong> {new Date(anuncio.data_expiracao).toLocaleDateString('pt-BR')}</span>
                                <span className={`anuncio-status ${anuncio.status}`}>
                                    {anuncio.status === 'ativo' ? 'Ativo' : 'Inativo'}
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
                {(!condominioDetalhado?.anuncios || condominioDetalhado.anuncios.length === 0) && (
                    <div className="empty-state">
                        <FiImage size={48} />
                        <p>Nenhum anúncio cadastrado</p>
                    </div>
                )}
            </div>
        </div>
    );

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
                        <h1 className="page-title">Detalhes do Condomínio</h1>
                        <button onClick={handleBack} className="back-btn">
                            <FiArrowLeft size={20} />
                            Voltar
                        </button>
                    </div>

                    <div className="section-tabs">
                        <button 
                            className={`tab-btn ${activeSection === 'condominio' ? 'active' : ''}`}
                            onClick={() => setActiveSection('condominio')}
                        >
                            {getSectionIcon('condominio')}
                            CONDOMÍNIO
                        </button>
                        <button 
                            className={`tab-btn ${activeSection === 'tv' ? 'active' : ''}`}
                            onClick={() => setActiveSection('tv')}
                        >
                            {getSectionIcon('tv')}
                            TV ({condominioDetalhado?.tvs.length || 0})
                        </button>
                        <button 
                            className={`tab-btn ${activeSection === 'anuncios' ? 'active' : ''}`}
                            onClick={() => setActiveSection('anuncios')}
                        >
                            {getSectionIcon('anuncios')}
                            ANÚNCIOS ({condominioDetalhado?.anuncios.length || 0})
                        </button>
                    </div>

                    <div className="section-container">
                        {activeSection === 'condominio' && renderCondominioSection()}
                        {activeSection === 'tv' && renderTVSection()}
                        {activeSection === 'anuncios' && renderAnunciosSection()}
                    </div>
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
