import React, { useState, useEffect } from 'react';
import { FiArrowLeft, FiMonitor, FiImage, FiHome } from 'react-icons/fi';
import { useCondominios } from '../hooks/useCondominios';
import { useUsers } from '../hooks/useUsers';
import Notification from '../components/Notification';
import { cepService, condominioService, type CondominioDetalhado } from '../services/api';
import './RegistrarCondominioPage.css';
import './DetalhesCondominioPage.css';

interface Props {
    condominioId?: number;
    onBack?: () => void;
}

export function EditarCondominioPage({ condominioId, onBack }: Props) {
    const { updateCondominio } = useCondominios();
    const { users } = useUsers();
    
    const [condominioDetalhado, setCondominioDetalhado] = useState<CondominioDetalhado | null>(null);
    const [loading, setLoading] = useState(false);
    const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null);
    const [loadingCep, setLoadingCep] = useState(false);
    const [activeSection, setActiveSection] = useState<'condominio' | 'tv' | 'anuncios'>('condominio');
    
    const [formData, setFormData] = useState({
        nome: '',
        cep: '',
        localizacao: '',
        sindico_id: ''
    });

    useEffect(() => {
        if (condominioId) {
            loadCondominioDetalhes();
        }
    }, [condominioId]);

    const loadCondominioDetalhes = async () => {
        setLoading(true);
        try {
            const detalhes = await condominioService.getCondominioById(condominioId!);
            setCondominioDetalhado(detalhes);
            setFormData({
                nome: detalhes.condominio.nome,
                cep: detalhes.condominio.cep,
                localizacao: detalhes.condominio.localizacao,
                sindico_id: detalhes.condominio.sindico_id.toString()
            });
        } catch (error) {
            setNotification({ type: 'error', message: 'Erro ao carregar detalhes do condomínio' });
        } finally {
            setLoading(false);
        }
    };

    const handleCepSearch = async (cep: string) => {
        if (cep.length === 8) {
            setLoadingCep(true);
            try {
                const response = await cepService.buscarCep(cep);
                setFormData(prev => ({
                    ...prev,
                    localizacao: `${response.logradouro}, ${response.localidade} - ${response.uf}`
                }));
            } catch (error) {
                setNotification({ type: 'error', message: 'Erro ao buscar CEP' });
            } finally {
                setLoadingCep(false);
            }
        }
    };

    const formatCep = (value: string) => {
        const numbers = value.replace(/\D/g, '');
        if (numbers.length <= 8) {
            return numbers.replace(/(\d{5})(\d{3})/, '$1-$2');
        }
        return value;
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        
        if (name === 'cep') {
            const formattedValue = formatCep(value);
            setFormData(prev => ({ ...prev, [name]: formattedValue }));
            if (formattedValue.replace(/\D/g, '').length === 8) {
                handleCepSearch(formattedValue.replace(/\D/g, ''));
            }
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!condominioId) return;

        setLoading(true);
        try {
            await updateCondominio(condominioId, {
                nome: formData.nome,
                cep: formData.cep.replace(/\D/g, ''),
                localizacao: formData.localizacao,
                sindico_id: parseInt(formData.sindico_id)
            });
            setNotification({ type: 'success', message: 'Condomínio atualizado com sucesso!' });
            setTimeout(() => onBack && onBack(), 1500);
        } catch (error) {
            setNotification({ type: 'error', message: 'Erro ao atualizar condomínio' });
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
            <form onSubmit={handleSubmit}>
                <div className="form-row">
                    <div className="form-group">
                        <label htmlFor="nome">Nome do Condomínio</label>
                        <input
                            type="text"
                            id="nome"
                            name="nome"
                            value={formData.nome}
                            onChange={handleInputChange}
                            placeholder="Digite o nome do condomínio"
                            required
                        />
                    </div>
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label htmlFor="cep">CEP</label>
                        <input
                            type="text"
                            id="cep"
                            name="cep"
                            value={formData.cep}
                            onChange={handleInputChange}
                            placeholder="00000-000"
                            required
                        />
                        {loadingCep && <span className="loading-text">Buscando CEP...</span>}
                    </div>
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label htmlFor="localizacao">Localização</label>
                        <input
                            type="text"
                            id="localizacao"
                            name="localizacao"
                            value={formData.localizacao}
                            onChange={handleInputChange}
                            placeholder="Digite a localização"
                            required
                        />
                    </div>
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label htmlFor="sindico_id">Síndico</label>
                        <select
                            id="sindico_id"
                            name="sindico_id"
                            value={formData.sindico_id}
                            onChange={handleInputChange}
                            required
                        >
                            <option value="">Selecione um síndico</option>
                            {users.map(user => (
                                <option key={user.id} value={user.id}>
                                    {user.nome}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="form-actions">
                    <button type="button" onClick={handleBack} className="btn btn-secondary">
                        Cancelar
                    </button>
                    <button type="submit" disabled={loading} className="btn btn-primary">
                        {loading ? 'Atualizando...' : 'Atualizar'}
                    </button>
                </div>
            </form>
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

    return (
        <div className="sindicos-page">
            <div className="page-card">
                <div className="details-container">
                    <div className="page-header">
                        <h1 className="page-title">Editar Condomínio</h1>
                        <button onClick={handleBack} className="back-btn">
                            <FiArrowLeft size={20} />
                            Voltar
                        </button>
                    </div>

                    {loading ? (
                        <div className="loading-container">
                            <p>Carregando detalhes...</p>
                        </div>
                    ) : (
                        <>
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
                        </>
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
